import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Secure AI tutor proxy. The LLM API key lives ONLY here (Vercel env vars) and
 * never reaches the browser. Supports Anthropic (Claude), OpenAI (GPT), or
 * Google (Gemini), and streams the reply back as plain text chunks.
 *
 * Set ONE of these env vars in the Vercel project settings:
 *   ANTHROPIC_API_KEY  – Claude   (model via ANTHROPIC_MODEL, optional)
 *   OPENAI_API_KEY     – GPT      (model via OPENAI_MODEL, optional)
 *   GEMINI_API_KEY     – Gemini   (model via GEMINI_MODEL, optional)
 */
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
type Provider = 'anthropic' | 'openai' | 'gemini';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { messages, system } = (req.body ?? {}) as { messages?: ChatMessage[]; system?: string };
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'No messages provided.' });
    return;
  }

  const anthropicKey = process.env['ANTHROPIC_API_KEY'];
  const openaiKey = process.env['OPENAI_API_KEY'];
  const geminiKey = process.env['GEMINI_API_KEY'] || process.env['GOOGLE_API_KEY'];

  const provider: Provider | null = anthropicKey ? 'anthropic' : openaiKey ? 'openai' : geminiKey ? 'gemini' : null;
  if (!provider) {
    res.status(503).json({
      error:
        'The AI tutor isn’t configured yet. Add an ANTHROPIC_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY in your Vercel project settings to bring DevJ to life. 🔑',
    });
    return;
  }

  try {
    const upstream =
      provider === 'anthropic'
        ? await callAnthropic(anthropicKey!, messages, system)
        : provider === 'openai'
          ? await callOpenAI(openaiKey!, messages, system)
          : await callGemini(geminiKey!, messages, system);

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text().catch(() => '');
      res.status(502).json({ error: `The AI provider returned an error. ${truncate(detail)}` });
      return;
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');

    const parseLine = provider === 'anthropic' ? parseAnthropicLine : provider === 'openai' ? parseOpenAILine : parseGeminiLine;
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        const text = parseLine(line);
        if (text) res.write(text);
      }
    }
    res.end();
  } catch {
    if (!res.headersSent) res.status(500).json({ error: 'Unexpected error talking to the AI provider.' });
    else res.end();
  }
}

function callAnthropic(key: string, messages: ChatMessage[], system?: string): Promise<Response> {
  const model = process.env['ANTHROPIC_MODEL'] || 'claude-3-5-haiku-latest';
  return fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model, max_tokens: 1024, system: system ?? 'You are a helpful coding tutor.', messages, stream: true }),
  });
}

function callOpenAI(key: string, messages: ChatMessage[], system?: string): Promise<Response> {
  const model = process.env['OPENAI_MODEL'] || 'gpt-4o-mini';
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

function callGemini(key: string, messages: ChatMessage[], system?: string): Promise<Response> {
  const model = process.env['GEMINI_MODEL'] || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${encodeURIComponent(key)}`;
  return fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system ?? 'You are a helpful coding tutor.' }] },
      contents: messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
      generationConfig: { maxOutputTokens: 1024 },
    }),
  });
}

function parseAnthropicLine(line: string): string {
  const trimmed = line.trim();
  if (!trimmed.startsWith('data:')) return '';
  const payload = trimmed.slice(5).trim();
  if (!payload || payload === '[DONE]') return '';
  try {
    const evt = JSON.parse(payload);
    if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') return evt.delta.text ?? '';
  } catch {
    /* ignore partial json */
  }
  return '';
}

function parseOpenAILine(line: string): string {
  const trimmed = line.trim();
  if (!trimmed.startsWith('data:')) return '';
  const payload = trimmed.slice(5).trim();
  if (!payload || payload === '[DONE]') return '';
  try {
    return JSON.parse(payload).choices?.[0]?.delta?.content ?? '';
  } catch {
    return '';
  }
}

function parseGeminiLine(line: string): string {
  const trimmed = line.trim();
  if (!trimmed.startsWith('data:')) return '';
  const payload = trimmed.slice(5).trim();
  if (!payload || payload === '[DONE]') return '';
  try {
    const evt = JSON.parse(payload);
    const parts = evt.candidates?.[0]?.content?.parts;
    return Array.isArray(parts) ? parts.map((p: { text?: string }) => p.text ?? '').join('') : '';
  } catch {
    return '';
  }
}

function truncate(s: string): string {
  return s.length > 200 ? s.slice(0, 200) + '…' : s;
}
