'use client'

import { useEffect, useState } from 'react'
import { ShoppingCart, Package, Truck, Clock, CheckCircle, Flame, MapPin, Bell, ArrowRight, User } from 'lucide-react'
import Link from 'next/link'

// Demo data for FastGas Customer Dashboard
const DEMO_USER = {
    name: 'Mary Wanjiku',
    email: 'mary@example.com',
    phone: '+254 723 456 789',
    address: 'Westlands, Nairobi',
    memberSince: '2024-08-20',
    loyaltyPoints: 450
}

const DEMO_STATS = {
    totalOrders: 12,
    delivered: 10,
    inProgress: 2,
    savedAmount: 3200
}

const DEMO_ORDERS = [
    { 
        id: 'ORD-2431', 
        variant: '13kg', 
        qty: 1, 
        total: 2800, 
        status: 'delivered', 
        date: '2026-01-28',
        deliveryDate: '2026-01-28',
        rider: 'Peter K.'
    },
    { 
        id: 'ORD-2398', 
        variant: '6kg', 
        qty: 2, 
        total: 3000, 
        status: 'shipped', 
        date: '2026-01-30',
        eta: 'Today, 3-5 PM',
        rider: 'John M.'
    },
    { 
        id: 'ORD-2312', 
        variant: '13kg', 
        qty: 1, 
        total: 2800, 
        status: 'delivered', 
        date: '2026-01-15',
        deliveryDate: '2026-01-15'
    },
    { 
        id: 'ORD-2245', 
        variant: '25kg', 
        qty: 1, 
        total: 5200, 
        status: 'delivered', 
        date: '2025-12-20',
        deliveryDate: '2025-12-20'
    }
]

const DEMO_ACTIVE_DELIVERY = {
    orderId: 'ORD-2398',
    status: 'On the way',
    rider: 'John Mwangi',
    riderPhone: '+254 712 345 678',
    eta: '3:00 PM - 5:00 PM',
    currentLocation: 'Parklands, heading to Westlands',
    progress: 75
}

const DEMO_PRODUCTS = [
    { size: '6kg', price: 1500, description: 'Perfect for small households', popular: false },
    { size: '13kg', price: 2800, description: 'Most popular for families', popular: true },
    { size: '25kg', price: 5200, description: 'Great for larger households', popular: false },
    { size: '50kg', price: 9500, description: 'Commercial & heavy users', popular: false }
]

const DEMO_NOTIFICATIONS = [
    { id: 1, message: 'Your order ORD-2398 is out for delivery!', time: '1 hour ago', read: false },
    { id: 2, message: 'Order ORD-2431 has been delivered', time: '2 days ago', read: true },
    { id: 3, message: 'Special offer: 10% off on 25kg cylinders!', time: '3 days ago', read: true }
]

function OrderStatusBadge({ status }) {
    const styles = {
        delivered: 'badge-success',
        shipped: 'badge-info',
        processing: 'badge-warning',
        pending: 'badge-ghost',
        cancelled: 'badge-error'
    }
    return <span className={`badge ${styles[status] || 'badge-ghost'}`}>{status}</span>
}

