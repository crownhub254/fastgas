// app/dashboard/layout.jsx
'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
    LayoutDashboard,
    Users,
    Package,
    ShoppingCart,
    FileText,
    BarChart3,
    Settings,
    Plus,
    ShoppingBag,
    CreditCard,
    Bike,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Bell,
    Search,
    Menu,
    X,
    ListChecks,
    DollarSign,
    Wallet
} from 'lucide-react'
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import Loading from './loading'
import DashboardNavbar from './components/DashboardNavbar'

// Demo user data for different roles
const DEMO_USERS = {
    admin: {
        uid: 'demo-admin',
        email: 'admin@fastgas.co.ke',
        displayName: 'Demo Admin',
        role: 'admin',
        photoURL: null
    },
    reseller: {
        uid: 'demo-reseller',
        email: 'reseller@fastgas.co.ke',
        displayName: 'Demo Reseller',
        role: 'reseller',
        photoURL: null
    },
    rider: {
        uid: 'demo-rider',
        email: 'rider@fastgas.co.ke',
        displayName: 'Demo Rider',
        role: 'rider',
        photoURL: null
    },
    seller: {
        uid: 'demo-seller',
        email: 'seller@fastgas.co.ke',
        displayName: 'Demo Seller',
        role: 'seller',
        photoURL: null
    },
    user: {
        uid: 'demo-user',
        email: 'user@fastgas.co.ke',
        displayName: 'Demo User',
        role: 'user',
        photoURL: null
    }
}

// Helper to get role from pathname
function getRoleFromPath(pathname) {
    if (pathname.startsWith('/dashboard/admin')) return 'admin'
    if (pathname.startsWith('/dashboard/reseller')) return 'reseller'
    if (pathname.startsWith('/dashboard/rider')) return 'rider'
    if (pathname.startsWith('/dashboard/seller')) return 'seller'
    if (pathname.startsWith('/dashboard/user')) return 'user'
    return 'user' // default
}

