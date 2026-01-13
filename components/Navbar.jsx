'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag, Menu, X, Sun, Moon, User, LogOut, Settings, Heart, Package } from 'lucide-react'
import Logo from './Logo'

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
    const [isOpen, setIsOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const { theme, toggleTheme, mounted } = useTheme()

    // Mock user data - replace with actual auth data
    const isLoggedIn = true
    const user = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: 'JD'
    }

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
    ]

    const handleLogout = () => {
        // Add logout logic here
        console.log('Logging out...')
        setIsProfileOpen(false)
    }

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 ${isScrolled? 'bg-base-300 shadow-lg border-b border-base-300': 'bg-base-200'
            }`}>
            <div className="container-custom">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Logo />

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-8">
                        <div className="flex items-center gap-1">
                            {navLinks.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className="px-4 py-2 rounded-lg text-base-content font-medium hover:bg-base-200 transition-all duration-200 hover:text-primary"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-lg bg-base-200 hover:bg-base-300 transition-all duration-200 group"
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
                        {isLoggedIn ? (
                            <div className="relative profile-dropdown">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-base-200 transition-all duration-200 group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="hidden md:block text-right">
                                            <div className="text-sm font-semibold text-base-content group-hover:text-primary transition-colors">
                                                {user.name}
                                            </div>
                                            <div className="text-xs text-base-content/60">
                                                {user.email}
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-primary-content font-bold ring-2 ring-base-200 group-hover:ring-primary/30 transition-all">
                                            {user.avatar}
                                        </div>
                                    </div>
                                </button>

                                {/* Dropdown Menu */}
                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-3 w-64 bg-base-100 rounded-xl shadow-2xl border border-base-300 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        {/* User Info */}
                                        <div className="p-4 bg-linear-to-br from-primary/10 to-secondary/10 border-b border-base-300">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-primary-content font-bold text-lg">
                                                    {user.avatar}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-base-content truncate">
                                                        {user.name}
                                                    </div>
                                                    <div className="text-sm text-base-content/60 truncate">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Menu Items */}
                                        <div className="p-2">
                                            <a
                                                href="/profile"
                                                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-base-200 transition-all duration-200 group"
                                            >
                                                <User className="w-5 h-5 text-base-content/70 group-hover:text-primary transition-colors" />
                                                <span className="font-medium text-base-content group-hover:text-primary transition-colors">
                                                    My Profile
                                                </span>
                                            </a>
                                            <a
                                                href="/orders"
                                                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-base-200 transition-all duration-200 group"
                                            >
                                                <Package className="w-5 h-5 text-base-content/70 group-hover:text-primary transition-colors" />
                                                <span className="font-medium text-base-content group-hover:text-primary transition-colors">
                                                    My Orders
                                                </span>
                                            </a>
                                            <a
                                                href="/wishlist"
                                                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-base-200 transition-all duration-200 group"
                                            >
                                                <Heart className="w-5 h-5 text-base-content/70 group-hover:text-primary transition-colors" />
                                                <span className="font-medium text-base-content group-hover:text-primary transition-colors">
                                                    Wishlist
                                                </span>
                                            </a>
                                            <a
                                                href="/settings"
                                                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-base-200 transition-all duration-200 group"
                                            >
                                                <Settings className="w-5 h-5 text-base-content/70 group-hover:text-primary transition-colors" />
                                                <span className="font-medium text-base-content group-hover:text-primary transition-colors">
                                                    Settings
                                                </span>
                                            </a>
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
                            <a
                                href="/login"
                                className="btn-primary"
                            >
                                Sign In
                            </a>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center gap-3 lg:hidden">
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
                        {isLoggedIn && (
                            <div className="mb-4 p-4 rounded-xl bg-linear-to-br from-primary/10 to-secondary/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-primary-content font-bold">
                                        {user.avatar}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-base-content">
                                            {user.name}
                                        </div>
                                        <div className="text-sm text-base-content/60 truncate">
                                            {user.email}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Links */}
                        <div className="space-y-1">
                            {navLinks.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className="block px-4 py-3 rounded-lg text-base-content font-medium hover:bg-base-200 transition-all duration-200"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>

                        {/* User Menu Mobile */}
                        {isLoggedIn ? (
                            <div className="mt-4 pt-4 border-t border-base-300 space-y-1">
                                <a
                                    href="/profile"
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-base-200 transition-all duration-200"
                                >
                                    <User className="w-5 h-5 text-base-content/70" />
                                    <span className="font-medium text-base-content">My Profile</span>
                                </a>
                                <a
                                    href="/orders"
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-base-200 transition-all duration-200"
                                >
                                    <Package className="w-5 h-5 text-base-content/70" />
                                    <span className="font-medium text-base-content">My Orders</span>
                                </a>
                                <a
                                    href="/wishlist"
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-base-200 transition-all duration-200"
                                >
                                    <Heart className="w-5 h-5 text-base-content/70" />
                                    <span className="font-medium text-base-content">Wishlist</span>
                                </a>
                                <a
                                    href="/settings"
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-base-200 transition-all duration-200"
                                >
                                    <Settings className="w-5 h-5 text-base-content/70" />
                                    <span className="font-medium text-base-content">Settings</span>
                                </a>
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
                                <a
                                    href="/login"
                                    className="btn-primary w-full text-center"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Sign In
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}
