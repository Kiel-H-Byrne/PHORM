import { appAuth } from '@/db/firebase';
import { EmailAuthProvider, FacebookAuthProvider, GoogleAuthProvider, PhoneAuthProvider } from 'firebase/auth';

// Import firebaseui dynamically to avoid SSR issues
let firebaseui: any;
if (typeof window !== 'undefined') {
    try {
        firebaseui = require('firebaseui');
        console.log('FirebaseUI loaded successfully');
    } catch (error) {
        console.error('Error loading FirebaseUI:', error);
        // Provide fallback or error handling
    }
}

// FirebaseUI configuration factory function to avoid SSR issues
export const getUiConfig = () => {
    if (typeof window === 'undefined') return {};

    return {
        signInSuccessUrl: '/dashboard', // Redirect URL after successful login
        signInOptions: [
            // Add phone authentication provider
            {
                provider: PhoneAuthProvider.PROVIDER_ID,
                recaptchaParameters: {
                    type: 'image', // 'audio' or 'image'
                    size: 'normal', // 'invisible' or 'normal'
                    badge: 'bottomleft' // 'bottomright' or 'inline' or 'bottomleft'
                },
                defaultCountry: 'US', // Set default country to the US
                whitelistedCountries: ['US', 'CA'] // Only allow US and Canada phone numbers
            },
            // Keep existing providers
            GoogleAuthProvider.PROVIDER_ID,
            FacebookAuthProvider.PROVIDER_ID,
            EmailAuthProvider.PROVIDER_ID
        ],
        // Other UI options
        signInFlow: 'popup', // or 'redirect'
        credentialHelper: firebaseui?.auth?.CredentialHelper?.NONE,
        tosUrl: '/privacy-and-terms', // Terms of Service URL
        privacyPolicyUrl: '/privacy-and-terms', // Privacy Policy URL
        callbacks: {
            signInSuccessWithAuthResult: (authResult: any) => {
                // User successfully signed in
                console.log('User signed in successfully:', authResult);
                // Don't redirect automatically, we'll handle it
                return false;
            }
        }
    };
};

// Get or initialize FirebaseUI instance
export const getUI = () => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
        console.log('Window is undefined, skipping FirebaseUI initialization');
        return null;
    }

    if (!firebaseui) {
        console.error('FirebaseUI is not loaded');
        return null;
    }

    if (!appAuth) {
        console.error('Firebase Auth is not initialized');
        return null;
    }

    try {
        let ui = null;

        // Initialize the FirebaseUI Widget using Firebase
        if (firebaseui.auth.AuthUI.getInstance()) {
            console.log('Reusing existing FirebaseUI instance');
            ui = firebaseui.auth.AuthUI.getInstance(); // Reuse existing instance
        } else {
            console.log('Creating new FirebaseUI instance');
            ui = new firebaseui.auth.AuthUI(appAuth);
        }

        return ui;
    } catch (error) {
        console.error('Error initializing FirebaseUI:', error);
        return null;
    }
};

// Function to start the FirebaseUI login flow
export function startFirebaseUILogin(containerId: string) {
    // Only run in browser environment
    if (typeof window === 'undefined') {
        console.log('Window is undefined, skipping FirebaseUI start');
        return;
    }

    try {
        // Check if the container element exists
        const containerElement = document.getElementById(containerId);
        if (!containerElement) {
            console.error(`FirebaseUI container element with ID '${containerId}' not found in the DOM`);
            throw new Error(`Could not find the FirebaseUI widget element on the page.`);
        }

        console.log(`Found FirebaseUI container element with ID '${containerId}'`, containerElement);

        const ui = getUI();
        if (ui) {
            const config = getUiConfig();
            console.log('Starting FirebaseUI with config:', config);
            ui.start(`#${containerId}`, config);
        } else {
            throw new Error('Firebase UI not initialized');
        }
    } catch (error) {
        console.error('Error starting FirebaseUI:', error);
        throw error; // Re-throw to allow component to handle it
    }
}

// Function to log out the user
export async function logoutUser() {
    try {
        if (appAuth) {
            await appAuth.signOut();
            console.log('User logged out successfully');
        }
    } catch (error) {
        console.error('Error logging out:', error);
    }
}

// Function to get the currently logged-in user
export function getCurrentUser() {
    return appAuth ? appAuth.currentUser : null;
}

// Function to get the current Firebase user state
export function onAuthStateChanged(callback: (user: any) => void) {
    if (!appAuth) return () => { };

    return appAuth.onAuthStateChanged(callback);
}
