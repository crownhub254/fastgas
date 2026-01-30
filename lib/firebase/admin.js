// Firebase Admin SDK Configuration
// Server-side authentication for API routes

import admin from 'firebase-admin';

// Initialize Firebase Admin only once
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
        console.log('✅ Firebase Admin initialized successfully');
    } catch (error) {
        console.error('❌ Firebase Admin initialization error:', error);
    }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export default admin;

// Verify Firebase ID token from client
export async function verifyIdToken(token) {
    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        return { success: true, uid: decodedToken.uid, email: decodedToken.email };
    } catch (error) {
        console.error('Token verification failed:', error);
        return { success: false, error: error.message };
    }
}

// Get user by UID
export async function getFirebaseUser(uid) {
    try {
        const user = await adminAuth.getUser(uid);
        return { success: true, user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Set custom claims (role) for user
export async function setUserRole(uid, role) {
    try {
        await adminAuth.setCustomUserClaims(uid, { role });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
