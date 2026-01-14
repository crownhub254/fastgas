'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, MapPin, Camera, Save, Edit2 } from 'lucide-react'

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false)
    const [profileData, setProfileData] = useState({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com', 
        phone: '+1 (555) 123-4567',
        address: '123 E-Commerce St',
        city: 'Digital City',
        state: 'DC',
        zipCode: '12345',
        country: 'United States',
        bio: 'Tech enthusiast and avid online shopper. Love discovering new products and staying up-to-date with the latest trends.',
        joinDate: 'January 2024'
    })

    const handleInputChange = (e) => {
        setProfileData({
            ...profileData,
            [e.target.name]: e.target.value
        })
    }

    const handleSave = () => {
        // Save logic here
        setIsEditing(false)
        alert('Profile updated successfully!')
    }

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
    }

    const stats = [
        { label: 'Total Orders', value: '24', icon: '📦' },
        { label: 'Wishlist Items', value: '12', icon: '❤️' },
        { label: 'Reviews Written', value: '8', icon: '⭐' },
        { label: 'Member Since', value: profileData.joinDate, icon: '🎉' }
    ]

    return (
        <div className="min-h-screen pt-32">
            <div className="section-padding">
                <div className="container-custom max-w-6xl">
                    {/* Header */}
                    <motion.div {...fadeInUp} className="mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-base-content mb-2">
                            My Profile
                        </h1>
                        <p className="text-base-content/70">
                            Manage your account information and preferences
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
                                {/* Avatar */}
                                <div className="relative w-32 h-32 mx-auto mb-4">
                                    <div className="w-full h-full rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-primary-content text-4xl font-bold">
                                        {profileData.firstName[0]}{profileData.lastName[0]}
                                    </div>
                                    <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-content rounded-full hover:opacity-90 transition-opacity shadow-lg">
                                        <Camera className="w-4 h-4" />
                                    </button>
                                </div>

                                <h2 className="text-2xl font-bold text-base-content mb-1">
                                    {profileData.firstName} {profileData.lastName}
                                </h2>
                                <p className="text-base-content/60 mb-6">{profileData.email}</p>

                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {stats.map((stat, idx) => (
                                        <div key={idx} className="bg-base-100 rounded-lg p-3">
                                            <div className="text-2xl mb-1">{stat.icon}</div>
                                            <div className="text-lg font-bold text-base-content">{stat.value}</div>
                                            <div className="text-xs text-base-content/60">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="w-full bg-linear-to-r from-primary to-secondary text-primary-content px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </motion.div>

                        {/* Profile Information */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-2 space-y-6"
                        >
                            {/* Personal Information */}
                            <div className="card bg-base-200">
                                <h3 className="text-2xl font-bold text-base-content mb-6">
                                    Personal Information
                                </h3>

                                <div className="grid md:grid-cols-2 gap-4">
                                    {[
                                        ['firstName', 'First Name', User],
                                        ['lastName', 'Last Name', User],
                                        ['email', 'Email Address', Mail],
                                        ['phone', 'Phone Number', Phone]
                                    ].map(([name, label, Icon]) => (
                                        <div key={name}>
                                            <label className="block text-sm font-semibold text-base-content mb-2">
                                                {label}
                                            </label>
                                            <div className="relative">
                                                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                                                <input
                                                    type="text"
                                                    name={name}
                                                    value={profileData[name]}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditing}
                                                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-base-100 border border-base-300 text-base-content focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-semibold text-base-content mb-2">
                                        Bio
                                    </label>
                                    <textarea
                                        name="bio"
                                        value={profileData.bio}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-lg bg-base-100 border border-base-300 text-base-content focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 resize-none"
                                    />
                                </div>
                            </div>

                            {/* Address Information */}
                            <div className="card bg-base-200">
                                <h3 className="text-2xl font-bold text-base-content mb-6">
                                    Address Information
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-base-content mb-2">
                                            Street Address
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                                            <input
                                                type="text"
                                                name="address"
                                                value={profileData.address}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="w-full pl-10 pr-4 py-3 rounded-lg bg-base-100 border border-base-300 text-base-content focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-4">
                                        {['city', 'state', 'zipCode'].map((field) => (
                                            <input
                                                key={field}
                                                type="text"
                                                name={field}
                                                value={profileData[field]}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-3 rounded-lg bg-base-100 border border-base-300 text-base-content focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                                            />
                                        ))}
                                    </div>

                                    <input
                                        type="text"
                                        name="country"
                                        value={profileData.country}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-3 rounded-lg bg-base-100 border border-base-300 text-base-content focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                                    />
                                </div>
                            </div>

                            {isEditing && (
                                <div className="flex gap-4">
                                    <button
                                        onClick={handleSave}
                                        className="flex-1 bg-linear-to-r from-primary to-secondary text-primary-content px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-5 h-5" />
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 bg-base-100 text-base-content px-6 py-3 rounded-lg font-semibold border-2 border-base-300"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}
