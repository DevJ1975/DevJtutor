/**
 * DevJ Tutor — Cloud Functions
 *
 * dailyReminder: a scheduled job that nudges learners who haven't trained today
 * to keep their streak alive, via Firebase Cloud Messaging (web push).
 *
 * Deploy (owner, requires the Blaze plan):
 *   cd functions && npm install
 *   npm run deploy            # or: npx firebase-tools deploy --only functions
 *
 * Adjust the schedule/timezone below to taste.
 */
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

initializeApp();

function localDateISO(timeZone) {
  // YYYY-MM-DD in the target timezone (matches the client's todayIso()).
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
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
      if (optedIn && notYetToday && Array.isArray(u.fcmTokens)) {
        tokens.push(...u.fcmTokens);
      }
    });

    if (tokens.length === 0) {
      logger.info('dailyReminder: no eligible tokens.');
      return;
    }

    const notification = {
      title: 'Keep your streak alive! 🔥',
      body: "You haven't trained today — a quick lesson keeps your momentum going.",
    };

    // sendEachForMulticast handles up to 500 tokens per call.
    let sent = 0;
    for (let i = 0; i < tokens.length; i += 500) {
      const batch = tokens.slice(i, i + 500);
      const res = await getMessaging().sendEachForMulticast({
        tokens: batch,
        notification,
        webpush: { fcmOptions: { link: '/dashboard' } },
      });
      sent += res.successCount;
    }
    logger.info(`dailyReminder: sent ${sent}/${tokens.length} reminders for ${today}.`);
  },
);
