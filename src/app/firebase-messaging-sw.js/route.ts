import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Dynamic Firebase Cloud Messaging Service Worker served at `/firebase-messaging-sw.js`.
 * Injects the live `NEXT_PUBLIC_FIREBASE_*` config from environment variables so the SW
 * always matches the client app and Firebase Admin project (never drifts or breaks on renames).
 */
export async function GET() {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  };

  const swScript = `/* Auto-generated Firebase Messaging Service Worker */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

const firebaseConfig = ${JSON.stringify(firebaseConfig)};

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

function resolveTargetPath(data) {
  if (!data) return '/dashboard/student/notifications';

  const rawUrl = data.webUrl || data.actionUrl || data.url || '';
  if (rawUrl) {
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('/')) {
      return rawUrl;
    }
    if (rawUrl.startsWith('quizdo://')) {
      const segments = rawUrl.replace('quizdo://', '').split('/').filter(Boolean);
      const [head, id, sub, subId] = segments;
      if (head === 'course') {
        if (!id) return '/dashboard/student/courses';
        if (sub === 'lesson' && subId) return '/dashboard/student/courses/' + id + '/lessons/' + subId;
        return '/dashboard/student/courses/' + id;
      }
      if (head === 'quiz') {
        return id ? '/dashboard/student/quizzes/' + id : '/dashboard/student/quizzes';
      }
      if (head === 'contest') {
        if (!id) return '/dashboard/student/contests';
        if (sub === 'result') return '/dashboard/student/contests/' + id + '/result';
        return '/dashboard/student/contests/' + id + '/take';
      }
      if (head === 'certificate') {
        return id ? '/dashboard/student/certificates/' + id : '/dashboard/student/certificates';
      }
    }
  }

  if (data.contestId) {
    return '/dashboard/student/contests/' + data.contestId + '/take';
  }
  return '/dashboard/student/notifications';
}

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    // Only manually show notifications for data-only messages (FCM auto-displays payload.notification)
    messaging.onBackgroundMessage((payload) => {
      if (payload && payload.notification) {
        return;
      }
      const data = (payload && payload.data) || {};
      const title = data.title || 'Quiz-Do';
      const options = {
        body: data.body || '',
        icon: '/favicon.png',
        badge: '/favicon.png',
        data: data,
      };
      return self.registration.showNotification(title, options);
    });
  } catch (e) {
    console.error('[firebase-messaging-sw.js] Error initializing Firebase:', e);
  }
}

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const rawData = (event.notification && event.notification.data) || {};
  const data = (rawData.FCM_MSG && rawData.FCM_MSG.data) || rawData;
  const targetPath = resolveTargetPath(data);
  const urlToOpen = new URL(targetPath, self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        if (windowClients.length > 0 && 'navigate' in windowClients[0] && 'focus' in windowClients[0]) {
          return windowClients[0].navigate(urlToOpen).then(() => windowClients[0].focus());
        }
        return self.clients.openWindow(urlToOpen);
      })
  );
});
`;

  return new NextResponse(swScript, {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Service-Worker-Allowed': '/',
    },
  });
}
