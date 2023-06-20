import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.FSDB_KEY,
  authDomain: process.env.FSDB_AUTH_URI,
  projectId: process.env.NEXT_PUBLIC_FSDB_PROJECTID,
  storageBucket: process.env.FSDB_STORAGE_BUCKET,
  messagingSenderId: process.env.FSDB_MESSAGING_SENDER_ID,
  appId: process.env.FSDB_APP_ID,
  measurementId: process.env.FSDB_MEASUREMENT_ID,
}
// if (!getApps().length) {
const phormApp = initializeApp(firebaseConfig)
const analytics = getAnalytics(phormApp);
const fsdb = initializeFirestore(phormApp, {})
// }
// useDeviceLanguage(getAuth())
export { analytics, fsdb, phormApp };

