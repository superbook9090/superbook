import * as admin from 'firebase-admin';

function formatPrivateKey(rawKey: string | undefined): string | undefined {
  if (!rawKey) return undefined;
  let key = rawKey.trim();

  // If base64-encoded private key, decode it
  if (!key.includes('-----BEGIN') && /^[A-Za-z0-9+/=]+$/.test(key.replace(/\s+/g, ''))) {
    try {
      const decoded = Buffer.from(key, 'base64').toString('utf8');
      if (decoded.includes('-----BEGIN')) {
        key = decoded.trim();
      }
    } catch {
      // Ignore base64 decode failure and proceed with original key
    }
  }

  // Strip surrounding quotes if present (double or single)
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim();
  }

  // Unescape literal '\n' and remove carriage returns
  key = key.replace(/\\n/g, '\n').replace(/\r/g, '').trim();

  return key;
}

function initializeFirebaseAdmin(): void {
  if (admin.apps.length > 0) {
    return;
  }

  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  const clientEmail =
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL ||
    process.env.FIREBASE_CLIENT_EMAIL;

  const rawKey =
    process.env.FIREBASE_ADMIN_PRIVATE_KEY ||
    process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !rawKey) {
    const missing: string[] = [];
    if (!projectId) missing.push('FIREBASE_ADMIN_PROJECT_ID');
    if (!clientEmail) missing.push('FIREBASE_ADMIN_CLIENT_EMAIL');
    if (!rawKey) missing.push('FIREBASE_ADMIN_PRIVATE_KEY');
    console.warn(`[Firebase Admin] Missing env credentials: ${missing.join(', ')}. Push notifications disabled.`);
    return;
  }

  const privateKey = formatPrivateKey(rawKey);

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    console.log(`[Firebase Admin] Successfully initialized Firebase Admin for project: ${projectId}`);
  } catch (error) {
    console.error('[Firebase Admin] Initialization error:', error);
  }
}

/** Lazily initialize Firebase Admin only when push messaging is actually used. */
export function getAdminMessaging(): admin.messaging.Messaging | null {
  initializeFirebaseAdmin();
  return admin.apps.length > 0 ? admin.messaging() : null;
}

/** Lazily initialize Firebase Admin only when auth is actually used. */
export function getAdminAuth(): admin.auth.Auth | null {
  initializeFirebaseAdmin();
  return admin.apps.length > 0 ? admin.auth() : null;
}
