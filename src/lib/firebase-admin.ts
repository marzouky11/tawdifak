import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

// This is a *server-only* module (never imported by client components).
// It powers the extra server-side admin-route protection in `src/middleware.ts`
// and the session-cookie API routes.
//
// IMPORTANT: this must be configured via 3 new environment variables
// (obtained from Firebase Console -> Project settings -> Service accounts
// -> Generate new private key):
//   FIREBASE_PROJECT_ID
//   FIREBASE_CLIENT_EMAIL
//   FIREBASE_PRIVATE_KEY
//
// If these are missing, every function below returns null instead of
// throwing, so the rest of the app (client-side auth + Firestore rules)
// keeps working exactly as before. Nothing breaks if you deploy this
// before setting up the credentials.

function getAdminApp(): App | null {
  if (getApps().length) return getApps()[0];

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  try {
    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    return null;
  }
}

export function getAdminAuthSafe(): Auth | null {
  const app = getAdminApp();
  return app ? getAuth(app) : null;
}

export function getAdminFirestoreSafe(): Firestore | null {
  const app = getAdminApp();
  return app ? getFirestore(app) : null;
}
