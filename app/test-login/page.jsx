'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Users, Shield, Truck, LogIn } from 'lucide-react'

// Test accounts for quick login - matches the API route
const testAccounts = [
    {
        email: 'admin@fastgas.com',
        role: 'admin',
        name: 'Admin User',
        icon: Shield,
        color: 'bg-error',
        dashboard: '/dashboard/admin'
    },
    {
        email: 'reseller@fastgas.com',
        role: 'reseller',
        name: 'John Gas Supplies',
        icon: Users,
        color: 'bg-primary',
        dashboard: '/dashboard/reseller'
    },
    {
        email: 'reseller2@fastgas.com',
        role: 'reseller',
        name: 'Jane LPG Distributors',
        icon: Users,
        color: 'bg-secondary',
        dashboard: '/dashboard/reseller'
    },
    {
        email: 'customer@fastgas.com',
        role: 'user',
        name: 'Alice Customer',
        icon: User,
        color: 'bg-success',
        dashboard: '/dashboard/user'
    },
    {
        email: 'rider@fastgas.com',
        role: 'rider',
        name: 'Mike Rider',
        icon: Truck,
        color: 'bg-warning',
        dashboard: '/dashboard/rider'
    }
]

export default function TestLoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(null)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleTestLogin = async (account) => {
        setLoading(account.email)
        setError('')
        setSuccess('')

        try {
            const response = await fetch('/api/auth/test-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: account.email })
            })

            const data = await response.json()

            if (data.success) {
                // Store user data in localStorage for client-side access
                localStorage.setItem('userData', JSON.stringify(data.user))
                localStorage.setItem('userRole', data.user.role)
                
                // Set cookies for middleware authentication
                const maxAge = 60 * 60 * 24 * 7 // 7 days
                document.cookie = `auth-token=test-token-${data.user.uid}; path=/; max-age=${maxAge}; SameSite=Lax`
                document.cookie = `user-role=${data.user.role}; path=/; max-age=${maxAge}; SameSite=Lax`
                
                setSuccess(`Logged in as ${data.user.displayName}! Redirecting...`)
                
                // Redirect to appropriate dashboard after a short delay
                setTimeout(() => {
                    router.push(account.dashboard)
                }, 500)
            } else {
                setError(data.error || 'Login failed')
            }
        } catch (err) {
            console.error('Login error:', err)
            setError('Connection failed: ' + err.message)
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2">🔥 FastGas</h1>
                    <p className="text-lg text-base-content/70">Test Login Portal</p>
                    <div className="badge badge-warning mt-2">Development Only - No Database Required</div>
                </div>

                {error && (
                    <div className="alert alert-error mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="alert alert-success mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{success}</span>
                    </div>
                )}

                <div className="bg-base-100 rounded-2xl shadow-xl p-6">
                    <h2 className="text-xl font-semibold mb-4">Quick Login as:</h2>
                    
                    <div className="grid gap-4">
                        {testAccounts.map((account) => {
                            const Icon = account.icon
                            const isLoading = loading === account.email
                            
                            return (
                                <button
                                    key={account.email}
                                    onClick={() => handleTestLogin(account)}
                                    disabled={loading !== null}
                                    className={`flex items-center gap-4 p-4 rounded-xl border-2 border-base-300 hover:border-primary transition-all ${isLoading ? 'opacity-50' : ''}`}
                                >
                                    <div className={`p-3 rounded-lg ${account.color} text-white`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-semibold">{account.name}</p>
                                        <p className="text-sm text-base-content/60">{account.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`badge ${
                                            account.role === 'admin' ? 'badge-error' :
                                            account.role === 'reseller' ? 'badge-primary' :
                                            account.role === 'rider' ? 'badge-warning' :
                                            'badge-success'
                                        }`}>
                                            {account.role}
                                        </span>
                                        {isLoading ? (
                                            <span className="loading loading-spinner loading-sm"></span>
                                        ) : (
                                            <LogIn className="w-5 h-5 text-base-content/40" />
                                        )}
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="mt-6 p-4 bg-base-100 rounded-xl">
                    <h3 className="font-semibold mb-2">✅ Ready to Test!</h3>
                    <p className="text-sm text-base-content/70">
                        This login page uses hardcoded test users - no database or Firebase required.
                        Click any account above to explore the different dashboards.
                    </p>
                </div>

                <div className="mt-4 text-center">
                    <a href="/login" className="btn btn-ghost btn-sm">
                        Use Regular Login →
                    </a>
                </div>
            </div>
        </div>
    )
}
