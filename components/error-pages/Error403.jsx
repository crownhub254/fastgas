'use client'

import { Home, Shield, Lock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Error403() {
    const router = useRouter()

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-100 via-base-200 to-base-100 px-4">
            <div className="max-w-2xl w-full text-center">
                {/* Animated 403 */}
                <div className="mb-8">
                    <h1 className="text-9xl md:text-[12rem] font-black bg-gradient-to-r from-warning via-error to-warning bg-clip-text text-transparent animate-pulse">
                        403
                    </h1>
                </div>

                {/* Icon */}
                <div className="mb-8 flex justify-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-warning/20 to-error/20 flex items-center justify-center">
                        <Shield className="w-16 h-16 text-warning animate-bounce" />
                    </div>
                </div>

                {/* Message */}
                <h2 className="text-4xl md:text-5xl font-bold text-base-content mb-4">
                    Access Forbidden
                </h2>
                <p className="text-xl text-base-content/70 mb-8 max-w-md mx-auto">
                    You don't have permission to access this resource. Please contact an administrator if you believe this is an error.
                </p>

                {/* Info Box */}
                <div className="mb-8 p-6 bg-warning/10 rounded-2xl border-2 border-warning/20 max-w-md mx-auto">
                    <div className="flex items-center gap-3 mb-3">
                        <Lock className="w-5 h-5 text-warning" />
                        <h3 className="font-semibold text-lg text-warning">Why am I seeing this?</h3>
                    </div>
                    <ul className="text-base-content/70 text-sm text-left space-y-2">
                        <li>• You may not have the required permissions</li>
                        <li>• Your account role might be restricted</li>
                        <li>• This page might be for administrators only</li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => router.back()}
                        className="btn btn-lg btn-outline gap-2 hover:scale-105 transition-transform"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Go Back
                    </button>

                    <Link
                        href="/"
                        className="btn btn-lg btn-primary gap-2 hover:scale-105 transition-transform"
                    >
                        <Home className="w-5 h-5" />
                        Back to Home
                    </Link>

                    <Link
                        href="/contact"
                        className="btn btn-lg btn-secondary gap-2 hover:scale-105 transition-transform"
                    >
                        Request Access
                    </Link>
                </div>

                {/* Help Section */}
                <div className="mt-12 pt-8 border-t border-base-300">
                    <h3 className="text-sm font-semibold text-base-content/60 mb-4">NEED HELP?</h3>
                    <p className="text-sm text-base-content/70">
                        Contact our support team at{' '}
                        <a href="mailto:support@fastgashub.com" className="link link-primary">
                            support@fastgashub.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}
