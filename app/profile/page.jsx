// app/profile/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Mail, Shield, Calendar, Edit, Save, X, Upload, Package, Heart, ShoppingCart, CheckCircle, Clock } from 'lucide-react'
import { getCurrentUser } from '@/lib/firebase/auth'
import { uploadImageToImgBB, validateImage } from '@/utils/imageUpload'
import toast from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'

export default function ProfilePage() {
    const router = useRouter()
    const [user, setUser] = useState(null)
    const [userProfile, setUserProfile] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [orderStats, setOrderStats] = useState({ total: 0, delivered: 0, processing: 0 })

    const [editData, setEditData] = useState({
        displayName: '',
        photoURL: ''
    })
    const [photoFile, setPhotoFile] = useState(null)
    const [photoPreview, setPhotoPreview] = useState('')

    useEffect(() => {
        const currentUser = getCurrentUser()
        if (!currentUser) {
            toast.error('Please login to view profile')
            router.push('/login')
            return
        }
        setUser(currentUser)
        fetchUserProfile(currentUser.uid)
        fetchOrderStats(currentUser.uid)
    }, [router])

    const fetchUserProfile = async (uid) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/user/${uid}`)
            const data = await response.json()

            if (data.success) {
                setUserProfile(data.user)
                setEditData({
                    displayName: data.user.displayName,
                    photoURL: data.user.photoURL
                })
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
            toast.error('Failed to load profile')
        } finally {
            setIsLoading(false)
        }
    }

    const fetchOrderStats = async (userId) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/user/${userId}`)
            const data = await response.json()

            if (data.success) {
                const stats = {
                    total: data.orders.length,
                    delivered: data.orders.filter(o => o.status === 'delivered').length,
                    processing: data.orders.filter(o => o.status === 'processing' || o.status === 'confirmed').length
                }
                setOrderStats(stats)
            }
        } catch (error) {
            console.error('Error fetching order stats:', error)
        }
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

    const handleSave = async () => {
        if (!user) return

        setIsSaving(true)

        try {
            let newPhotoURL = editData.photoURL

            // Upload new photo if selected
            if (photoFile) {
                toast.loading('Uploading profile photo...')
                const uploadResult = await uploadImageToImgBB(photoFile)
                toast.dismiss()

                if (uploadResult.success) {
                    newPhotoURL = uploadResult.url
                } else {
                    toast.error('Failed to upload photo')
                    setIsSaving(false)
                    return
                }
            }

            // Update user in MongoDB
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    displayName: editData.displayName,
                    photoURL: newPhotoURL,
                    role: userProfile.role,
                    provider: userProfile.provider
                })
            })

            const data = await response.json()

            if (data.success) {
                setUserProfile(data.user)
                setEditData({
                    displayName: data.user.displayName,
                    photoURL: data.user.photoURL
                })
                setPhotoFile(null)
                setPhotoPreview('')
                setIsEditing(false)
                toast.success('Profile updated successfully!')
            } else {
                toast.error('Failed to update profile')
            }
        } catch (error) {
            console.error('Error updating profile:', error)
            toast.error('Failed to update profile')
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        setEditData({
            displayName: userProfile.displayName,
            photoURL: userProfile.photoURL
        })
        setPhotoFile(null)
        setPhotoPreview('')
        setIsEditing(false)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen pt-32 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-base-content/70 text-lg">Loading profile...</p>
                </div>
            </div>
        )
    }

    if (!userProfile) return null

    const displayPhoto = photoPreview || editData.photoURL || userProfile.photoURL

    return (
        <div className="min-h-screen">
            <div className="section-padding">
                <div className="container-custom max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold text-base-content mb-2">
                            My Profile
                        </h1>
                        <p className="text-base-content/70">
                            Manage your account settings and preferences
                        </p>
                    </motion.div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Profile Card */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="lg:col-span-1"
                        >
                            <div className="card bg-base-200 text-center sticky top-24">
                                {/* Profile Photo */}
                                <div className="relative mx-auto mb-6">
                                    <div className="w-32 h-32 rounded-full overflow-hidden bg-base-300 mx-auto relative">
                                        {displayPhoto ? (
                                            <Image
                                                src={displayPhoto}
                                                alt={userProfile.displayName}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary to-secondary text-primary-content text-4xl font-bold">
                                                {userProfile.displayName?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    {isEditing && (
                                        <label
                                            htmlFor="photo-upload"
                                            className="absolute bottom-0 right-1/2 translate-x-18 bg-primary text-primary-content p-2 rounded-full cursor-pointer hover:opacity-90 transition-opacity shadow-lg"
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
                                    )}
                                </div>

                                {/* User Info */}
                                <div className="space-y-2 mb-6">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editData.displayName}
                                            onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                                            className="w-full px-4 py-2 bg-base-100 border-2 border-base-300 rounded-lg text-center text-xl font-bold focus:outline-none focus:border-primary"
                                        />
                                    ) : (
                                        <h2 className="text-2xl font-bold text-base-content">
                                            {userProfile.displayName}
                                        </h2>
                                    )}
                                    <p className="text-base-content/60 flex items-center justify-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        {userProfile.email}
                                    </p>
                                    <div className="flex items-center justify-center gap-2">
                                        <Shield className="w-4 h-4 text-primary" />
                                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold capitalize">
                                            {userProfile.role}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-content px-4 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit Profile
                                    </button>
                                ) : (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="flex-1 flex items-center justify-center gap-2 bg-success text-success-content px-4 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                                        >
                                            <Save className="w-4 h-4" />
                                            {isSaving ? 'Saving...' : 'Save'}
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            disabled={isSaving}
                                            className="flex-1 flex items-center justify-center gap-2 bg-error text-error-content px-4 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                                        >
                                            <X className="w-4 h-4" />
                                            Cancel
                                        </button>
                                    </div>
                                )}

                                {/* Account Info */}
                                <div className="mt-6 pt-6 border-t border-base-300 space-y-3 text-left">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-base-content/60">Provider</span>
                                        <span className="text-sm font-semibold text-base-content capitalize">
                                            {userProfile.provider}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-base-content/60">Member Since</span>
                                        <span className="text-sm font-semibold text-base-content">
                                            {new Date(userProfile.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Stats & Activity */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Stats Cards */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="grid md:grid-cols-3 gap-6"
                            >
                                {[
                                    { icon: Package, label: 'Total Orders', value: orderStats.total, color: 'primary' },
                                    { icon: CheckCircle, label: 'Delivered', value: orderStats.delivered, color: 'success' },
                                    { icon: Clock, label: 'Processing', value: orderStats.processing, color: 'warning' },
                                ].map((stat, idx) => (
                                    <div key={idx} className={`card bg-${stat.color}/10 border-2 border-${stat.color}/20`}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-base-content/60 text-sm mb-1">{stat.label}</div>
                                                <div className={`text-3xl font-bold text-${stat.color}`}>{stat.value}</div>
                                            </div>
                                            <stat.icon className={`w-12 h-12 text-${stat.color}/30`} />
                                        </div>
                                    </div>
                                ))}
                            </motion.div>

                            {/* Quick Actions */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="card bg-base-200"
                            >
                                <h3 className="text-2xl font-bold text-base-content mb-6">Quick Actions</h3>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <Link
                                        href="/orders"
                                        className="flex flex-col items-center gap-3 p-6 bg-base-100 rounded-lg hover:shadow-lg transition-all duration-300 group"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-content transition-colors">
                                            <Package className="w-8 h-8" />
                                        </div>
                                        <span className="font-semibold text-base-content">My Orders</span>
                                    </Link>
                                    <Link
                                        href="/wishlist"
                                        className="flex flex-col items-center gap-3 p-6 bg-base-100 rounded-lg hover:shadow-lg transition-all duration-300 group"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center group-hover:bg-error group-hover:text-error-content transition-colors">
                                            <Heart className="w-8 h-8" />
                                        </div>
                                        <span className="font-semibold text-base-content">Wishlist</span>
                                    </Link>
                                    <Link
                                        href="/products"
                                        className="flex flex-col items-center gap-3 p-6 bg-base-100 rounded-lg hover:shadow-lg transition-all duration-300 group"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary group-hover:text-secondary-content transition-colors">
                                            <ShoppingCart className="w-8 h-8" />
                                        </div>
                                        <span className="font-semibold text-base-content">Shop Now</span>
                                    </Link>
                                </div>
                            </motion.div>

                            {/* Account Details */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="card bg-base-200"
                            >
                                <h3 className="text-2xl font-bold text-base-content mb-6">Account Details</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-base-100 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <User className="w-5 h-5 text-primary" />
                                            <div>
                                                <div className="text-sm text-base-content/60">Full Name</div>
                                                <div className="font-semibold text-base-content">{userProfile.displayName}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-base-100 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-5 h-5 text-primary" />
                                            <div>
                                                <div className="text-sm text-base-content/60">Email Address</div>
                                                <div className="font-semibold text-base-content">{userProfile.email}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-base-100 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Shield className="w-5 h-5 text-primary" />
                                            <div>
                                                <div className="text-sm text-base-content/60">Account Type</div>
                                                <div className="font-semibold text-base-content capitalize">{userProfile.role}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-base-100 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-5 h-5 text-primary" />
                                            <div>
                                                <div className="text-sm text-base-content/60">Member Since</div>
                                                <div className="font-semibold text-base-content">
                                                    {new Date(userProfile.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
