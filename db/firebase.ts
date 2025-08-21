import { FirebaseApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, initializeFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FSDB_KEY,
  authDomain: process.env.NEXT_PUBLIC_FSDB_AUTH_URI,
  projectId: process.env.NEXT_PUBLIC_FSDB_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FSDB_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FSDB_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FSDB_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FSDB_MEASUREMENT_ID,
};

let appAuth: Auth | undefined,
  appFsdb: Firestore | undefined,
  phormApp: FirebaseApp | undefined;
if (!firebaseConfig.apiKey) {
  console.warn("NO FIREBASE API KEYS");
  phormApp = undefined;
  appAuth = undefined;
  appFsdb = undefined;
} else {
  phormApp =
    getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  // const appFsdb = getApps().length === 0 ? admin.initializeApp({credential: admin.credential.cert(firebaseCredentials)}) : getApps()[0]
  // const appAnalytics = getAnalytics(phormApp); //need 'window'
  appAuth = getAuth(phormApp);
  appFsdb = initializeFirestore(phormApp, {});
}
export { appAuth, appFsdb, phormApp };
