import { initializeApp } from "firebase/app"
import { getAuth, useDeviceLanguage } from "firebase/auth"
import { initializeFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBTUtMRd68roYbhf1yYIZLSpwCD8NWpnrE",
  authDomain: "todaysmath-5d0e8.firebaseapp.com",
  databaseURL: "https://todaysmath-5d0e8.firebaseio.com",
  projectId: "todaysmath-5d0e8",
  storageBucket: "todaysmath-5d0e8.appspot.com",
  messagingSenderId: "1015189715065",
  appId: "1:1015189715065:web:bae89322e120772910bca8",
  measurementId: "G-SQY8ZPMQV7",
}
// if (!getApps().length) {
const todaysMathApp = initializeApp(firebaseConfig)
const fsdb = initializeFirestore(todaysMathApp, {})
// }
useDeviceLanguage(getAuth())
export { fsdb, todaysMathApp }

