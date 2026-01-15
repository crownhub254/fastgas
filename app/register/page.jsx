// app/register/page.jsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Mail, Lock, User, UserCircle, Eye, EyeOff, Upload, ArrowRight, Shield } from 'lucide-react'
import { registerWithEmail, loginWithGoogle } from '@/lib/firebase/auth'
import { uploadImageToImgBB, validateImage } from '@/utils/imageUpload'
import toast from 'react-hot-toast'

export default function RegisterPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user'
    })
    const [photoFile, setPhotoFile] = useState(null)
    const [photoPreview, setPhotoPreview] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            const validation = validateImage(file)
            if (!validation.valid) {
                toast.error(validation.error)
                return
            }
            setPhotoFile(file)
            setPhotoPreview(URL.createObjectURL(file))
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }

        setIsLoading(true)

        try {
            // Upload photo to ImgBB if provided
            let photoURL = ''
            if (photoFile) {
                toast.loading('Uploading profile photo...')
                const uploadResult = await uploadImageToImgBB(photoFile)
                toast.dismiss()

                if (uploadResult.success) {
                    photoURL = uploadResult.url
                } else {
                    toast.error('Failed to upload profile photo. Continuing without it.')
                }
            }

            // Register with Firebase
            toast.loading('Creating your account...')
            const { user, error } = await registerWithEmail(
                formData.email,
                formData.password,
                formData.displayName
            )

            toast.dismiss()

            if (error) {
                toast.error(error)
                setIsLoading(false)
                return
            }

            // Save user to MongoDB
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    displayName: formData.displayName,
                    photoURL: photoURL || user.photoURL || '',
                    role: formData.role,
                    provider: 'email'
                })
            })

            const data = await response.json()

            if (data.success) {
                toast.success('🎉 Account created successfully!')
                setTimeout(() => {
                    router.push('/products')
                }, 1000)
            } else {
                toast.error('Failed to save user data. Please try logging in.')
                setTimeout(() => {
                    router.push('/login')
                }, 2000)
            }
        } catch (error) {
            toast.error('Registration failed. Please try again.')
            console.error('Registration error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleRegister = async () => {
        setIsLoading(true)
        try {
            toast.loading('Signing in with Google...')
            const { user, error } = await loginWithGoogle()

            toast.dismiss()

            if (error) {
                toast.error(error)
                setIsLoading(false)
                return
            }

            // Check if user exists, if not create with default role
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL || '',
                    role: 'user', // Default role for Google sign-in
                    provider: 'google'
                })
            })

            const data = await response.json()

            if (data.success) {
                toast.success('✨ Signed in with Google successfully!')
                setTimeout(() => {
                    router.push('/products')
                }, 1000)
            } else {
                toast.error('Failed to save user data')
            }
        } catch (error) {
            toast.error('Google sign-in failed')
            console.error('Google sign-in error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const features = [
        { icon: '🎁', text: 'Exclusive welcome bonus' },
        { icon: '🚀', text: 'Fast account setup' },
        { icon: '💳', text: 'Secure payment options' },
        { icon: '🌟', text: 'Premium member benefits' },
    ]

    return (
        <div className="min-h-screen flex items-center justify-center section-padding bg-base-200 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>

            <div className="container-custom grid lg:grid-cols-2 gap-12 items-start lg:items-center relative z-10">
                {/* Left Side - Info */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="hidden lg:flex lg:items-center lg:h-full"
                >
                    <div className="space-y-6 w-full">
                        <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
                            ✨ Join Our Community
                        </div>
                        <h1 className="text-5xl font-bold text-base-content leading-tight">
                            Start Your Journey with
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent mt-2">
                                ShopHub
                            </span>
                        </h1>
                        <p className="text-base-content/70 text-xl leading-relaxed">
                            Create your account to unlock premium features, exclusive deals, and a personalized shopping experience.
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
                                    <div className="text-4xl">👋</div>
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

                {/* Right Side - Register Form */}
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
                            <p className="text-base-content/60">Join ShopHub today and start shopping</p>
                        </div>

                        {/* Profile Photo Upload */}
                        <div className="mb-6 flex flex-col items-center">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full overflow-hidden bg-base-200 flex items-center justify-center border-4 border-base-300 group-hover:border-primary transition-colors relative">
                                    {photoPreview ? (
                                        <Image
                                            src={photoPreview}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <UserCircle className="w-16 h-16 text-base-content/30" />
                                    )}
                                </div>
                                <label
                                    htmlFor="photo-upload"
                                    className="absolute bottom-0 right-0 bg-primary text-primary-content p-2.5 rounded-full cursor-pointer hover:bg-primary/90 transition-all shadow-lg group-hover:scale-110"
                                >
                                    <Upload className="w-4 h-4" />
                                    <input
                                        id="photo-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <p className="text-xs text-base-content/60 mt-2">Upload profile photo (optional)</p>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-5">
                            {/* Display Name */}
                            <div>
                                <label htmlFor="displayName" className="block text-sm font-semibold text-base-content mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="w-5 h-5 text-base-content/40" />
                                    </div>
                                    <input
                                        type="text"
                                        id="displayName"
                                        name="displayName"
                                        value={formData.displayName}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 rounded-lg bg-base-200 border-2 border-base-300 focus:border-primary focus:bg-base-100 outline-none transition-all text-base-content"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            {/* Email */}
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

                            {/* Role Selection */}
                            <div>
                                <label htmlFor="role" className="block text-sm font-semibold text-base-content mb-2">
                                    Account Type
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Shield className="w-5 h-5 text-base-content/40" />
                                    </div>
                                    <select
                                        id="role"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-lg bg-base-200 border-2 border-base-300 focus:border-primary focus:bg-base-100 outline-none transition-all text-base-content appearance-none cursor-pointer"
                                    >
                                        <option value="user">User - Shop and browse products</option>
                                        <option value="seller">Seller - List and sell products</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Password */}
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

                            {/* Confirm Password */}
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
                            </div>

                            {/* Terms & Conditions */}
                            <div className="flex items-start gap-2">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    required
                                    className="checkbox checkbox-primary checkbox-sm mt-1"
                                />
                                <label htmlFor="terms" className="text-sm text-base-content/70 cursor-pointer">
                                    I agree to the{' '}
                                    <Link href="/terms" className="text-primary hover:text-primary/80 font-semibold">
                                        Terms & Conditions
                                    </Link>
                                    {' '}and{' '}
                                    <Link href="/privacy" className="text-primary hover:text-primary/80 font-semibold">
                                        Privacy Policy
                                    </Link>
                                </label>
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

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-base-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-base-100 text-base-content/60">Or continue with</span>
                            </div>
                        </div>

                        {/* Google Sign Up */}
                        <button
                            onClick={handleGoogleRegister}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 bg-base-200 text-base-content py-3.5 rounded-lg font-semibold hover:bg-base-300 transition-all duration-300 border-2 border-base-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Sign up with Google
                        </button>

                        {/* Sign In Link */}
                        <div className="mt-6 text-center text-sm text-base-content/70">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary hover:text-primary/80 font-semibold">
                                Sign in
                            </Link>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="grid grid-cols-3 gap-4 mt-8">
                        {[
                            { icon: '🔒', text: 'Secure' },
                            { icon: '⚡', text: 'Fast Setup' },
                            { icon: '✨', text: 'Free' },
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
