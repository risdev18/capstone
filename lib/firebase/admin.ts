/**
 * Firebase Admin SDK — SERVER SIDE ONLY.
 * Never import this file in client components.
 * Credentials are loaded from server-only env vars (no NEXT_PUBLIC_ prefix).
 *
 * Required env vars (set in .env.local):
 *   FIREBASE_ADMIN_PROJECT_ID
 *   FIREBASE_ADMIN_CLIENT_EMAIL
 *   FIREBASE_ADMIN_PRIVATE_KEY   (escape newlines as \n in the file)
 */
import { cert, getApps, initializeApp, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Support both FIREBASE_ADMIN_* and legacy FIREBASE_* naming
  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  const clientEmail =
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL ??
    process.env.FIREBASE_CLIENT_EMAIL;

  const rawKey =
    process.env.FIREBASE_ADMIN_PRIVATE_KEY ??
    process.env.FIREBASE_PRIVATE_KEY;

  const privateKey = rawKey?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase Admin env vars missing. ' +
      'Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY in .env.local'
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

const adminApp = getAdminApp();

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
// Also export as 'db' so older imports still work
export const db = adminDb;
export default adminApp;
