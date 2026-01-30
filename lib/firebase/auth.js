import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendPasswordResetEmail,
    sendEmailVerification
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './config';

/**
 * Register with Email and Password
 */
export async function registerWithEmail(email, password, displayName) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update display name
        if (displayName) {
            await updateProfile(user, { displayName });
        }

        // Optional: Send verification email
        // await sendEmailVerification(user);

        return { user, error: null };
    } catch (error) {
        console.error('Registration error:', error);
        return { user: null, error: getErrorMessage(error.code) };
    }
}

/**
 * Login with Email and Password
 */
export async function loginWithEmail(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { user: userCredential.user, error: null };
    } catch (error) {
        console.error('Login error:', error);
        return { user: null, error: getErrorMessage(error.code) };
    }
}

/**
 * Login with Google
 */
export async function loginWithGoogle() {
    try {
        const provider = new GoogleAuthProvider();
        // Optional: Add custom parameters
        provider.setCustomParameters({
            prompt: 'select_account'
        });

        const userCredential = await signInWithPopup(auth, provider);
        return { user: userCredential.user, error: null };
    } catch (error) {
        console.error('Google login error:', error);

        // Handle specific popup errors
        if (error.code === 'auth/popup-closed-by-user') {
            return { user: null, error: 'Sign-in cancelled' };
        }

        return { user: null, error: getErrorMessage(error.code) };
    }
}

/**
 * Logout
 */
export async function logout() {
    try {
        // Clear test login data from localStorage
        if (typeof window !== 'undefined') {
            localStorage.removeItem('userData')
            localStorage.removeItem('userRole')
            // Clear cookies
            document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
            document.cookie = 'firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
            document.cookie = 'user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
        }
        
        // If Firebase auth is available, sign out
        if (auth && isFirebaseConfigured) {
            await signOut(auth);
        }
        return { error: null };
    } catch (error) {
        console.error('Logout error:', error);
        return { error: 'Failed to logout' };
    }
}

/**
 * Send Password Reset Email
 */
export async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        return { error: null };
    } catch (error) {
        console.error('Password reset error:', error);
        return { error: getErrorMessage(error.code) };
    }
}

/**
 * Update User Profile
 */
export async function updateUserProfile(updates) {
    try {
        const user = auth.currentUser;
        if (!user) {
            return { error: 'No user logged in' };
        }

        await updateProfile(user, updates);
        return { error: null };
    } catch (error) {
        console.error('Profile update error:', error);
        return { error: 'Failed to update profile' };
    }
}

/**
 * Get Current User
 */
export function getCurrentUser() {
    return auth.currentUser;
}

/**
 * Auth State Observer
 */
export function onAuthStateChange(callback) {
    // If Firebase is not configured, return a no-op unsubscribe function
    if (!auth || !isFirebaseConfigured) {
        console.warn('Firebase auth not available. Using test login instead.')
        // Call callback with null to indicate no user
        setTimeout(() => callback(null), 0)
        return () => {} // Return empty unsubscribe function
    }
    return onAuthStateChanged(auth, callback);
}

/**
 * Get user-friendly error messages
 */
function getErrorMessage(errorCode) {
    const errorMessages = {
        // Auth errors
        'auth/email-already-in-use': 'This email is already registered',
        'auth/invalid-email': 'Invalid email address',
        'auth/operation-not-allowed': 'Operation not allowed',
        'auth/weak-password': 'Password should be at least 6 characters',
        'auth/user-disabled': 'This account has been disabled',
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/invalid-credential': 'Invalid email or password',
        'auth/too-many-requests': 'Too many attempts. Please try again later',
        'auth/network-request-failed': 'Network error. Please check your connection',
        'auth/popup-blocked': 'Popup blocked. Please allow popups for this site',
        'auth/popup-closed-by-user': 'Sign-in cancelled',
        'auth/unauthorized-domain': 'This domain is not authorized',
        'auth/account-exists-with-different-credential': 'Account exists with different sign-in method',

        // Default
        'default': 'An error occurred. Please try again'
    };

    return errorMessages[errorCode] || errorMessages['default'];
}

export const onAuthChange = onAuthStateChange;

export default {
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    getCurrentUser,
    onAuthStateChange
};
