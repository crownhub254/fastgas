'use client'
import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'

export default function useFirebaseAuth() {
    const [user, setUser] = useState(null)
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    // User is signed in
                    setUser(firebaseUser)

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
                    // User is signed out
                    setUser(null)
                    setUserData(null)
                }
            } catch (err) {
                console.error('Auth state change error:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        })

        // Cleanup subscription
        return () => unsubscribe()
    }, [])

    return {
        user,
        userData,
        loading,
        error
    }
}
