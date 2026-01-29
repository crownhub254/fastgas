'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Eye, MapPin, Trash2, X, Package, Truck, CheckCircle, Clock, AlertCircle, Calendar, CreditCard } from 'lucide-react'
import DataTable from '@/app/dashboard/components/DataTable'
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function SellerOrdersPage() {
    const { user, userData } = useFirebaseAuth()
    const [orders, setOrders] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('all')
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [trackingOrder, setTrackingOrder] = useState(null)
    const [deleteOrder, setDeleteOrder] = useState(null)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        if (user && userData) {
            fetchOrders()
        }
    }, [user, userData])

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`)
            const data = await response.json()

            if (data.success) {
                setOrders(data.orders || [])
            } else {
                toast.error('Failed to fetch orders')
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
            toast.error('Failed to load orders')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteOrder = async () => {
        if (!deleteOrder) return

        setIsDeleting(true)
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/orders/${deleteOrder.orderId}`,
                {
                    method: 'DELETE'
                }
            )

            const data = await response.json()

            if (data.success) {
                toast.success('Order deleted successfully')
                setOrders(orders.filter(o => o.orderId !== deleteOrder.orderId))
                setDeleteOrder(null)
            } else {
                toast.error(data.error || 'Failed to delete order')
            }
        } catch (error) {
            console.error('Error deleting order:', error)
            toast.error('Failed to delete order')
        } finally {
            setIsDeleting(false)
        }
    }

    const getStatusBadge = (status) => {
        const badges = {
            processing: { class: 'badge-info', text: 'Processing' },
            confirmed: { class: 'badge-primary', text: 'Confirmed' },
            assigned: { class: 'badge-warning', text: 'Assigned' },
            collected: { class: 'badge-info', text: 'Collected' },
            in_transit: { class: 'badge-primary', text: 'In Transit' },
            out_for_delivery: { class: 'badge-secondary', text: 'Out for Delivery' },
            delivered: { class: 'badge-success', text: 'Delivered' },
            cancelled: { class: 'badge-error', text: 'Cancelled' }
        }
        return badges[status] || { class: 'badge-ghost', text: status }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'processing':
                return <Clock className="w-5 h-5" />
            case 'confirmed':
            case 'assigned':
            case 'collected':
                return <Package className="w-5 h-5" />
            case 'in_transit':
            case 'out_for_delivery':
                return <Truck className="w-5 h-5" />
            case 'delivered':
                return <CheckCircle className="w-5 h-5" />
            case 'cancelled':
                return <AlertCircle className="w-5 h-5" />
            default:
                return <Package className="w-5 h-5" />
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'processing':
                return 'bg-info/10 text-info border-info/20'
            case 'confirmed':
            case 'assigned':
                return 'bg-warning/10 text-warning border-warning/20'
            case 'collected':
            case 'in_transit':
                return 'bg-primary/10 text-primary border-primary/20'
            case 'out_for_delivery':
                return 'bg-secondary/10 text-secondary border-secondary/20'
            case 'delivered':
                return 'bg-success/10 text-success border-success/20'
            case 'cancelled':
                return 'bg-error/10 text-error border-error/20'
            default:
                return 'bg-base-300 text-base-content border-base-300'
        }
    }

    const columns = [
        {
            header: 'Order ID',
            accessor: 'orderId',
            render: (row) => (
                <div className="font-mono text-sm font-semibold text-primary">
                    #{row.orderId}
                </div>
            )
        },
        {
            header: 'Customer',
            accessor: 'buyerInfo',
            render: (row) => (
                <div>
                    <div className="font-semibold">{row.buyerInfo?.name || 'N/A'}</div>
                    <div className="text-xs text-base-content/60">{row.buyerInfo?.phoneNumber}</div>
                </div>
            )
        },
        {
            header: 'Items',
            accessor: 'items',
            render: (row) => (
                <div className="text-sm">
                    {row.items?.length || 0} item(s)
                </div>
            )
        },
        {
            header: 'Amount',
            accessor: 'total',
            render: (row) => (
                <div className="font-bold text-success">
                    ${row.total?.toFixed(2)}
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => {
                const badge = getStatusBadge(row.status)
                return <span className={`badge ${badge.class}`}>{badge.text}</span>
            }
        },
        {
            header: 'Rider',
            accessor: 'riderInfo',
            render: (row) => (
                <div className="text-sm">
                    {row.riderInfo?.name || (
                        <span className="text-base-content/40">Not assigned</span>
                    )}
                </div>
            )
        },
        {
            header: 'Date',
            accessor: 'createdAt',
            render: (row) => (
                <div className="text-sm">
                    {new Date(row.createdAt).toLocaleDateString()}
                </div>
            )
        },
        {
            header: 'Actions',
            accessor: 'actions',
            render: (row) => (
                <div className="flex gap-2">
                    {/* Details Button */}
                    <button
                        onClick={() => setSelectedOrder(row)}
                        className="btn btn-sm btn-square btn-ghost hover:btn-primary"
                        title="View Details"
                    >
                        <Eye className="w-4 h-4" />
                    </button>

                    {/* Track Order Button */}
                    <button
                        onClick={() => setTrackingOrder(row)}
                        className="btn btn-sm btn-square btn-ghost hover:btn-info"
                        title="Track Order"
                    >
                        <MapPin className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                        onClick={() => setDeleteOrder(row)}
                        className="btn btn-sm btn-square btn-ghost hover:btn-error"
                        title="Delete Order"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ]

    const filteredOrders = orders.filter(order => {
        if (statusFilter === 'all') return true
        return order.status === statusFilter
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
                        <ShoppingCart className="w-8 h-8 text-primary" />
                        My Orders
                    </h1>
                    <p className="text-base-content/60 mt-1">
                        View and manage orders for your products
                    </p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="btn btn-primary"
                >
                    Refresh Orders
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-3 overflow-x-auto pb-2">
                {[
                    { value: 'all', label: 'All Orders' },
                    { value: 'processing', label: 'Processing' },
                    { value: 'confirmed', label: 'Confirmed' },
                    { value: 'assigned', label: 'Assigned' },
                    { value: 'delivered', label: 'Delivered' }
                ].map((filter) => (
                    <button
                        key={filter.value}
                        onClick={() => setStatusFilter(filter.value)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${statusFilter === filter.value
                            ? 'bg-gradient-to-r from-primary to-secondary text-primary-content shadow-lg'
                            : 'bg-base-200 text-base-content hover:bg-base-300'
                            }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Orders Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card bg-base-100 shadow-xl"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-base-content/70">Loading orders...</p>
                        </div>
                    </div>
                ) : (
                    <DataTable
                        data={filteredOrders}
                        columns={columns}
                        itemsPerPage={10}
                        emptyMessage="No orders found"
                        EmptyIcon={ShoppingCart}
                    />
                )}
            </motion.div>

            {/* Details Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedOrder(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-base-100 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="bg-base-200 p-6 flex items-center justify-between border-b border-base-300">
                                <div>
                                    <h2 className="text-2xl font-bold text-base-content">Order Details</h2>
                                    <p className="text-base-content/60 font-mono text-sm">#{selectedOrder.orderId}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="btn btn-sm btn-ghost"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 space-y-6 overflow-y-auto flex-1">
                                {/* Order Status */}
                                <div className="card bg-base-200 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <Package className="w-5 h-5 text-primary" />
                                            Order Status
                                        </h3>
                                        <span className={`badge ${getStatusBadge(selectedOrder.status).class} badge-lg`}>
                                            {getStatusBadge(selectedOrder.status).text}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-base-content/60">Payment:</span>
                                            <span className={`ml-2 badge ${selectedOrder.paymentStatus === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                                                {selectedOrder.paymentStatus}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-base-content/60">Tracking ID:</span>
                                            <span className="ml-2 font-mono font-semibold">{selectedOrder.trackingId}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Information */}
                                <div className="card bg-base-200 p-4">
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <Package className="w-5 h-5 text-primary" />
                                        Customer Information
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-start gap-2">
                                            <span className="text-base-content/60 w-24">Name:</span>
                                            <span className="font-semibold">{selectedOrder.buyerInfo?.name || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-base-content/60 w-24">Email:</span>
                                            <span>{selectedOrder.buyerInfo?.email || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-base-content/60 w-24">Phone:</span>
                                            <span>{selectedOrder.buyerInfo?.phoneNumber || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                {selectedOrder.shippingAddress && (
                                    <div className="card bg-base-200 p-4">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-primary" />
                                            Shipping Address
                                        </h3>
                                        <div className="text-sm space-y-1">
                                            <p>{selectedOrder.shippingAddress.street}</p>
                                            <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.district}</p>
                                            <p>{selectedOrder.shippingAddress.division} - {selectedOrder.shippingAddress.zipCode}</p>
                                            <p>{selectedOrder.shippingAddress.country}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Order Items */}
                                <div className="card bg-base-200 p-4">
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <ShoppingCart className="w-5 h-5 text-primary" />
                                        Order Items ({selectedOrder.items?.length || 0})
                                    </h3>
                                    <div className="space-y-3">
                                        {selectedOrder.items?.map((item, index) => (
                                            <div key={index} className="flex gap-3 bg-base-100 p-3 rounded-lg">
                                                {item.image && (
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        width={64}
                                                        height={64}
                                                        className="w-16 h-16 object-cover rounded-lg"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <h4 className="font-semibold">{item.name}</h4>
                                                    <div className="text-sm text-base-content/60 mt-1">
                                                        Quantity: {item.quantity} × ${item.price?.toFixed(2)}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-success">
                                                        ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Rider Information */}
                                {selectedOrder.riderInfo?.name && (
                                    <div className="card bg-base-200 p-4">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <Truck className="w-5 h-5 text-primary" />
                                            Rider Information
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-start gap-2">
                                                <span className="text-base-content/60 w-24">Name:</span>
                                                <span className="font-semibold">{selectedOrder.riderInfo.name}</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="text-base-content/60 w-24">Phone:</span>
                                                <span>{selectedOrder.riderInfo.phone}</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="text-base-content/60 w-24">Vehicle:</span>
                                                <span>{selectedOrder.riderInfo.vehicleType} - {selectedOrder.riderInfo.vehicleNumber}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Order Summary */}
                                <div className="card bg-base-200 p-4">
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-primary" />
                                        Order Summary
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-base-content/60">Subtotal:</span>
                                            <span className="font-semibold">${selectedOrder.subtotal?.toFixed(2) || '0.00'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-base-content/60">Shipping:</span>
                                            <span className="font-semibold">${selectedOrder.shipping?.toFixed(2) || '0.00'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-base-content/60">Tax:</span>
                                            <span className="font-semibold">${selectedOrder.tax?.toFixed(2) || '0.00'}</span>
                                        </div>
                                        <div className="divider my-2"></div>
                                        <div className="flex justify-between text-lg">
                                            <span className="font-bold">Total:</span>
                                            <span className="font-bold text-success">${selectedOrder.total?.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="card bg-base-200 p-4">
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-primary" />
                                        Timeline
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-base-content/60">Order Placed:</span>
                                            <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                                        </div>
                                        {selectedOrder.updatedAt && (
                                            <div className="flex justify-between">
                                                <span className="text-base-content/60">Last Updated:</span>
                                                <span>{new Date(selectedOrder.updatedAt).toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 bg-base-200 border-t border-base-300 flex gap-3">
                                <button
                                    onClick={() => {
                                        setSelectedOrder(null)
                                        setTrackingOrder(selectedOrder)
                                    }}
                                    className="btn btn-primary flex-1"
                                >
                                    <Truck className="w-4 h-4 mr-2" />
                                    Track Order
                                </button>
                                <button
                                    onClick={() => {
                                        setDeleteOrder(selectedOrder)
                                        setSelectedOrder(null)
                                    }}
                                    className="btn btn-error"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Track Order Modal */}
            <AnimatePresence>
                {trackingOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setTrackingOrder(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-base-100 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="bg-base-200 p-6 flex items-center justify-between border-b border-base-300">
                                <div>
                                    <h2 className="text-2xl font-bold text-base-content">Track Order</h2>
                                    <p className="text-base-content/60 font-mono text-sm">Tracking ID: {trackingOrder.trackingId}</p>
                                </div>
                                <button
                                    onClick={() => setTrackingOrder(null)}
                                    className="btn btn-sm btn-ghost"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 space-y-6 overflow-y-auto flex-1">
                                {/* Order Info Banner */}
                                <div className="bg-linear-to-r from-primary/10 to-secondary/10 border-2 border-primary/20 rounded-xl p-4">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                        <div>
                                            <div className="text-xs text-base-content/60 mb-1">Order ID</div>
                                            <div className="font-bold text-sm">#{trackingOrder.orderId}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-base-content/60 mb-1">Status</div>
                                            <span className={`badge ${getStatusBadge(trackingOrder.status).class}`}>
                                                {getStatusBadge(trackingOrder.status).text}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="text-xs text-base-content/60 mb-1">Items</div>
                                            <div className="font-bold text-sm">{trackingOrder.items?.length || 0}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-base-content/60 mb-1">Total</div>
                                            <div className="font-bold text-sm text-success">${trackingOrder.total?.toFixed(2)}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="space-y-4">
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-primary" />
                                        Delivery Progress
                                    </h3>

                                    {trackingOrder.timeline && trackingOrder.timeline.length > 0 ? (
                                        <div className="relative">
                                            {trackingOrder.timeline.map((event, index) => {
                                                const isCompleted = index < trackingOrder.timeline.length - 1 || trackingOrder.status === 'delivered'
                                                const isCurrent = index === trackingOrder.timeline.length - 1 && trackingOrder.status !== 'delivered'

                                                return (
                                                    <div key={index} className="flex gap-4 pb-8 last:pb-0">
                                                        {/* Timeline Line */}
                                                        {index < trackingOrder.timeline.length - 1 && (
                                                            <div className={`absolute left-6 w-0.5 h-full ${isCompleted ? 'bg-success' : 'bg-base-300'}`}
                                                                style={{ top: `${(index * 128) + 48}px` }} />
                                                        )}

                                                        {/* Icon */}
                                                        <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${isCurrent
                                                            ? 'bg-primary text-primary-content ring-4 ring-primary/20'
                                                            : isCompleted
                                                                ? 'bg-success text-success-content'
                                                                : 'bg-base-300 text-base-content/40'
                                                            }`}>
                                                            {getStatusIcon(event.status)}
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1 pt-2">
                                                            <div className={`font-bold capitalize ${isCurrent ? 'text-primary' : isCompleted ? 'text-success' : 'text-base-content/40'}`}>
                                                                {event.status.replace(/_/g, ' ')}
                                                            </div>
                                                            <div className="text-sm text-base-content/60 mt-1">
                                                                <Clock className="w-3 h-3 inline mr-1" />
                                                                {new Date(event.timestamp).toLocaleString()}
                                                            </div>
                                                            {event.note && (
                                                                <div className="text-sm text-base-content/80 mt-1">
                                                                    {event.note}
                                                                </div>
                                                            )}
                                                            {event.location && (
                                                                <div className="text-sm text-base-content/60 flex items-center gap-1 mt-1">
                                                                    <MapPin className="w-3 h-3" />
                                                                    {event.location}
                                                                </div>
                                                            )}
                                                            {isCurrent && (
                                                                <div className="text-sm text-primary font-semibold mt-1">
                                                                    Current Status
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-base-content/60">
                                            <Clock className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                            <p>No tracking information available yet</p>
                                        </div>
                                    )}
                                </div>

                                {/* Rider Info */}
                                {trackingOrder.riderInfo?.name && (
                                    <div className="card bg-base-200 p-4">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <Truck className="w-5 h-5 text-primary" />
                                            Delivery Rider
                                        </h3>
                                        <div className="flex items-center gap-4">
                                            <div className="avatar placeholder">
                                                <div className="bg-primary text-primary-content rounded-full w-12">
                                                    <span className="text-xl">{trackingOrder.riderInfo.name.charAt(0)}</span>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold">{trackingOrder.riderInfo.name}</div>
                                                <div className="text-sm text-base-content/60">
                                                    {trackingOrder.riderInfo.phone}
                                                </div>
                                                <div className="text-sm text-base-content/60">
                                                    {trackingOrder.riderInfo.vehicleType} - {trackingOrder.riderInfo.vehicleNumber}
                                                </div>
                                            </div>
                                            {trackingOrder.riderInfo.rating && (
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-warning">★ {trackingOrder.riderInfo.rating}</div>
                                                    <div className="text-xs text-base-content/60">Rating</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Delivery Address */}
                                {trackingOrder.shippingAddress && (
                                    <div className="card bg-base-200 p-4">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-primary" />
                                            Delivery Address
                                        </h3>
                                        <div className="text-sm space-y-1">
                                            <p className="font-semibold">{trackingOrder.buyerInfo?.name}</p>
                                            <p>{trackingOrder.shippingAddress.street}</p>
                                            <p>{trackingOrder.shippingAddress.city}, {trackingOrder.shippingAddress.district}</p>
                                            <p>{trackingOrder.shippingAddress.division} - {trackingOrder.shippingAddress.zipCode}</p>
                                            <p>{trackingOrder.shippingAddress.country}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 bg-base-200 border-t border-base-300 flex gap-3">
                                <button
                                    onClick={() => {
                                        setTrackingOrder(null)
                                        setSelectedOrder(trackingOrder)
                                    }}
                                    className="btn btn-primary flex-1"
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => !isDeleting && setDeleteOrder(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-base-100 rounded-xl max-w-md w-full p-6"
                        >
                            {/* Icon */}
                            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-error" />
                            </div>

                            {/* Content */}
                            <h2 className="text-2xl font-bold text-center mb-2">Delete Order</h2>
                            <p className="text-center text-base-content/70 mb-6">
                                Are you sure you want to delete order <span className="font-mono font-bold text-error">#{deleteOrder.orderId}</span>?
                                This action cannot be undone.
                            </p>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteOrder(null)}
                                    disabled={isDeleting}
                                    className="btn btn-ghost flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteOrder}
                                    disabled={isDeleting}
                                    className="btn btn-error flex-1"
                                >
                                    {isDeleting ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
