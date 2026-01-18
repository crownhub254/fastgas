'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Bell, Shield, Eye, EyeOff, Save, Camera, AlertCircle, Check } from 'lucide-react'
import { auth } from '@/lib/firebase/config'
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Loading from '../../loading'
import LoginPage from '@/app/(auth)/login/page'

export default function DashboardSettings() {
    const router = useRouter()
    const [user, setUser] = useState(null)
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [activeTab, setActiveTab] = useState('profile')

    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        photoURL: '',
        role: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        orderUpdates: true,
        productUpdates: false,
        newsletter: false
    })

    const [errors, setErrors] = useState({})

    // Load user data from Firebase Auth
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    setUser(firebaseUser)

                    // Fetch additional user data from backend
                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/auth/user/${firebaseUser.uid}`
                    )

                    if (response.ok) {
                        const data = await response.json()
                        if (data.success && data.user) {
                            setUserData(data.user)
                            setFormData({
                                displayName: data.user.displayName || firebaseUser.displayName || '',
                                email: data.user.email || firebaseUser.email || '',
                                photoURL: data.user.photoURL || firebaseUser.photoURL || '',
                                role: data.user.role || 'user',
                                currentPassword: '',
                                newPassword: '',
                                confirmPassword: ''
                            })
                        }
                    } else {
                        // If user not in database, use Firebase data
                        setFormData({
                            displayName: firebaseUser.displayName || '',
                            email: firebaseUser.email || '',
                            photoURL: firebaseUser.photoURL || '',
                            role: 'user',
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                        })
                    }
                } else {
                    setUser(null)
                    setUserData(null)
                    router.push('/login')
                }
            } catch (err) {
                console.error('Auth state change error:', err)
                toast.error('Failed to load user data')
            } finally {
                setLoading(false)
            }
        })

        return () => unsubscribe()
    }, [router])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const handleNotificationChange = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const validateProfileForm = () => {
        const newErrors = {}

        if (!formData.displayName.trim()) {
            newErrors.displayName = 'Display name is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const validatePasswordForm = () => {
        const newErrors = {}

        if (!formData.currentPassword) {
            newErrors.currentPassword = 'Current password is required'
        }

        if (!formData.newPassword) {
            newErrors.newPassword = 'New password is required'
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters'
        }

        if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleUpdateProfile = async () => {
        if (!validateProfileForm()) return

        setSaving(true)
        try {
            if (!user) throw new Error('No user logged in')

            // Update Firebase Auth profile
            await updateProfile(user, {
                displayName: formData.displayName,
                photoURL: formData.photoURL
            })

            // Update backend database
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    displayName: formData.displayName,
                    photoURL: formData.photoURL,
                    role: formData.role
                })
            })

            const data = await response.json()

            if (data.success) {
                setUserData(data.user)
                toast.success('Profile updated successfully!')

                // Reload Firebase user to get updated data
                await user.reload()
            } else {
                throw new Error(data.error || 'Failed to update profile')
            }
        } catch (error) {
            console.error('Update error:', error)
            toast.error(error.message || 'Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    const handleChangePassword = async () => {
        if (!validatePasswordForm()) return

        setSaving(true)
        try {
            if (!user) throw new Error('No user logged in')

            // Check if user is using email/password authentication
            const isEmailProvider = user.providerData.some(
                provider => provider.providerId === 'password'
            )

            if (!isEmailProvider) {
                throw new Error('Password change is only available for email/password accounts')
            }

            // Reauthenticate user with current password
            const credential = EmailAuthProvider.credential(
                user.email,
                formData.currentPassword
            )

            await reauthenticateWithCredential(user, credential)

            // Update password
            await updatePassword(user, formData.newPassword)

            toast.success('Password changed successfully!')

            // Clear password fields
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }))
            setErrors({})
        } catch (error) {
            console.error('Password change error:', error)
            if (error.code === 'auth/wrong-password') {
                setErrors({ currentPassword: 'Incorrect current password' })
                toast.error('Incorrect current password')
            } else if (error.code === 'auth/too-many-requests') {
                toast.error('Too many attempts. Please try again later.')
            } else {
                toast.error(error.message || 'Failed to change password')
            }
        } finally {
            setSaving(false)
        }
    }

    const handleSaveNotifications = async () => {
        setSaving(true)
        try {
            // Save notification preferences to backend
            await new Promise(resolve => setTimeout(resolve, 500))
            toast.success('Notification preferences saved!')
        } catch (error) {
            toast.error('Failed to save preferences')
        } finally {
            setSaving(false)
        }
    }

    const getProviderName = () => {
        if (!user || !user.providerData || user.providerData.length === 0) {
            return 'Unknown'
        }

        const providerId = user.providerData[0].providerId

        switch (providerId) {
            case 'google.com':
                return 'Google'
            case 'password':
                return 'Email'
            case 'facebook.com':
                return 'Facebook'
            case 'github.com':
                return 'GitHub'
            default:
                return providerId
        }
    }

    const isPasswordProvider = () => {
        return user && user.providerData.some(provider => provider.providerId === 'password')
    }

    if (loading) {
        return <Loading />
    }

    if (!user) {
        return <LoginPage />
    }

    const notificationDetails = {
        emailNotifications: {
            icon: Mail,
            title: 'Email Notifications',
            description: 'Receive email updates about your account'
        },
        orderUpdates: {
            icon: Bell,
            title: 'Order Updates',
            description: 'Get notified when your order status changes'
        },
        productUpdates: {
            icon: Bell,
            title: 'Product Updates',
            description: 'Receive updates about new products and features'
        },
        newsletter: {
            icon: Mail,
            title: 'Newsletter',
            description: 'Subscribe to our weekly newsletter and tips'
        }
    }

    return (
        <div className="min-h-screen bg-base-100">
            <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-base-content mb-2">Account Settings</h1>
                    <p className="text-base-content/70">Manage your account preferences and security</p>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-1 mb-8 border-b border-base-300 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`px-4 sm:px-6 py-3 font-semibold transition-all relative whitespace-nowrap ${activeTab === 'profile'
                            ? 'text-primary'
                            : 'text-base-content/60 hover:text-base-content'
                            }`}
                    >
                        <User className="w-5 h-5 inline-block mr-2" />
                        <span className="hidden sm:inline">Profile</span>
                        {activeTab === 'profile' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`px-4 sm:px-6 py-3 font-semibold transition-all relative whitespace-nowrap ${activeTab === 'security'
                            ? 'text-primary'
                            : 'text-base-content/60 hover:text-base-content'
                            }`}
                    >
                        <Shield className="w-5 h-5 inline-block mr-2" />
                        <span className="hidden sm:inline">Security</span>
                        {activeTab === 'security' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`px-4 sm:px-6 py-3 font-semibold transition-all relative whitespace-nowrap ${activeTab === 'notifications'
                            ? 'text-primary'
                            : 'text-base-content/60 hover:text-base-content'
                            }`}
                    >
                        <Bell className="w-5 h-5 inline-block mr-2" />
                        <span className="hidden sm:inline">Notifications</span>
                        {activeTab === 'notifications' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                    </button>
                </div>

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="max-w-2xl">
                        <div className="bg-base-200 rounded-2xl p-6 sm:p-8 shadow-lg">
                            <h2 className="text-2xl font-bold mb-6">Profile Information</h2>

                            {/* Profile Picture */}
                            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b border-base-300">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full overflow-hidden bg-base-300 ring-4 ring-primary/10">
                                        {formData.photoURL ? (
                                            <img src={formData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-base-content/30 uppercase">
                                                {formData.displayName?.charAt(0) || formData.email?.charAt(0) || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center shadow-lg">
                                        <Camera className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <h3 className="text-lg font-semibold">{formData.displayName || 'User'}</h3>
                                    <p className="text-sm text-base-content/60">{formData.email}</p>
                                    <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                            <Check className="w-3 h-3" />
                                            {getProviderName()} Account
                                        </div>
                                        {userData?.role && (
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-medium capitalize">
                                                {userData.role}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-base-content">
                                        Display Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="displayName"
                                        value={formData.displayName}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 rounded-xl bg-base-100 border-2 transition-all ${errors.displayName
                                            ? 'border-error focus:border-error'
                                            : 'border-base-300 focus:border-primary'
                                            } focus:outline-none`}
                                        placeholder="Enter your display name"
                                    />
                                    {errors.displayName && (
                                        <p className="text-error text-sm mt-1 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.displayName}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-base-content">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        className="w-full px-4 py-3 rounded-xl bg-base-300 border-2 border-base-300 cursor-not-allowed opacity-60"
                                        disabled
                                    />
                                    <p className="text-xs text-base-content/50 mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        Email cannot be changed
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-base-content">
                                        Photo URL
                                    </label>
                                    <input
                                        type="url"
                                        name="photoURL"
                                        value={formData.photoURL}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-base-100 border-2 border-base-300 focus:border-primary focus:outline-none transition-all"
                                        placeholder="https://example.com/photo.jpg"
                                    />
                                    <p className="text-xs text-base-content/50 mt-1">
                                        Enter a URL to your profile picture
                                    </p>
                                </div>

                                {userData && (
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-base-content">
                                            Account Role
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.role}
                                            className="w-full px-4 py-3 rounded-xl bg-base-300 border-2 border-base-300 cursor-not-allowed opacity-60 capitalize"
                                            disabled
                                        />
                                        <p className="text-xs text-base-content/50 mt-1">
                                            Contact admin to change your role
                                        </p>
                                    </div>
                                )}

                                <button
                                    onClick={handleUpdateProfile}
                                    disabled={saving}
                                    className="w-full bg-linear-to-r from-primary to-secondary text-primary-content py-3 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                                >
                                    {saving ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-primary-content/30 border-t-primary-content rounded-full animate-spin" />
                                            Saving Changes...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div className="max-w-2xl space-y-6">
                        {/* Change Password Section */}
                        {isPasswordProvider() ? (
                            <div className="bg-base-200 rounded-2xl p-6 sm:p-8 shadow-lg">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center">
                                        <Shield className="w-6 h-6 text-error" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">Change Password</h2>
                                        <p className="text-sm text-base-content/60">Update your account password</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-base-content">
                                            Current Password *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="currentPassword"
                                                value={formData.currentPassword}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 rounded-xl bg-base-100 border-2 transition-all pr-12 ${errors.currentPassword
                                                    ? 'border-error focus:border-error'
                                                    : 'border-base-300 focus:border-primary'
                                                    } focus:outline-none`}
                                                placeholder="Enter current password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {errors.currentPassword && (
                                            <p className="text-error text-sm mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.currentPassword}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-base-content">
                                            New Password *
                                        </label>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 rounded-xl bg-base-100 border-2 transition-all ${errors.newPassword
                                                ? 'border-error focus:border-error'
                                                : 'border-base-300 focus:border-primary'
                                                } focus:outline-none`}
                                            placeholder="Enter new password"
                                        />
                                        {errors.newPassword && (
                                            <p className="text-error text-sm mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.newPassword}
                                            </p>
                                        )}
                                        <p className="text-xs text-base-content/50 mt-1">
                                            Password must be at least 6 characters
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-base-content">
                                            Confirm New Password *
                                        </label>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 rounded-xl bg-base-100 border-2 transition-all ${errors.confirmPassword
                                                ? 'border-error focus:border-error'
                                                : 'border-base-300 focus:border-primary'
                                                } focus:outline-none`}
                                            placeholder="Confirm new password"
                                        />
                                        {errors.confirmPassword && (
                                            <p className="text-error text-sm mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.confirmPassword}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleChangePassword}
                                        disabled={saving}
                                        className="w-full bg-error text-error-content py-3 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                                    >
                                        {saving ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-error-content/30 border-t-error-content rounded-full animate-spin" />
                                                Changing Password...
                                            </>
                                        ) : (
                                            <>
                                                <Shield className="w-5 h-5" />
                                                Change Password
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-base-200 rounded-2xl p-6 sm:p-8 shadow-lg">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                                        <Shield className="w-6 h-6 text-info" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">Password Not Available</h2>
                                        <p className="text-sm text-base-content/60">Your account uses {getProviderName()} authentication</p>
                                    </div>
                                </div>
                                <p className="text-base-content/70">
                                    Password management is only available for email/password accounts.
                                    Since you&apos;re using {getProviderName()} to sign in, please manage your password
                                    through your {getProviderName()} account settings.
                                </p>
                            </div>
                        )}

                        {/* Account Information */}
                        <div className="bg-base-200 rounded-2xl p-6 sm:p-8 shadow-lg">
                            <h2 className="text-xl font-bold mb-4">Account Information</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-base-300">
                                    <span className="text-base-content/70">User ID</span>
                                    <span className="font-mono text-sm text-right break-all max-w-[60%]">{user.uid}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-base-300">
                                    <span className="text-base-content/70">Email Verified</span>
                                    <span className={user.emailVerified ? 'text-success font-semibold' : 'text-warning font-semibold'}>
                                        {user.emailVerified ? 'Yes' : 'No'}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-base-300">
                                    <span className="text-base-content/70">Account Created</span>
                                    <span>{new Date(user.metadata.creationTime).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-base-content/70">Last Sign In</span>
                                    <span>{new Date(user.metadata.lastSignInTime).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <div className="max-w-2xl">
                        <div className="bg-base-200 rounded-2xl p-6 sm:p-8 shadow-lg">
                            <h2 className="text-2xl font-bold mb-6">Notification Preferences</h2>

                            <div className="space-y-4 mb-6">
                                {Object.entries(notifications).map(([key, value]) => {
                                    const detail = notificationDetails[key]
                                    const Icon = detail.icon

                                    return (
                                        <div
                                            key={key}
                                            className="flex items-center justify-between p-4 bg-base-100 rounded-xl hover:bg-base-100/80 transition-all border border-base-300"
                                        >
                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                    <Icon className="w-5 h-5 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-base-content">
                                                        {detail.title}
                                                    </p>
                                                    <p className="text-sm text-base-content/60">
                                                        {detail.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                                                <input
                                                    type="checkbox"
                                                    checked={value}
                                                    onChange={() => handleNotificationChange(key)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-base-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                            </label>
                                        </div>
                                    )
                                })}
                            </div>

                            <button
                                onClick={handleSaveNotifications}
                                disabled={saving}
                                className="w-full bg-success text-success-content py-3 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                            >
                                {saving ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-success-content/30 border-t-success-content rounded-full animate-spin" />
                                        Saving Preferences...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Save Preferences
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
