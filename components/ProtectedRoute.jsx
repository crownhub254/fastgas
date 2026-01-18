'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth'
import { Shield, Lock } from 'lucide-react'
import Loading from '@/app/dashboard/loading'

export default function ProtectedRoute({ children, allowedRoles = [] }) {
    const { user, userData, loading } = useFirebaseAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            // Store the current URL to redirect back after login
            const currentPath = window.location.pathname
            router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
        }
    }, [user, loading, router])

    useEffect(() => {
        if (!loading && user && userData && allowedRoles.length > 0) {
            // Check role-based access
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
    }, [user, userData, loading, allowedRoles, router])

    // Show loading state
    if (loading) {
        return <Loading />
    }

    // Show unauthorized state - user not logged in
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
                        className="btn-primary"
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
                        You don't have permission to access this page. Your role: <strong>{userData.role}</strong>
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="btn-primary"
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
