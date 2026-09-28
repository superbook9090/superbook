importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

// You will need to replace this config with your actual Firebase config in production
// The SW doesn't have access to process.env unless bundled.
const firebaseConfig = {
  apiKey: "AIzaSyBbDdQ6l-T98rsDSx8HFpTXTs4vR55Ce-I", // Need to be injected or hardcoded here since it's a static file
  authDomain: "Quiz-Do-84762.firebaseapp.com",
  projectId: "Quiz-Do-84762",
  storageBucket: "Quiz-Do-84762.firebasestorage.app",
  messagingSenderId: "311992119719",
  appId: "1:311992119719:web:e4ac19a743a5a57e23c682"
};

// Initialize Firebase
try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload?.notification?.title || payload?.data?.title || 'Quiz-Do';
    const notificationOptions = {
      body: payload?.notification?.body || payload?.data?.body || '',
      icon: payload?.notification?.icon || '/notification-icon.svg',
      badge: '/notification-icon.svg',
      data: payload?.data || {}
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (e) {
  console.log('Error initializing Firebase in Service Worker', e);
}

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const data = event.notification?.data || {};

  let targetPath = data.webUrl;
  if (!targetPath && data.url) {
    if (data.url.startsWith('quizdo://contest/')) {
      const contestId = data.url.replace('quizdo://contest/', '');
      targetPath = `/dashboard/student/contests/${contestId}/take`;
    } else if (data.url.startsWith('http://') || data.url.startsWith('https://') || data.url.startsWith('/')) {
      targetPath = data.url;
    }
  }
  if (!targetPath && data.contestId) {
    targetPath = `/dashboard/student/contests/${data.contestId}/take`;
  }
  if (!targetPath) {
    targetPath = '/dashboard/student/notifications';
  }

  const urlToOpen = new URL(targetPath, self.location.origin).href;

  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then((windowClients) => {
    let matchingClient = null;

    for (let i = 0; i < windowClients.length; i++) {
      const windowClient = windowClients[i];
      if (windowClient.url === urlToOpen) {
        matchingClient = windowClient;
        break;
      }
    }

    if (matchingClient) {
      return matchingClient.focus();
    } else {
      return clients.openWindow(urlToOpen);
    }
  });

  event.waitUntil(promiseChain);
});
