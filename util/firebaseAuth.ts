// Lightweight auth helpers (modular SDK). FirebaseUI lives in util/firebaseUI.ts
// and is only loaded by the login page.
import { appAuth } from "@/db/firebase";
import { User, onAuthStateChanged as onChange, signOut } from "firebase/auth";

export function onAuthStateChanged(callback: (user: User | null) => void) {
  if (!appAuth) {
    callback(null);
    return () => {};
  }
  return onChange(appAuth, callback);
}

export async function logoutUser() {
  if (appAuth) await signOut(appAuth);
}
