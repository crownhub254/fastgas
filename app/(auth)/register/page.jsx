'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Mail, Lock, User, UserCircle, Eye, EyeOff, Upload, ArrowRight, Shield, Phone } from 'lucide-react'
import { registerWithEmail, loginWithGoogle } from '@/lib/firebase/auth'
import { uploadImageToImgBB, validateImage } from '@/utils/imageUpload'
import toast from 'react-hot-toast'

export default function RegisterPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        phoneNumber: '',
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

        // Validation
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }

        // Validate phone number
        const phoneRegex = /^01[3-9]\d{8}$/
        const cleanPhone = formData.phoneNumber.trim()

        if (!cleanPhone) {
            toast.error('Phone number is required')
            return
        }

        if (!phoneRegex.test(cleanPhone)) {
            toast.error('Please enter a valid Bangladesh phone number (01XXXXXXXXX)')
            return
        }

        setIsLoading(true)

        try {
            // Upload photo
            let photoURL = ''
            if (photoFile) {
                const uploadToast = toast.loading('Uploading profile photo...')
                const uploadResult = await uploadImageToImgBB(photoFile)
                toast.dismiss(uploadToast)

                if (uploadResult.success) {
                    photoURL = uploadResult.url
                } else {
                    toast.error('Failed to upload profile photo. Continuing without it.')
                }
            }

            // Register with Firebase
            const registerToast = toast.loading('Creating your account...')
            const { user, error } = await registerWithEmail(
                formData.email,
                formData.password,
                formData.displayName
            )

            toast.dismiss(registerToast)

            if (error) {
                toast.error(error)
                setIsLoading(false)
                return
            }

            if (!user) {
                toast.error('Failed to create user account')
                setIsLoading(false)
                return
            }

            // If rider role, redirect to rider info page
            if (formData.role === 'rider') {
                // Store temporary data in sessionStorage
                sessionStorage.setItem('riderRegistration', JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    displayName: formData.displayName.trim(),
                    phoneNumber: cleanPhone,
                    photoURL: photoURL || user.photoURL || '',
                    role: 'rider',
                    provider: 'email'
                }))

                toast.success('Account created! Please complete your rider information.')
                router.push('../../rider-info')
                return
            }

            // For non-rider users, save to database directly
            const userData = {
                uid: user.uid,
                email: user.email,
                displayName: formData.displayName.trim(),
                phoneNumber: cleanPhone,
                photoURL: photoURL || user.photoURL || '',
                role: formData.role,
                provider: 'email'
            }

            // Save to MongoDB
            const saveToast = toast.loading('Saving your information...')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            })

            toast.dismiss(saveToast)

            if (!response.ok) {
                const errorData = await response.json()
                console.error('❌ Backend error:', errorData)
                toast.error(errorData.error || 'Failed to save user data')
                setIsLoading(false)
                return
            }

            const data = await response.json()

            if (data.success) {
                toast.success('🎉 Account created successfully!')
                setTimeout(() => {
                    if (formData.role === 'seller') {
                        router.push('/dashboard/seller')
                    } else {
                        router.push('/products')
                    }
                }, 1000)
            } else {
                toast.error(data.error || 'Failed to save user data')
            }
        } catch (error) {
            console.error('❌ Registration error:', error)
            toast.error('Registration failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleRegister = async () => {
        setIsLoading(true)
        try {
            const googleToast = toast.loading('Signing in with Google...')
            const { user, error } = await loginWithGoogle()

            toast.dismiss(googleToast)

            if (error) {
                toast.error(error)
                setIsLoading(false)
                return
            }

            if (!user) {
                toast.error('Failed to sign in with Google')
                setIsLoading(false)
                return
            }

            // Get phone number from user
            const phoneNumber = window.prompt('Please enter your phone number (01XXXXXXXXX):')

            if (!phoneNumber) {
                toast.error('Phone number is required for registration')
                setIsLoading(false)
                return
            }

            const phoneRegex = /^01[3-9]\d{8}$/
            const cleanPhone = phoneNumber.trim()

            if (!phoneRegex.test(cleanPhone)) {
                toast.error('Please enter a valid Bangladesh phone number (01XXXXXXXXX)')
                setIsLoading(false)
                return
            }

            const userData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || user.email.split('@')[0],
                phoneNumber: cleanPhone,
                photoURL: user.photoURL || '',
                role: 'user',
                provider: 'google'
            }

            const saveToast = toast.loading('Saving your information...')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            })

            toast.dismiss(saveToast)

            if (!response.ok) {
                const errorData = await response.json()
                toast.error(errorData.error || 'Failed to save user data')
                setIsLoading(false)
                return
            }

            const data = await response.json()

            if (data.success) {
                toast.success('✨ Signed in with Google successfully!')
                setTimeout(() => {
                    router.push('/products')
                }, 1000)
            } else {
                toast.error(data.error || 'Failed to save user data')
            }
        } catch (error) {
            console.error('❌ Google sign-in error:', error)
            toast.error('Google sign-in failed')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center section-padding bg-base-200 relative overflow-hidden py-12">
            <div className="container-custom grid lg:grid-cols-2 gap-12 items-start lg:items-center relative z-10">
                {/* Left Side - Info */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="hidden lg:flex lg:mt-40 lg:h-full"
                >
                    <div className="space-y-6 w-full">
                        <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
                            ✨ Join Our Community
                        </div>
                        <h1 className="text-5xl font-bold text-base-content leading-tight">
                            Start Your Journey with
                            <span className="block text-transparent bg-clip-text bg-linear-to-r from-primary via-secondary to-accent mt-2">
                                FastGasHub
                            </span>
                        </h1>
                        <p className="text-base-content/70 text-xl leading-relaxed">
                            Create your account to unlock premium features, exclusive deals, and a personalized shopping experience.
                        </p>
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
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-bold text-base-content mb-2">Create Account</h2>
                            <p className="text-base-content/60">Join FastGasHub today</p>
                        </div>

                        {/* Profile Photo Upload */}
                        <div className="mb-6 flex flex-col items-center">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full overflow-hidden bg-base-200 flex items-center justify-center border-4 border-base-300 group-hover:border-primary transition-colors relative">
                                    {photoPreview ? (
                                        <Image src={photoPreview} alt="Preview" fill className="object-cover" />
                                    ) : (
                                        <UserCircle className="w-16 h-16 text-base-content/30" />
                                    )}
                                </div>
                                <label htmlFor="photo-upload" className="absolute bottom-0 right-0 bg-primary text-primary-content p-2.5 rounded-full cursor-pointer hover:bg-primary/90 transition-all shadow-lg group-hover:scale-110">
                                    <Upload className="w-4 h-4" />
                                    <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                                </label>
                            </div>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-4">
                            {/* Display Name */}
                            <div>
                                <label className="block text-sm font-semibold text-base-content mb-2">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                                    <input
                                        type="text"
                                        name="displayName"
                                        value={formData.displayName}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-4 py-3 rounded-lg bg-base-200 border-2 border-base-300 focus:border-primary focus:bg-base-100 outline-none transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-base-content mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-4 py-3 rounded-lg bg-base-200 border-2 border-base-300 focus:border-primary focus:bg-base-100 outline-none transition-all"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-sm font-semibold text-base-content mb-2">
                                    Phone Number <span className="text-error">*</span>
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-4 py-3 rounded-lg bg-base-200 border-2 border-base-300 focus:border-primary focus:bg-base-100 outline-none transition-all"
                                        placeholder="01XXXXXXXXX"
                                        pattern="01[3-9]\d{8}"
                                        title="Please enter a valid Bangladesh phone number (01XXXXXXXXX)"
                                    />
                                </div>
                                <p className="text-xs text-base-content/60 mt-1">
                                    Format: 01XXXXXXXXX (Required)
                                </p>
                            </div>

                            {/* Role Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-base-content mb-2">Account Type</label>
                                <div className="relative">
                                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 rounded-lg bg-base-200 border-2 border-base-300 focus:border-primary focus:bg-base-100 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="user">User - Shop and browse products</option>
                                        <option value="seller">Seller - List and sell products</option>
                                        <option value="rider">Rider - Deliver products</option>
                                    </select>
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-semibold text-base-content mb-2">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        minLength={6}
                                        className="w-full pl-12 pr-12 py-3 rounded-lg bg-base-200 border-2 border-base-300 focus:border-primary focus:bg-base-100 outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/40"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-semibold text-base-content mb-2">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-12 py-3 rounded-lg bg-base-200 border-2 border-base-300 focus:border-primary focus:bg-base-100 outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/40"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Terms & Conditions */}
                            <div className="flex items-start gap-2">
                                <input type="checkbox" id="terms" required className="checkbox checkbox-primary checkbox-sm mt-1" />
                                <label htmlFor="terms" className="text-sm text-base-content/70 cursor-pointer">
                                    I agree to the{' '}
                                    <Link href="/terms" className="text-primary hover:text-primary/80 font-semibold">Terms & Conditions</Link>
                                    {' '}and{' '}
                                    <Link href="/privacy" className="text-primary hover:text-primary/80 font-semibold">Privacy Policy</Link>
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
                            <Link href="/login" className="text-primary hover:text-primary/80 font-semibold">Sign in</Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
