'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, LogOut, User, Home, X, Settings, UserCircle, PanelRightClose } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth'
import toast from 'react-hot-toast'
import Loading from '../loading'
import Image from 'next/image'
import Link from 'next/link'

export default function DashboardNavbar({ notifications = [], isCollapsed, setIsCollapsed, setIsMobileSidebarOpen, isMobileSidebarOpen }) {
    const [showNotifications, setShowNotifications] = useState(false)
    const [showProfile, setShowProfile] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const router = useRouter()
    const notifRef = useRef(null)
    const profileRef = useRef(null)

    // Use the Firebase Auth hook to get user data
    const { user, userData, loading } = useFirebaseAuth()

    useEffect(() => {
        setUnreadCount(notifications.filter(n => !n.read).length)
    }, [notifications])

    useEffect(() => {
        function handleClickOutside(event) {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false)
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfile(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = async () => {
        try {
            await signOut(auth)
            toast.success('Logged out successfully')
            router.push('/login')
        } catch (error) {
            console.error('Logout error:', error)
            toast.error('Failed to logout')
        }
    }

    // Show loading skeleton while user data is loading
    if (loading) {
        return <Loading />
    }

    // Get display name and role from userData or fallback to user object
    const displayName = userData?.displayName || user?.displayName || 'User'
    const email = userData?.email || user?.email || ''
    const photoURL = userData?.photoURL || user?.photoURL || ''
    const role = userData?.role || 'user'

    return (
        <nav className="bg-base-100 border-b border-base-300 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center justify-between px-4 md:px-6 py-3">
                {/* Left: Dashboard Title */}
                <div className="flex items-center gap-4">
                    <PanelRightClose onClick={() => { setIsCollapsed(!isCollapsed); setIsMobileSidebarOpen(!isMobileSidebarOpen) }} className={`cursor-pointer ${isCollapsed ? 'rotate-180' : ''}`} />
                    <h2 className="text-lg font-bold text-base-content">Dashboard</h2>
                </div>

                {/* Right: Notifications & Profile */}
                <div className="flex items-center gap-2 md:gap-4">
                    {/* Notifications Bell */}
                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="btn btn-ghost btn-circle btn-sm relative hover:bg-base-200"
                            aria-label="Notifications"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 bg-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-base-100 rounded-xl shadow-2xl border border-base-300 overflow-hidden z-50">
                                <div className="p-4 border-b border-base-300 flex items-center justify-between bg-base-200">
                                    <h3 className="font-bold text-base">Notifications</h3>
                                    <button
                                        onClick={() => setShowNotifications(false)}
                                        className="btn btn-ghost btn-xs btn-circle"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="max-h-96 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-base-content/60">
                                            <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                            <p className="text-sm">No notifications</p>
                                        </div>
                                    ) : (
                                        notifications.map((notif, idx) => (
                                            <div
                                                key={idx}
                                                className={`p-4 border-b border-base-300 hover:bg-base-200 transition-colors cursor-pointer ${!notif.read ? 'bg-primary/5' : ''
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className={`w-2 h-2 rounded-full mt-2 shrink-0 ${notif.read ? 'bg-base-300' : 'bg-primary'
                                                            }`}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-sm">
                                                            {notif.title || 'Notification'}
                                                        </p>
                                                        <p className="text-xs text-base-content/70 mt-1 line-clamp-2">
                                                            {notif.message}
                                                        </p>
                                                        <p className="text-xs text-base-content/50 mt-2">
                                                            {notif.time || new Date(notif.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Profile Dropdown */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setShowProfile(!showProfile)}
                            className="flex items-center cursor-pointer gap-2 md:gap-3 px-2 md:px-3 py-2 rounded-lg hover:bg-base-200 transition-all duration-200 group"
                        >
                            <div className="hidden lg:flex flex-col items-end leading-tight">
                                <span className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                                    {displayName}
                                </span>
                                <span className="text-xs text-base-content/60 capitalize">
                                    {role}
                                </span>
                            </div>
                            <div className="avatar">
                                <div className="w-9 md:w-10 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-base-100 group-hover:ring-accent transition-all overflow-hidden">
                                    {photoURL ? (
                                        <Image
                                            src={photoURL || '/default-avatar.png'}
                                            alt={displayName || 'User'}
                                            width={40}
                                            height={40}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="bg-primary/10 flex items-center justify-center w-full h-full">
                                            <User className="w-5 h-5 text-primary" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </button>

                        {showProfile && (
                            <div className="absolute right-0 mt-2 w-72 bg-base-100 rounded-xl shadow-2xl border border-base-300 overflow-hidden z-50">
                                {/* Profile Header */}
                                <div className="bg-linear-to-br from-primary/10 to-secondary/10 border-b border-base-300">
                                    <div className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="avatar">
                                                <div className="w-12 rounded-full ring-2 ring-primary overflow-hidden">
                                                    {photoURL ? (
                                                        <Image
                                                            src={photoURL || '/default-avatar.png'}
                                                            alt={displayName || 'User'}
                                                            width={40}
                                                            height={40}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="bg-primary/10 flex items-center justify-center w-full h-full">
                                                            <User className="w-6 h-6 text-primary" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-base truncate">
                                                    {displayName}
                                                </p>
                                                <p className="text-xs text-base-content/60 truncate">
                                                    {email}
                                                </p>
                                                <div className="badge badge-primary badge-sm mt-1.5 capitalize">
                                                    {role}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div className="py-2">
                                    <Link
                                        href="/"
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-primary/10 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Home className="text-primary" size={18} />
                                        </div>
                                        <div className="flex flex-col leading-tight">
                                            <span className="font-medium text-sm">Home</span>
                                            <span className="text-xs text-base-content/60">
                                                Back to main site
                                            </span>
                                        </div>
                                    </Link>

                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-info/10 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
                                            <UserCircle className="text-info" size={18} />
                                        </div>
                                        <div className="flex flex-col leading-tight">
                                            <span className="font-medium text-sm">My Profile</span>
                                            <span className="text-xs text-base-content/60">
                                                View and edit profile
                                            </span>
                                        </div>
                                    </Link>

                                    <Link
                                        href="/settings"
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-warning/10 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                                            <Settings className="text-warning" size={18} />
                                        </div>
                                        <div className="flex flex-col leading-tight">
                                            <span className="font-medium text-sm">Settings</span>
                                            <span className="text-xs text-base-content/60">
                                                Preferences & settings
                                            </span>
                                        </div>
                                    </Link>
                                </div>

                                {/* Logout Button */}
                                <div className="border-t border-base-300">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-error/10 transition-colors text-error"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center">
                                            <LogOut size={18} />
                                        </div>
                                        <div className="flex flex-col leading-tight text-start">
                                            <span className="font-medium text-sm">Logout</span>
                                            <span className="text-xs text-error/60">
                                                Sign out of your account
                                            </span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
