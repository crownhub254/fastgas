'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag, Menu, X, Sun, Moon, User, LogOut, Settings, Heart, Package, ShoppingCart, LayoutDashboard } from 'lucide-react'
import Logo from './Logo'
import { useCart } from '@/contexts/CartContext'
import { onAuthChange, logout } from '@/lib/firebase/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Image from 'next/image'
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth'

// Theme Hook
function useTheme() {
    const [theme, setTheme] = useState('light')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const savedTheme = localStorage.getItem('theme') || 'light'
        setTheme(savedTheme)
        document.documentElement.setAttribute('data-theme', savedTheme)
    }, [])

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        localStorage.setItem('theme', newTheme)
        document.documentElement.setAttribute('data-theme', newTheme)
    }

    return { theme, toggleTheme, mounted }
}

export default function Navbar() {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const { theme, toggleTheme, mounted } = useTheme()
    const { cartItems } = useCart()
    const { user: us } = useFirebaseAuth()

    // Real Firebase Auth State
    const [user, setUser] = useState(null)
    const [userProfile, setUserProfile] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    // Calculate total items in cart
    const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0)

    // Get dashboard route based on user role
    const getDashboardRoute = () => {
        if (!userProfile?.role) return '/dashboard/user'
        switch (userProfile.role) {
            case 'admin':
                return '/dashboard/admin'
            case 'seller':
                return '/dashboard/seller'
            default:
                return '/dashboard/user'
        }
    }

    // Listen to Firebase auth state changes
    useEffect(() => {
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser)
                // Fetch user profile from MongoDB
                try {
                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/auth/user/${firebaseUser.uid}`
                    )
                    const data = await response.json()
                    if (data.success) {
                        setUserProfile(data.user)
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error)
                }
            } else {
                setUser(null)
                setUserProfile(null)
            }
            setIsLoading(false)
        })

        return () => unsubscribe()
    }, [])

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isProfileOpen && !event.target.closest('.profile-dropdown')) {
                setIsProfileOpen(false)
            }
        }
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [isProfileOpen])

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/products', label: 'Products' },
        { href: '/about', label: 'About' },
        { href: '/contact', label: 'Contact' },
        { href: `${us ? getDashboardRoute() : ''}`, label: us ? 'Dashboard' : '' },
    ]

    const handleLogout = async () => {
        try {
            const { error } = await logout()
            if (error) {
                toast.error('Failed to logout')
            } else {
                toast.success('Logged out successfully')
                setIsProfileOpen(false)
                router.push('/')
            }
        } catch (error) {
            console.error('Logout error:', error)
            toast.error('Failed to logout')
        }
    }

    // Get user avatar (first letters of name or first letter of email)
    const getUserAvatar = () => {
        if (userProfile?.displayName) {
            return userProfile.displayName
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
        }
        if (user?.displayName) {
            return user.displayName
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
        }
        if (user?.email) {
            return user.email[0].toUpperCase()
        }
        return 'U'
    }

    // Get display name
    const getDisplayName = () => {
        return userProfile?.displayName || user?.displayName || 'User'
    }

    // Get email
    const getEmail = () => {
        return user?.email || ''
    }

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 ${isScrolled ? 'bg-base-200 shadow-lg border-b border-base-300' : 'bg-base-200'
            }`}>
            <div className="container-custom">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Logo />

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-8">
                        <div className="flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="px-4 py-2 rounded-lg text-base-content font-medium hover:bg-base-200 transition-all duration-200 hover:text-primary"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Cart Button */}
                        <Link
                            href="/cart"
                            className="relative p-2.5 rounded-lg bg-base-300 hover:bg-base-200 transition-all duration-200 group"
                            aria-label="Shopping cart"
                        >
                            <ShoppingCart className="w-5 h-5 text-base-content group-hover:scale-110 transition-transform" />
                            {cartItemsCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-linear-to-r from-primary to-secondary text-primary-content text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                                    {cartItemsCount > 9 ? '9+' : cartItemsCount}
                                </span>
                            )}
                        </Link>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-lg bg-base-300 hover:bg-base-200 transition-all duration-200 group"
                            aria-label="Toggle theme"
                        >
                            {mounted && (
                                theme === 'light' ? (
                                    <Moon className="w-5 h-5 text-base-content group-hover:rotate-12 transition-transform" />
                                ) : (
                                    <Sun className="w-5 h-5 text-base-content group-hover:rotate-45 transition-transform" />
                                )
                            )}
                        </button>

                        {/* User Profile / Login */}
                        {!isLoading && (
                            user ? (
                                <div className="relative profile-dropdown bg-base-300 rounded-lg">
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-base-200 transition-all duration-200 group cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="hidden md:block text-right">
                                                <div className="text-sm font-semibold text-base-content group-hover:text-primary transition-colors">
                                                    {getDisplayName()}
                                                </div>
                                                <div className="text-xs text-base-content/60">
                                                    {getEmail()}
                                                </div>
                                            </div>
                                            {userProfile?.photoURL || user?.photoURL ? (
                                                <Image
                                                    src={userProfile?.photoURL || user?.photoURL || '/avatar-placeholder.png'}
                                                    alt={getDisplayName()}
                                                    width={40}
                                                    height={40}
                                                    quality={100}
                                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-base-200 group-hover:ring-primary/30 transition-all"
                                                    priority={false}
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-primary-content font-bold ring-2 ring-base-200 group-hover:ring-primary/30 transition-all">
                                                    {getUserAvatar()}
                                                </div>
                                            )}
                                        </div>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isProfileOpen && (
                                        <div className="absolute right-0 mt-3 w-64 bg-base-100 rounded-xl shadow-2xl border border-base-300 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            {/* User Info */}
                                            <div className="p-4 bg-linear-to-br from-primary/10 to-secondary/10 border-b border-base-300">
                                                <div className="flex items-center gap-3">
                                                    {userProfile?.photoURL || user?.photoURL ? (
                                                        <Image
                                                            src={userProfile?.photoURL || user?.photoURL || '/avatar-placeholder.png'}
                                                            alt={getDisplayName()}
                                                            width={48}
                                                            height={48}
                                                            quality={100}
                                                            priority={true}
                                                            className="w-12 h-12 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-primary-content font-bold text-lg">
                                                            {getUserAvatar()}
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-semibold text-base-content truncate">
                                                            {getDisplayName()}
                                                        </div>
                                                        <div className="text-sm text-base-content/60 truncate">
                                                            {getEmail()}
                                                        </div>
                                                        {userProfile?.role && (
                                                            <div className="mt-1">
                                                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-semibold capitalize">
                                                                    {userProfile.role}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Menu Items */}
                                            <div className="p-2">
                                                {/* Dashboard Link */}
                                                <Link
                                                    href={getDashboardRoute()}
                                                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-linear-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 transition-all duration-200 group mb-2"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                                                        <LayoutDashboard className="w-4 h-4 text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <span className="font-semibold text-base-content group-hover:text-primary transition-colors block">
                                                            Dashboard
                                                        </span>
                                                        <span className="text-xs text-base-content/60">
                                                            Manage your account
                                                        </span>
                                                    </div>
                                                </Link>

                                                <Link
                                                    href="/profile"
                                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-base-200 transition-all duration-200 group"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    <User className="w-5 h-5 text-base-content/70 group-hover:text-primary transition-colors" />
                                                    <span className="font-medium text-base-content group-hover:text-primary transition-colors">
                                                        My Profile
                                                    </span>
                                                </Link>
                                                <Link
                                                    href="/orders"
                                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-base-200 transition-all duration-200 group"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    <Package className="w-5 h-5 text-base-content/70 group-hover:text-primary transition-colors" />
                                                    <span className="font-medium text-base-content group-hover:text-primary transition-colors">
                                                        My Orders
                                                    </span>
                                                </Link>
                                                <Link
                                                    href="/wishlist"
                                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-base-200 transition-all duration-200 group"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    <Heart className="w-5 h-5 text-base-content/70 group-hover:text-primary transition-colors" />
                                                    <span className="font-medium text-base-content group-hover:text-primary transition-colors">
                                                        Wishlist
                                                    </span>
                                                </Link>
                                                <Link
                                                    href="/settings"
                                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-base-200 transition-all duration-200 group"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    <Settings className="w-5 h-5 text-base-content/70 group-hover:text-primary transition-colors" />
                                                    <span className="font-medium text-base-content group-hover:text-primary transition-colors">
                                                        Settings
                                                    </span>
                                                </Link>
                                            </div>

                                            {/* Logout */}
                                            <div className="p-2 border-t border-base-300">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-error/10 transition-all duration-200 group"
                                                >
                                                    <LogOut className="w-5 h-5 text-error group-hover:translate-x-1 transition-transform" />
                                                    <span className="font-medium text-error">
                                                        Logout
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    className="btn-primary"
                                >
                                    Sign In
                                </Link>
                            )
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center gap-3 lg:hidden">
                        {/* Mobile Cart Button */}
                        <Link
                            href="/cart"
                            className="relative p-2 rounded-lg bg-base-200 hover:bg-base-300 transition-all duration-200"
                            aria-label="Shopping cart"
                        >
                            <ShoppingCart className="w-5 h-5 text-base-content" />
                            {cartItemsCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-linear-to-r from-primary to-secondary text-primary-content text-xs font-bold rounded-full flex items-center justify-center">
                                    {cartItemsCount > 9 ? '9+' : cartItemsCount}
                                </span>
                            )}
                        </Link>

                        {/* Mobile Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg bg-base-200 hover:bg-base-300 transition-all duration-200"
                            aria-label="Toggle theme"
                        >
                            {mounted && (
                                theme === 'light' ? (
                                    <Moon className="w-5 h-5 text-base-content" />
                                ) : (
                                    <Sun className="w-5 h-5 text-base-content" />
                                )
                            )}
                        </button>

                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-lg bg-base-200 hover:bg-base-300 transition-all duration-200"
                            aria-label="Toggle menu"
                        >
                            {isOpen ? (
                                <X className="w-6 h-6 text-base-content" />
                            ) : (
                                <Menu className="w-6 h-6 text-base-content" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="lg:hidden border-t border-base-300 bg-base-100 rounded-xl mb-2">
                    <div className="container-custom p-4">
                        {/* User Info Mobile */}
                        {!isLoading && user && (
                            <div className="mb-4 p-4 rounded-xl bg-linear-to-br from-primary/10 to-secondary/10">
                                <div className="flex items-center gap-3">
                                    {userProfile?.photoURL || user?.photoURL ? (
                                        <Image
                                            src={userProfile?.photoURL || user?.photoURL || '/avatar-placeholder.png'}
                                            alt={getDisplayName()}
                                            width={48}
                                            height={48}
                                            quality={100}
                                            priority={true}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-primary-content font-bold">
                                            {getUserAvatar()}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-base-content">
                                            {getDisplayName()}
                                        </div>
                                        <div className="text-sm text-base-content/60 truncate">
                                            {getEmail()}
                                        </div>
                                        {userProfile?.role && (
                                            <div className="mt-1">
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-semibold capitalize">
                                                    {userProfile.role}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Links */}
                        <div className="space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="block px-4 py-3 rounded-lg text-base-content font-medium hover:bg-base-200 transition-all duration-200"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* User Menu Mobile */}
                        {!isLoading && (
                            user ? (
                                <div className="mt-4 pt-4 border-t border-base-300 space-y-1">
                                    {/* Dashboard Link Mobile */}
                                    <Link
                                        href={getDashboardRoute()}
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg bg-linear-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 transition-all duration-200"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <LayoutDashboard className="w-5 h-5 text-primary" />
                                        <span className="font-semibold text-primary">Dashboard</span>
                                    </Link>

                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-base-200 transition-all duration-200"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <User className="w-5 h-5 text-base-content/70" />
                                        <span className="font-medium text-base-content">My Profile</span>
                                    </Link>
                                    <Link
                                        href="/orders"
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-base-200 transition-all duration-200"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <Package className="w-5 h-5 text-base-content/70" />
                                        <span className="font-medium text-base-content">My Orders</span>
                                    </Link>
                                    <Link
                                        href="/wishlist"
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-base-200 transition-all duration-200"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <Heart className="w-5 h-5 text-base-content/70" />
                                        <span className="font-medium text-base-content">Wishlist</span>
                                    </Link>
                                    <Link
                                        href="/settings"
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-base-200 transition-all duration-200"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <Settings className="w-5 h-5 text-base-content/70" />
                                        <span className="font-medium text-base-content">Settings</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-error/10 transition-all duration-200 text-error"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span className="font-medium">Logout</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-4 pt-4 border-t border-base-300">
                                    <Link
                                        href="/login"
                                        className="btn-primary w-full text-center block"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Sign In
                                    </Link>
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}
