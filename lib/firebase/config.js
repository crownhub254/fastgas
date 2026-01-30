// lib/firebase/config.js
import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDvHtqU5RHai9179kAUD2i3vd4ByTJQFzo',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'fastgas-74783.firebaseapp.com',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'fastgas-74783',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'fastgas-74783.firebasestorage.app',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '179545427914',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:179545427914:web:658404d10af252d64d0933',
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-9L3DYEKW32'
}

// Check if Firebase is properly configured
const isFirebaseConfigured = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'demo-api-key'

// Initialize Firebase only if it hasn't been initialized
let app = null
let auth = null
let db = null
let googleProvider = null
let githubProvider = null

try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    auth = getAuth(app)
    db = getFirestore(app)
    googleProvider = new GoogleAuthProvider()
    githubProvider = new GithubAuthProvider()
} catch (error) {
    console.warn('Firebase initialization error:', error.message)
    console.warn('Firebase auth will not be available. Use test login instead.')
}

export { auth, db, googleProvider, githubProvider, isFirebaseConfigured }
export default app
