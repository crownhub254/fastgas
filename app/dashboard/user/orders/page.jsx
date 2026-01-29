'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Package, Truck, CheckCircle, Clock, Eye, X, MapPin, Phone,
    CreditCard, Calendar, ShoppingCart, Mail, MapPinned, Navigation,
    TruckIcon, FileText
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth'
import DataTable from '../../components/DataTable'
import Invoice from '@/components/Invoice'

export default function UserOrders() {
    const [orders, setOrders] = useState([])
    const [filteredOrders, setFilteredOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('all')
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
    const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false)
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
    const { userData } = useFirebaseAuth()

    useEffect(() => {
        if (userData) {
            fetchOrders()
        }
    }, [userData])

    useEffect(() => {
        filterOrders()
    }, [statusFilter, orders])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/orders/user/${userData.uid}`
            )
            const data = await response.json()

            if (data.success) {
                setOrders(data.orders || [])
                setFilteredOrders(data.orders || [])
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error)
            toast.error('Failed to load orders')
        } finally {
            setLoading(false)
        }
    }

    const filterOrders = () => {
        if (statusFilter === 'all') {
            setFilteredOrders(orders)
        } else {
            setFilteredOrders(orders.filter(order => {
                if (statusFilter === 'pending') {
                    return ['processing', 'confirmed', 'assigned'].includes(order.status)
                }
                return order.status === statusFilter
            }))
        }
    }

    const handleViewDetails = (order) => {
        setSelectedOrder(order)
        setIsDetailsModalOpen(true)
    }

    const handleViewTracking = (order) => {
        setSelectedOrder(order)
        setIsTrackingModalOpen(true)
    }

    const handleViewInvoice = (order) => {
        setSelectedOrder(order)
        setIsInvoiceModalOpen(true)
    }

    const getStatusBadge = (status) => {
        const badges = {
            processing: {
                class: 'bg-info/10 text-info border-info/20',
                text: 'Processing'
            },

            confirmed: {
                class: 'bg-primary/10 text-primary border-primary/20',
                text: 'Confirmed'
            },

            assigned: {
                class: 'bg-secondary/10 text-secondary border-secondary/20',
                text: 'Assigned'
            },

            collected: {
                class: 'bg-accent/10 text-accent border-accent/20',
                text: 'Collected'
            },

            in_transit: {
                class: 'bg-info/10 text-info border-info/30',
                text: 'In Transit'
            },

            out_for_delivery: {
                class: 'bg-warning/10 text-warning border-warning/20',
                text: 'Out for Delivery'
            },

            shipped: {
                class: 'bg-warning/10 text-warning border-warning/30',
                text: 'Shipped'
            },

            delivered: {
                class: 'bg-success/10 text-success border-success/20',
                text: 'Delivered'
            },

            cancelled: {
                class: 'bg-error/10 text-error border-error/20',
                text: 'Cancelled'
            }
        }

        return badges[status] || { class: 'bg-base-300 text-base-content border-base-300', text: status }
    }

    const getPaymentStatusBadge = (status) => {
        const badges = {
            completed: { class: 'bg-green-500/10 text-green-600 border-green-500/20', text: 'Paid' },
            pending: { class: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', text: 'Pending' },
            failed: { class: 'bg-red-500/10 text-red-600 border-red-500/20', text: 'Failed' }
        }
        return badges[status] || { class: 'bg-base-300 text-base-content border-base-300', text: status }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'processing':
            case 'confirmed':
            case 'assigned':
                return <Clock className="w-4 h-4" />
            case 'shipped':
            case 'in_transit':
            case 'out_for_delivery':
                return <Truck className="w-4 h-4" />
            case 'delivered':
                return <CheckCircle className="w-4 h-4" />
            default:
                return <Package className="w-4 h-4" />
        }
    }

    const getTimelineSteps = (order) => {
        const allSteps = [
            { status: 'processing', label: 'Order Placed', icon: ShoppingCart },
            { status: 'confirmed', label: 'Confirmed', icon: CheckCircle },
            { status: 'assigned', label: 'Assigned to Rider', icon: TruckIcon },
            { status: 'shipped', label: 'Shipped', icon: Package },
            { status: 'in_transit', label: 'In Transit', icon: Truck },
            { status: 'out_for_delivery', label: 'Out for Delivery', icon: Navigation },
            { status: 'delivered', label: 'Delivered', icon: CheckCircle }
        ]

        const currentStatusIndex = allSteps.findIndex(step => step.status === order.status)

        return allSteps.map((step, index) => ({
            ...step,
            completed: index <= currentStatusIndex,
            current: index === currentStatusIndex
        }))
    }

    const statusFilters = [
        { value: 'all', label: 'All Orders', count: orders.length },
        {
            value: 'pending',
            label: 'Pending',
            count: orders.filter(o => ['processing', 'confirmed', 'assigned'].includes(o.status)).length
        },
        { value: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
        { value: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length }
    ]

    const columns = [
        {
            header: 'Order ID',
            accessor: 'orderId',
            render: (order) => (
                <div>
                    <div className="font-bold text-base-content font-mono">#{order.orderId}</div>
                    <div className="text-xs text-base-content/60">
                        {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                </div>
            )
        },
        {
            header: 'Items',
            accessor: 'items',
            render: (order) => (
                <div className="flex items-center gap-2">
                    <div className="avatar-group -space-x-4">
                        {order.items?.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="avatar">
                                <div className="w-8 h-8 rounded-full ring ring-base-100">
                                    {item.image && (
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            width={32}
                                            height={32}
                                            className="object-cover"
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div>
                        <div className="font-semibold text-base-content">{order.items?.length || 0} item(s)</div>
                        <div className="text-xs text-base-content/60 max-w-37.5 truncate">
                            {order.items?.[0]?.name}
                        </div>
                    </div>
                </div>
            )
        },
        {
            header: 'Total',
            accessor: 'total',
            render: (order) => (
                <div className="font-bold text-primary text-lg">
                    ${order.total?.toFixed(2) || '0.00'}
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (order) => {
                const statusBadge = getStatusBadge(order.status)
                return (
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold border-2 flex items-center gap-2 w-fit ${statusBadge.class}`}>
                        {getStatusIcon(order.status)}
                        {statusBadge.text}
                    </span>
                )
            }
        },
        {
            header: 'Payment',
            accessor: 'paymentStatus',
            render: (order) => {
                const paymentBadge = getPaymentStatusBadge(order.paymentStatus)
                return (
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold border-2 flex items-center gap-2 w-fit ${paymentBadge.class}`}>
                        <CreditCard className="w-3 h-3" />
                        {paymentBadge.text}
                    </span>
                )
            }
        },
        {
            header: 'Address',
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
            header: 'Actions',
            accessor: 'actions',
            render: (order) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleViewDetails(order)}
                        className="btn btn-sm btn-square btn-info btn-outline"
                        title="View Details"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleViewTracking(order)}
                        className="btn btn-sm btn-square btn-success btn-outline"
                        title="Track Order"
                    >
                        <Truck className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleViewInvoice(order)}
                        className="btn btn-sm btn-square btn-accent/10 btn-outline"
                        title="View Invoice"
                    >
                        <FileText className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ]

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-base-content/70 text-lg">Loading your orders...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2">My Orders</h1>
                <p className="text-base-content/70">Track and manage your orders</p>
            </div>

            {/* Status Filters */}
            <div className="flex gap-3 overflow-x-auto pb-2">
                {statusFilters.map((filter) => (
                    <button
                        key={filter.value}
                        onClick={() => setStatusFilter(filter.value)}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap ${statusFilter === filter.value
                                ? 'bg-primary text-primary-content shadow-lg'
                                : 'bg-base-200 text-base-content hover:bg-base-300'
                            }`}
                    >
                        {filter.label} ({filter.count})
                    </button>
                ))}
            </div>

            {/* Orders Table */}
            {filteredOrders.length > 0 ? (
                <DataTable
                    columns={columns}
                    data={filteredOrders}
                    itemsPerPage={10}
                    emptyMessage="No orders found"
                    EmptyIcon={Package}
                />
            ) : (
                <div className="text-center py-12 bg-base-200 rounded-xl">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-base-content/70 font-semibold">
                        {statusFilter !== 'all'
                            ? `No ${statusFilter} orders found`
                            : 'No orders yet'}
                    </p>
                    {statusFilter === 'all' && (
                        <Link href="/products" className="btn btn-primary mt-4">
                            Start Shopping
                        </Link>
                    )}
                </div>
            )}

            {/* Order Details Modal */}
            <AnimatePresence>
                {isDetailsModalOpen && selectedOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setIsDetailsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-base-100 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="bg-base-200 p-4 flex items-center justify-between border-b border-base-300">
                                <div>
                                    <h2 className="text-xl font-bold text-base-content">Order Details</h2>
                                    <p className="text-base-content/60 text-sm font-mono">#{selectedOrder.orderId}</p>
                                </div>
                                <button
                                    onClick={() => setIsDetailsModalOpen(false)}
                                    className="btn btn-sm btn-square btn-ghost"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-4 space-y-4 overflow-y-auto flex-1">
                                {/* Order Status */}
                                <div className="card bg-base-200 p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold text-sm flex items-center gap-2">
                                            <Package className="w-4 h-4 text-primary" />
                                            Order Status
                                        </h3>
                                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold border-2 ${getStatusBadge(selectedOrder.status).class}`}>
                                            {getStatusBadge(selectedOrder.status).text}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <span className="text-base-content/60">Payment:</span>
                                            <span className={`ml-2 px-3 py-1 rounded-lg text-xs font-semibold border-2 ${getPaymentStatusBadge(selectedOrder.paymentStatus).class
                                                }`}>
                                                {getPaymentStatusBadge(selectedOrder.paymentStatus).text}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-base-content/60">Tracking ID:</span>
                                            <span className="ml-2 font-mono font-semibold">{selectedOrder.trackingId}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                {selectedOrder.shippingAddress && (
                                    <div className="card bg-base-200 p-3">
                                        <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-primary" />
                                            Shipping Address
                                        </h3>
                                        <div className="text-xs space-y-0.5">
                                            <p>{selectedOrder.shippingAddress.street}</p>
                                            <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.district}</p>
                                            <p>{selectedOrder.shippingAddress.division} - {selectedOrder.shippingAddress.zipCode}</p>
                                            <p>{selectedOrder.shippingAddress.country}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Order Items */}
                                <div className="card bg-base-200 p-3">
                                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                        <ShoppingCart className="w-4 h-4 text-primary" />
                                        Order Items ({selectedOrder.items?.length || 0})
                                    </h3>
                                    <div className="space-y-2">
                                        {selectedOrder.items?.map((item, index) => (
                                            <div key={index} className="flex gap-2 bg-base-100 p-2 rounded-lg">
                                                {item.image && (
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        width={48}
                                                        height={48}
                                                        className="object-cover rounded-lg"
                                                    />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                                                    <div className="text-xs text-base-content/60">
                                                        Qty: {item.quantity} × ${item.price?.toFixed(2)}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-sm text-success">
                                                        ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Rider Information */}
                                {selectedOrder.riderInfo?.name && (
                                    <div className="card bg-base-200 p-3">
                                        <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                            <Truck className="w-4 h-4 text-primary" />
                                            Delivery Rider
                                        </h3>
                                        <div className="space-y-1 text-xs">
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
                                <div className="card bg-base-200 p-3">
                                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-primary" />
                                        Order Summary
                                    </h3>
                                    <div className="space-y-1 text-xs">
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
                                        <div className="divider my-1"></div>
                                        <div className="flex justify-between text-sm">
                                            <span className="font-bold">Total:</span>
                                            <span className="font-bold text-success">${selectedOrder.total?.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="card bg-base-200 p-3">
                                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        Timeline
                                    </h3>
                                    <div className="space-y-1 text-xs">
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
                            <div className="p-3 bg-base-200 border-t border-base-300 flex gap-2">
                                <button
                                    onClick={() => {
                                        setIsDetailsModalOpen(false)
                                        handleViewTracking(selectedOrder)
                                    }}
                                    className="btn btn-accent btn-sm flex-1"
                                    title="Track Order"
                                >
                                    <Truck className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        setIsDetailsModalOpen(false)
                                        handleViewInvoice(selectedOrder)
                                    }}
                                    className="btn btn-success btn-sm"
                                    title="View Invoice"
                                >
                                    <FileText className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Track Order Modal */}
            <AnimatePresence>
                {isTrackingModalOpen && selectedOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setIsTrackingModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-base-100 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="bg-base-200 p-4 flex items-center justify-between border-b border-base-300">
                                <div>
                                    <h2 className="text-xl font-bold text-base-content">Track Order</h2>
                                    <p className="text-base-content/60 text-sm font-mono">Tracking: {selectedOrder.trackingId}</p>
                                </div>
                                <button
                                    onClick={() => setIsTrackingModalOpen(false)}
                                    className="btn btn-sm btn-square btn-ghost"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-4 space-y-4 overflow-y-auto flex-1">
                                {/* Order Info Banner */}
                                <div className="bg-primary/10 border-2 border-primary/20 rounded-xl p-3">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                                        <div>
                                            <div className="text-xs text-base-content/60 mb-1">Order ID</div>
                                            <div className="font-bold text-xs">#{selectedOrder.orderId}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-base-content/60 mb-1">Status</div>
                                            <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold border-2 ${getStatusBadge(selectedOrder.status).class}`}>
                                                {getStatusBadge(selectedOrder.status).text}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="text-xs text-base-content/60 mb-1">Items</div>
                                            <div className="font-bold text-xs">{selectedOrder.items?.length || 0}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-base-content/60 mb-1">Total</div>
                                            <div className="font-bold text-xs text-success">${selectedOrder.total?.toFixed(2)}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="space-y-3">
                                    <h3 className="font-bold text-sm flex items-center gap-2">
                                        <MapPinned className="w-4 h-4 text-primary" />
                                        Delivery Progress
                                    </h3>

                                    <div className="relative">
                                        {getTimelineSteps(selectedOrder).map((step, index) => (
                                            <div key={step.status} className="flex gap-3 pb-6 last:pb-0">
                                                {/* Timeline Line */}
                                                {index < getTimelineSteps(selectedOrder).length - 1 && (
                                                    <div className={`absolute left-5 top-10 w-0.5 h-full ${step.completed ? 'bg-success' : 'bg-base-300'
                                                        }`} />
                                                )}

                                                {/* Icon */}
                                                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${step.current
                                                        ? 'bg-primary text-primary-content ring-4 ring-primary/20'
                                                        : step.completed
                                                            ? 'bg-success text-success-content'
                                                            : 'bg-base-300 text-base-content/40'
                                                    }`}>
                                                    <step.icon className="w-5 h-5" />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 pt-1">
                                                    <div className={`font-bold text-sm ${step.current ? 'text-primary' : step.completed ? 'text-success' : 'text-base-content/40'
                                                        }`}>
                                                        {step.label}
                                                    </div>
                                                    {step.completed && (
                                                        <div className="text-xs text-base-content/60 mt-0.5">
                                                            <Clock className="w-3 h-3 inline mr-1" />
                                                            {new Date(selectedOrder.createdAt).toLocaleString()}
                                                        </div>
                                                    )}
                                                    {step.current && (
                                                        <div className="text-xs text-primary mt-0.5">
                                                            Current Status
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Rider Info */}
                                {selectedOrder.riderInfo?.name && (
                                    <div className="card bg-base-200 p-3">
                                        <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                            <Truck className="w-4 h-4 text-primary" />
                                            Delivery Rider
                                        </h3>
                                        <div className="flex items-center gap-3">
                                            <div className="avatar placeholder">
                                                <div className="bg-primary text-primary-content rounded-full w-10">
                                                    <span className="text-lg">{selectedOrder.riderInfo.name.charAt(0)}</span>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-sm">{selectedOrder.riderInfo.name}</div>
                                                <div className="text-xs text-base-content/60">
                                                    <Phone className="w-3 h-3 inline mr-1" />
                                                    {selectedOrder.riderInfo.phone}
                                                </div>
                                                <div className="text-xs text-base-content/60">
                                                    {selectedOrder.riderInfo.vehicleType} - {selectedOrder.riderInfo.vehicleNumber}
                                                </div>
                                            </div>
                                            {selectedOrder.riderInfo.rating && (
                                                <div className="text-center">
                                                    <div className="text-xl font-bold text-warning">★ {selectedOrder.riderInfo.rating}</div>
                                                    <div className="text-xs text-base-content/60">Rating</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Delivery Address */}
                                {selectedOrder.shippingAddress && (
                                    <div className="card bg-base-200 p-3">
                                        <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-primary" />
                                            Delivery Address
                                        </h3>
                                        <div className="text-xs space-y-0.5">
                                            <p className="font-semibold">{selectedOrder.buyerInfo?.name}</p>
                                            <p>{selectedOrder.shippingAddress.street}</p>
                                            <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.district}</p>
                                            <p>{selectedOrder.shippingAddress.division} - {selectedOrder.shippingAddress.zipCode}</p>
                                            <p>{selectedOrder.shippingAddress.country}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-3 bg-base-200 border-t border-base-300 flex gap-2">
                                <button
                                    onClick={() => {
                                        setIsTrackingModalOpen(false)
                                        handleViewDetails(selectedOrder)
                                    }}
                                    className="btn btn-info btn-sm flex-1"
                                    title="View Details"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        setIsTrackingModalOpen(false)
                                        handleViewInvoice(selectedOrder)
                                    }}
                                    className="btn btn-success btn-sm"
                                    title="View Invoice"
                                >
                                    <FileText className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Invoice Modal */}
            <AnimatePresence>
                {isInvoiceModalOpen && selectedOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setIsInvoiceModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-base-100 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-base-content">Invoice</h2>
                                <button
                                    onClick={() => setIsInvoiceModalOpen(false)}
                                    className="p-2 hover:bg-base-200 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <Invoice order={selectedOrder} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
