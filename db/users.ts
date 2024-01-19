import { IUser } from "@/types";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { appFsdb } from "./firebase";

const usersRef = appFsdb ? collection(appFsdb, "users") : undefined;

const findUserById = async (userId: string) => {
  if (!usersRef) return;
  const userRef = doc(usersRef, userId);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    return userDoc.data();
  }
  return;
};

const findUserByEmail = async (email: string) => {
  if (!usersRef) return;
  const q = query(usersRef, where("email", "==", email));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data();
  }
  return;
};

const updateUserById = async (userId: string, newData: Partial<IUser>) => {
  if (!usersRef) return;
  const userRef = doc(usersRef, userId);
  await updateDoc(userRef, newData);
};

const getUsers = async () => {
  if (!usersRef) return;
  const querySnapshot = await getDocs(usersRef);
  const users = querySnapshot.docs.map((doc) => doc.data());
  return users;
};

export { findUserByEmail, findUserById, getUsers, updateUserById };
