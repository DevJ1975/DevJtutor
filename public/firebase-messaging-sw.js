/* Firebase Cloud Messaging service worker — handles push while the app is in
   the background or closed. Uses the compat builds (required in SWs). */
importScripts('https://www.gstatic.com/firebasejs/12.14.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.14.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyDj7FRDwW9twLoRVcVhAWksUZpdAStgigs',
  authDomain: 'devj-tutor.firebaseapp.com',
  projectId: 'devj-tutor',
  storageBucket: 'devj-tutor.firebasestorage.app',
  messagingSenderId: '737326153891',
  appId: '1:737326153891:web:306b90b1acaeb3f8187f16',
  measurementId: 'G-BHP0EYK7YL',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || 'DevJ Tutor';
  const body =
    (payload.notification && payload.notification.body) ||
    'Time for today’s training — keep your streak alive! 🔥';
  self.registration.showNotification(title, {
    body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    data: { url: '/dashboard' },
  });
});

// Focus/open the app when a notification is clicked.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/dashboard';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) return client.focus();
      }
      return self.clients.openWindow(url);
    }),
  );
});
