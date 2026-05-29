/**
 * Seed a login + starter profile into your Firebase project.
 *
 * Creates (or updates) an Auth user with email/password, and seeds their
 * Firestore profile, a couple of completed lessons, and a few badges so the
 * account isn't empty on first sign-in.
 *
 * USAGE (owner, one time):
 *   1) Firebase console → Project settings → Service accounts →
 *      "Generate new private key" → save as functions/serviceAccount.json
 *      (this file is gitignored — never commit it).
 *   2) cd functions && npm install
 *   3) GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json node seed.mjs
 *
 *   Optional overrides:
 *     SEED_EMAIL=you@example.com SEED_PASSWORD='YourPass123!' SEED_NAME=Jamil \
 *     GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json node seed.mjs
 *
 * Tip: you can also point at the Auth emulator by setting
 *   FIRESTORE_EMULATOR_HOST=localhost:8080 FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const EMAIL = process.env.SEED_EMAIL || 'jamil@trainovations.com';
const PASSWORD = process.env.SEED_PASSWORD || 'DevJTutor!2026';
const NAME = process.env.SEED_NAME || 'Jamil';
const PROJECT_ID = process.env.GCLOUD_PROJECT || 'devj-tutor';

initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID });

const auth = getAuth();
const db = getFirestore();

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

async function ensureUser() {
  try {
    const u = await auth.getUserByEmail(EMAIL);
    await auth.updateUser(u.uid, { password: PASSWORD, displayName: NAME, emailVerified: true });
    console.log(`↻ Updated existing user ${EMAIL}`);
    return u.uid;
  } catch {
    const u = await auth.createUser({ email: EMAIL, password: PASSWORD, displayName: NAME, emailVerified: true });
    console.log(`✓ Created user ${EMAIL}`);
    return u.uid;
  }
}

async function seed() {
  const uid = await ensureUser();
  const today = todayISO();

  await db.doc(`users/${uid}`).set(
    {
      uid,
      displayName: NAME,
      email: EMAIL,
      xp: 160,
      level: 2,
      currentStreak: 2,
      longestStreak: 2,
      lastActiveDate: today,
      dailyXp: { [today]: 60 },
      cardsReviewed: 3,
      fcmTokens: [],
      settings: { theme: 'light', dailyGoalXp: 100, soundOn: true, notifications: false, tutorModel: '' },
      createdAt: Date.now(),
    },
    { merge: true },
  );

  // A couple of completed lessons so the skill tree shows progress.
  const completed = ['js-variables', 'js-operators'];
  for (const lessonId of completed) {
    await db.doc(`users/${uid}/progress/${lessonId}`).set({
      lessonId,
      status: 'completed',
      bestScore: 100,
      attempts: 1,
      exercisePassed: true,
      completedAt: Date.now(),
    });
  }

  // Starter badges.
  for (const badgeId of ['first-steps', 'js-explorer']) {
    await db.doc(`users/${uid}/badges/${badgeId}`).set({ badgeId, earnedAt: Date.now() });
  }

  console.log('\n✅ Seed complete. Sign in with:');
  console.log(`   Email:    ${EMAIL}`);
  console.log(`   Password: ${PASSWORD}`);
  console.log('\n⚠️  Change the password after first login, and make sure Email/Password sign-in is enabled in the Firebase console.');
}

seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Seed failed:', e.message || e);
    process.exit(1);
  });
