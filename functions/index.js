/**
 * DevJ Tutor — Cloud Functions
 *
 *  • tutor:         HTTPS function that proxies the AI tutor (Firebase Hosting
 *                   rewrites /api/tutor → this function). Keeps the LLM key
 *                   server-side and streams the reply back.
 *  • dailyReminder: scheduled push that nudges learners who haven't trained
 *                   today to keep their streak alive (FCM).
 *
 * Deploy (owner, requires the Blaze plan):
 *   cd functions && npm install
 *   firebase functions:secrets:set ANTHROPIC_API_KEY   # or OPENAI_API_KEY
 *   npm run deploy          # or: npx firebase-tools deploy --only functions
 */
import { onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';
import { logger } from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

initializeApp();

// ─────────────────────────── AI tutor proxy ───────────────────────────
const ANTHROPIC_API_KEY = defineSecret('ANTHROPIC_API_KEY');
const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY');

export const tutor = onRequest(
  { secrets: [ANTHROPIC_API_KEY, OPENAI_API_KEY], timeoutSeconds: 60, cors: true, region: 'us-central1' },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const { messages, system } = req.body ?? {};
    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'No messages provided.' });
      return;
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!anthropicKey && !openaiKey) {
      res.status(503).json({
        error:
          'The AI tutor isn’t configured yet. Run `firebase functions:secrets:set ANTHROPIC_API_KEY` (or OPENAI_API_KEY) and redeploy. 🔑',
      });
      return;
    }

    try {
      const upstream = anthropicKey
        ? await callAnthropic(anthropicKey, messages, system)
        : await callOpenAI(openaiKey, messages, system);

      if (!upstream.ok || !upstream.body) {
        const detail = await upstream.text().catch(() => '');
        res.status(502).json({ error: `The AI provider returned an error. ${truncate(detail)}` });
        return;
      }

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');

      const reader = upstream.body.getReader();
      const decoder = new TextDecoder();
      const useAnthropic = !!anthropicKey;
      let buffer = '';

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          const text = useAnthropic ? parseAnthropicLine(line) : parseOpenAILine(line);
          if (text) res.write(text);
        }
      }
      res.end();
    } catch (err) {
      logger.error('tutor error', err);
      if (!res.headersSent) res.status(500).json({ error: 'Unexpected error talking to the AI provider.' });
      else res.end();
    }
  },
);

function callAnthropic(key, messages, system) {
  const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest';
  return fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model, max_tokens: 1024, system: system ?? 'You are a helpful coding tutor.', messages, stream: true }),
  });
}

function callOpenAI(key, messages, system) {
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  return fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      stream: true,
      messages: [{ role: 'system', content: system ?? 'You are a helpful coding tutor.' }, ...messages],
    }),
  });
}

function parseAnthropicLine(line) {
  const t = line.trim();
  if (!t.startsWith('data:')) return '';
  const payload = t.slice(5).trim();
  if (!payload || payload === '[DONE]') return '';
  try {
    const evt = JSON.parse(payload);
    if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') return evt.delta.text ?? '';
  } catch {
    /* ignore */
  }
  return '';
}

function parseOpenAILine(line) {
  const t = line.trim();
  if (!t.startsWith('data:')) return '';
  const payload = t.slice(5).trim();
  if (!payload || payload === '[DONE]') return '';
  try {
    return JSON.parse(payload).choices?.[0]?.delta?.content ?? '';
  } catch {
    return '';
  }
}

function truncate(s) {
  return s && s.length > 200 ? s.slice(0, 200) + '…' : s;
}

// ─────────────────────────── Daily reminder ───────────────────────────
function localDateISO(timeZone) {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

export const dailyReminder = onSchedule(
  { schedule: 'every day 18:00', timeZone: 'America/Chicago' },
  async () => {
    const db = getFirestore();
    const today = localDateISO('America/Chicago');

    const snap = await db.collection('users').get();
    const tokens = [];
    snap.forEach((doc) => {
      const u = doc.data();
      const optedIn = u?.settings?.notifications === true;
      const notYetToday = u?.lastActiveDate !== today;
      if (optedIn && notYetToday && Array.isArray(u.fcmTokens)) tokens.push(...u.fcmTokens);
    });

    if (tokens.length === 0) {
      logger.info('dailyReminder: no eligible tokens.');
      return;
    }

    const notification = {
      title: 'Keep your streak alive! 🔥',
      body: "You haven't trained today — a quick lesson keeps your momentum going.",
    };

    let sent = 0;
    for (let i = 0; i < tokens.length; i += 500) {
      const res = await getMessaging().sendEachForMulticast({
        tokens: tokens.slice(i, i + 500),
        notification,
        webpush: { fcmOptions: { link: '/dashboard' } },
      });
      sent += res.successCount;
    }
    logger.info(`dailyReminder: sent ${sent}/${tokens.length} reminders for ${today}.`);
  },
);
