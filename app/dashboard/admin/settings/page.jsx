'use client'

import { useState } from 'react'
import { User, Mail, Bell, Shield, Eye, EyeOff, Save, Camera, Lock, Globe, Palette, Moon, Sun, Smartphone } from 'lucide-react'
import toast from 'react-hot-toast'
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth'
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'

export default function ProfessionalSettings() {
    const { user, userData } = useFirebaseAuth()
    const [activeTab, setActiveTab] = useState('profile')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    })
    const [formData, setFormData] = useState({
        displayName: userData?.displayName || '',
        email: userData?.email || '',
        phone: userData?.phone || '',
        bio: userData?.bio || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        orderUpdates: true,
        productUpdates: false,
        newsletter: false,
        smsNotifications: true,
        pushNotifications: true
    })

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User, gradient: 'from-blue-500 to-cyan-500' },
        { id: 'security', label: 'Security', icon: Shield, gradient: 'from-red-500 to-pink-500' },
        { id: 'notifications', label: 'Notifications', icon: Bell, gradient: 'from-green-500 to-emerald-500' },
        { id: 'preferences', label: 'Preferences', icon: Globe, gradient: 'from-purple-500 to-indigo-500' }
    ]

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleNotificationChange = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const handleUpdateProfile = async () => {
        setLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    displayName: formData.displayName,
                    photoURL: user.photoURL,
                    phone: formData.phone,
                    bio: formData.bio
                })
            })

            const data = await response.json()

            if (data.success) {
                toast.success('Profile updated successfully!', {
                    icon: '✅',
                    style: { borderRadius: '10px', background: '#10b981', color: '#fff' }
                })
            } else {
                toast.error(data.error || 'Failed to update profile')
            }
        } catch (error) {
            console.error('Update error:', error)
            toast.error('Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    const handleChangePassword = async () => {
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('Passwords do not match')
            return
        }
        if (formData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }

        setLoading(true)
        try {
            const credential = EmailAuthProvider.credential(user.email, formData.currentPassword)
            await reauthenticateWithCredential(auth.currentUser, credential)
            await updatePassword(auth.currentUser, formData.newPassword)

            toast.success('Password changed successfully!', {
                icon: '🔒',
                style: { borderRadius: '10px', background: '#10b981', color: '#fff' }
            })
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }))
        } catch (error) {
            if (error.code === 'auth/wrong-password') {
                toast.error('Current password is incorrect')
            } else {
                toast.error('Failed to change password')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleSaveNotifications = () => {
        toast.success('Notification preferences saved!', {
            icon: '🔔',
            style: { borderRadius: '10px', background: '#10b981', color: '#fff' }
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-100">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-3">
                        Account Settings
                    </h1>
                    <p className="text-base-content/70 text-lg">
                        Manage your account preferences and security settings
                    </p>
                </div>

                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="card bg-base-200 shadow-2xl sticky top-24 border border-base-300">
                            <div className="card-body p-4">
                                <nav className="space-y-2">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === tab.id
                                                        ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg scale-105`
                                                        : 'hover:bg-base-300 text-base-content hover:scale-102'
                                                    }`}
                                            >
                                                <Icon className="w-5 h-5" />
                                                <span className="font-semibold">{tab.label}</span>
                                            </button>
                                        )
                                    })}
                                </nav>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                {/* Profile Picture */}
                                <div className="card bg-base-200 shadow-xl border border-base-300 hover:shadow-2xl transition-all duration-300">
                                    <div className="card-body">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                                                <Camera className="w-7 h-7 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-3xl font-bold">Profile Picture</h2>
                                                <p className="text-sm text-base-content/70">Update your profile photo</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-base-100 rounded-2xl">
                                            <div className="relative group">
                                                <div className="avatar">
                                                    <div className="w-32 h-32 rounded-full ring-4 ring-primary ring-offset-4 ring-offset-base-100 shadow-2xl transition-transform group-hover:scale-105">
                                                        {user?.photoURL ? (
                                                            <img src={user.photoURL} alt={user.displayName} />
                                                        ) : (
                                                            <div className="bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-5xl font-bold">
                                                                {formData.displayName?.charAt(0) || 'U'}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <button className="absolute bottom-2 right-2 btn btn-circle btn-primary btn-sm shadow-xl hover:scale-110 transition-transform">
                                                    <Camera className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex-1 text-center md:text-left">
                                                <h3 className="text-2xl font-bold mb-2">{formData.displayName}</h3>
                                                <p className="text-base-content/60 mb-4">{userData?.role || 'User'}</p>
                                                <button className="btn btn-primary gap-2">
                                                    <Camera className="w-5 h-5" />
                                                    Upload New Photo
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Info */}
                                <div className="card bg-base-200 shadow-xl border border-base-300">
                                    <div className="card-body">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                                                <User className="w-7 h-7 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-3xl font-bold">Personal Information</h2>
                                                <p className="text-sm text-base-content/70">Update your personal details</p>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text font-bold text-base">Display Name</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="displayName"
                                                    value={formData.displayName}
                                                    onChange={handleChange}
                                                    className="input input-bordered input-lg focus:input-primary"
                                                    placeholder="Your name"
                                                />
                                            </div>

                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text font-bold text-base">Email Address</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    className="input input-bordered input-lg bg-base-300"
                                                    disabled
                                                />
                                                <label className="label">
                                                    <span className="label-text-alt text-warning">Email cannot be changed</span>
                                                </label>
                                            </div>

                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text font-bold text-base">Phone Number</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className="input input-bordered input-lg focus:input-primary"
                                                    placeholder="+1 234 567 8900"
                                                />
                                            </div>

                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text font-bold text-base">Role</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={userData?.role || 'user'}
                                                    className="input input-bordered input-lg capitalize bg-base-300"
                                                    disabled
                                                />
                                            </div>

                                            <div className="form-control md:col-span-2">
                                                <label className="label">
                                                    <span className="label-text font-bold text-base">Bio</span>
                                                </label>
                                                <textarea
                                                    name="bio"
                                                    value={formData.bio}
                                                    onChange={handleChange}
                                                    className="textarea textarea-bordered textarea-lg focus:textarea-primary h-24"
                                                    placeholder="Tell us about yourself..."
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end mt-6">
                                            <button
                                                onClick={handleUpdateProfile}
                                                disabled={loading}
                                                className="btn btn-primary btn-lg gap-2 px-8"
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="loading loading-spinner"></span>
                                                        Saving...
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
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <div className="card bg-base-200 shadow-xl border border-base-300">
                                    <div className="card-body">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg">
                                                <Shield className="w-7 h-7 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-3xl font-bold">Change Password</h2>
                                                <p className="text-sm text-base-content/70">Update your account password</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text font-bold text-base">Current Password</span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword.current ? 'text' : 'password'}
                                                        name="currentPassword"
                                                        value={formData.currentPassword}
                                                        onChange={handleChange}
                                                        className="input input-bordered input-lg w-full pr-12 focus:input-primary"
                                                        placeholder="Enter current password"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
                                                    >
                                                        {showPassword.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text font-bold text-base">New Password</span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword.new ? 'text' : 'password'}
                                                        name="newPassword"
                                                        value={formData.newPassword}
                                                        onChange={handleChange}
                                                        className="input input-bordered input-lg w-full pr-12 focus:input-primary"
                                                        placeholder="Enter new password"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
                                                    >
                                                        {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text font-bold text-base">Confirm New Password</span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword.confirm ? 'text' : 'password'}
                                                        name="confirmPassword"
                                                        value={formData.confirmPassword}
                                                        onChange={handleChange}
                                                        className="input input-bordered input-lg w-full pr-12 focus:input-primary"
                                                        placeholder="Confirm new password"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
                                                    >
                                                        {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="alert alert-warning">
                                                <Lock className="w-6 h-6" />
                                                <span>Make sure your password is at least 6 characters long and secure.</span>
                                            </div>

                                            <div className="flex justify-end">
                                                <button
                                                    onClick={handleChangePassword}
                                                    disabled={loading || !formData.currentPassword || !formData.newPassword}
                                                    className="btn btn-error btn-lg gap-2 px-8"
                                                >
                                                    {loading ? (
                                                        <>
                                                            <span className="loading loading-spinner"></span>
                                                            Updating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Shield className="w-5 h-5" />
                                                            Update Password
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <div className="card bg-base-200 shadow-xl border border-base-300">
                                <div className="card-body">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                                            <Bell className="w-7 h-7 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold">Notification Preferences</h2>
                                            <p className="text-sm text-base-content/70">Choose how you want to be notified</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {[
                                            { key: 'emailNotifications', icon: Mail, title: 'Email Notifications', desc: 'Receive email updates about your account' },
                                            { key: 'orderUpdates', icon: Bell, title: 'Order Updates', desc: 'Get notified about your order status changes' },
                                            { key: 'productUpdates', icon: Bell, title: 'Product Updates', desc: 'New products and special offers' },
                                            { key: 'newsletter', icon: Mail, title: 'Newsletter', desc: 'Weekly newsletter with tips and news' },
                                            { key: 'smsNotifications', icon: Smartphone, title: 'SMS Notifications', desc: 'Get text messages for important updates' },
                                            { key: 'pushNotifications', icon: Bell, title: 'Push Notifications', desc: 'Browser push notifications' }
                                        ].map((item) => {
                                            const Icon = item.icon
                                            return (
                                                <div key={item.key} className="flex items-center justify-between p-6 bg-base-100 rounded-2xl hover:shadow-lg transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                                                            <Icon className="w-6 h-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-lg">{item.title}</p>
                                                            <p className="text-sm text-base-content/60">{item.desc}</p>
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="toggle toggle-success toggle-lg"
                                                        checked={notifications[item.key]}
                                                        onChange={() => handleNotificationChange(item.key)}
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>

                                    <div className="flex justify-end mt-6">
                                        <button onClick={handleSaveNotifications} className="btn btn-success btn-lg gap-2 px-8">
                                            <Save className="w-5 h-5" />
                                            Save Preferences
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Preferences Tab */}
                        {activeTab === 'preferences' && (
                            <div className="card bg-base-200 shadow-xl border border-base-300">
                                <div className="card-body">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
                                            <Globe className="w-7 h-7 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold">App Preferences</h2>
                                            <p className="text-sm text-base-content/70">Customize your app experience</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text font-bold text-base flex items-center gap-2">
                                                    <Palette className="w-5 h-5" />
                                                    Theme
                                                </span>
                                            </label>
                                            <div className="grid grid-cols-2 gap-4">
                                                {['light', 'dark'].map((theme) => (
                                                    <button
                                                        key={theme}
                                                        className={`btn btn-lg justify-start gap-3 ${theme === 'light' ? 'btn-outline' : 'btn-primary'
                                                            }`}
                                                    >
                                                        {theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                                        {theme.charAt(0).toUpperCase() + theme.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text font-bold text-base flex items-center gap-2">
                                                        <Globe className="w-5 h-5" />
                                                        Language
                                                    </span>
                                                </label>
                                                <select className="select select-bordered select-lg">
                                                    <option>English</option>
                                                    <option>Spanish</option>
                                                    <option>French</option>
                                                </select>
                                            </div>

                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text font-bold text-base">Currency</span>
                                                </label>
                                                <select className="select select-bordered select-lg">
                                                    <option>USD ($)</option>
                                                    <option>EUR (€)</option>
                                                    <option>GBP (£)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <button className="btn btn-primary btn-lg gap-2 px-8">
                                                <Save className="w-5 h-5" />
                                                Save Preferences
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
