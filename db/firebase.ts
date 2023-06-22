import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FSDB_KEY,
  authDomain: process.env.NEXT_PUBLIC_FSDB_AUTH_URI,
  projectId: process.env.NEXT_PUBLIC_FSDB_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FSDB_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FSDB_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FSDB_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FSDB_MEASUREMENT_ID,
}
const phormApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
// const appAnalytics = getAnalytics(phormApp); //need 'window'
const appAuth = getAuth(phormApp);
const appFsdb = initializeFirestore(phormApp, {})
export { appAuth, appFsdb, phormApp };

