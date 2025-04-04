import { appAuth } from '@/db/firebase';
import { EmailAuthProvider, FacebookAuthProvider, GoogleAuthProvider, PhoneAuthProvider } from 'firebase/auth';
import * as firebaseui from 'firebaseui';

// FirebaseUI configuration
export const uiConfig = {
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
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
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

// Initialize FirebaseUI instance
let ui: firebaseui.auth.AuthUI | null = null;

// Initialize UI only on client side
if (typeof window !== 'undefined') {
    // Initialize the FirebaseUI Widget using Firebase
    if (firebaseui.auth.AuthUI.getInstance()) {
        ui = firebaseui.auth.AuthUI.getInstance(); // Reuse existing instance
    } else if (appAuth) {
        ui = new firebaseui.auth.AuthUI(appAuth);
    }
}

// Function to start the FirebaseUI login flow
export function startFirebaseUILogin(containerId: string) {
    if (ui) {
        ui.start(containerId, uiConfig);
    } else {
        console.error('Firebase UI not initialized');
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
    if (!appAuth) return () => {};
    
    return appAuth.onAuthStateChanged(callback);
}
