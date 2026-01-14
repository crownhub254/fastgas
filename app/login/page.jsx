'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (response.ok) {
                toast.success('Login successful! Welcome back! 🎉')
                router.push('/products')
                router.refresh()
            } else {
                toast.error(data.message || 'Login failed')
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const features = [
        { icon: '✨', text: 'Exclusive member benefits' },
        { icon: '🎁', text: 'Special discounts & offers' },
        { icon: '📦', text: 'Track your orders easily' },
        { icon: '💎', text: 'Premium customer support' },
    ]

    return (
        <div className="min-h-screen flex items-center justify-center section-padding bg-base-200 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>

            <div className="container-custom grid lg:grid-cols-2 gap-12 items-center relative z-10">
                {/* Left Side - Info */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="hidden lg:block"
                >
                    <div className="space-y-6">
                        <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
                            🔐 Secure Login
                        </div>
                        <h1 className="text-5xl font-bold text-base-content leading-tight">
                            Welcome Back to
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent mt-2">
                                ProductHub
                            </span>
                        </h1>
                        <p className="text-base-content/70 text-xl leading-relaxed">
                            Access your account to explore premium products, manage orders, and enjoy exclusive deals.
                        </p>

                        <div className="space-y-4 pt-6">
                            {features.map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + idx * 0.1 }}
                                    className="flex items-center gap-4"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-2xl">
                                        {item.icon}
                                    </div>
                                    <span className="text-base-content/80 text-lg font-medium">{item.text}</span>
                                </motion.div>
                            ))}
                        </div>

                        <div className="pt-8">
                            <div className="card bg-base-100 border-2 border-primary/20">
                                <div className="flex items-start gap-4">
                                    <div className="text-4xl">🎉</div>
                                    <div>
                                        <h3 className="font-bold text-base-content mb-2">New to ProductHub?</h3>
                                        <p className="text-base-content/60 text-sm mb-3">Create an account and unlock access to exclusive features and deals.</p>
                                        <Link href="/register" className="text-primary font-semibold hover:text-primary/80 transition-colors inline-flex items-center gap-2">
                                            Sign Up Now
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side - Login Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md mx-auto lg:mx-0"
                >
                    <div className="card bg-base-100 shadow-2xl">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">
                                🛍️
                            </div>
                            <h2 className="text-3xl font-bold text-base-content mb-2">
                                Sign In
                            </h2>
                            <p className="text-base-content/60">Enter your credentials to continue</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-base-content mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="w-5 h-5 text-base-content/40" />
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 rounded-lg bg-base-200 border-2 border-base-300 focus:border-primary focus:bg-base-100 outline-none transition-all text-base-content"
                                        placeholder="admin@example.com"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-base-content mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="w-5 h-5 text-base-content/40" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-12 py-3.5 rounded-lg bg-base-200 border-2 border-base-300 focus:border-primary focus:bg-base-100 outline-none transition-all text-base-content"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-base-content/40 hover:text-base-content"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="checkbox checkbox-primary checkbox-sm" />
                                    <span className="text-base-content/70">Remember me</span>
                                </label>
                                <a href="#" className="text-primary hover:text-primary/80 font-semibold">
                                    Forgot password?
                                </a>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary w-full flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        <span>Signing In...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Sign Up Link */}
                        <div className="mt-6 text-center text-sm text-base-content/70">
                            Don&apos;t have an account?{' '}
                            <Link href="/register" className="text-primary hover:text-primary/80 font-semibold">
                                Sign up now
                            </Link>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="grid grid-cols-3 gap-4 mt-8">
                        {[
                            { icon: '🔒', text: 'Secure' },
                            { icon: '⚡', text: 'Fast' },
                            { icon: '✨', text: 'Trusted' },
                        ].map((badge, idx) => (
                            <div key={idx} className="text-center">
                                <div className="text-2xl mb-1">{badge.icon}</div>
                                <div className="text-xs text-base-content/60 font-medium">{badge.text}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
