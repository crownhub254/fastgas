'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, MapPin, Phone, DollarSign, CheckCircle, XCircle, Eye, X, Clock, Loader, Truck, Navigation } from 'lucide-react'
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth'
import toast from 'react-hot-toast'
import DataTable from '../../components/DataTable'
import Loading from '../../loading'

export default function RiderMyTasksPage() {
    const { user, userData } = useFirebaseAuth() // Also get userData to check role
    const [orders, setOrders] = useState([])
    const [filter, setFilter] = useState('pending')
    const [isLoading, setIsLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        if (user) {
            console.log('🔍 Current user:', {
                uid: user.uid,
                email: user.email,
                role: userData?.role
            })
            fetchOrders()
        }
    }, [user, userData, filter])

    const fetchOrders = async () => {
        setIsLoading(true)
        try {
            console.log('🔍 Fetching orders for rider:', user.uid)
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/riders/${user.uid}/orders`,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )

            if (!response.ok) {
                console.error('❌ HTTP Error:', response.status, response.statusText)
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            const data = await response.json()
            console.log('📦 API Response:', data)

            if (data.success) {
                let filteredOrders = data.orders || []

                if (filter !== 'all') {
                    filteredOrders = filteredOrders.filter(order => order.riderStatus === filter)
                }

                console.log(`✅ Orders fetched (filter: ${filter}):`, filteredOrders.length)
                setOrders(filteredOrders)
            } else {
                console.error('❌ Failed to load orders:', data.error)
                toast.error(data.error || 'Failed to load orders')
                setOrders([])
            }
        } catch (error) {
            console.error('❌ Error fetching orders:', error)
            toast.error('Failed to load orders: ' + error.message)
            setOrders([])
        } finally {
            setIsLoading(false)
        }
    }

    const handleAcceptDelivery = async (orderId) => {
        if (!orderId) {
            toast.error('Invalid order ID')
            return
        }

        if (!user?.uid) {
            toast.error('User not authenticated')
            return
        }

        setActionLoading(true)
        try {
            console.log('✅ Accepting delivery for order:', orderId)
            console.log('📤 Sending request with:', {
                orderId,
                riderId: user.uid
            })

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/riders/accept-delivery`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        orderId,
                        riderId: user.uid
                    })
                }
            )

            console.log('📥 Response status:', response.status, response.statusText)

            if (!response.ok) {
                const errorText = await response.text()
                console.error('❌ HTTP Error Response:', errorText)
                throw new Error(`HTTP ${response.status}: ${errorText}`)
            }

            const data = await response.json()
            console.log('📊 Accept delivery response:', data)

            if (data.success) {
                toast.success('✅ Delivery accepted!')
                setSelectedOrder(null)
                // Reload orders after a short delay
                setTimeout(() => fetchOrders(), 500)
            } else {
                console.error('❌ Failed to accept:', data.error)
                toast.error(data.error || 'Failed to accept delivery')
            }
        } catch (error) {
            console.error('❌ Error accepting delivery:', error)
            toast.error('Failed to accept delivery: ' + error.message)
        } finally {
            setActionLoading(false)
        }
    }

    const handleUpdateStatus = async (orderId, newStatus, statusLabel) => {
        if (!orderId) {
            toast.error('Invalid order ID')
            return
        }

        if (!user?.uid) {
            toast.error('User not authenticated')
            return
        }

        setActionLoading(true)
        try {
            console.log(`🔄 Updating order ${orderId} to status: ${newStatus}`)

            // Map the status to the correct Order.status and riderStatus
            let orderStatus = 'shipped' // default
            let riderStatus = newStatus

            // Define status mappings
            const statusMappings = {
                'picked_up': { orderStatus: 'shipped', riderStatus: 'picked_up' },
                'in_transit': { orderStatus: 'shipped', riderStatus: 'in_transit' },
                'delivered': { orderStatus: 'delivered', riderStatus: 'delivered' }
            }

            if (statusMappings[newStatus]) {
                orderStatus = statusMappings[newStatus].orderStatus
                riderStatus = statusMappings[newStatus].riderStatus
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/riders/update-status`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        orderId,
                        riderId: user.uid,
                        orderStatus,
                        riderStatus,
                        statusLabel
                    })
                }
            )

            if (!response.ok) {
                const errorText = await response.text()
                console.error('❌ HTTP Error Response:', errorText)
                throw new Error(`HTTP ${response.status}: ${errorText}`)
            }

            const data = await response.json()
            console.log('📊 Update status response:', data)

            if (data.success) {
                toast.success(`✅ Order marked as ${statusLabel}!`)
                setSelectedOrder(null)
                setTimeout(() => fetchOrders(), 500)
            } else {
                console.error('❌ Failed to update status:', data.error)
                toast.error(data.error || `Failed to update to ${statusLabel}`)
            }
        } catch (error) {
            console.error('❌ Error updating status:', error)
            toast.error('Failed to update status: ' + error.message)
        } finally {
            setActionLoading(false)
        }
    }

    const handleCancelDelivery = async (orderId) => {
        if (!orderId) {
            toast.error('Invalid order ID')
            return
        }

        if (!user?.uid) {
            toast.error('User not authenticated')
            return
        }

        const reason = prompt('Please provide a reason for cancellation:')
        if (!reason || reason.trim() === '') {
            toast.error('Reason is required')
            return
        }

        if (!confirm('This will reset the order and remove your assignment. Admin will need to reassign a rider. Continue?')) {
            return
        }

        setActionLoading(true)
        try {
            console.log('🔄 Cancelling delivery for order:', orderId)

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/riders/reject-delivery`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        orderId,
                        riderId: user.uid,
                        reason: reason.trim()
                    })
                }
            )

            if (!response.ok) {
                const errorText = await response.text()
                console.error('❌ HTTP Error Response:', errorText)
                throw new Error(`HTTP ${response.status}: ${errorText}`)
            }

            const data = await response.json()
            console.log('📊 Cancel delivery response:', data)

            if (data.success) {
                toast.success('Delivery cancelled. Order reset for reassignment.')
                setSelectedOrder(null)
                setTimeout(() => fetchOrders(), 500)
            } else {
                console.error('❌ Failed to cancel:', data.error)
                toast.error(data.error || 'Failed to cancel delivery')
            }
        } catch (error) {
            console.error('❌ Error cancelling delivery:', error)
            toast.error('Failed to cancel delivery: ' + error.message)
        } finally {
            setActionLoading(false)
        }
    }

    const getStatusBadge = (status) => {
        const badges = {
            pending: { class: 'badge-warning', label: 'Pending', icon: Clock },
            assigned: { class: 'badge-warning', label: 'Assigned', icon: Clock },
            accepted: { class: 'badge-info', label: 'Accepted', icon: CheckCircle },
            picked_up: { class: 'badge-primary', label: 'Picked Up', icon: Package },
            in_transit: { class: 'badge-primary', label: 'In Transit', icon: Truck },
            out_for_delivery: { class: 'badge-secondary', label: 'Out for Delivery', icon: Navigation },
            delivered: { class: 'badge-success', label: 'Delivered', icon: CheckCircle },
            cancelled: { class: 'badge-error', label: 'Cancelled', icon: XCircle }
        }
        const badge = badges[status] || badges.pending
        const Icon = badge.icon

        return (
            <span className={`badge ${badge.class} gap-1`}>
                <Icon className="w-3 h-3" />
                {badge.label}
            </span>
        )
    }

    const getActionButtons = (order) => {
        const status = order.riderStatus

        switch (status) {
            case 'pending':
                return (
                    <>
                        <button
                            onClick={() => handleAcceptDelivery(order.orderId)}
                            className="btn btn-sm btn-success"
                            title="Accept Delivery"
                            disabled={actionLoading}
                        >
                            {actionLoading ? (
                                <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                                <CheckCircle className="w-4 h-4" />
                            )}
                        </button>
                        <button
                            onClick={() => handleCancelDelivery(order.orderId)}
                            className="btn btn-sm btn-error btn-outline"
                            title="Reject Delivery"
                            disabled={actionLoading}
                        >
                            <XCircle className="w-4 h-4" />
                        </button>
                    </>
                )

            case 'accepted':
                return (
                    <>
                        <button
                            onClick={() => handleUpdateStatus(order.orderId, 'picked_up', 'Picked Up')}
                            className="btn btn-sm btn-outline btn-success"
                            title="Mark as Picked Up"
                            disabled={actionLoading}
                        >
                            {actionLoading ? (
                                <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                                <Package className="w-4 h-4" />
                            )}
                        </button>
                        <button
                            onClick={() => handleCancelDelivery(order.orderId)}
                            className="btn btn-sm btn-error btn-outline"
                            title="Cancel Delivery"
                            disabled={actionLoading}
                        >
                            <XCircle className="w-4 h-4" />
                        </button>
                    </>
                )

            case 'picked_up':
                return (
                    <>
                        <button
                            onClick={() => handleUpdateStatus(order.orderId, 'in_transit', 'In Transit')}
                            className="btn btn-sm btn-info"
                            title="Mark as In Transit"
                            disabled={actionLoading}
                        >
                            {actionLoading ? (
                                <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                                <Truck className="w-4 h-4" />
                            )}
                        </button>
                        <button
                            onClick={() => handleCancelDelivery(order.orderId)}
                            className="btn btn-sm btn-error btn-outline"
                            title="Cancel Delivery"
                            disabled={actionLoading}
                        >
                            <XCircle className="w-4 h-4" />
                        </button>
                    </>
                )

            case 'in_transit':
                return (
                    <>
                        <button
                            onClick={() => handleUpdateStatus(order.orderId, 'delivered', 'Delivered')}
                            className="btn btn-sm btn-success"
                            title="Mark as Delivered"
                            disabled={actionLoading}
                        >
                            {actionLoading ? (
                                <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                                <CheckCircle className="w-4 h-4" />
                            )}
                        </button>
                        <button
                            onClick={() => handleCancelDelivery(order.orderId)}
                            className="btn btn-sm btn-error btn-outline"
                            title="Report Failed Delivery"
                            disabled={actionLoading}
                        >
                            <XCircle className="w-4 h-4" />
                        </button>
                    </>
                )

            case 'delivered':
                return (
                    <div className="badge badge-success gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Completed
                    </div>
                )

            default:
                return null
        }
    }

    const columns = [
        {
            header: 'Order ID',
            accessor: 'orderId',
            render: (order) => (
                <div>
                    <div className="font-bold text-base-content">{order.orderId}</div>
                    <div className="text-xs text-base-content/60 font-mono">
                        {order.trackingId}
                    </div>
                </div>
            )
        },
        {
            header: 'Customer',
            accessor: 'buyerInfo',
            render: (order) => (
                <div>
                    <div className="font-semibold text-base-content">
                        {order.buyerInfo?.name || 'N/A'}
                    </div>
                    <div className="text-xs text-base-content/60 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {order.buyerInfo?.phoneNumber || 'N/A'}
                    </div>
                </div>
            )
        },
        {
            header: 'Location',
            accessor: 'shippingAddress',
            render: (order) => (
                <div className="text-sm">
                    <div className="font-semibold text-base-content flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-primary" />
                        {order.shippingAddress?.city || 'N/A'}
                    </div>
                    <div className="text-xs text-base-content/60">
                        {order.shippingAddress?.district}, {order.shippingAddress?.division}
                    </div>
                </div>
            )
        },
        {
            header: 'Items',
            accessor: 'items',
            render: (order) => (
                <div className="text-sm">
                    <div className="font-semibold text-base-content">
                        {order.items?.length || 0} item(s)
                    </div>
                    <div className="text-xs text-base-content/60">
                        Total: ${order.total?.toFixed(2) || '0.00'}
                    </div>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'riderStatus',
            render: (order) => getStatusBadge(order.riderStatus)
        },
        {
            header: 'Delivery Fee',
            accessor: 'deliveryFee',
            render: (order) => (
                <div className="font-semibold text-success">
                    ${order.deliveryFee?.toFixed(2) || '50.00'}
                </div>
            )
        },
        {
            header: 'Actions',
            accessor: 'actions',
            render: (order) => (
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setSelectedOrder(order)}
                        className="btn btn-sm btn-info btn-outline"
                        title="View Details"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    {getActionButtons(order)}
                </div>
            )
        }
    ]

    if (isLoading) {
        return <Loading />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-bold text-base-content mb-2">My Delivery Tasks</h1>
                <p className="text-base-content/70">
                    {filter === 'pending'
                        ? `You have ${orders.length} pending task(s) awaiting your response`
                        : `Showing ${orders.length} ${filter === 'all' ? 'total' : filter} task(s)`
                    }
                </p>
            </motion.div>

            {/* Filter Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 overflow-x-auto pb-2"
            >
                {[
                    { value: 'pending', label: 'Pending' },
                    { value: 'accepted', label: 'Accepted' },
                    { value: 'picked_up', label: 'Picked Up' },
                    { value: 'in_transit', label: 'In Transit' },
                    { value: 'delivered', label: 'Delivered' },
                    { value: 'all', label: 'All Tasks' }
                ].map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => setFilter(tab.value)}
                        className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${filter === tab.value
                            ? 'bg-gradient-to-r from-primary to-secondary text-primary-content shadow-lg'
                            : 'bg-base-200 text-base-content hover:bg-base-300'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </motion.div>

            {/* Data Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                {orders.length > 0 ? (
                    <DataTable
                        columns={columns}
                        data={orders}
                        itemsPerPage={10}
                        emptyMessage="No delivery tasks found"
                        EmptyIcon={Package}
                    />
                ) : (
                    <div className="text-center py-12 card bg-base-100 shadow-xl">
                        <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-base-content/70 font-semibold text-lg">
                            No {filter !== 'all' ? filter : ''} delivery tasks found
                        </p>
                        <p className="text-base-content/50 text-sm mt-2">
                            {filter === 'pending'
                                ? 'All pending tasks have been accepted or rejected'
                                : 'Check back later for new assignments'
                            }
                        </p>
                    </div>
                )}
            </motion.div>

            {/* Details Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                        onClick={() => setSelectedOrder(null)}
                    >
                        <motion.div
                            onClick={(e) => e.stopPropagation()}
                            className="bg-base-100 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-gradient-to-r from-primary to-secondary p-6 flex justify-between items-center z-10">
                                <div>
                                    <h2 className="text-2xl font-bold text-primary-content">
                                        Order Details
                                    </h2>
                                    <p className="text-sm text-primary-content/80 mt-1">
                                        {selectedOrder.orderId}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="btn btn-circle btn-sm btn-ghost text-primary-content hover:bg-white/20"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 space-y-6">
                                {/* Order Status */}
                                <div className="flex justify-between items-center pb-4 border-b border-base-300">
                                    <div>
                                        <p className="text-xs text-base-content/60">Tracking ID</p>
                                        <p className="font-mono text-sm">{selectedOrder.trackingId}</p>
                                    </div>
                                    {getStatusBadge(selectedOrder.riderStatus)}
                                </div>

                                {/* Customer Information */}
                                <div>
                                    <h4 className="font-bold text-base-content mb-3 flex items-center gap-2">
                                        <Package className="w-5 h-5 text-primary" />
                                        Customer Information
                                    </h4>
                                    <div className="bg-base-200 p-4 rounded-lg space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-base-content/70">Name:</span>
                                            <span className="font-semibold text-base-content">
                                                {selectedOrder.buyerInfo?.name || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-base-content/70">Phone:</span>
                                            <a
                                                href={`tel:${selectedOrder.buyerInfo?.phoneNumber}`}
                                                className="font-semibold text-primary hover:underline flex items-center gap-1"
                                            >
                                                <Phone className="w-4 h-4" />
                                                {selectedOrder.buyerInfo?.phoneNumber || 'N/A'}
                                            </a>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-base-content/70">Email:</span>
                                            <span className="font-semibold text-base-content text-sm">
                                                {selectedOrder.buyerInfo?.email || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Delivery Address */}
                                <div>
                                    <h4 className="font-bold text-base-content mb-3 flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-primary" />
                                        Delivery Address
                                    </h4>
                                    <div className="bg-base-200 p-4 rounded-lg">
                                        <p className="text-base-content font-semibold mb-1">
                                            {selectedOrder.shippingAddress?.street}
                                        </p>
                                        <p className="text-base-content/70">
                                            {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.district}
                                        </p>
                                        <p className="text-base-content/70">
                                            {selectedOrder.shippingAddress?.division}, {selectedOrder.shippingAddress?.zipCode}
                                        </p>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div>
                                    <h4 className="font-bold text-base-content mb-3 flex items-center gap-2">
                                        <Package className="w-5 h-5 text-primary" />
                                        Order Items ({selectedOrder.items?.length || 0})
                                    </h4>
                                    <div className="bg-base-200 p-4 rounded-lg space-y-3">
                                        {selectedOrder.items?.map((item, i) => (
                                            <div key={i} className="flex items-center justify-between pb-3 border-b border-base-300 last:border-0 last:pb-0">
                                                <div>
                                                    <p className="font-semibold text-base-content">{item.name}</p>
                                                    <p className="text-sm text-base-content/60">
                                                        Qty: {item.quantity}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-base-content">
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </p>
                                                    <p className="text-sm text-base-content/60">
                                                        ${item.price.toFixed(2)} each
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div>
                                    <h4 className="font-bold text-base-content mb-3 flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-primary" />
                                        Order Summary
                                    </h4>
                                    <div className="bg-base-200 p-4 rounded-lg space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-base-content/70">Subtotal:</span>
                                            <span className="font-semibold text-base-content">
                                                ${selectedOrder.subtotal?.toFixed(2) || '0.00'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-base-content/70">Shipping:</span>
                                            <span className="font-semibold text-base-content">
                                                ${selectedOrder.shipping?.toFixed(2) || '0.00'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-base-content/70">Tax:</span>
                                            <span className="font-semibold text-base-content">
                                                ${selectedOrder.tax?.toFixed(2) || '0.00'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-base-content/70">Your Delivery Fee:</span>
                                            <span className="font-semibold text-success text-lg">
                                                ${selectedOrder.deliveryFee?.toFixed(2) || '50.00'}
                                            </span>
                                        </div>
                                        <div className="border-t border-base-300 pt-2 mt-2 flex justify-between">
                                            <span className="font-bold text-base-content">Order Total:</span>
                                            <span className="font-bold text-base-content">
                                                ${selectedOrder.total?.toFixed(2) || '0.00'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
