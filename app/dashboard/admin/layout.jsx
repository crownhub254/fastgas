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
    ChevronLeft,
    ChevronRight
} from 'lucide-react'
import DashboardNavbar from '../components/DashboardNavbar'
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth'

export default function AdminDashboardLayout({ children }) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [notifications, setNotifications] = useState([])
    const pathname = usePathname()
    const router = useRouter()
    const { user, userData, loading } = useFirebaseAuth()

    useEffect(() => {
        if (!loading) {
            // Check if user is authenticated
            if (!user) {
                router.push('/login')
                return
            }

            // Check if user has admin role
            if (userData && userData.role !== 'admin') {
                router.push(`/dashboard/${userData.role}`)
                return
            }

            // Fetch notifications
            if (userData) {
                fetchNotifications()
            }
        }
    }, [user, userData, loading, router])

    const fetchNotifications = async () => {
        try {
            const response = await fetch('/api/notifications', {
                headers: {
                    'Authorization': `Bearer ${await user.getIdToken()}`
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

    const navigation = [
        {
            name: 'Dashboard',
            href: '/dashboard/admin',
            icon: LayoutDashboard,
            keywords: ['home', 'overview', 'stats']
        },
        {
            name: 'User Management',
            href: '/dashboard/admin/users',
            icon: Users,
            keywords: ['users', 'customers', 'members']
        },
        {
            name: 'All Products',
            href: '/dashboard/admin/products',
            icon: Package,
            keywords: ['products', 'inventory', 'items']
        },
        {
            name: 'All Orders',
            href: '/dashboard/admin/orders',
            icon: ShoppingCart,
            keywords: ['orders', 'sales', 'transactions']
        },
        {
            name: 'System Logs',
            href: '/dashboard/admin/logs',
            icon: FileText,
            keywords: ['logs', 'history', 'activity']
        },
        {
            name: 'Reports & Exports',
            href: '/dashboard/admin/reports',
            icon: BarChart3,
            keywords: ['reports', 'analytics', 'export']
        },
        {
            name: 'Settings',
            href: '/dashboard/admin/settings',
            icon: Settings,
            keywords: ['settings', 'configuration']
        }
    ]

    const isActive = (href) => pathname === href || pathname.startsWith(href + '/dashboard')

    if (loading || !userData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-base-content/70">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen overflow-hidden bg-base-300">
            {/* Sidebar */}
            <aside
                className={`bg-base-200 border-r border-base-300 transition-all duration-300 flex flex-col ${isCollapsed ? 'w-20' : 'w-64'
                    }`}
            >
                {/* Logo */}
                <div className="p-4 border-b border-base-300">
                    <Link href="/" className="flex items-center gap-3">
                        {!isCollapsed ? (
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-linear-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                                    <Package className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                                    ShopHub
                                </span>
                            </div>
                        ) : (
                            <div className="w-10 h-10 bg-linear-to-br from-primary to-secondary rounded-lg flex items-center justify-center mx-auto">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                        )}
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-2">
                    <ul className="space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon
                            const active = isActive(item.href)

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${active
                                                ? 'bg-linear-to-r from-primary to-secondary text-primary-content shadow-lg'
                                                : 'text-base-content hover:bg-base-300'
                                            } ${isCollapsed ? 'justify-center' : ''}`}
                                        title={isCollapsed ? item.name : ''}
                                    >
                                        <Icon className="w-5 h-5 shrink-0" />
                                        {!isCollapsed && (
                                            <span className="font-medium text-sm">{item.name}</span>
                                        )}
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>

                {/* Collapse Toggle */}
                <div className="p-4 border-t border-base-300">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-base-300 transition-colors"
                    >
                        {isCollapsed ? (
                            <ChevronRight className="w-5 h-5" />
                        ) : (
                            <>
                                <ChevronLeft className="w-5 h-5" />
                                <span className="text-sm font-medium">Collapse</span>
                            </>
                        )}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <DashboardNavbar user={userData} role="admin" notifications={notifications} />

                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
