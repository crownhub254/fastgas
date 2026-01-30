'use client'

import { useEffect, useState } from 'react'
import { Package, ShoppingCart, DollarSign, Truck, TrendingUp, Clock, CheckCircle, Flame, MapPin, Phone, Mail, User } from 'lucide-react'
import Link from 'next/link'

// Demo data for FastGas Reseller Dashboard
const DEMO_RESELLER = {
    businessName: 'Nairobi Cream Supplies',
    ownerName: 'James Kamau',
    email: 'james@nairobicream.co.ke',
    phone: '+254 712 345 678',
    region: 'Nairobi',
    address: 'Kenyatta Avenue, Nairobi CBD',
    tier: 'Gold',
    discount: 15,
    joinedDate: '2024-06-15'
}

const DEMO_STATS = {
    totalOrders: 145,
    pendingOrders: 8,
    deliveredOrders: 127,
    totalSpent: 812000,
    productsOrdered: 423,
    savings: 143290
}

const DEMO_MY_ORDERS = [
    { id: 'RES-001', variant: '670g Cylinder', qty: 20, unitPrice: 6375, total: 127500, status: 'delivered', date: '2026-01-30', deliveryDate: '2026-01-30' },
    { id: 'RES-002', variant: 'Pressure Regulator', qty: 10, unitPrice: 2125, total: 21250, status: 'shipped', date: '2026-01-29', eta: '2026-01-31' },
    { id: 'RES-003', variant: '670g Cylinder', qty: 15, unitPrice: 6375, total: 95625, status: 'processing', date: '2026-01-28' },
    { id: 'RES-004', variant: 'FastGas Creamer', qty: 3, unitPrice: 12750, total: 38250, status: 'pending', date: '2026-01-27' },
    { id: 'RES-005', variant: '670g Cylinder', qty: 25, unitPrice: 6375, total: 159375, status: 'delivered', date: '2026-01-25', deliveryDate: '2026-01-26' }
]

const DEMO_PRICING = [
    { size: '670g N₂O Cylinder', retailPrice: 7500, yourPrice: 6375, savings: 1125, stock: 'In Stock' },
    { size: 'Pressure Regulator', retailPrice: 2500, yourPrice: 2125, savings: 375, stock: 'In Stock' },
    { size: 'FastGas Creamer', retailPrice: 15000, yourPrice: 12750, savings: 2250, stock: 'Low Stock' }
]

const DEMO_SALES_HISTORY = [
    { month: 'Oct', orders: 32, revenue: 156000 },
    { month: 'Nov', orders: 38, revenue: 189000 },
    { month: 'Dec', orders: 45, revenue: 234000 },
    { month: 'Jan', orders: 30, revenue: 143000 }
]

