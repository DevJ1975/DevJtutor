// Development environment.
// NOTE: The Firebase web config below is a *public* client config (safe to ship
// to the browser). Security is enforced by Firebase Auth + Firestore rules, not
// by hiding these values. The AI tutor key is NEVER here — it lives only in the
// Vercel serverless function env (ANTHROPIC_API_KEY).
export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyDj7FRDwW9twLoRVcVhAWksUZpdAStgigs',
    authDomain: 'devj-tutor.firebaseapp.com',
    projectId: 'devj-tutor',
    storageBucket: 'devj-tutor.firebasestorage.app',
    messagingSenderId: '737326153891',
    appId: '1:737326153891:web:306b90b1acaeb3f8187f16',
    measurementId: 'G-BHP0EYK7YL',
  },
  // Endpoint of the serverless AI proxy (relative path works on Vercel).
  tutorApiUrl: '/api/tutor',
  // The learner this app is personalized for.
  ownerName: 'Jamil',
  // Web Push (FCM) VAPID public key. Get it from Firebase console →
  // Project settings → Cloud Messaging → Web Push certificates. Leave empty to
  // disable push (the app degrades gracefully with a friendly message).
  messagingVapidKey: '',
};