export default function UserDashboard() {
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 500)
        return () => clearTimeout(timer)
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                        <Flame className="w-8 h-8 text-orange-500" />
                        Hello, {DEMO_USER.name.split(' ')[0]}!
                    </h1>
                    <p className="text-base-content/70">Manage your FastGas orders and deliveries</p>
                </div>
                <div className="flex gap-2">
                    <span className="badge badge-warning badge-lg">Demo Mode</span>
                    <span className="badge badge-primary badge-lg">{DEMO_USER.loyaltyPoints} Points</span>
                </div>
            </div>

            {/* Active Delivery Tracking */}
            {DEMO_ACTIVE_DELIVERY && (
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-6 text-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Truck className="w-6 h-6" />
                                <h3 className="font-bold text-lg">Active Delivery</h3>
                            </div>
                            <p className="text-white/90 mb-1">Order {DEMO_ACTIVE_DELIVERY.orderId} • {DEMO_ACTIVE_DELIVERY.status}</p>
                            <p className="text-sm text-white/80">Rider: {DEMO_ACTIVE_DELIVERY.rider} • ETA: {DEMO_ACTIVE_DELIVERY.eta}</p>
                            <p className="text-sm text-white/70 mt-1">📍 {DEMO_ACTIVE_DELIVERY.currentLocation}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <div className="w-48">
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Delivery Progress</span>
                                    <span>{DEMO_ACTIVE_DELIVERY.progress}%</span>
                                </div>
                                <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-white rounded-full transition-all"
                                        style={{ width: `${DEMO_ACTIVE_DELIVERY.progress}%` }}
                                    />
                                </div>
                            </div>
                            <Link href="/track" className="btn btn-sm btn-accent mt-2">
                                Track in Real-time
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-base-100 rounded-xl p-5 shadow-sm border border-base-200 text-center">
                    <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{DEMO_STATS.totalOrders}</p>
                    <p className="text-sm text-base-content/60">Total Orders</p>
                </div>
                <div className="bg-base-100 rounded-xl p-5 shadow-sm border border-base-200 text-center">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-success" />
                    <p className="text-2xl font-bold">{DEMO_STATS.delivered}</p>
                    <p className="text-sm text-base-content/60">Delivered</p>
                </div>
                <div className="bg-base-100 rounded-xl p-5 shadow-sm border border-base-200 text-center">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-warning" />
                    <p className="text-2xl font-bold">{DEMO_STATS.inProgress}</p>
                    <p className="text-sm text-base-content/60">In Progress</p>
                </div>
                <div className="bg-base-100 rounded-xl p-5 shadow-sm border border-base-200 text-center">
                    <Flame className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                    <p className="text-2xl font-bold">KES {DEMO_STATS.savedAmount.toLocaleString()}</p>
                    <p className="text-sm text-base-content/60">Total Saved</p>
                </div>
            </div>

            {/* Quick Order Section */}
            <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 overflow-hidden">
                <div className="p-4 border-b border-base-200">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-500" />
                        Quick Order
                    </h3>
                    <p className="text-sm text-base-content/60">Order your LPG cylinder in one click</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                    {DEMO_PRODUCTS.map((product) => (
                        <div key={product.size} className={`relative rounded-lg border-2 p-4 text-center hover:border-primary transition-colors ${product.popular ? 'border-primary bg-primary/5' : 'border-base-200'}`}>
                            {product.popular && (
                                <span className="absolute -top-2 -right-2 badge badge-primary badge-sm">Popular</span>
                            )}
                            <div className="text-4xl mb-2">🔥</div>
                            <p className="font-bold text-xl">{product.size}</p>
                            <p className="text-2xl font-bold text-primary my-2">KES {product.price.toLocaleString()}</p>
                            <p className="text-xs text-base-content/60 mb-3">{product.description}</p>
                            <Link href={`/products?size=${product.size}`} className="btn btn-primary btn-sm w-full">
                                Order Now
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 overflow-hidden">
                <div className="p-4 border-b border-base-200 flex justify-between items-center">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Recent Orders
                    </h3>
                    <Link href="/orders" className="btn btn-ghost btn-sm">View All <ArrowRight className="w-4 h-4" /></Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Product</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {DEMO_ORDERS.map((order) => (
                                <tr key={order.id}>
                                    <td className="font-medium">{order.id}</td>
                                    <td>LPG {order.variant} × {order.qty}</td>
                                    <td className="font-bold">KES {order.total.toLocaleString()}</td>
                                    <td><OrderStatusBadge status={order.status} /></td>
                                    <td className="text-sm">{order.date}</td>
                                    <td>
                                        <Link href={`/orders/${order.id}`} className="btn btn-ghost btn-xs">
                                            Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Notifications */}
            <div className="bg-base-100 rounded-xl shadow-sm border border-base-200">
                <div className="p-4 border-b border-base-200 flex justify-between items-center">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Recent Notifications
                    </h3>
                    <Link href="/notifications" className="btn btn-ghost btn-sm">View All</Link>
                </div>
                <div className="divide-y divide-base-200">
                    {DEMO_NOTIFICATIONS.map((notif) => (
                        <div key={notif.id} className={`p-4 flex items-start gap-3 ${!notif.read ? 'bg-primary/5' : ''}`}>
                            <div className={`w-2 h-2 rounded-full mt-2 ${!notif.read ? 'bg-primary' : 'bg-base-300'}`} />
                            <div className="flex-1">
                                <p className={!notif.read ? 'font-medium' : ''}>{notif.message}</p>
                                <p className="text-sm text-base-content/60">{notif.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/products" className="btn btn-primary">
                    <ShoppingCart className="w-4 h-4" /> Order Gas
                </Link>
                <Link href="/orders" className="btn btn-outline">
                    <Package className="w-4 h-4" /> My Orders
                </Link>
                <Link href="/track" className="btn btn-outline">
                    <Truck className="w-4 h-4" /> Track Order
                </Link>
                <Link href="/profile" className="btn btn-outline">
                    <User className="w-4 h-4" /> My Profile
                </Link>
            </div>
        </div>
    )
}
