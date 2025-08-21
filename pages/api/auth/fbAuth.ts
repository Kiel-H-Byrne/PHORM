import { phormApp } from "@/db/firebase";
// Import the compat versions of Firebase
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

// Import firebaseui dynamically to avoid SSR issues
let firebaseui: any;

if (typeof window !== "undefined") {
  try {
    // Initialize Firebase with the same config if it hasn't been initialized yet
    if (!firebase.apps.length && phormApp) {
      firebase.initializeApp(phormApp.options);
      console.log("Firebase compat initialized successfully");
    }

    // Now load FirebaseUI
    firebaseui = require("firebaseui");
    console.log("FirebaseUI loaded successfully");
  } catch (error) {
    console.error("Error loading FirebaseUI:", error);
    // Provide fallback or error handling
  }
}

// FirebaseUI configuration factory function to avoid SSR issues
export const getUiConfig = () => {
  if (typeof window === "undefined") return {};

  return {
    signInSuccessUrl: "/dashboard", // Redirect URL after successful login
    signInOptions: [
      // Add phone authentication provider
      {
        provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
        recaptchaParameters: {
          type: "image", // 'audio' or 'image'
          size: "normal", // 'invisible' or 'normal'
          badge: "bottomleft", // 'bottomright' or 'inline' or 'bottomleft'
        },
        defaultCountry: "US", // Set default country to the US
        whitelistedCountries: ["US", "CA"], // Only allow US and Canada phone numbers
      },
      // Keep existing providers
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
    ],
    // Other UI options
    signInFlow: "popup", // or 'redirect'
    credentialHelper: firebaseui?.auth?.CredentialHelper?.NONE,
    tosUrl: "/privacy-and-terms", // Terms of Service URL
    privacyPolicyUrl: "/privacy-and-terms", // Privacy Policy URL
    callbacks: {
      signInSuccessWithAuthResult: (authResult: any) => {
        // User successfully signed in
        console.log("User signed in successfully:", authResult.user);
        // Don't redirect automatically, we'll handle it
        return true;
      },
    },
  };
};

// Get or initialize FirebaseUI instance
export const getUI = () => {
  // Only run in browser environment
  if (typeof window === "undefined") {
    console.log("Window is undefined, skipping FirebaseUI initialization");
    return null;
  }

  if (!firebaseui) {
    console.error("FirebaseUI is not loaded");
    return null;
  }

  if (!firebase.auth()) {
    console.error("Firebase Auth is not initialized");
    return null;
  }

  try {
    let ui = null;

    // Initialize the FirebaseUI Widget using Firebase
    if (firebaseui.auth.AuthUI.getInstance()) {
      console.log("Reusing existing FirebaseUI instance");
      ui = firebaseui.auth.AuthUI.getInstance(); // Reuse existing instance
    } else {
      console.log("Creating new FirebaseUI instance");
      ui = new firebaseui.auth.AuthUI(firebase.auth());
    }

    return ui;
  } catch (error) {
    console.error("Error initializing FirebaseUI:", error);
    return null;
  }
};

// Function to start the FirebaseUI login flow
export function startFirebaseUILogin(containerId: string) {
  // Only run in browser environment
  if (typeof window === "undefined") {
    console.log("Window is undefined, skipping FirebaseUI start");
    return;
  }

  try {
    // Check if the container element exists
    const containerElement = document.getElementById(containerId);
    if (!containerElement) {
      console.error(
        `FirebaseUI container element with ID '${containerId}' not found in the DOM`
      );
      throw new Error(
        `Could not find the FirebaseUI widget element on the page.`
      );
    }

    const ui = getUI();
    if (ui) {
      const config = getUiConfig();
      // console.log("Starting FirebaseUI with config:", config);
      ui.start(`#${containerId}`, config);
    } else {
      throw new Error("Firebase UI not initialized");
    }
  } catch (error) {
    console.error("Error starting FirebaseUI:", error);

    // Log more detailed error information
    if (error instanceof Error) {
      console.error("Error code:", (error as any).code);
      console.error("Error message:", error.message);

      // Check for specific API blocked errors
      if (
        (error as any).code === "auth/internal-error" ||
        error.message.includes("identitytoolkit") ||
        error.message.includes("blocked")
      ) {
        console.error(
          "API restriction error detected. Please check your Firebase project settings."
        );
        console.error(
          "This is likely due to API key restrictions in the Google Cloud Console."
        );
      }
    }

    throw error; // Re-throw to allow component to handle it
  }
}

// Function to log out the user
export async function logoutUser() {
  try {
    if (firebase.auth()) {
      await firebase.auth().signOut();
      console.log("User logged out successfully");
    }
  } catch (error) {
    console.error("Error logging out:", error);
  }
}

// Function to get the currently logged-in user
// export function getCurrentUser() {
//     return firebase.auth ? firebase.auth().currentUser : null;
// }

// Function to get the current Firebase user state
export function onAuthStateChanged(callback: (user: any) => void) {
  if (!firebase.auth()) return () => {};

  return firebase.auth().onAuthStateChanged(callback);
}
