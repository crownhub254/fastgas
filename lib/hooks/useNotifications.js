'use client'

import { useState, useEffect, useCallback } from 'react'

export default function useNotifications(userId) {
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const API_URL = process.env.NEXT_PUBLIC_API_URL

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        if (!userId) {
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            const response = await fetch(`${API_URL}/notifications/user/${userId}`)
            const data = await response.json()

            if (data.success) {
                setNotifications(data.notifications)
                setUnreadCount(data.unreadCount)
            } else {
                setError(data.error || 'Failed to fetch notifications')
            }
        } catch (err) {
            console.error('Error fetching notifications:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [userId, API_URL])

    // Fetch unread count only
    const fetchUnreadCount = useCallback(async () => {
        if (!userId) return

        try {
            const response = await fetch(`${API_URL}/notifications/user/${userId}/unread-count`)
            const data = await response.json()

            if (data.success) {
                setUnreadCount(data.count)
            }
        } catch (err) {
            console.error('Error fetching unread count:', err)
        }
    }, [userId, API_URL])

    // Mark notification as read
    const markAsRead = useCallback(async (notificationId) => {
        try {
            const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            const data = await response.json()

            if (data.success) {
                // Update local state
                setNotifications(prev =>
                    prev.map(notif =>
                        notif._id === notificationId
                            ? { ...notif, read: true, readAt: new Date() }
                            : notif
                    )
                )
                setUnreadCount(prev => Math.max(0, prev - 1))
                return true
            }
            return false
        } catch (err) {
            console.error('Error marking notification as read:', err)
            return false
        }
    }, [API_URL])

    // Mark all as read
    const markAllAsRead = useCallback(async () => {
        if (!userId) return false

        try {
            const response = await fetch(`${API_URL}/notifications/user/${userId}/read-all`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            const data = await response.json()

            if (data.success) {
                // Update local state
                setNotifications(prev =>
                    prev.map(notif => ({
                        ...notif,
                        read: true,
                        readAt: new Date()
                    }))
                )
                setUnreadCount(0)
                return true
            }
            return false
        } catch (err) {
            console.error('Error marking all as read:', err)
            return false
        }
    }, [userId, API_URL])

    // Delete notification
    const deleteNotification = useCallback(async (notificationId) => {
        try {
            const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
                method: 'DELETE'
            })

            const data = await response.json()

            if (data.success) {
                // Update local state
                setNotifications(prev => {
                    const notification = prev.find(n => n._id === notificationId)
                    if (notification && !notification.read) {
                        setUnreadCount(prevCount => Math.max(0, prevCount - 1))
                    }
                    return prev.filter(notif => notif._id !== notificationId)
                })
                return true
            }
            return false
        } catch (err) {
            console.error('Error deleting notification:', err)
            return false
        }
    }, [API_URL])

    // Delete all notifications
    const deleteAllNotifications = useCallback(async () => {
        if (!userId) return false

        try {
            const response = await fetch(`${API_URL}/notifications/user/${userId}/all`, {
                method: 'DELETE'
            })

            const data = await response.json()

            if (data.success) {
                setNotifications([])
                setUnreadCount(0)
                return true
            }
            return false
        } catch (err) {
            console.error('Error deleting all notifications:', err)
            return false
        }
    }, [userId, API_URL])

    // Refresh notifications
    const refresh = useCallback(() => {
        fetchNotifications()
    }, [fetchNotifications])

    // Initial fetch
    useEffect(() => {
        fetchNotifications()
    }, [fetchNotifications])

    // Poll for new notifications every 10 seconds
    useEffect(() => {
        if (!userId) return

        const interval = setInterval(() => {
            fetchNotifications()
        }, 10000) // 10 seconds

        return () => clearInterval(interval)
    }, [userId, fetchNotifications])

    return {
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
        refresh,
        fetchUnreadCount
    }
}
