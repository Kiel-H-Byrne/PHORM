import * as firebase from 'firebase/app';
import 'firebase/auth';
import * as firebaseui from 'firebaseui';

// Initialize Firebase app (replace with your Firebase config)
const firebaseConfig = {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_AUTH_DOMAIN',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_STORAGE_BUCKET',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID',
};
// Ensure Firebase is initialized only once
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app(); // Use the already initialized app
}

// FirebaseUI configuration
const uiConfig = {
    signInSuccessUrl: '/dashboard', // Redirect URL after successful login
    signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
    ],
    tosUrl: '/terms-of-service', // Terms of Service URL
    privacyPolicyUrl: '/privacy-policy', // Privacy Policy URL
};

// Initialize FirebaseUI instance
let ui: firebaseui.auth.AuthUI;
if (firebaseui.auth.AuthUI.getInstance()) {
    ui = firebaseui.auth.AuthUI.getInstance(); // Reuse existing instance
} else {
    ui = new firebaseui.auth.AuthUI(firebase.auth());
}

// Function to start the FirebaseUI login flow
export function startFirebaseUILogin(containerId: string) {
    ui.start(containerId, uiConfig);
}

// Function to log out the user
export async function logoutUser() {
    try {
        await firebase.auth().signOut();
        console.log('User logged out successfully');
    } catch (error) {
        console.error('Error logging out:', error);
    }
}

// Function to get the currently logged-in user
export function getCurrentUser() {
    return firebase.auth().currentUser;
}
