'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Package,
    Truck,
    CheckCircle,
    XCircle,
    Eye,
    Download,
    MapPin,
    Calendar,
    CreditCard
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function OrdersPage() {
    const [orders, setOrders] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedStatus, setSelectedStatus] = useState('all')

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            // Simulate fetching orders - replace with actual API call
            // const response = await fetch('/api/orders')
            // const data = await response.json()

            const savedOrders = localStorage.getItem('orders')
            if (savedOrders) {
                setOrders(JSON.parse(savedOrders))
            } else {
                setOrders([])
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-warning/10 text-warning border-warning/20'
            case 'processing':
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

    const filteredOrders =
        selectedStatus === 'all'
            ? orders
            : orders.filter((order) => order.status === selectedStatus)

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
    }

    const statusFilters = [
        { value: 'all', label: 'All Orders', count: orders.length },
        { value: 'pending', label: 'Pending', count: orders.filter((o) => o.status === 'pending').length },
        { value: 'processing', label: 'Processing', count: orders.filter((o) => o.status === 'processing').length },
        { value: 'shipped', label: 'Shipped', count: orders.filter((o) => o.status === 'shipped').length },
        { value: 'delivered', label: 'Delivered', count: orders.filter((o) => o.status === 'delivered').length }
    ]

    if (isLoading) {
        return (
            <div className="min-h-screen pt-32 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-base-content/70 text-lg">Loading your orders...</p>
                </div>
            </div>
        )
    }

    if (orders.length === 0) {
        return (
            <div className="min-h-screen pt-32">
                <div className="section-padding">
                    <div className="container-custom">
                        <motion.div {...fadeInUp} className="text-center max-w-md mx-auto">
                            <div className="w-32 h-32 mx-auto mb-6 bg-base-200 rounded-full flex items-center justify-center">
                                <Package className="w-16 h-16 text-base-content/30" />
                            </div>
                            <h1 className="text-4xl font-bold text-base-content mb-4">No Orders Yet</h1>
                            <p className="text-base-content/70 mb-8 text-lg">
                                You haven't placed any orders yet. Start shopping to see your orders here!
                            </p>
                            <Link
                                href="/products"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-primary-content px-8 py-4 rounded-lg font-semibold hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg"
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
        <div className="min-h-screen pt-32">
            <div className="section-padding">
                <div className="container-custom">
                    <motion.div {...fadeInUp} className="mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-base-content mb-2">My Orders</h1>
                        <p className="text-base-content/70">Track and manage your orders</p>
                    </motion.div>

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
                                            ? 'bg-gradient-to-r from-primary to-secondary text-primary-content shadow-lg'
                                            : 'bg-base-200 text-base-content hover:bg-base-300'
                                        }`}
                                >
                                    {filter.label} ({filter.count})
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    <div className="space-y-6">
                        {filteredOrders.map((order, index) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="card bg-base-200"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-base-300">
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div>
                                            <div className="text-sm text-base-content/60">Order ID</div>
                                            <div className="font-bold text-base-content">#{order.id}</div>
                                        </div>
                                        <div className="h-8 w-px bg-base-300"></div>
                                        <div>
                                            <div className="text-sm text-base-content/60">Date</div>
                                            <div className="font-semibold text-base-content flex items-center gap-2">
                                                <Calendar className="w-4 h-4" /> {order.date}
                                            </div>
                                        </div>
                                        <div className="h-8 w-px bg-base-300"></div>
                                        <div>
                                            <div className="text-sm text-base-content/60">Total</div>
                                            <div className="font-bold text-primary text-lg">${order.total.toFixed(2)}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-4 py-2 rounded-lg font-semibold border-2 flex items-center gap-2 ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4 py-4">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex gap-4 items-center">
                                            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-base-300 shrink-0">
                                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-base-content truncate">{item.name}</h3>
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

                                <div className="pt-4 border-t border-base-300">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-5 h-5 text-primary mt-1 shrink-0" />
                                            <div>
                                                <div className="font-semibold text-base-content mb-1">Shipping Address</div>
                                                <div className="text-sm text-base-content/70">
                                                    {order.shippingAddress.street}<br />
                                                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                                                    {order.shippingAddress.country}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <CreditCard className="w-5 h-5 text-primary mt-1 shrink-0" />
                                            <div>
                                                <div className="font-semibold text-base-content mb-1">Payment Method</div>
                                                <div className="text-sm text-base-content/70">{order.paymentMethod}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3 pt-4 border-t border-base-300">
                                    <Link
                                        href={`/orders/${order.id}`}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-content rounded-lg font-semibold hover:opacity-90 transition-opacity"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View Details
                                    </Link>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-base-100 text-base-content rounded-lg font-semibold hover:bg-base-300 transition-all duration-200 border-2 border-base-300">
                                        <Download className="w-4 h-4" /> Invoice
                                    </button>
                                    {order.status === 'delivered' && (
                                        <button className="flex items-center gap-2 px-4 py-2 bg-base-100 text-base-content rounded-lg font-semibold hover:bg-base-300 transition-all duration-200 border-2 border-base-300">
                                            Reorder
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {filteredOrders.length === 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                            <Package className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
                            <p className="text-base-content/70 text-lg">
                                No {selectedStatus !== 'all' ? selectedStatus : ''} orders found
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    )
}
