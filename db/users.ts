import { IUser } from "@/types";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { appFsdb } from "./firebase";

const usersRef = appFsdb ? collection(appFsdb, "users") : undefined;

const findUserById = async (userId: string | undefined) => {
  if (!usersRef) return;
  const userRef = doc(usersRef, userId);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    return userDoc.data() as IUser;
  }
  return null;
};

const findUserByEmail = async (email: string) => {
  if (!usersRef) return;
  const q = query(usersRef, where("email", "==", email));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data();
  }
  return null;
};

const updateUserById = async (userId: string, newData: Partial<IUser>) => {
  if (!usersRef) return;
  const userRef = doc(usersRef, userId);
  const userDoc = (await getDoc(userRef)).data();
  const newDoc = { ...userDoc, profile: { ...userDoc?.profile, ...newData } };
  if (userDoc) await updateDoc(userRef, newDoc);
};

const getUsers = async () => {
  if (!usersRef) return;
  const querySnapshot = await getDocs(usersRef);
  const users = querySnapshot.docs.map((doc) => doc.data());
  return users;
};

// Create a new user in the users collection
const createUser = async (userId: string, userData: Partial<IUser>) => {
  if (!usersRef) return;

  // Create a basic user profile with default values
  const defaultProfile = {
    orgs: [],
    ownedListings: [],
    verifiedListings: [],
    deverifiedListings: [],
    favorites: [],
  };

  // Merge the provided user data with default values
  const newUser = {
    id: userId,
    name: userData.name || "",
    email: userData.email || "",
    image: userData.image || "",
    emailVerified: userData.emailVerified || null,
    profile: { ...defaultProfile, ...userData.profile },
  };

  // Set the document with the user ID
  const userRef = doc(usersRef, userId);
  await setDoc(userRef, newUser);

  return newUser;
};

// Check if a user exists and create if not
const findOrCreateUser = async (userId: string, userData: Partial<IUser>) => {
  if (!usersRef) return null;

  // Try to find the user first
  const existingUser = await findUserById(userId);

  // If user doesn't exist, create a new one
  if (!existingUser) {
    console.log("User not found, creating new user:", userId);
    return await createUser(userId, userData);
  }

  return existingUser;
};

export {
  createUser,
  findOrCreateUser,
  findUserByEmail,
  findUserById,
  getUsers,
  updateUserById,
};
