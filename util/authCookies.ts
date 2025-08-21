"use client";

import { appAuth } from '@/db/firebase';
import { User } from 'firebase/auth';
import Cookies from 'js-cookie';

// Cookie name for Firebase auth
const FIREBASE_AUTH_COOKIE = 'firebase-auth-token';

// Set auth cookie when user logs in
export const setAuthCookie = (user: User) => {
  if (typeof window === 'undefined') return;
  
  // Create a simplified user object with only the data we need
  const userData = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    phoneNumber: user.phoneNumber,
  };
  
  // Set the cookie with user data
  Cookies.set(FIREBASE_AUTH_COOKIE, JSON.stringify(userData), {
    expires: 7, // 7 days
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
};

// Remove auth cookie when user logs out
export const removeAuthCookie = () => {
  if (typeof window === 'undefined') return;
  Cookies.remove(FIREBASE_AUTH_COOKIE, { path: '/' });
};

// Get user data from auth cookie
export const getUserFromCookie = () => {
  if (typeof window === 'undefined') return null;
  
  const cookie = Cookies.get(FIREBASE_AUTH_COOKIE);
  if (!cookie) return null;
  
  try {
    return JSON.parse(cookie);
  } catch (error) {
    console.error('Error parsing auth cookie:', error);
    return null;
  }
};

// Setup auth state listener to manage cookies
export const setupAuthCookieListener = () => {
  if (typeof window === 'undefined' || !appAuth) return () => {};
  
  return appAuth.onAuthStateChanged((user) => {
    if (user) {
      setAuthCookie(user);
    } else {
      removeAuthCookie();
    }
  });
};
