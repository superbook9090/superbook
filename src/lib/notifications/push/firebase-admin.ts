import * as admin from 'firebase-admin';

// Avoid re-initializing if it's already initialized
if (!admin.apps.length) {
  try {
    // Note: To make this work, you must set FIREBASE_ADMIN_PRIVATE_KEY, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PROJECT_ID in your .env
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    if (privateKey && process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PROJECT_ID) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
      console.log('Firebase Admin initialized successfully.');
    } else {
      console.warn('Firebase Admin credentials missing. Push notifications will not be sent.');
    }
  } catch (error) {
    console.error('Firebase Admin initialization error', error);
  }
}

export const adminMessaging = admin.apps.length ? admin.messaging() : null;
