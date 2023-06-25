import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { insertUser } from './_user';
import { appFsdb } from './firebase';

const findUserById = async (userId: string) => {
  const userRef = doc(usersRef, userId);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    return userDoc.data();
  }
  return null;
};
const usersRef = collection(appFsdb, "users");

const findUserByEmail = async (email: string) => {
  const q = query(usersRef, where('email', '==', email));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data();
  }
  return null;
};

const updateUserById = async (userId: string, newData) => {
  const userRef = doc(usersRef, userId);
  await updateDoc(userRef, newData);
};
/**
 * Not needed because new users are created with next-auth & firebase adapter
 */
// const insertUser = async (userData) => {
//   const newUserRef = await addDoc(usersRef, userData);
//   return newUserRef.id;
// };

const getUsers = async () => {
  const querySnapshot = await getDocs(usersRef);
  const users = querySnapshot.docs.map((doc) => doc.data());
  return users;
};

export {
  findUserByEmail, findUserById, getUsers, insertUser, updateUserById
};