export default function DashboardLayout({ children }) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [demoMode, setDemoMode] = useState(false)
    const [demoUser, setDemoUser] = useState(null)
    const pathname = usePathname()
    const router = useRouter()
    const { user: firebaseUser, userData: firebaseUserData, loading: firebaseLoading } = useFirebaseAuth()

    // Check for demo mode on mount
    useEffect(() => {
        const checkDemoMode = () => {
            // Check for demo-mode cookie
            const cookies = document.cookie.split(';').reduce((acc, cookie) => {
                const [key, value] = cookie.trim().split('=')
                acc[key] = value
                return acc
            }, {})
            
            if (cookies['demo-mode'] === 'true' || cookies['auth-token']?.startsWith('demo-')) {
                const role = getRoleFromPath(pathname)
                setDemoMode(true)
                setDemoUser(DEMO_USERS[role] || DEMO_USERS.user)
            }
        }
        
        checkDemoMode()
    }, [pathname])

    // Determine actual user and userData (Firebase or Demo)
    const user = demoMode ? demoUser : firebaseUser
    const userData = demoMode ? demoUser : firebaseUserData
    const loading = demoMode ? false : firebaseLoading

    useEffect(() => {
        if (!loading && !demoMode) {
            if (!user) {
                // In demo mode, don't redirect - middleware will handle it
                // For real auth, redirect to login
                router.push('/login')
                return
            }

            if (userData) {
                fetchNotifications()

                // Redirect to role-specific dashboard if on base /dashboard route
                if (pathname === '/dashboard') {
                    router.push(`/dashboard/${userData.role}`)
                }
            }
        }
        
        // If in demo mode and on base /dashboard, redirect to role dashboard
        if (demoMode && demoUser && pathname === '/dashboard') {
            router.push(`/dashboard/${demoUser.role}`)
        }
    }, [user, userData, loading, router, pathname, demoMode, demoUser])

    const fetchNotifications = async () => {
        try {
            if (!user || demoMode) return // Skip for demo mode
            const token = await user.getIdToken()
            const response = await fetch('/api/notifications', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()
            if (data.success) {
                setNotifications(data.notifications || [])
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
        }
    }

    const handleLogout = async () => {
        try {
            if (demoMode) {
                // Clear demo cookies
                document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
                document.cookie = 'user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
                document.cookie = 'demo-mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
                router.push('/')
                return
            }
            await signOut(auth)
            router.push('/login')
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    // Navigation based on role
    const getNavigation = () => {
        if (!userData) return []

        const baseNav = [
            {
                name: 'Dashboard',
                href: `/dashboard/${userData.role}`,
                icon: LayoutDashboard,
            }
        ]

        if (userData.role === 'admin') {
            return [
                ...baseNav,
                {
                    name: 'User Management',
                    href: '/dashboard/admin/users',
                    icon: Users,
                },
                {
                    name: 'Resellers',
                    href: '/dashboard/admin/resellers',
                    icon: Users,
                },
                {
                    name: 'Inventory',
                    href: '/dashboard/admin/inventory',
                    icon: Package,
                },
                {
                    name: 'All Orders',
                    href: '/dashboard/admin/orders',
                    icon: ShoppingCart,
                },
                {
                    name: 'Reseller Orders',
                    href: '/dashboard/admin/reseller-orders',
                    icon: ShoppingCart,
                },
                {
                    name: 'Assign Riders',
                    href: '/dashboard/admin/assign-rider',
                    icon: Bike,
                },
                {
                    name: 'M-Pesa Transactions',
                    href: '/dashboard/admin/mpesa',
                    icon: Wallet,
                },
                {
                    name: 'Reports',
                    href: '/dashboard/admin/reports',
                    icon: BarChart3,
                },
                {
                    name: 'System Logs',
                    href: '/dashboard/admin/logs',
                    icon: FileText,
                },
                {
                    name: 'Settings',
                    href: '/dashboard/admin/settings',
                    icon: Settings,
                }
            ]
        }

        if (userData.role === 'seller') {
            return [
                ...baseNav,
                {
                    name: 'Add Product',
                    href: '/dashboard/seller/add-product',
                    icon: Plus,
                },
                {
                    name: 'My Products',
                    href: '/dashboard/seller/products',
                    icon: Package,
                },
                {
                    name: 'Orders',
                    href: '/dashboard/seller/orders',
                    icon: ShoppingCart,
                },
                {
                    name: 'Assign Riders',
                    href: '/dashboard/seller/assign-rider',
                    icon: Bike,
                },
                {
                    name: 'Settings',
                    href: '/dashboard/seller/settings',
                    icon: Settings,
                }
            ]
        }

        if (userData.role === 'rider') {
            return [
                ...baseNav,
                {
                    name: 'My Tasks',
                    href: '/dashboard/rider/my-tasks',
                    icon: ListChecks,
                },
                {
                    name: 'Income',
                    href: '/dashboard/rider/income',
                    icon: DollarSign,
                },
                {
                    name: 'Settings',
                    href: '/dashboard/rider/settings',
                    icon: Settings,
                }
            ]
        }

        // Reseller navigation
        if (userData.role === 'reseller') {
            return [
                ...baseNav,
                {
                    name: 'My Clients',
                    href: '/dashboard/reseller/clients',
                    icon: Users,
                },
                {
                    name: 'Client Orders',
                    href: '/dashboard/reseller/orders',
                    icon: ShoppingCart,
                },
                {
                    name: 'Stock Orders',
                    href: '/dashboard/reseller/stock-orders',
                    icon: Package,
                },
                {
                    name: 'My Inventory',
                    href: '/dashboard/reseller/inventory',
                    icon: Package,
                },
                {
                    name: 'Earnings',
                    href: '/dashboard/reseller/earnings',
                    icon: Wallet,
                },
                {
                    name: 'Settings',
                    href: '/dashboard/reseller/settings',
                    icon: Settings,
                }
            ]
        }

        // Default user navigation
        return [
            ...baseNav,
            {
                name: 'My Orders',
                href: '/dashboard/user/orders',
                icon: ShoppingBag,
            },
            {
                name: 'My Payments',
                href: '/dashboard/user/payments',
                icon: CreditCard,
            },
            {
                name: 'Settings',
                href: '/dashboard/user/settings',
                icon: Settings,
            }
        ]
    }

    const navigation = getNavigation()
    const isActive = (href) => pathname === href || pathname.startsWith(href + '/dashboard')

    // Show loading only if not in demo mode and still loading
    if (!demoMode && (loading || !userData)) {
        return <Loading />
    }
    
    // In demo mode, ensure we have demo user data
    if (demoMode && !demoUser) {
        return <Loading />
    }

    return (
        <div className="drawer lg:drawer-open">
            <input
                id="my-drawer-4"
                type="checkbox"
                className="drawer-toggle"
                checked={isMobileSidebarOpen}
                onChange={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            />

            {/* Main Content */}
            <div className="drawer-content flex flex-col">
                {/* Navbar */}
                <DashboardNavbar
                    user={user}
                    userData={userData}
                    isCollapsed={isCollapsed}
                    setIsCollapsed={setIsCollapsed}
                    isMobileSidebarOpen={isMobileSidebarOpen}
                    setIsMobileSidebarOpen={setIsMobileSidebarOpen}
                    notifications={notifications}
                    onLogout={handleLogout}
                />

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-6 bg-base-200 min-h-screen">
                    {children}
                </main>
            </div>

            {/* Sidebar */}
            <div className="drawer-side z-40">
                <label
                    htmlFor="my-drawer-4"
                    aria-label="close sidebar"
                    className="drawer-overlay"
                    onClick={() => setIsMobileSidebarOpen(false)}
                ></label>

                <div
                    className={`flex min-h-full flex-col bg-base-100 transition-all duration-300 ${isCollapsed ? 'lg:w-20' : 'lg:w-64'
                        } w-64`}
                >
                    {/* Logo Section */}
                    <div className="p-4 border-b border-base-300 flex items-center justify-between">
                        <Link
                            href="/"
                            className="flex items-center gap-3 flex-1"
                            onClick={() => {
                                if (window.innerWidth < 1024) {
                                    setIsMobileSidebarOpen(false)
                                }
                            }}
                        >
                            {!isCollapsed || window.innerWidth < 1024 ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-linear-to-br from-primary to-secondary rounded-lg flex items-center justify-center shrink-0">
                                        <ShoppingBag className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                                        ShopHub
                                    </span>
                                </div>
                            ) : (
                                <div className="w-10 h-10 bg-linear-to-br from-primary to-secondary rounded-lg flex items-center justify-center mx-auto">
                                    <ShoppingBag className="w-6 h-6 text-white" />
                                </div>
                            )}
                        </Link>

                        {/* Close Button for Mobile */}
                        <button
                            onClick={() => setIsMobileSidebarOpen(false)}
                            className="lg:hidden btn btn-ghost btn-sm btn-circle"
                            aria-label="Close sidebar"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <ul className="menu w-full flex-1 p-2">
                        {navigation.map((item) => {
                            const Icon = item.icon
                            const active = isActive(item.href)

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={`${active
                                            ? 'bg-linear-to-r from-primary to-secondary text-primary-content font-semibold'
                                            : 'hover:bg-base-300'
                                            } ${isCollapsed && window.innerWidth >= 1024
                                                ? 'tooltip tooltip-right justify-center p-3'
                                                : 'p-3'
                                            } transition-all duration-200`}
                                        data-tip={isCollapsed && window.innerWidth >= 1024 ? item.name : ''}
                                        onClick={() => {
                                            if (window.innerWidth < 1024) {
                                                setIsMobileSidebarOpen(false)
                                            }
                                        }}
                                    >
                                        <Icon className="w-5 h-5 shrink-0" />
                                        {(!isCollapsed || window.innerWidth < 1024) && (
                                            <span className="text-sm md:text-base">{item.name}</span>
                                        )}
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>

                    {/* Bottom Section - User Profile */}
                    <div className="p-4 border-t border-base-300">
                        <div className={`flex items-center gap-3 ${isCollapsed && window.innerWidth >= 1024 ? 'justify-center' : ''}`}>
                            <div className="avatar shrink-0">
                                <div className="w-10 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-base-100">
                                    {userData?.photoURL ? (
                                        <Image
                                            src={userData.photoURL}
                                            alt={userData.displayName || 'User'}
                                            width={40}
                                            height={40}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                                            <span className="text-primary font-bold">
                                                {userData?.displayName?.charAt(0) || 'U'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {(!isCollapsed || window.innerWidth < 1024) && (
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold truncate">
                                        {userData?.displayName || 'User'}
                                    </div>
                                    <div className="text-xs text-base-content/60 capitalize truncate">
                                        {userData?.role || 'user'}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
