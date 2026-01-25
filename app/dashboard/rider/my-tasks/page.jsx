'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, MapPin, Phone, DollarSign, CheckCircle, XCircle, Eye, X, Clock, Loader } from 'lucide-react'
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth'
import toast from 'react-hot-toast'
import DataTable from '../../components/DataTable'
import Loading from '../../loading'

export default function RiderMyTasksPage() {
    const { user } = useFirebaseAuth()
    const [orders, setOrders] = useState([])
    const [filter, setFilter] = useState('all')
    const [isLoading, setIsLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        if (user) {
            fetchOrders()
        }
    }, [user, filter])

    const fetchOrders = async () => {
        setIsLoading(true)
        try {
            console.log('Fetching orders for rider:', user.uid)
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/riders/${user.uid}/orders`
            )
            const data = await response.json()

            console.log('API Response:', data)

            if (data.success) {
                let filteredOrders = data.orders
                if (filter !== 'all') {
                    filteredOrders = data.orders.filter(order => order.riderStatus === filter)
                }
                console.log('Orders fetched:', filteredOrders)
                console.log('Order riderStatuses:', filteredOrders.map(o => ({ orderId: o.orderId, riderStatus: o.riderStatus })))
                setOrders(filteredOrders)
            } else {
                toast.error(data.error || 'Failed to load orders')
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
            toast.error('Failed to load orders')
        } finally {
            setIsLoading(false)
        }
    }

    const handleAcceptDelivery = async (orderId) => {
        setActionLoading(true)
        try {
            console.log('Accepting delivery for order:', orderId)
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

            const data = await response.json()
            console.log('Accept delivery response:', data)

            if (data.success) {
                toast.success('✅ Delivery accepted! Customer has been notified.')
                // Refresh orders after a short delay to allow server to update
                setTimeout(() => {
                    fetchOrders()
                }, 500)
                setSelectedOrder(null)
            } else {
                toast.error(data.error || 'Failed to accept delivery')
            }
        } catch (error) {
            console.error('Error accepting delivery:', error)
            toast.error('Failed to accept delivery: ' + error.message)
        } finally {
            setActionLoading(false)
        }
    }

    const handleRejectDelivery = async (orderId) => {
        const reason = prompt('Please provide a reason for rejection:')
        if (!reason) {
            toast.error('Reason is required')
            return
        }

        setActionLoading(true)
        try {
            console.log('Rejecting delivery for order:', orderId)
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
                        reason
                    })
                }
            )

            const data = await response.json()
            console.log('Reject delivery response:', data)

            if (data.success) {
                toast.success('Delivery rejected')
                // Refresh orders after a short delay
                setTimeout(() => {
                    fetchOrders()
                }, 500)
                setSelectedOrder(null)
            } else {
                toast.error(data.error || 'Failed to reject delivery')
            }
        } catch (error) {
            console.error('Error rejecting delivery:', error)
            toast.error('Failed to reject delivery: ' + error.message)
        } finally {
            setActionLoading(false)
        }
    }

    const getStatusBadge = (status) => {
        const badges = {
            pending: { class: 'badge-warning', label: 'Pending' },
            assigned: { class: 'badge-warning', label: 'Assigned' },
            accepted: { class: 'badge-info', label: 'Accepted' },
            picked_up: { class: 'badge-primary', label: 'Picked Up' },
            in_transit: { class: 'badge-primary', label: 'In Transit' },
            out_for_delivery: { class: 'badge-secondary', label: 'Out for Delivery' },
            delivered: { class: 'badge-success', label: 'Delivered' },
            cancelled: { class: 'badge-error', label: 'Cancelled' }
        }
        const badge = badges[status] || badges.pending
        return <span className={`badge ${badge.class}`}>{badge.label}</span>
    }

    const isActionDisabled = (status) => {
        // Enable actions only when riderStatus is 'pending' or 'accepted'
        return !['pending', 'accepted'].includes(status)
    }

    const columns = [
        {
            header: 'Order ID',
            accessor: 'orderId',
            render: (order) => (
                <div>
                    <div className="font-bold text-base-content">{order.orderId}</div>
                    <div className="text-xs text-base-content/60">
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
                    <div className="text-xs text-base-content/60">
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
                    <div className="font-semibold text-base-content">
                        {order.shippingAddress?.city}
                    </div>
                    <div className="text-xs text-base-content/60">
                        {order.shippingAddress?.district}
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
            header: 'Fee',
            accessor: 'deliveryFee',
            render: (order) => (
                <div className="font-semibold text-success">
                    ${order.deliveryFee || '50.00'}
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

                    <button
                        onClick={() => handleAcceptDelivery(order.orderId)}
                        className="btn btn-sm btn-success btn-outline"
                        title="Accept Delivery"
                        disabled={isActionDisabled(order.riderStatus) || actionLoading}
                    >
                        <CheckCircle className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => handleRejectDelivery(order.orderId)}
                        className="btn btn-sm btn-error btn-outline"
                        title="Reject Delivery"
                        disabled={isActionDisabled(order.riderStatus) || actionLoading}
                    >
                        <XCircle className="w-4 h-4" />
                    </button>
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
                    You have {orders.length} task(s) assigned to you
                </p>
            </motion.div>

            {/* Filter Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 overflow-x-auto pb-2"
            >
                {[
                    { value: 'all', label: 'All Tasks' },
                    { value: 'assigned', label: 'Assigned' },
                    { value: 'accepted', label: 'Accepted' },
                    { value: 'picked_up', label: 'Picked Up' },
                    { value: 'in_transit', label: 'In Transit' },
                    { value: 'delivered', label: 'Delivered' }
                ].map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => setFilter(tab.value)}
                        className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${filter === tab.value
                            ? 'bg-linear-to-r from-primary to-secondary text-primary-content'
                            : 'bg-base-200 text-base-content hover:bg-base-300'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
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
                            <div className="sticky top-0 bg-linear-to-r from-primary to-secondary p-6 flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-primary-content">
                                    Order Details
                                </h2>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="btn btn-circle btn-sm btn-ghost text-primary-content"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-4 space-y-4">
                                {/* Order ID and Status */}
                                <div className="flex justify-between items-start border-b border-base-300 pb-3">
                                    <div>
                                        <h3 className="text-lg font-bold text-base-content">
                                            {selectedOrder.orderId}
                                        </h3>
                                        <p className="text-xs text-base-content/60">
                                            {selectedOrder.trackingId}
                                        </p>
                                    </div>
                                    {getStatusBadge(selectedOrder.riderStatus)}
                                </div>

                                {/* Customer Information */}
                                <div>
                                    <h4 className="font-bold text-base-content mb-2 flex items-center gap-2 text-sm">
                                        <Package className="w-4 h-4 text-primary" />
                                        Customer Information
                                    </h4>
                                    <div className="bg-base-200 p-3 rounded-lg space-y-1 text-sm">
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
                                                className="font-semibold text-primary hover:underline flex items-center gap-1 text-xs"
                                            >
                                                <Phone className="w-3 h-3" />
                                                {selectedOrder.buyerInfo?.phoneNumber || 'N/A'}
                                            </a>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-base-content/70">Email:</span>
                                            <span className="font-semibold text-base-content text-xs">
                                                {selectedOrder.buyerInfo?.email || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Delivery Address */}
                                <div>
                                    <h4 className="font-bold text-base-content mb-2 flex items-center gap-2 text-sm">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        Delivery Address
                                    </h4>
                                    <div className="bg-base-200 p-3 rounded-lg text-sm">
                                        <p className="text-base-content font-semibold">
                                            {selectedOrder.shippingAddress?.street}
                                        </p>
                                        <p className="text-base-content/70 text-xs">
                                            {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.district}
                                        </p>
                                        <p className="text-base-content/70 text-xs">
                                            {selectedOrder.shippingAddress?.division}, {selectedOrder.shippingAddress?.zipCode}
                                        </p>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div>
                                    <h4 className="font-bold text-base-content mb-2 flex items-center gap-2 text-sm">
                                        <Package className="w-4 h-4 text-primary" />
                                        Order Items ({selectedOrder.items?.length || 0})
                                    </h4>
                                    <div className="bg-base-200 p-3 rounded-lg space-y-2">
                                        {selectedOrder.items?.map((item, i) => (
                                            <div key={i} className="flex items-center justify-between border-b border-base-300 pb-2 last:border-0 text-sm">
                                                <div>
                                                    <p className="font-semibold text-base-content text-xs">{item.name}</p>
                                                    <p className="text-xs text-base-content/60">
                                                        Qty: {item.quantity}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-base-content text-xs">
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </p>
                                                    <p className="text-xs text-base-content/60">
                                                        ${item.price.toFixed(2)} each
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div>
                                    <h4 className="font-bold text-base-content mb-2 flex items-center gap-2 text-sm">
                                        <DollarSign className="w-4 h-4 text-primary" />
                                        Order Summary
                                    </h4>
                                    <div className="bg-base-200 p-3 rounded-lg space-y-1 text-sm">
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
                                            <span className="text-base-content/70">Delivery Fee:</span>
                                            <span className="font-semibold text-success">
                                                ${selectedOrder.deliveryFee?.toFixed(2) || '50.00'}
                                            </span>
                                        </div>
                                        <div className="border-t border-base-300 pt-1 mt-1 flex justify-between">
                                            <span className="font-bold text-base-content">Total:</span>
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
                    <div className="text-center py-12">
                        <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-base-content/70 font-semibold">
                            No delivery tasks in this category
                        </p>
                    </div>
                )}
            </motion.div>
        </div>
    )
}
