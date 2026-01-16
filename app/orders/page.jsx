// app/orders/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Truck, CheckCircle, XCircle, Eye, MapPin, Calendar, CreditCard, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Invoice from '@/components/Invoice'
import { getCurrentUser } from '@/lib/firebase/auth'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function OrdersPage() {
    const router = useRouter()
    const [orders, setOrders] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedStatus, setSelectedStatus] = useState('all')
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [user, setUser] = useState(null)

    useEffect(() => {
        const currentUser = getCurrentUser()
        if (!currentUser) {
            toast.error('Please login to view your orders')
            router.push('/login')
            return
        }
        setUser(currentUser)
        fetchOrders(currentUser.uid)
    }, [router])

    const fetchOrders = async (userId) => {
        try {
            setIsLoading(true)
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/orders/user/${userId}`
            )
            const data = await response.json()

            if (data.success) {
                // Format orders for display
                const formattedOrders = data.orders.map(order => ({
                    ...order,
                    id: order.orderId,
                    date: new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })
                }))
                setOrders(formattedOrders)
            } else {
                toast.error('Failed to load orders')
                setOrders([])
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
            toast.error('Failed to load orders')
            setOrders([])
        } finally {
            setIsLoading(false)
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
            case 'processing':
                return 'bg-warning/10 text-warning border-warning/20'
            case 'confirmed':
                return 'bg-info/10 text-info border-info/20'
            case 'shipped':
                return 'bg-primary/10 text-primary border-primary/20'
            case 'delivered':
                return 'bg-success/10 text-success border-success/20'
            case 'cancelled':
                return 'bg-error/10 text-error border-error/20'
            default:
                return 'bg-base-300 text-base-content border-base-300'
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
            case 'processing':
                return <Package className="w-5 h-5" />
            case 'confirmed':
                return <CheckCircle className="w-5 h-5" />
            case 'shipped':
                return <Truck className="w-5 h-5" />
            case 'delivered':
                return <CheckCircle className="w-5 h-5" />
            case 'cancelled':
                return <XCircle className="w-5 h-5" />
            default:
                return <Package className="w-5 h-5" />
        }
    }

    const filteredOrders = selectedStatus === 'all'
        ? orders
        : orders.filter(order => order.status === selectedStatus)

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
    }

    const statusFilters = [
        { value: 'all', label: 'All Orders', count: orders.length },
        { value: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'processing').length },
        { value: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length },
        { value: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
        { value: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
    ]

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-base-content/70 text-lg">Loading your orders...</p>
                </div>
            </div>
        )
    }

    if (orders.length === 0) {
        return (
            <div className="min-h-screen">
                <div className="section-padding">
                    <div className="container-custom">
                        <motion.div {...fadeInUp} className="text-center max-w-md mx-auto">
                            <div className="w-32 h-32 mx-auto mb-6 bg-base-200 rounded-full flex items-center justify-center">
                                <Package className="w-16 h-16 text-base-content/30" />
                            </div>
                            <h1 className="text-4xl font-bold text-base-content mb-4">No Orders Yet</h1>
                            <p className="text-base-content/70 mb-8 text-lg">
                                You haven&apos;t placed any orders yet. Start shopping to see your orders here!
                            </p>
                            <Link
                                href="/products"
                                className="inline-flex items-center gap-2 bg-linear-to-r from-primary to-secondary text-primary-content px-8 py-4 rounded-lg font-semibold hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg"
                            >
                                Start Shopping
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            <div className="section-padding">
                <div className="container-custom">
                    {/* Header */}
                    <motion.div {...fadeInUp} className="mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-base-content mb-2">
                            My Orders
                        </h1>
                        <p className="text-base-content/70">
                            Track and manage your orders ({orders.length} total)
                        </p>
                    </motion.div>

                    {/* Status Filters */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-8 overflow-x-auto"
                    >
                        <div className="flex gap-3 min-w-max pb-2">
                            {statusFilters.map((filter) => (
                                <button
                                    key={filter.value}
                                    onClick={() => setSelectedStatus(filter.value)}
                                    className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap ${selectedStatus === filter.value
                                        ? 'bg-linear-to-r from-primary to-secondary text-primary-content shadow-lg'
                                        : 'bg-base-200 text-base-content hover:bg-base-300'
                                        }`}
                                >
                                    {filter.label} ({filter.count})
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Orders List */}
                    <div className="space-y-6">
                        {filteredOrders.map((order, index) => (
                            <motion.div
                                key={order._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="card bg-base-200"
                            >
                                {/* Order Header */}
                                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-base-300">
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div>
                                            <div className="text-sm text-base-content/60">Order ID</div>
                                            <div className="font-bold text-base-content">#{order.orderId}</div>
                                        </div>
                                        <div className="h-8 w-px bg-base-300"></div>
                                        <div>
                                            <div className="text-sm text-base-content/60">Date</div>
                                            <div className="font-semibold text-base-content flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                {order.date}
                                            </div>
                                        </div>
                                        <div className="h-8 w-px bg-base-300"></div>
                                        <div>
                                            <div className="text-sm text-base-content/60">Total</div>
                                            <div className="font-bold text-primary text-lg">
                                                ${order.total.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className={`px-4 py-2 rounded-lg font-semibold border-2 flex items-center gap-2 ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                        {order.paymentStatus === 'completed' && (
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/20">
                                                Paid
                                            </span>
                                        )}
                                        {order.paymentStatus === 'pending' && (
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-warning/10 text-warning border border-warning/20">
                                                Payment Pending
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="space-y-4 py-4">
                                    {order.items.map((item) => (
                                        <div key={item._id || item.productId} className="flex gap-4 items-center">
                                            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-base-300 shrink-0">
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-base-content truncate">
                                                    {item.name}
                                                </h3>
                                                <p className="text-sm text-base-content/60">
                                                    Qty: {item.quantity} × ${item.price.toFixed(2)}
                                                </p>
                                            </div>
                                            <div className="font-bold text-base-content">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Shipping Info */}
                                <div className="pt-4 border-t border-base-300">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-5 h-5 text-primary mt-1 shrink-0" />
                                            <div>
                                                <div className="font-semibold text-base-content mb-1">Shipping Address</div>
                                                <div className="text-sm text-base-content/70">
                                                    {order.shippingAddress.street}<br />
                                                    {order.shippingAddress.city}, {order.shippingAddress.district}<br />
                                                    {order.shippingAddress.division} {order.shippingAddress.zipCode}<br />
                                                    {order.shippingAddress.country}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <CreditCard className="w-5 h-5 text-primary mt-1 shrink-0" />
                                            <div>
                                                <div className="font-semibold text-base-content mb-1">Payment Method</div>
                                                <div className="text-sm text-base-content/70">
                                                    {order.paymentMethod}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap gap-3 pt-4 border-t border-base-300">
                                    <button
                                        onClick={() => setSelectedOrder(order)}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-content rounded-lg font-semibold hover:opacity-90 transition-opacity"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View Invoice
                                    </button>
                                    <Link
                                        href={`/orders/${order.orderId}`}
                                        className="flex items-center gap-2 px-4 py-2 bg-base-100 text-base-content rounded-lg font-semibold hover:bg-base-300 transition-all duration-200 border-2 border-base-300"
                                    >
                                        View Details
                                    </Link>
                                    {order.status === 'delivered' && (
                                        <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-content rounded-lg font-semibold hover:opacity-90 transition-opacity">
                                            Reorder
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {filteredOrders.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12"
                        >
                            <Package className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
                            <p className="text-base-content/70 text-lg">
                                No {selectedStatus !== 'all' ? selectedStatus : ''} orders found
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Invoice Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedOrder(null)}
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
                                    onClick={() => setSelectedOrder(null)}
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
