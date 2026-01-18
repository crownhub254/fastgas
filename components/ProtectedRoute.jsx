'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth'
import { Shield, Lock } from 'lucide-react'

export default function ProtectedRoute({ children, allowedRoles = [] }) {
    const { user, userData, loading } = useFirebaseAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading) {
            // Redirect to login if not authenticated
            if (!user) {
                router.push('/login')
                return
            }

            // Check role-based access
            if (allowedRoles.length > 0 && userData) {
                if (!allowedRoles.includes(userData.role)) {
                    // Redirect to appropriate dashboard based on role
                    switch (userData.role) {
                        case 'admin':
                            router.push('/dashboard/admin')
                            break
                        case 'seller':
                            router.push('/dashboard/seller')
                            break
                        default:
                            router.push('/dashboard/user')
                    }
                }
            }
        }
    }, [user, userData, loading, allowedRoles, router])

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-base-100 via-base-200 to-base-100">
                <div className="text-center">
                    <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <h2 className="text-2xl font-bold text-base-content mb-2">Loading...</h2>
                    <p className="text-base-content/70">Please wait while we verify your access</p>
                </div>
            </div>
        )
    }

    // Show unauthorized state
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-base-100 via-base-200 to-base-100">
                <div className="text-center max-w-md">
                    <div className="w-24 h-24 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-12 h-12 text-error" />
                    </div>
                    <h2 className="text-3xl font-bold text-base-content mb-4">Access Denied</h2>
                    <p className="text-base-content/70 mb-6">
                        You need to be logged in to access this page.
                    </p>
                    <button
                        onClick={() => router.push('/login')}
                        className="btn btn-primary btn-lg"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        )
    }

    // Check role-based access
    if (allowedRoles.length > 0 && userData && !allowedRoles.includes(userData.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-base-100 via-base-200 to-base-100">
                <div className="text-center max-w-md">
                    <div className="w-24 h-24 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-12 h-12 text-warning" />
                    </div>
                    <h2 className="text-3xl font-bold text-base-content mb-4">Insufficient Permissions</h2>
                    <p className="text-base-content/70 mb-6">
                        You don't have permission to access this page. Your role: {userData.role}
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="btn btn-primary btn-lg"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        )
    }

    // Render children if all checks pass
    return <>{children}</>
}
