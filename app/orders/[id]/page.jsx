// ============================================
// app/orders/[id]/page.jsx - Fixed Order Details from DB
// ============================================
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Package, Truck, CheckCircle, Clock, MapPin, CreditCard, ArrowLeft, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Invoice from '@/components/Invoice'
import { getCurrentUser } from '@/lib/firebase/auth'
import toast from 'react-hot-toast'

export default function OrderDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const orderId = params.id
    const [order, setOrder] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [expandedSections, setExpandedSections] = useState({
        items: true,
        shipping: true,
        invoice: false
    })

    useEffect(() => {
        const user = getCurrentUser()
        if (!user) {
            toast.error('Please login to view order details')
            router.push('/login')
            return
        }

        if (orderId) {
            fetchOrder()
        }
    }, [orderId, router])

    const fetchOrder = async () => {
        try {
            setIsLoading(true)
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`)
            const data = await response.json()

            if (data.success && data.order) {
                // Format order for display
                const formattedOrder = {
                    ...data.order,
                    id: data.order.orderId,
                    date: new Date(data.order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })
                }
                setOrder(formattedOrder)
            } else {
                toast.error('Order not found')
                router.push('/orders')
            }
        } catch (error) {
            console.error('Error fetching order:', error)
            toast.error('Failed to load order')
            router.push('/orders')
        } finally {
            setIsLoading(false)
        }
    }

    const toggleSection = (section) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section]
        }))
    }

    const getStatusColor = (status) => {
        switch (status) {
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
            case 'processing':
                return <Clock className="w-5 h-5" />
            case 'confirmed':
                return <CheckCircle className="w-5 h-5" />
            case 'shipped':
                return <Truck className="w-5 h-5" />
            case 'delivered':
                return <CheckCircle className="w-5 h-5" />
            case 'cancelled':
                return <AlertCircle className="w-5 h-5" />
            default:
                return <Package className="w-5 h-5" />
        }
    }

    const getDeliveryEstimate = (status) => {
        const today = new Date()
        let deliveryDate = new Date(today)

        switch (status) {
            case 'processing':
                deliveryDate.setDate(deliveryDate.getDate() + 5)
                return { date: deliveryDate.toLocaleDateString(), message: 'Order will ship soon' }
            case 'confirmed':
                deliveryDate.setDate(deliveryDate.getDate() + 4)
                return { date: deliveryDate.toLocaleDateString(), message: 'Payment confirmed, preparing shipment' }
            case 'shipped':
                deliveryDate.setDate(deliveryDate.getDate() + 3)
                return { date: deliveryDate.toLocaleDateString(), message: 'In transit' }
            case 'delivered':
                return { date: 'Delivered', message: 'Order completed' }
            case 'cancelled':
                return { date: 'N/A', message: 'Order cancelled' }
            default:
                deliveryDate.setDate(deliveryDate.getDate() + 5)
                return { date: deliveryDate.toLocaleDateString(), message: 'Estimated delivery' }
        }
    }

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-base-content/70 text-lg">Loading order details...</p>
                </div>
            </div>
        )
    }

    if (!order) return null

    const delivery = getDeliveryEstimate(order.status)

    return (
        <div className="min-h-screen">
            <div className="section-padding">
                <div className="container-custom max-w-6xl">
                    {/* Back Button */}
                    <motion.div {...fadeInUp} className="mb-6">
                        <Link
                            href="/orders"
                            className="inline-flex items-center gap-2 text-base-content/70 hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Orders
                        </Link>
                    </motion.div>

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="card bg-base-200 mb-8"
                    >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-base-content mb-2">
                                    Order #{order.orderId}
                                </h1>
                                <p className="text-base-content/70">
                                    Placed on {order.date}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className={`px-6 py-3 rounded-lg font-semibold border-2 flex items-center gap-2 ${getStatusColor(order.status)}`}>
                                    {getStatusIcon(order.status)}
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                                {order.paymentStatus === 'completed' && (
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/20">
                                        Paid
                                    </span>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Delivery Status Timeline */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="card bg-base-200"
                            >
                                <h2 className="text-2xl font-bold text-base-content mb-6">Delivery Status</h2>

                                <div className="space-y-4">
                                    {[
                                        { status: 'processing', label: 'Order Received', icon: Package },
                                        { status: 'confirmed', label: 'Payment Confirmed', icon: CheckCircle },
                                        { status: 'shipped', label: 'Shipped', icon: Truck },
                                        { status: 'delivered', label: 'Delivered', icon: CheckCircle }
                                    ].map((step, index) => {
                                        const statuses = ['processing', 'confirmed', 'shipped', 'delivered']
                                        const currentIndex = statuses.indexOf(order.status)
                                        const stepIndex = statuses.indexOf(step.status)
                                        const isCompleted = stepIndex <= currentIndex
                                        const isCurrent = step.status === order.status

                                        return (
                                            <div key={step.status}>
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${isCompleted
                                                            ? 'bg-linear-to-r from-primary to-secondary text-primary-content'
                                                            : 'bg-base-300 text-base-content/50'
                                                            } ${isCurrent ? 'ring-4 ring-primary/30' : ''}`}
                                                    >
                                                        <step.icon className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className={`font-semibold ${isCompleted ? 'text-base-content' : 'text-base-content/60'}`}>
                                                            {step.label}
                                                        </h3>
                                                        {isCurrent && (
                                                            <p className="text-sm text-primary font-semibold">
                                                                Expected delivery: {delivery.date}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {isCompleted && (
                                                        <CheckCircle className="w-5 h-5 text-success" />
                                                    )}
                                                </div>
                                                {index < 3 && (
                                                    <div
                                                        className={`ml-6 h-8 w-1 my-2 rounded-full transition-all duration-300 ${isCompleted ? 'bg-linear-to-b from-primary to-secondary' : 'bg-base-300'}`}
                                                    ></div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>

                                {order.status !== 'cancelled' && (
                                    <div className="mt-6 p-4 bg-info/10 border border-info/20 rounded-lg flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-info shrink-0 mt-0.5" />
                                        <div className="text-sm text-base-content/80">
                                            <p className="font-semibold mb-1">{delivery.message}</p>
                                            <p>Track your package in real-time and receive notifications at every step.</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>

                            {/* Order Items */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="card bg-base-200"
                            >
                                <button
                                    onClick={() => toggleSection('items')}
                                    className="w-full flex items-center justify-between mb-6 hover:text-primary transition-colors"
                                >
                                    <h2 className="text-2xl font-bold text-base-content">Order Items</h2>
                                    {expandedSections.items ? (
                                        <ChevronUp className="w-6 h-6" />
                                    ) : (
                                        <ChevronDown className="w-6 h-6" />
                                    )}
                                </button>

                                {expandedSections.items && (
                                    <div className="space-y-4">
                                        {order.items.map((item, idx) => (
                                            <div
                                                key={item._id || idx}
                                                className="flex gap-4 p-4 bg-base-100 rounded-lg hover:shadow-lg transition-all duration-300"
                                            >
                                                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-base-300 shrink-0">
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-base-content truncate">
                                                        {item.name}
                                                    </h3>
                                                    <p className="text-sm text-base-content/60 mt-1">
                                                        Item ID: {item.productId}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
                                                        <div className="text-sm">
                                                            <span className="text-base-content/60">Qty: </span>
                                                            <span className="font-bold text-base-content">{item.quantity}</span>
                                                        </div>
                                                        <div className="text-sm">
                                                            <span className="text-base-content/60">Price: </span>
                                                            <span className="font-bold text-base-content">${item.price.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-primary">
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>

                            {/* Shipping & Payment */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="grid md:grid-cols-2 gap-6"
                            >
                                {/* Shipping Address */}
                                <div className="card bg-base-200">
                                    <button
                                        onClick={() => toggleSection('shipping')}
                                        className="w-full flex items-center justify-between mb-4 hover:text-primary transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-5 h-5 text-primary" />
                                            <h3 className="text-xl font-bold text-base-content">Shipping Address</h3>
                                        </div>
                                        {expandedSections.shipping ? (
                                            <ChevronUp className="w-5 h-5" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5" />
                                        )}
                                    </button>

                                    {expandedSections.shipping && (
                                        <div className="text-base-content/70 space-y-1">
                                            <p className="font-semibold text-base-content">
                                                {order.shippingAddress.street}
                                            </p>
                                            <p>{order.shippingAddress.city}, {order.shippingAddress.district}</p>
                                            <p>{order.shippingAddress.division} {order.shippingAddress.zipCode}</p>
                                            <p>{order.shippingAddress.country}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Payment Method */}
                                <div className="card bg-base-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <CreditCard className="w-5 h-5 text-primary" />
                                        <h3 className="text-xl font-bold text-base-content">Payment</h3>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-base-content/70">
                                            <span className="text-base-content/60">Method: </span>
                                            <span className="font-semibold text-base-content">{order.paymentMethod}</span>
                                        </p>
                                        <p className="text-base-content/70">
                                            <span className="text-base-content/60">Status: </span>
                                            <span className={`font-semibold ${order.paymentStatus === 'completed' ? 'text-success' : 'text-warning'}`}>
                                                {order.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
                                            </span>
                                        </p>
                                        {order.transactionId && (
                                            <p className="text-base-content/70 text-xs mt-2">
                                                <span className="text-base-content/60">Transaction: </span>
                                                <span className="font-mono">{order.transactionId.slice(0, 20)}...</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Invoice Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="card bg-base-200"
                            >
                                <button
                                    onClick={() => toggleSection('invoice')}
                                    className="w-full flex items-center justify-between mb-6 hover:text-primary transition-colors"
                                >
                                    <h2 className="text-2xl font-bold text-base-content">Invoice</h2>
                                    {expandedSections.invoice ? (
                                        <ChevronUp className="w-6 h-6" />
                                    ) : (
                                        <ChevronDown className="w-6 h-6" />
                                    )}
                                </button>

                                {expandedSections.invoice && (
                                    <Invoice order={order} />
                                )}
                            </motion.div>
                        </div>

                        {/* Sidebar - Order Summary */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="lg:col-span-1"
                        >
                            <div className="card bg-base-200 sticky top-24 space-y-6">
                                {/* Order Summary */}
                                <div>
                                    <h3 className="text-xl font-bold text-base-content mb-4">Order Summary</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-base-content/70">
                                            <span>Subtotal</span>
                                            <span className="font-semibold">
                                                ${order.subtotal.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-base-content/70">
                                            <span>Shipping</span>
                                            <span className="font-semibold text-success">
                                                {order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-base-content/70">
                                            <span>Tax</span>
                                            <span className="font-semibold">
                                                ${order.tax.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="border-t border-base-300 pt-3">
                                            <div className="flex justify-between items-baseline">
                                                <span className="font-semibold text-base-content">Total</span>
                                                <span className="text-2xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                                                    ${order.total.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="space-y-3 pt-6 border-t border-base-300">
                                    <Link
                                        href="/products"
                                        className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-primary to-secondary text-primary-content px-4 py-3 rounded-lg font-semibold hover:opacity-90 transition-all duration-300"
                                    >
                                        <Package className="w-4 h-4" />
                                        Continue Shopping
                                    </Link>
                                    {order.status === 'delivered' && (
                                        <button className="w-full flex items-center justify-center gap-2 bg-base-100 text-base-content px-4 py-3 rounded-lg font-semibold hover:bg-base-300 transition-all duration-300 border-2 border-base-300">
                                            Reorder
                                        </button>
                                    )}
                                </div>

                                {/* Support */}
                                <div className="pt-6 border-t border-base-300">
                                    <p className="text-sm text-base-content/70 mb-3">Need help?</p>
                                    <Link
                                        href="/contact"
                                        className="text-primary hover:text-primary/80 font-semibold text-sm"
                                    >
                                        Contact Support →
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}
