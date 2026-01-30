'use client'
import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, isFirebaseConfigured } from '@/lib/firebase/config'

export default function useFirebaseAuth() {
    const [user, setUser] = useState(null)
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        // Check for test login data in localStorage first
        const checkTestLogin = () => {
            try {
                const storedUserData = localStorage.getItem('userData')
                if (storedUserData) {
                    const parsedData = JSON.parse(storedUserData)
                    setUserData(parsedData)
                    setUser({ 
                        uid: parsedData.uid, 
                        email: parsedData.email,
                        displayName: parsedData.displayName,
                        getIdToken: async () => `test-token-${parsedData.uid}`
                    })
                    setLoading(false)
                    return true
                }
            } catch (err) {
                console.warn('Error checking test login:', err)
            }
            return false
        }

        // If test login exists, use it
        if (checkTestLogin()) {
            return
        }

        // If Firebase is not properly configured, just set loading to false
        if (!isFirebaseConfigured || !auth) {
            console.warn('Firebase not configured. Use test login at /test-login')
            setLoading(false)
            return
        }

        // Use Firebase auth
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    // User is signed in
                    setUser(firebaseUser)

                    // Get Firebase ID token and store in cookie
                    const idToken = await firebaseUser.getIdToken()

                    // Set cookie for middleware
                    document.cookie = `firebase-token=${idToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`

                    // Fetch additional user data from backend
                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/auth/user/${firebaseUser.uid}`
                    )

                    if (response.ok) {
                        const data = await response.json()
                        if (data.success) {
                            setUserData(data.user)
                        } else {
                            setError('Failed to fetch user data')
                        }
                    } else {
                        setError('User not found in database')
                    }
                } else {
                    // User is signed out - clear cookies
                    document.cookie = 'firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
                    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'

                    setUser(null)
                    setUserData(null)
                }
            } catch (err) {
                console.error('Auth state change error:', err)
                setError(err.message)

                // Clear cookies on error
                document.cookie = 'firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
                document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
            } finally {
                setLoading(false)
            }
        })

        // Cleanup subscription
        return () => unsubscribe()
    }, [])

    // Logout function
    const logout = () => {
        localStorage.removeItem('userData')
        localStorage.removeItem('userRole')
        document.cookie = 'firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
        document.cookie = 'user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
        setUser(null)
        setUserData(null)
    }

    return {
        user,
        userData,
        loading,
        error,
        logout,
        isFirebaseConfigured
    }
}
