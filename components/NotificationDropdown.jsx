'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, X, Check, CheckCheck, Trash2, Package, ShoppingCart, CreditCard, Truck, CheckCircle, XCircle, AlertCircle, Star, UserPlus, UserCheck, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import useNotifications from '@/lib/hooks/useNotifications'
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth'

// Icon mapping for different notification types
const notificationIcons = {
    'order_placed': ShoppingCart,
    'order_confirmed': CheckCircle,
    'order_shipped': Truck,
    'order_delivered': Package,
    'order_cancelled': XCircle,
    'payment_success': CreditCard,
    'payment_failed': AlertCircle,
    'new_order': ShoppingCart,
    'product_approved': CheckCircle,
    'product_rejected': XCircle,
    'new_review': Star,
    'low_stock': AlertTriangle,
    'user_registered': UserPlus,
    'account_created': UserCheck,
    'profile_updated': UserCheck,
    'general': Bell
}

// Priority colors
const priorityColors = {
    'low': 'text-base-content/60',
    'medium': 'text-info',
    'high': 'text-warning',
    'urgent': 'text-error'
}

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false)
    const [filter, setFilter] = useState('all') // 'all', 'unread'
    const dropdownRef = useRef(null)
    const { user } = useFirebaseAuth()

    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
        refresh
    } = useNotifications(user?.uid)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    // Format time ago
    const formatTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000)

        if (seconds < 60) return 'Just now'
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
        return new Date(date).toLocaleDateString()
    }

    // Handle notification click
    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            await markAsRead(notification._id)
        }
        if (notification.link) {
            setIsOpen(false)
        }
    }

    // Handle mark all as read
    const handleMarkAllAsRead = async () => {
        const success = await markAllAsRead()
        if (success) {
            refresh()
        }
    }

    // Handle delete notification
    const handleDelete = async (e, notificationId) => {
        e.stopPropagation()
        await deleteNotification(notificationId)
    }

    // Handle clear all
    const handleClearAll = async () => {
        if (window.confirm('Are you sure you want to delete all notifications?')) {
            await deleteAllNotifications()
        }
    }

    // Filter notifications
    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.read)
        : notifications

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-lg bg-base-300 hover:bg-primary/20 transition-all duration-200 border border-base-content/10 group"
                aria-label="Notifications"
            >
                <Bell size={20} className={`${isOpen ? 'text-primary' : 'text-base-content'} group-hover:text-primary transition-colors`} />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-error text-error-content text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1.5 shadow-lg ring-2 ring-base-100"
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </motion.span>
                )}
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-base-100 rounded-xl shadow-2xl border border-base-300 overflow-hidden z-50"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-base-300 bg-base-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-bold text-base-content">
                                    Notifications
                                </h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="btn btn-ghost btn-sm btn-circle"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Filter Tabs */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${filter === 'all'
                                            ? 'bg-primary text-primary-content'
                                            : 'bg-base-100 text-base-content hover:bg-base-300'
                                        }`}
                                >
                                    All ({notifications.length})
                                </button>
                                <button
                                    onClick={() => setFilter('unread')}
                                    className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${filter === 'unread'
                                            ? 'bg-primary text-primary-content'
                                            : 'bg-base-100 text-base-content hover:bg-base-300'
                                        }`}
                                >
                                    Unread ({unreadCount})
                                </button>
                            </div>
                        </div>

                        {/* Actions Bar */}
                        {notifications.length > 0 && (
                            <div className="px-4 py-2 border-b border-base-300 bg-base-100 flex items-center justify-between">
                                <button
                                    onClick={handleMarkAllAsRead}
                                    disabled={unreadCount === 0}
                                    className="text-xs font-semibold text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                >
                                    <CheckCheck size={14} />
                                    Mark all as read
                                </button>
                                <button
                                    onClick={handleClearAll}
                                    className="text-xs font-semibold text-error hover:text-error/80 flex items-center gap-1"
                                >
                                    <Trash2 size={14} />
                                    Clear all
                                </button>
                            </div>
                        )}

                        {/* Notifications List */}
                        <div className="max-h-[400px] overflow-y-auto">
                            {loading ? (
                                <div className="p-8 text-center">
                                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                    <p className="text-sm text-base-content/60">Loading...</p>
                                </div>
                            ) : filteredNotifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Bell className="w-12 h-12 text-base-content/30 mx-auto mb-3" />
                                    <p className="text-sm font-semibold text-base-content">
                                        {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                                    </p>
                                    <p className="text-xs text-base-content/60 mt-1">
                                        {filter === 'unread' ? 'All caught up!' : 'Notifications will appear here'}
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-base-300">
                                    {filteredNotifications.map((notification) => {
                                        const IconComponent = notificationIcons[notification.type] || Bell
                                        const priorityColor = priorityColors[notification.priority] || priorityColors.medium

                                        return (
                                            <motion.div
                                                key={notification._id}
                                                layout
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                className={`p-4 hover:bg-base-200 transition-all cursor-pointer group relative ${!notification.read ? 'bg-primary/5' : ''
                                                    }`}
                                            >
                                                {notification.link ? (
                                                    <Link
                                                        href={notification.link}
                                                        onClick={() => handleNotificationClick(notification)}
                                                        className="block"
                                                    >
                                                        <NotificationContent
                                                            notification={notification}
                                                            IconComponent={IconComponent}
                                                            priorityColor={priorityColor}
                                                            formatTimeAgo={formatTimeAgo}
                                                        />
                                                    </Link>
                                                ) : (
                                                    <div onClick={() => handleNotificationClick(notification)}>
                                                        <NotificationContent
                                                            notification={notification}
                                                            IconComponent={IconComponent}
                                                            priorityColor={priorityColor}
                                                            formatTimeAgo={formatTimeAgo}
                                                        />
                                                    </div>
                                                )}

                                                {/* Delete Button */}
                                                <button
                                                    onClick={(e) => handleDelete(e, notification._id)}
                                                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity btn btn-ghost btn-xs btn-circle"
                                                >
                                                    <X size={14} />
                                                </button>

                                                {/* Unread Indicator */}
                                                {!notification.read && (
                                                    <div className="absolute top-4 right-12 w-2 h-2 bg-primary rounded-full"></div>
                                                )}
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="p-3 border-t border-base-300 bg-base-200 text-center">
                                <Link
                                    href="/notifications"
                                    onClick={() => setIsOpen(false)}
                                    className="text-sm font-semibold text-primary hover:text-primary/80"
                                >
                                    View all notifications
                                </Link>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// Separate component for notification content
function NotificationContent({ notification, IconComponent, priorityColor, formatTimeAgo }) {
    return (
        <div className="flex gap-3">
            <div className={`w-10 h-10 rounded-lg bg-base-300 flex items-center justify-center shrink-0 ${priorityColor}`}>
                <IconComponent size={20} />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-base-content truncate">
                    {notification.title}
                </h4>
                <p className="text-xs text-base-content/70 mt-0.5 line-clamp-2">
                    {notification.message}
                </p>
                <p className="text-xs text-base-content/50 mt-1">
                    {formatTimeAgo(notification.createdAt)}
                </p>
            </div>
        </div>
    )
}
