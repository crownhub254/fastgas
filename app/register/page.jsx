'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [passwordStrength, setPasswordStrength] = useState(0)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value
        })

        // Calculate password strength
        if (name === 'password') {
            calculatePasswordStrength(value)
        }
    }

    const calculatePasswordStrength = (password) => {
        let strength = 0
        if (password.length >= 8) strength++
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++
        if (password.match(/[0-9]/)) strength++
        if (password.match(/[^a-zA-Z0-9]/)) strength++
        setPasswordStrength(strength)
    }

    const getStrengthColor = () => {
        if (passwordStrength === 0) return 'bg-base-300'
        if (passwordStrength === 1) return 'bg-error'
        if (passwordStrength === 2) return 'bg-warning'
        if (passwordStrength === 3) return 'bg-info'
        return 'bg-success'
    }

    const getStrengthText = () => {
        if (passwordStrength === 0) return ''
        if (passwordStrength === 1) return 'Weak'
        if (passwordStrength === 2) return 'Fair'
        if (passwordStrength === 3) return 'Good'
        return 'Strong'
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validation
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match!')
            return
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters long!')
            return
        }

        setIsLoading(true)

        try {
            // Since we're using mock auth, we'll just validate and redirect to login
            // In a real app, you'd call a registration API here

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500))

            toast.success('Registration successful! Please login to continue. 🎉')
            router.push('/login')
        } catch (error) {
            toast.error('Registration failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const features = [
        { icon: '🎁', text: 'Exclusive member benefits' },
        { icon: '🚀', text: 'Fast and free shipping' },
        { icon: '💎', text: 'Premium customer support' },
        { icon: '🔒', text: 'Secure payment processing' },
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
                            🎉 Join Us Today
                        </div>
                        <h1 className="text-5xl font-bold text-base-content leading-tight">
                            Start Your Journey with
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent mt-2">
                                ProductHub
                            </span>
                        </h1>
                        <p className="text-base-content/70 text-xl leading-relaxed">
                            Create your account and unlock access to premium products, exclusive deals, and a seamless shopping experience.
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
                                    <div className="text-4xl">💡</div>
                                    <div>
                                        <h3 className="font-bold text-base-content mb-2">Already have an account?</h3>
                                        <p className="text-base-content/60 text-sm mb-3">Sign in to access your account and continue shopping.</p>
                                        <Link href="/login" className="text-primary font-semibold hover:text-primary/80 transition-colors inline-flex items-center gap-2">
                                            Sign In Now
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side - Registration Form */}
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
                                Create Account
                            </h2>
                            <p className="text-base-content/60">Fill in your details to get started</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Name Field */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-semibold text-base-content mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="w-5 h-5 text-base-content/40" />
                                    </div>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 rounded-lg bg-base-200 border-2 border-base-300 focus:border-primary focus:bg-base-100 outline-none transition-all text-base-content"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

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
                                        placeholder="john@example.com"
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

                                {/* Password Strength Indicator */}
                                {formData.password && (
                                    <div className="mt-2">
                                        <div className="flex gap-1 mb-1">
                                            {[...Array(4)].map((_, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`h-1 flex-1 rounded-full transition-all ${idx < passwordStrength ? getStrengthColor() : 'bg-base-300'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <p className={`text-xs font-medium ${passwordStrength === 1 ? 'text-error' :
                                                passwordStrength === 2 ? 'text-warning' :
                                                    passwordStrength === 3 ? 'text-info' :
                                                        passwordStrength === 4 ? 'text-success' : ''
                                            }`}>
                                            {getStrengthText()}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-base-content mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="w-5 h-5 text-base-content/40" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-12 py-3.5 rounded-lg bg-base-200 border-2 border-base-300 focus:border-primary focus:bg-base-100 outline-none transition-all text-base-content"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-base-content/40 hover:text-base-content"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                    <p className="text-xs text-error mt-1 flex items-center gap-1">
                                        <span>Passwords do not match</span>
                                    </p>
                                )}
                                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                    <p className="text-xs text-success mt-1 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" />
                                        <span>Passwords match</span>
                                    </p>
                                )}
                            </div>

                            {/* Terms & Conditions */}
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    required
                                    className="checkbox checkbox-primary checkbox-sm mt-1"
                                />
                                <label className="text-sm text-base-content/70">
                                    I agree to the{' '}
                                    <a href="#" className="text-primary hover:text-primary/80 font-semibold">
                                        Terms of Service
                                    </a>
                                    {' '}and{' '}
                                    <a href="#" className="text-primary hover:text-primary/80 font-semibold">
                                        Privacy Policy
                                    </a>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading || (formData.password && formData.password !== formData.confirmPassword)}
                                className="btn-primary w-full flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        <span>Creating Account...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Create Account</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Sign In Link */}
                        <div className="mt-6 text-center text-sm text-base-content/70">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary hover:text-primary/80 font-semibold">
                                Sign in here
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
