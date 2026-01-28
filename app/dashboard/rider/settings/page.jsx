'use client'

import { useState, useEffect } from 'react'
import {
    User, Mail, Bell, Shield, Eye, EyeOff, Save, Camera, AlertCircle, Check,
    Upload, Trash2, Lock, LogOut, Smartphone, RefreshCw, Key,
    Settings as SettingsIcon, Palette, Download, CheckCircle
} from 'lucide-react'
import { auth } from '@/lib/firebase/config'
import {
    updateProfile,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
    sendPasswordResetEmail,
    deleteUser
} from 'firebase/auth'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Loading from '../../loading'
import { uploadImageToImgBB } from '@/utils/imageUpload'
import Image from 'next/image'

export default function SettingsPage() {
    const router = useRouter()
    const [user, setUser] = useState(null)
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [activeTab, setActiveTab] = useState('profile')
    const [uploadingImage, setUploadingImage] = useState(false)
    const [imagePreview, setImagePreview] = useState(null)

    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        photoURL: '',
        phoneNumber: '',
        role: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const [settings, setSettings] = useState({
        preferences: {
            theme: 'light',
            language: 'en',
            timezone: 'UTC',
            dateFormat: 'MM/DD/YYYY',
            currency: 'USD'
        },
        notifications: {
            emailNotifications: true,
            orderUpdates: true,
            productUpdates: false,
            newsletter: false,
            securityAlerts: true,
            promotions: false,
            comments: true,
            mentions: true
        },
        privacy: {
            profileVisibility: 'public',
            showEmail: false,
            showPhone: false,
            activityStatus: true,
            dataCollection: true
        }
    })

    const [errors, setErrors] = useState({})
    const [autoSaveStatus, setAutoSaveStatus] = useState('saved')

    // Load user data and settings
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    setUser(firebaseUser)
                    await loadUserData(firebaseUser)
                    await loadUserSettings(firebaseUser.uid)
                } else {
                    router.push('/login')
                }
            } catch (err) {
                console.error('Auth error:', err)
                toast.error('Failed to load user data')
            } finally {
                setLoading(false)
            }
        })
        return () => unsubscribe()
    }, [router])

    const loadUserData = async (firebaseUser) => {
        try {
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
                        phoneNumber: data.user.phoneNumber || '',
                        role: data.user.role || 'user',
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                    })
                }
            }
        } catch (error) {
            console.error('Load user data error:', error)
        }
    }

    const loadUserSettings = async (userId) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/settings/${userId}`
            )

            if (response.ok) {
                const data = await response.json()
                if (data.success && data.settings) {
                    setSettings({
                        preferences: data.settings.preferences || settings.preferences,
                        notifications: data.settings.notifications || settings.notifications,
                        privacy: data.settings.privacy || settings.privacy
                    })
                }
            }
        } catch (error) {
            console.error('Load settings error:', error)
        }
    }

    // Auto-save settings to database
    useEffect(() => {
        if (!loading && user) {
            const timer = setTimeout(() => {
                saveSettingsToDB()
            }, 1500)
            return () => clearTimeout(timer)
        }
    }, [settings])

    const saveSettingsToDB = async () => {
        if (!user) return

        try {
            setAutoSaveStatus('saving')

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/settings/${user.uid}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(settings)
                }
            )

            if (response.ok) {
                setAutoSaveStatus('saved')
            } else {
                setAutoSaveStatus('error')
            }
        } catch (error) {
            console.error('Auto-save error:', error)
            setAutoSaveStatus('error')
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const updateSettings = (category, key, value) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: value
            }
        }))
    }

    const handleImageSelect = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB')
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => setImagePreview(reader.result)
        reader.readAsDataURL(file)

        setUploadingImage(true)
        try {
            const result = await uploadImageToImgBB(file)
            if (result.success) {
                setFormData(prev => ({ ...prev, photoURL: result.url }))
                toast.success('Image uploaded successfully!')
            } else {
                throw new Error(result.error || 'Upload failed')
            }
        } catch (error) {
            console.error('Image upload error:', error)
            toast.error('Failed to upload image')
            setImagePreview(null)
        } finally {
            setUploadingImage(false)
        }
    }

    const removeProfileImage = () => {
        setFormData(prev => ({ ...prev, photoURL: '' }))
        setImagePreview(null)
        toast.success('Profile image removed')
    }

    const handleUpdateProfile = async () => {
        if (!formData.displayName.trim()) {
            setErrors({ displayName: 'Display name is required' })
            return
        }

        setSaving(true)
        try {
            await updateProfile(user, {
                displayName: formData.displayName,
                photoURL: formData.photoURL
            })

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    displayName: formData.displayName,
                    photoURL: formData.photoURL,
                    phoneNumber: formData.phoneNumber,
                    role: formData.role
                })
            })

            const data = await response.json()

            if (data.success) {
                setUserData(data.user)
                toast.success('Profile updated successfully!', { icon: '✅' })
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
        const newErrors = {}
        if (!formData.currentPassword) newErrors.currentPassword = 'Required'
        if (!formData.newPassword) newErrors.newPassword = 'Required'
        else if (formData.newPassword.length < 6) newErrors.newPassword = 'Min 6 characters'
        if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        setSaving(true)
        try {
            const credential = EmailAuthProvider.credential(user.email, formData.currentPassword)
            await reauthenticateWithCredential(user, credential)
            await updatePassword(user, formData.newPassword)

            toast.success('Password changed successfully!', { icon: '🔒' })
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }))
            setErrors({})
        } catch (error) {
            if (error.code === 'auth/wrong-password') {
                setErrors({ currentPassword: 'Incorrect password' })
                toast.error('Incorrect current password')
            } else {
                toast.error(error.message || 'Failed to change password')
            }
        } finally {
            setSaving(false)
        }
    }

    const handleForgotPassword = async () => {
        try {
            await sendPasswordResetEmail(auth, user.email)
            toast.success('Password reset email sent!', { icon: '📧', duration: 5000 })
        } catch (error) {
            toast.error('Failed to send reset email')
        }
    }

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            'Are you absolutely sure? This will permanently delete your account and all associated data. This action cannot be undone!'
        )
        if (!confirmed) return

        const doubleCheck = window.prompt('Type "DELETE" to confirm account deletion:')
        if (doubleCheck !== 'DELETE') {
            toast.error('Account deletion cancelled')
            return
        }

        try {
            // Delete settings first
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/${user.uid}`, {
                method: 'DELETE'
            })

            // Delete user account
            await deleteUser(user)
            toast.success('Account deleted successfully')
            router.push('/')
        } catch (error) {
            if (error.code === 'auth/requires-recent-login') {
                toast.error('Please log in again to delete your account')
            } else {
                toast.error('Failed to delete account')
            }
        }
    }

    const handleLogout = async () => {
        try {
            await auth.signOut()
            toast.success('Logged out successfully')
            router.push('/login')
        } catch (error) {
            toast.error('Failed to log out')
        }
    }

    const downloadUserData = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/settings/${user.uid}/export`
            )

            if (response.ok) {
                const data = await response.json()

                const fullData = {
                    profile: {
                        uid: user.uid,
                        displayName: formData.displayName,
                        email: formData.email,
                        phoneNumber: formData.phoneNumber,
                        role: formData.role
                    },
                    settings: data.data,
                    account: {
                        emailVerified: user.emailVerified,
                        creationTime: user.metadata.creationTime,
                        lastSignInTime: user.metadata.lastSignInTime
                    }
                }

                const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `user-data-${user.uid.slice(0, 8)}-${Date.now()}.json`
                a.click()
                URL.revokeObjectURL(url)
                toast.success('User data downloaded!', { icon: '📥' })
            }
        } catch (error) {
            console.error('Download error:', error)
            toast.error('Failed to download data')
        }
    }

    const getProviderName = () => {
        if (!user?.providerData?.length) return 'Unknown'
        const providerId = user.providerData[0].providerId
        const providers = {
            'google.com': 'Google',
            'password': 'Email',
            'facebook.com': 'Facebook',
            'github.com': 'GitHub'
        }
        return providers[providerId] || providerId
    }

    const isPasswordProvider = () => {
        return user?.providerData.some(provider => provider.providerId === 'password')
    }

    if (loading) return <Loading />
    if (!user) {
        router.push('/login')
        return null
    }

    return (
        <div className="min-h-screen">
            <div className="max-w-5xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                <SettingsIcon className="w-5 h-5 text-white" />
                            </div>
                            Settings
                        </h1>
                        <p className="text-base-content/70 mt-1 text-sm">Manage your account and preferences</p>
                    </div>

                    {/* Auto-save Indicator */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-base-200 text-sm">
                        {autoSaveStatus === 'saving' && (
                            <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-warning" />
                                <span className="text-warning">Saving...</span>
                            </>
                        )}
                        {autoSaveStatus === 'saved' && (
                            <>
                                <CheckCircle className="w-3.5 h-3.5 text-success" />
                                <span className="text-success">Saved</span>
                            </>
                        )}
                        {autoSaveStatus === 'error' && (
                            <>
                                <AlertCircle className="w-3.5 h-3.5 text-error" />
                                <span className="text-error">Error</span>
                            </>
                        )}
                    </div>
                </div>

                {/* DaisyUI Tabs */}
                <div role="tablist" className="tabs tabs-boxed bg-base-200 mb-6 p-1">
                    <button
                        role="tab"
                        className={`tab gap-2 ${activeTab === 'profile' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <User className="w-4 h-4" />
                        <span className="hidden sm:inline">Profile</span>
                    </button>
                    <button
                        role="tab"
                        className={`tab gap-2 ${activeTab === 'security' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        <Shield className="w-4 h-4" />
                        <span className="hidden sm:inline">Security</span>
                    </button>
                    <button
                        role="tab"
                        className={`tab gap-2 ${activeTab === 'notifications' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('notifications')}
                    >
                        <Bell className="w-4 h-4" />
                        <span className="hidden sm:inline">Notifications</span>
                    </button>
                    <button
                        role="tab"
                        className={`tab gap-2 ${activeTab === 'preferences' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('preferences')}
                    >
                        <Palette className="w-4 h-4" />
                        <span className="hidden sm:inline">Preferences</span>
                    </button>
                    <button
                        role="tab"
                        className={`tab gap-2 ${activeTab === 'privacy' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('privacy')}
                    >
                        <Lock className="w-4 h-4" />
                        <span className="hidden sm:inline">Privacy</span>
                    </button>
                </div>

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="space-y-4">
                        {/* Profile Header */}
                        <div className="card bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border border-base-300">
                            <div className="card-body">
                                <div className="flex flex-col md:flex-row items-center gap-4">
                                    {/* Image Upload */}
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-base-300 ring-2 ring-primary/30">
                                            {imagePreview || formData.photoURL ? (
                                                <Image
                                                    src={imagePreview || formData.photoURL}
                                                    alt="Profile"
                                                    width={96}
                                                    height={96}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-base-content/30 uppercase bg-gradient-to-br from-primary/20 to-secondary/20">
                                                    {formData.displayName?.charAt(0) || 'U'}
                                                </div>
                                            )}
                                        </div>

                                        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-2xl">
                                            <label className="cursor-pointer">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageSelect}
                                                    className="hidden"
                                                    disabled={uploadingImage}
                                                />
                                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:scale-110 transition-transform">
                                                    {uploadingImage ? (
                                                        <RefreshCw className="w-4 h-4 text-white animate-spin" />
                                                    ) : (
                                                        <Upload className="w-4 h-4 text-white" />
                                                    )}
                                                </div>
                                            </label>
                                            {formData.photoURL && (
                                                <button
                                                    onClick={removeProfileImage}
                                                    className="w-8 h-8 rounded-full bg-error flex items-center justify-center hover:scale-110 transition-transform"
                                                >
                                                    <Trash2 className="w-4 h-4 text-white" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-success text-white flex items-center justify-center shadow-lg">
                                            <Camera className="w-4 h-4" />
                                        </div>
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-1 text-center md:text-left">
                                        <h2 className="text-xl font-bold text-base-content">
                                            {formData.displayName || 'User'}
                                        </h2>
                                        <p className="text-base-content/70 text-sm mb-2">{formData.email}</p>
                                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                            <div className="badge badge-primary gap-1">
                                                <Check className="w-3 h-3" />
                                                {getProviderName()}
                                            </div>
                                            <div className="badge badge-secondary capitalize">
                                                {formData.role}
                                            </div>
                                            {user.emailVerified && (
                                                <div className="badge badge-success gap-1">
                                                    <Shield className="w-3 h-3" />
                                                    Verified
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Form */}
                        <div className="card bg-base-200">
                            <div className="card-body">
                                <h3 className="font-bold mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary" />
                                    Personal Information
                                </h3>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">Display Name</span>
                                            <span className="label-text-alt text-error">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="displayName"
                                            value={formData.displayName}
                                            onChange={handleChange}
                                            className={`input input-bordered w-full ${errors.displayName ? 'input-error' : ''}`}
                                            placeholder="Enter your display name"
                                        />
                                        {errors.displayName ? (
                                            <label className="label">
                                                <span className="label-text-alt text-error">{errors.displayName}</span>
                                            </label>
                                        ) : (
                                            <label className="label">
                                                <span className="label-text-alt text-base-content/50">This is how others will see you</span>
                                            </label>
                                        )}
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">Email Address</span>
                                            <span className="label-text-alt">🔒</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            className="input input-bordered w-full bg-base-300/50 cursor-not-allowed"
                                            disabled
                                        />
                                        <label className="label">
                                            <span className="label-text-alt text-base-content/50">Email cannot be changed</span>
                                        </label>
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">Phone Number</span>
                                        </label>
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            className="input input-bordered w-full"
                                            placeholder="+1 (555) 123-4567"
                                        />
                                        <label className="label">
                                            <span className="label-text-alt text-base-content/50">Used for order updates</span>
                                        </label>
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">Account Role</span>
                                            <span className="label-text-alt">🔒</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.role}
                                            className="input input-bordered w-full bg-base-300/50 cursor-not-allowed capitalize"
                                            disabled
                                        />
                                        <label className="label">
                                            <span className="label-text-alt text-base-content/50">Contact admin to change role</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={handleUpdateProfile}
                                        disabled={saving}
                                        className="btn btn-primary gap-2"
                                    >
                                        {saving ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={downloadUserData}
                                        className="btn btn-ghost gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download Data
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div className="space-y-4">
                        {isPasswordProvider() && (
                            <div className="card bg-base-200">
                                <div className="card-body">
                                    <h3 className="font-bold mb-4 flex items-center gap-2">
                                        <Key className="w-5 h-5 text-primary" />
                                        Change Password
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text font-semibold">Current Password</span>
                                                <span className="label-text-alt text-error">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    name="currentPassword"
                                                    value={formData.currentPassword}
                                                    onChange={handleChange}
                                                    className={`input input-bordered w-full pr-12 ${errors.currentPassword ? 'input-error' : ''}`}
                                                    placeholder="Enter your current password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            {errors.currentPassword ? (
                                                <label className="label">
                                                    <span className="label-text-alt text-error">{errors.currentPassword}</span>
                                                </label>
                                            ) : (
                                                <label className="label">
                                                    <span className="label-text-alt text-base-content/50">Required to verify your identity</span>
                                                </label>
                                            )}
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text font-semibold">New Password</span>
                                                    <span className="label-text-alt text-error">*</span>
                                                </label>
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    name="newPassword"
                                                    value={formData.newPassword}
                                                    onChange={handleChange}
                                                    className={`input input-bordered w-full ${errors.newPassword ? 'input-error' : ''}`}
                                                    placeholder="Min 6 characters"
                                                />
                                                {errors.newPassword ? (
                                                    <label className="label">
                                                        <span className="label-text-alt text-error">{errors.newPassword}</span>
                                                    </label>
                                                ) : (
                                                    <label className="label">
                                                        <span className="label-text-alt text-base-content/50">At least 6 characters</span>
                                                    </label>
                                                )}
                                            </div>

                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text font-semibold">Confirm Password</span>
                                                    <span className="label-text-alt text-error">*</span>
                                                </label>
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    className={`input input-bordered w-full ${errors.confirmPassword ? 'input-error' : ''}`}
                                                    placeholder="Re-enter new password"
                                                />
                                                {errors.confirmPassword ? (
                                                    <label className="label">
                                                        <span className="label-text-alt text-error">{errors.confirmPassword}</span>
                                                    </label>
                                                ) : (
                                                    <label className="label">
                                                        <span className="label-text-alt text-base-content/50">Must match new password</span>
                                                    </label>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 pt-2">
                                            <button
                                                onClick={handleChangePassword}
                                                disabled={saving}
                                                className="btn btn-error gap-2"
                                            >
                                                {saving ? (
                                                    <>
                                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                                        Changing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Shield className="w-4 h-4" />
                                                        Change Password
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={handleForgotPassword}
                                                className="btn btn-ghost gap-2"
                                            >
                                                <Mail className="w-4 h-4" />
                                                Send Reset Email
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Account Info */}
                        <div className="card bg-base-200">
                            <div className="card-body">
                                <h3 className="font-bold mb-3 flex items-center gap-2">
                                    <Smartphone className="w-5 h-5 text-primary" />
                                    Account Information
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center p-2 bg-base-100 rounded-lg text-sm">
                                        <span className="text-base-content/70">User ID</span>
                                        <code className="text-xs bg-base-300 px-2 py-1 rounded">{user.uid.slice(0, 12)}...</code>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-base-100 rounded-lg text-sm">
                                        <span className="text-base-content/70">Email Verified</span>
                                        <div className={`badge badge-sm ${user.emailVerified ? 'badge-success' : 'badge-warning'}`}>
                                            {user.emailVerified ? 'Yes' : 'No'}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-base-100 rounded-lg text-sm">
                                        <span className="text-base-content/70">Created</span>
                                        <span className="font-semibold text-xs">{new Date(user.metadata.creationTime).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-base-100 rounded-lg text-sm">
                                        <span className="text-base-content/70">Last Sign In</span>
                                        <span className="font-semibold text-xs">{new Date(user.metadata.lastSignInTime).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="card bg-error/10 border border-error/30">
                            <div className="card-body">
                                <h3 className="font-bold mb-2 flex items-center gap-2 text-error">
                                    <AlertCircle className="w-5 h-5" />
                                    Danger Zone
                                </h3>
                                <p className="text-sm text-base-content/70 mb-3">
                                    Delete your account permanently. This action cannot be undone.
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleDeleteAccount}
                                        className="btn btn-error btn-sm gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Account
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="btn btn-ghost btn-sm gap-2"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Bell className="w-5 h-5 text-primary" />
                                Notification Preferences
                            </h3>

                            <div className="space-y-3">
                                {Object.entries(settings.notifications).map(([key, value]) => {
                                    const labels = {
                                        emailNotifications: { title: 'Email Notifications', desc: 'Receive email updates about your account', icon: '📧' },
                                        orderUpdates: { title: 'Order Updates', desc: 'Get notified when order status changes', icon: '📦' },
                                        productUpdates: { title: 'Product Updates', desc: 'New products, features, and announcements', icon: '🆕' },
                                        newsletter: { title: 'Newsletter', desc: 'Weekly tips, updates, and exclusive content', icon: '📰' },
                                        securityAlerts: { title: 'Security Alerts', desc: 'Important security and login notifications', icon: '🔒' },
                                        promotions: { title: 'Promotions & Offers', desc: 'Special offers, discounts, and deals', icon: '🎁' },
                                        comments: { title: 'Comments', desc: 'When someone comments on your posts', icon: '💬' },
                                        mentions: { title: 'Mentions', desc: 'When someone mentions or tags you', icon: '🏷️' }
                                    }
                                    const label = labels[key]

                                    return (
                                        <div key={key} className="flex items-center justify-between p-4 bg-base-100 rounded-lg border border-base-300 hover:border-primary/50 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <span className="text-2xl">{label.icon}</span>
                                                <div>
                                                    <p className="font-semibold text-sm">{label.title}</p>
                                                    <p className="text-xs text-base-content/60 mt-0.5">{label.desc}</p>
                                                </div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={value}
                                                onChange={() => updateSettings('notifications', key, !value)}
                                                className="toggle toggle-primary toggle-sm"
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Palette className="w-5 h-5 text-primary" />
                                Appearance & Display
                            </h3>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold">Theme Preference</span>
                                    </label>
                                    <select
                                        value={settings.preferences.theme}
                                        onChange={(e) => updateSettings('preferences', 'theme', e.target.value)}
                                        className="select select-bordered w-full"
                                    >
                                        <option value="light">☀️ Light Mode</option>
                                        <option value="dark">🌙 Dark Mode</option>
                                        <option value="auto">💻 System Default</option>
                                    </select>
                                    <label className="label">
                                        <span className="label-text-alt text-base-content/50">Choose your display theme</span>
                                    </label>
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold">Language</span>
                                    </label>
                                    <select
                                        value={settings.preferences.language}
                                        onChange={(e) => updateSettings('preferences', 'language', e.target.value)}
                                        className="select select-bordered w-full"
                                    >
                                        <option value="en">🇺🇸 English</option>
                                        <option value="es">🇪🇸 Español</option>
                                        <option value="fr">🇫🇷 Français</option>
                                        <option value="de">🇩🇪 Deutsch</option>
                                    </select>
                                    <label className="label">
                                        <span className="label-text-alt text-base-content/50">Interface language</span>
                                    </label>
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold">Timezone</span>
                                    </label>
                                    <select
                                        value={settings.preferences.timezone}
                                        onChange={(e) => updateSettings('preferences', 'timezone', e.target.value)}
                                        className="select select-bordered w-full"
                                    >
                                        <option value="UTC">🌍 UTC (Coordinated Universal Time)</option>
                                        <option value="EST">🇺🇸 EST (Eastern Time)</option>
                                        <option value="PST">🇺🇸 PST (Pacific Time)</option>
                                        <option value="CST">🇺🇸 CST (Central Time)</option>
                                    </select>
                                    <label className="label">
                                        <span className="label-text-alt text-base-content/50">Used for timestamps</span>
                                    </label>
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold">Date Format</span>
                                    </label>
                                    <select
                                        value={settings.preferences.dateFormat}
                                        onChange={(e) => updateSettings('preferences', 'dateFormat', e.target.value)}
                                        className="select select-bordered w-full"
                                    >
                                        <option value="MM/DD/YYYY">📅 MM/DD/YYYY (01/28/2026)</option>
                                        <option value="DD/MM/YYYY">📅 DD/MM/YYYY (28/01/2026)</option>
                                        <option value="YYYY-MM-DD">📅 YYYY-MM-DD (2026-01-28)</option>
                                    </select>
                                    <label className="label">
                                        <span className="label-text-alt text-base-content/50">How dates are displayed</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Privacy Tab */}
                {activeTab === 'privacy' && (
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Lock className="w-5 h-5 text-primary" />
                                Privacy Settings
                            </h3>

                            <div className="space-y-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold">Profile Visibility</span>
                                    </label>
                                    <select
                                        value={settings.privacy.profileVisibility}
                                        onChange={(e) => updateSettings('privacy', 'profileVisibility', e.target.value)}
                                        className="select select-bordered w-full"
                                    >
                                        <option value="public">🌍 Public - Anyone can see</option>
                                        <option value="private">🔒 Private - Only you</option>
                                        <option value="friends">👥 Friends Only</option>
                                    </select>
                                    <label className="label">
                                        <span className="label-text-alt text-base-content/50">Control who can view your profile</span>
                                    </label>
                                </div>

                                {['showEmail', 'showPhone', 'activityStatus', 'dataCollection'].map((key) => {
                                    const labels = {
                                        showEmail: { title: 'Show Email', desc: 'Display email address on public profile', icon: '📧' },
                                        showPhone: { title: 'Show Phone', desc: 'Display phone number on public profile', icon: '📱' },
                                        activityStatus: { title: 'Activity Status', desc: 'Let others see when you\'re active', icon: '🟢' },
                                        dataCollection: { title: 'Data Collection', desc: 'Allow analytics and improvement data collection', icon: '📊' }
                                    }
                                    const label = labels[key]

                                    return (
                                        <div key={key} className="flex items-center justify-between p-4 bg-base-100 rounded-lg border border-base-300 hover:border-primary/50 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <span className="text-2xl">{label.icon}</span>
                                                <div>
                                                    <p className="font-semibold text-sm">{label.title}</p>
                                                    <p className="text-xs text-base-content/60 mt-0.5">{label.desc}</p>
                                                </div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={settings.privacy[key]}
                                                onChange={(e) => updateSettings('privacy', key, e.target.checked)}
                                                className="toggle toggle-primary toggle-sm"
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