function StatsCard({ title, value, icon: Icon, color = 'primary' }) {
    return (
        <div className="bg-base-100 rounded-xl p-5 shadow-sm border border-base-200">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg bg-${color}/10`}>
                    <Icon className={`w-6 h-6 text-${color}`} />
                </div>
                <div>
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-sm text-base-content/60">{title}</p>
                </div>
            </div>
        </div>
    )
}

export default function ResellerDashboard() {
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
                        Welcome back, {DEMO_RESELLER.ownerName}!
                    </h1>
                    <p className="text-base-content/70">Manage your FastGas reseller account</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className="badge badge-warning badge-lg">Demo Mode</span>
                    <span className={`badge badge-lg ${DEMO_RESELLER.tier === 'Gold' ? 'badge-warning' : DEMO_RESELLER.tier === 'Silver' ? 'badge-ghost' : 'badge-accent'}`}>
                        {DEMO_RESELLER.tier} Tier • {DEMO_RESELLER.discount}% Discount
                    </span>
                </div>
            </div>

            {/* Business Info Card */}
            <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-primary-content">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">{DEMO_RESELLER.businessName}</h2>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm opacity-90">
                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{DEMO_RESELLER.region}</span>
                            <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{DEMO_RESELLER.phone}</span>
                            <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{DEMO_RESELLER.email}</span>
                        </div>
                    </div>
                    <button className="btn btn-accent">
                        <ShoppingCart className="w-4 h-4" /> Place Bulk Order
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatsCard title="Total Orders" value={DEMO_STATS.totalOrders} icon={ShoppingCart} />
                <StatsCard title="Pending" value={DEMO_STATS.pendingOrders} icon={Clock} color="warning" />
                <StatsCard title="Delivered" value={DEMO_STATS.deliveredOrders} icon={CheckCircle} color="success" />
                <StatsCard title="Total Spent" value={`KES ${(DEMO_STATS.totalSpent / 1000).toFixed(0)}K`} icon={DollarSign} />
                <StatsCard title="Products" value={DEMO_STATS.productsOrdered} icon={Flame} color="warning" />
                <StatsCard title="Savings" value={`KES ${(DEMO_STATS.savings / 1000).toFixed(0)}K`} icon={TrendingUp} color="success" />
            </div>

            {/* Pricing Table */}
            <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 overflow-hidden">
                <div className="p-4 border-b border-base-200">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-500" />
                        Your Reseller Pricing
                    </h3>
                    <p className="text-sm text-base-content/60">Special {DEMO_RESELLER.tier} tier pricing with {DEMO_RESELLER.discount}% discount</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Retail Price</th>
                                <th>Your Price</th>
                                <th>You Save</th>
                                <th>Availability</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {DEMO_PRICING.map((item) => (
                                <tr key={item.size}>
                                    <td className="font-bold text-lg">{item.size}</td>
                                    <td className="text-base-content/60 line-through">KES {item.retailPrice.toLocaleString()}</td>
                                    <td className="font-bold text-primary text-lg">KES {item.yourPrice.toLocaleString()}</td>
                                    <td className="text-success font-medium">KES {item.savings.toLocaleString()}</td>
                                    <td>
                                        <span className={`badge ${item.stock === 'In Stock' ? 'badge-success' : 'badge-warning'}`}>
                                            {item.stock}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn btn-primary btn-sm">Order Now</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 overflow-hidden">
                <div className="p-4 border-b border-base-200 flex justify-between items-center">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Recent Orders
                    </h3>
                    <Link href="/dashboard/reseller/orders" className="btn btn-ghost btn-sm">View All</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Unit Price</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {DEMO_MY_ORDERS.map((order) => (
                                <tr key={order.id}>
                                    <td className="font-medium">{order.id}</td>
                                    <td>{order.variant}</td>
                                    <td>{order.qty} units</td>
                                    <td>KES {order.unitPrice.toLocaleString()}</td>
                                    <td className="font-bold">KES {order.total.toLocaleString()}</td>
                                    <td>
                                        <span className={`badge ${
                                            order.status === 'delivered' ? 'badge-success' :
                                            order.status === 'shipped' ? 'badge-info' :
                                            order.status === 'processing' ? 'badge-warning' :
                                            'badge-ghost'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="text-sm">{order.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Sales History Chart */}
            <div className="bg-base-100 rounded-xl p-6 shadow-sm border border-base-200">
                <h3 className="font-semibold mb-4">Your Order History (Last 4 Months)</h3>
                <div className="grid grid-cols-4 gap-4">
                    {DEMO_SALES_HISTORY.map((month) => (
                        <div key={month.month} className="text-center p-4 bg-base-200 rounded-lg">
                            <p className="font-bold text-lg">{month.month}</p>
                            <p className="text-3xl font-bold text-primary">{month.orders}</p>
                            <p className="text-xs text-base-content/60">orders</p>
                            <p className="text-sm font-medium text-success mt-1">KES {(month.revenue / 1000).toFixed(0)}K</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/dashboard/reseller/orders" className="btn btn-outline btn-primary">
                    <Package className="w-4 h-4" /> My Orders
                </Link>
                <button className="btn btn-primary">
                    <ShoppingCart className="w-4 h-4" /> Place Order
                </button>
                <Link href="/track" className="btn btn-outline">
                    <Truck className="w-4 h-4" /> Track Delivery
                </Link>
                <Link href="/profile" className="btn btn-outline">
                    <User className="w-4 h-4" /> My Profile
                </Link>
            </div>
        </div>
    )
}
