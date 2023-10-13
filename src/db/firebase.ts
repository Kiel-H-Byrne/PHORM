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

// const firebaseCredentials = {
//   type: process.env.NEXT_PUBLIC_TEST_type,
//   projectId: process.env.NEXT_PUBLIC_TEST_project_id,
//   privateKeyId: process.env.NEXT_PUBLIC_TEST_private_key_id,
//   privateKey: process.env.NEXT_PUBLIC_TEST_private_key,
//   clientEmail: process.env.NEXT_PUBLIC_TEST_client_email,
//   clientId: process.env.NEXT_PUBLIC_TEST_client_id,
//   authUri: process.env.NEXT_PUBLIC_TEST_auth_uri,
//   tokenUri: process.env.NEXT_PUBLIC_TEST_token_uri,
//   authProviderX509CertUrl: process.env.NEXT_PUBLIC_TEST_auth_provider_x509_cert_url,
//   clientX509CertUrl: process.env.NEXT_PUBLIC_TEST_client_x509_cert_url,
//   universeDomain: process.env.NEXT_PUBLIC_TEST_universe_domain,
// }
const phormApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
// const appFsdb = getApps().length === 0 ? admin.initializeApp({credential: admin.credential.cert(firebaseCredentials)}) : getApps()[0]
// const appAnalytics = getAnalytics(phormApp); //need 'window'
const appAuth = getAuth(phormApp);
const appFsdb = initializeFirestore(phormApp, {})
export { appAuth, appFsdb, phormApp };

