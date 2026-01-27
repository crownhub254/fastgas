'use client'

import { useEffect, useState } from 'react'
import { Activity, User, Package, ShoppingCart, CreditCard, Calendar, Search, Bell, Bike, Copy, Check } from 'lucide-react'
import DataTable from '../../components/DataTable'
import Loading from '../../loading'
import toast from 'react-hot-toast'

export default function AdminSystemLogs() {
    const [logs, setLogs] = useState([])
    const [filteredLogs, setFilteredLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionFilter, setActionFilter] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [copiedId, setCopiedId] = useState(null)

    useEffect(() => {
        fetchLogs()
    }, [])

    useEffect(() => {
        filterLogs()
    }, [actionFilter, searchQuery, logs])

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedId(text)
            toast.success('UID copied to clipboard!')
            setTimeout(() => setCopiedId(null), 2000)
        } catch (err) {
            toast.error('Failed to copy UID')
        }
    }

    const fetchLogs = async () => {
        try {
            setLoading(true)

            // Fetch all data sources in parallel
            const [ordersRes, productsRes, usersRes, paymentsRes, ridersRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/users`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/riders`)
            ])

            const [ordersData, productsData, usersData, paymentsData, ridersData] = await Promise.all([
                ordersRes.json(),
                productsRes.json(),
                usersRes.json(),
                paymentsRes.json(),
                ridersRes.json()
            ])

            // Create user lookup map for quick access
            const userMap = new Map()
            if (usersData.success && usersData.users) {
                usersData.users.forEach(user => {
                    userMap.set(user.uid, {
                        name: user.displayName,
                        email: user.email,
                        role: user.role
                    })
                })
            }

            // Create rider lookup map
            const riderMap = new Map()
            if (ridersData.success && ridersData.riders) {
                ridersData.riders.forEach(rider => {
                    riderMap.set(rider.uid, {
                        name: rider.displayName,
                        email: rider.email,
                        role: 'rider'
                    })
                })
            }

            // Collect all unique user IDs that need to be fetched
            const allUserIds = new Set()

            // Collect user IDs from all sources
            if (ordersData.success && ordersData.orders) {
                ordersData.orders.forEach(order => {
                    if (order.userId) allUserIds.add(order.userId)
                    if (order.riderId) allUserIds.add(order.riderId)
                })
            }

            if (productsData.success && productsData.products) {
                productsData.products.forEach(product => {
                    if (product.userId) allUserIds.add(product.userId)
                    if (product.reviews) {
                        product.reviews.forEach(review => {
                            if (review.userId) allUserIds.add(review.userId)
                        })
                    }
                })
            }

            // Fetch individual user data for any missing UIDs
            const missingUserIds = Array.from(allUserIds).filter(
                uid => uid && uid !== 'system' && !userMap.has(uid) && !riderMap.has(uid)
            )

            // Fetch missing users in parallel
            if (missingUserIds.length > 0) {
                const userFetchPromises = missingUserIds.map(uid =>
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/user/${uid}`)
                        .then(res => res.json())
                        .catch(err => {
                            console.error(`Failed to fetch user ${uid}:`, err)
                            return { success: false }
                        })
                )

                const userResults = await Promise.all(userFetchPromises)

                userResults.forEach((result, index) => {
                    if (result.success && result.user) {
                        const user = result.user
                        const uid = missingUserIds[index]

                        if (user.role === 'rider') {
                            riderMap.set(uid, {
                                name: user.displayName,
                                email: user.email,
                                role: 'rider'
                            })
                        } else {
                            userMap.set(uid, {
                                name: user.displayName,
                                email: user.email,
                                role: user.role
                            })
                        }
                    }
                })
            }

            // Helper function to get user info
            const getUserInfo = (userId) => {
                if (!userId || userId === 'system') return null
                const info = userMap.get(userId) || riderMap.get(userId)
                return info || null
            }

            // Build activity logs array from all sources
            const activityLogs = []

            // 1. ORDER LOGS
            if (ordersData.success && ordersData.orders) {
                ordersData.orders.forEach(order => {
                    const customerInfo = getUserInfo(order.userId)

                    // Only add log if we have customer info
                    if (customerInfo) {
                        // Order creation log
                        activityLogs.push({
                            id: `order-created-${order.orderId}`,
                            action: 'Order Placed',
                            actionType: 'order',
                            userId: order.userId,
                            userName: customerInfo.name,
                            userEmail: customerInfo.email,
                            userRole: customerInfo.role,
                            details: `Order #${order.orderId} - $${order.total?.toFixed(2) || '0.00'} - ${order.items?.length || 0} items`,
                            status: order.status,
                            timestamp: new Date(order.createdAt || Date.now()).getTime(),
                            date: order.createdAt || new Date().toISOString()
                        })
                    }

                    // If order has rider assigned
                    if (order.riderId) {
                        const riderInfo = getUserInfo(order.riderId)
                        if (riderInfo) {
                            activityLogs.push({
                                id: `order-assigned-${order.orderId}`,
                                action: 'Rider Assigned',
                                actionType: 'rider',
                                userId: order.riderId,
                                userName: riderInfo.name,
                                userEmail: riderInfo.email,
                                userRole: 'rider',
                                details: `Order #${order.orderId} assigned to rider`,
                                status: order.riderStatus || 'assigned',
                                timestamp: new Date(order.riderAssignedAt || order.createdAt || Date.now()).getTime(),
                                date: order.riderAssignedAt || order.createdAt || new Date().toISOString()
                            })
                        }
                    }

                    // If order was accepted by rider
                    if (order.riderStatus === 'accepted' && order.riderAcceptedAt && order.riderId) {
                        const riderInfo = getUserInfo(order.riderId)
                        if (riderInfo) {
                            activityLogs.push({
                                id: `order-accepted-${order.orderId}`,
                                action: 'Delivery Accepted',
                                actionType: 'rider',
                                userId: order.riderId,
                                userName: riderInfo.name,
                                userEmail: riderInfo.email,
                                userRole: 'rider',
                                details: `Order #${order.orderId} accepted by rider`,
                                status: 'accepted',
                                timestamp: new Date(order.riderAcceptedAt).getTime(),
                                date: order.riderAcceptedAt
                            })
                        }
                    }

                    // If order was picked up
                    if (order.pickedUpAt && order.riderId) {
                        const riderInfo = getUserInfo(order.riderId)
                        if (riderInfo) {
                            activityLogs.push({
                                id: `order-picked-${order.orderId}`,
                                action: 'Package Picked Up',
                                actionType: 'rider',
                                userId: order.riderId,
                                userName: riderInfo.name,
                                userEmail: riderInfo.email,
                                userRole: 'rider',
                                details: `Order #${order.orderId} picked up by rider`,
                                status: 'picked_up',
                                timestamp: new Date(order.pickedUpAt).getTime(),
                                date: order.pickedUpAt
                            })
                        }
                    }

                    // If order is delivered
                    if (order.status === 'delivered' && order.deliveredAt && order.riderId) {
                        const riderInfo = getUserInfo(order.riderId)
                        if (riderInfo) {
                            activityLogs.push({
                                id: `order-delivered-${order.orderId}`,
                                action: 'Order Delivered',
                                actionType: 'rider',
                                userId: order.riderId,
                                userName: riderInfo.name,
                                userEmail: riderInfo.email,
                                userRole: 'rider',
                                details: `Order #${order.orderId} successfully delivered`,
                                status: 'delivered',
                                timestamp: new Date(order.deliveredAt).getTime(),
                                date: order.deliveredAt
                            })
                        }
                    }
                })
            }

            // 2. RIDER LOGS
            if (ridersData.success && ridersData.riders) {
                ridersData.riders.forEach(rider => {
                    // Rider registration
                    activityLogs.push({
                        id: `rider-registered-${rider.uid}`,
                        action: 'Rider Registered',
                        actionType: 'rider',
                        userId: rider.uid,
                        userName: rider.displayName,
                        userEmail: rider.email,
                        userRole: 'rider',
                        details: `${rider.displayName} registered as rider - ${rider.vehicleType} (${rider.vehicleNumber})`,
                        status: rider.isVerified ? 'verified' : 'pending',
                        timestamp: new Date(rider.createdAt || Date.now()).getTime(),
                        date: rider.createdAt || new Date().toISOString()
                    })

                    // Rider verification
                    if (rider.isVerified && rider.updatedAt && rider.updatedAt !== rider.createdAt) {
                        activityLogs.push({
                            id: `rider-verified-${rider.uid}`,
                            action: 'Rider Verified',
                            actionType: 'rider',
                            userId: rider.uid,
                            userName: rider.displayName,
                            userEmail: rider.email,
                            userRole: 'rider',
                            details: `${rider.displayName} account verified by admin`,
                            status: 'verified',
                            timestamp: new Date(rider.updatedAt).getTime(),
                            date: rider.updatedAt
                        })
                    }
                })
            }

            // 3. PRODUCT LOGS
            if (productsData.success && productsData.products) {
                productsData.products.forEach(product => {
                    const sellerInfo = getUserInfo(product.userId)

                    // Only add product log if we have seller info
                    if (sellerInfo) {
                        activityLogs.push({
                            id: `product-${product._id || product.id}`,
                            action: 'Product Added',
                            actionType: 'product',
                            userId: product.userId,
                            userName: sellerInfo.name,
                            userEmail: sellerInfo.email,
                            userRole: sellerInfo.role,
                            details: `${product.name} - ${product.category} - $${product.price?.toFixed(2) || '0.00'}`,
                            status: product.stock > 0 ? 'active' : 'out_of_stock',
                            timestamp: new Date(product.createdAt || Date.now()).getTime(),
                            date: product.createdAt || new Date().toISOString()
                        })
                    }

                    // Product reviews logs
                    if (product.reviews && product.reviews.length > 0) {
                        product.reviews.forEach(review => {
                            const reviewerInfo = getUserInfo(review.userId)
                            // Only add review log if we have reviewer info
                            if (reviewerInfo) {
                                activityLogs.push({
                                    id: `review-${product._id || product.id}-${review.userId}`,
                                    action: 'Product Review',
                                    actionType: 'product',
                                    userId: review.userId,
                                    userName: reviewerInfo.name,
                                    userEmail: reviewerInfo.email,
                                    userRole: reviewerInfo.role,
                                    details: `Review on ${product.name} - ${review.rating} stars`,
                                    status: 'active',
                                    timestamp: new Date(review.date || Date.now()).getTime(),
                                    date: review.date || new Date().toISOString()
                                })
                            }
                        })
                    }
                })
            }

            // 4. USER LOGS
            if (usersData.success && usersData.users) {
                usersData.users.forEach(user => {
                    activityLogs.push({
                        id: `user-${user.uid}`,
                        action: 'User Registered',
                        actionType: 'user',
                        userId: user.uid,
                        userName: user.displayName,
                        userEmail: user.email,
                        userRole: user.role,
                        details: `${user.displayName} registered with ${user.provider} - Role: ${user.role}`,
                        status: 'active',
                        timestamp: new Date(user.createdAt || Date.now()).getTime(),
                        date: user.createdAt || new Date().toISOString()
                    })

                    // User updates
                    if (user.updatedAt && user.updatedAt !== user.createdAt) {
                        activityLogs.push({
                            id: `user-update-${user.uid}`,
                            action: 'Profile Updated',
                            actionType: 'user',
                            userId: user.uid,
                            userName: user.displayName,
                            userEmail: user.email,
                            userRole: user.role,
                            details: `${user.displayName} updated their profile`,
                            status: 'active',
                            timestamp: new Date(user.updatedAt).getTime(),
                            date: user.updatedAt
                        })
                    }
                })
            }

            // 5. PAYMENT LOGS
            if (paymentsData.success && paymentsData.payments) {
                paymentsData.payments.forEach(payment => {
                    // Find the order to get user info
                    const relatedOrder = ordersData.orders?.find(o => o.orderId === payment.orderId)
                    const userInfo = relatedOrder ? getUserInfo(relatedOrder.userId) : null

                    // Only add payment log if we have user info
                    if (userInfo) {
                        activityLogs.push({
                            id: `payment-${payment._id}`,
                            action: 'Payment Processed',
                            actionType: 'payment',
                            userId: relatedOrder.userId,
                            userName: userInfo.name,
                            userEmail: userInfo.email,
                            userRole: userInfo.role,
                            details: `Order: ${payment.orderId} - $${payment.amount?.toFixed(2) || '0.00'} - ${payment.paymentMethod || 'Card'}`,
                            status: payment.status,
                            timestamp: new Date(payment.createdAt || Date.now()).getTime(),
                            date: payment.createdAt || new Date().toISOString()
                        })
                    }
                })
            }

            // Sort by timestamp (latest first)
            activityLogs.sort((a, b) => b.timestamp - a.timestamp)

            setLogs(activityLogs)
            setFilteredLogs(activityLogs)
        } catch (error) {
            console.error('Failed to fetch logs:', error)
            toast.error('Failed to load system logs')
        } finally {
            setLoading(false)
        }
    }

    const filterLogs = () => {
        let filtered = logs

        // Filter by action type
        if (actionFilter !== 'all') {
            filtered = filtered.filter(log => log.actionType === actionFilter)
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(log =>
                log.details?.toLowerCase().includes(query) ||
                log.userId?.toLowerCase().includes(query) ||
                log.userName?.toLowerCase().includes(query) ||
                log.userEmail?.toLowerCase().includes(query) ||
                log.action?.toLowerCase().includes(query)
            )
        }

        setFilteredLogs(filtered)
    }

    const getActionIcon = (actionType) => {
        const icons = {
            user: User,
            product: Package,
            order: ShoppingCart,
            payment: CreditCard,
            notification: Bell,
            rider: Bike
        }
        const Icon = icons[actionType] || Activity
        return <Icon className="w-5 h-5" />
    }

    const getActionColor = (actionType) => {
        const colors = {
            user: 'bg-info/10 text-info',
            product: 'bg-success/10 text-success',
            order: 'bg-primary/10 text-primary',
            payment: 'bg-warning/10 text-warning',
            notification: 'bg-secondary/10 text-secondary',
            rider: 'bg-accent/10 text-accent'
        }
        return colors[actionType] || 'bg-base-300 text-base-content'
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            // Order statuses
            'processing': 'badge-info',
            'confirmed': 'badge-info',
            'assigned': 'badge-primary',
            'shipped': 'badge-primary',
            'collected': 'badge-primary',
            'in_transit': 'badge-primary',
            'out_for_delivery': 'badge-primary',
            'delivered': 'badge-success',
            'cancelled': 'badge-error',

            // Payment statuses
            'succeeded': 'badge-success',
            'completed': 'badge-success',
            'pending': 'badge-warning',
            'failed': 'badge-error',

            // Product statuses
            'active': 'badge-success',
            'out_of_stock': 'badge-error',

            // Rider statuses
            'accepted': 'badge-success',
            'rejected': 'badge-error',
            'picked_up': 'badge-primary',
            'verified': 'badge-success',
        }

        return statusConfig[status] || 'badge-ghost'
    }

    const getRoleBadgeColor = (role) => {
        const colors = {
            'admin': 'badge-error',
            'seller': 'badge-warning',
            'rider': 'badge-accent',
            'user': 'badge-info'
        }
        return colors[role] || 'badge-ghost'
    }

    const actionFilters = [
        { value: 'all', label: 'All Activities', count: logs.length },
        { value: 'user', label: 'User Activity', count: logs.filter(l => l.actionType === 'user').length },
        { value: 'product', label: 'Products', count: logs.filter(l => l.actionType === 'product').length },
        { value: 'order', label: 'Orders', count: logs.filter(l => l.actionType === 'order').length },
        { value: 'payment', label: 'Payments', count: logs.filter(l => l.actionType === 'payment').length },
        { value: 'rider', label: 'Rider Activity', count: logs.filter(l => l.actionType === 'rider').length }
    ]

    const columns = [
        {
            header: 'Action',
            accessor: 'action',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getActionColor(row.actionType)}`}>
                        {getActionIcon(row.actionType)}
                    </div>
                    <div>
                        <div className="font-semibold">{row.action}</div>
                        <div className="text-xs text-base-content/60 capitalize">{row.actionType}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Details',
            accessor: 'details',
            render: (row) => <span className="text-sm">{row.details}</span>
        },
        {
            header: 'Performed By',
            accessor: 'userName',
            render: (row) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{row.userName}</span>
                        <span className={`badge badge-xs ${getRoleBadgeColor(row.userRole)}`}>
                            {row.userRole}
                        </span>
                    </div>
                    <div className="text-xs text-base-content/60">{row.userEmail}</div>
                    {row.userId && (
                        <button
                            onClick={() => copyToClipboard(row.userId)}
                            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors group"
                        >
                            <span className="font-mono">{row.userId.slice(0, 8)}...</span>
                            {copiedId === row.userId ? (
                                <Check className="w-3 h-3 text-success" />
                            ) : (
                                <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                        </button>
                    )}
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <span className={`badge ${getStatusBadge(row.status)}`}>
                    {row.status}
                </span>
            )
        },
        {
            header: 'Date & Time',
            accessor: 'date',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-base-content/60" />
                    <div className="text-sm">
                        <div>{new Date(row.date).toLocaleDateString()}</div>
                        <div className="text-xs text-base-content/60">
                            {new Date(row.date).toLocaleTimeString()}
                        </div>
                    </div>
                </div>
            )
        }
    ]

    if (loading) {
        return <Loading />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2">System Logs</h1>
                <p className="text-base-content/70">Track all system activities and user actions</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="card bg-base-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Activity className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{logs.length}</p>
                            <p className="text-sm text-base-content/70">Total Activities</p>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center">
                            <User className="w-6 h-6 text-info" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{logs.filter(l => l.actionType === 'user').length}</p>
                            <p className="text-sm text-base-content/70">User Actions</p>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                            <ShoppingCart className="w-6 h-6 text-success" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{logs.filter(l => l.actionType === 'order').length}</p>
                            <p className="text-sm text-base-content/70">Orders</p>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-warning" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{logs.filter(l => l.actionType === 'payment').length}</p>
                            <p className="text-sm text-base-content/70">Payments</p>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                            <Bike className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{logs.filter(l => l.actionType === 'rider').length}</p>
                            <p className="text-sm text-base-content/70">Rider Activity</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Type Filters */}
            <div className="flex gap-3 overflow-x-auto pb-2">
                {actionFilters.map((filter) => (
                    <button
                        key={filter.value}
                        onClick={() => setActionFilter(filter.value)}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap ${actionFilter === filter.value
                                ? 'bg-linear-to-r from-primary to-secondary text-primary-content shadow-lg'
                                : 'bg-base-200 text-base-content hover:bg-base-300'
                            }`}
                    >
                        {filter.label} ({filter.count})
                    </button>
                ))}
            </div>

            {/* Search Bar */}
            <div className="card bg-base-200 p-6">
                <div className="form-control">
                    <div className="input">
                        <span className="">
                            <Search className="w-5 h-5" />
                        </span>
                        <input
                            type="text"
                            placeholder="Search logs by details, user name, email, or action..."
                            className="flex-1"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="card bg-base-200 p-6">
                <DataTable
                    columns={columns}
                    data={filteredLogs}
                    itemsPerPage={5}
                    emptyMessage="No logs found"
                    EmptyIcon={Activity}
                />
            </div>
        </div>
    )
}
