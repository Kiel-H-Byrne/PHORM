// Server-only Firebase Admin access. Never import this from client components.
import { App, cert, getApps, initializeApp } from "firebase-admin/app";
import { Auth, getAuth } from "firebase-admin/auth";
import { Firestore, getFirestore } from "firebase-admin/firestore";

// Must match the database the client SDK uses (see db/firebase.ts).
export const ADMIN_DATABASE_ID =
  process.env.NEXT_PUBLIC_FSDB_DATABASE_ID ||
  (process.env.NODE_ENV === "production" ? "phorm-db-prod" : "(default)");

let adminApp: App | undefined;

function getAdminApp(): App {
  if (adminApp) return adminApp;
  const existing = getApps().find((a) => a.name === "phorm-admin");
  if (existing) return (adminApp = existing);

  const projectId =
    process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FSDB_PROJECT_ID;
  // Prefer non-public names; the NEXT_PUBLIC_ fallbacks exist only so current
  // deployments keep working until the env vars are renamed.
  const clientEmail =
    process.env.FIREBASE_CLIENT_EMAIL ||
    process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL;
  const privateKey = (
    process.env.FIREBASE_PRIVATE_KEY ||
    process.env.NEXT_PUBLIC_FSDB_PRIVATE_KEY ||
    ""
  ).replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY."
    );
  }

  adminApp = initializeApp(
    { credential: cert({ projectId, clientEmail, privateKey }), projectId },
    "phorm-admin"
  );
  return adminApp;
}

export function adminDb(): Firestore {
  return getFirestore(getAdminApp(), ADMIN_DATABASE_ID);
}

export function adminAuth(): Auth {
  return getAuth(getAdminApp());
}
