'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Package, Truck, Clock, CheckCircle, Search, Filter, Eye, MapPin, User, Calendar } from 'lucide-react'
import Link from 'next/link'

// Demo reseller orders data
const DEMO_RESELLER_ORDERS = [
    { 
        id: 'RES-001', 
        reseller: 'Nairobi Cream Supplies',
        owner: 'James Kamau',
        region: 'Nairobi',
        items: [
            { name: '670g Cylinder', qty: 20, price: 6375 },
            { name: 'Pressure Regulator', qty: 5, price: 2125 }
        ],
        total: 138125,
        status: 'delivered',
        orderDate: '2026-01-30',
        deliveryDate: '2026-01-30'
    },
    { 
        id: 'RES-002', 
        reseller: 'Mombasa FastGas Hub',
        owner: 'Fatuma Hassan',
        region: 'Mombasa',
        items: [
            { name: '670g Cylinder', qty: 15, price: 6375 }
        ],
        total: 95625,
        status: 'shipped',
        orderDate: '2026-01-29',
        eta: '2026-01-31'
    },
    { 
        id: 'RES-003', 
        reseller: 'Kisumu Culinary Center',
        owner: 'Otieno Odhiambo',
        region: 'Kisumu',
        items: [
            { name: 'FastGas Creamer', qty: 3, price: 12750 },
            { name: '670g Cylinder', qty: 10, price: 6375 }
        ],
        total: 102000,
        status: 'processing',
        orderDate: '2026-01-28'
    },
    { 
        id: 'RES-004', 
        reseller: 'Nakuru Catering Supplies',
        owner: 'Alice Njeri',
        region: 'Nakuru',
        items: [
            { name: '670g Cylinder', qty: 25, price: 6375 }
        ],
        total: 159375,
        status: 'pending',
        orderDate: '2026-01-27'
    },
    { 
        id: 'RES-005', 
        reseller: 'Nairobi Cream Supplies',
        owner: 'James Kamau',
        region: 'Nairobi',
        items: [
            { name: '670g Cylinder', qty: 30, price: 6375 },
            { name: 'Pressure Regulator', qty: 10, price: 2125 }
        ],
        total: 212500,
        status: 'delivered',
        orderDate: '2026-01-25',
        deliveryDate: '2026-01-26'
    }
]

const DEMO_STATS = {
    totalOrders: 145,
    pendingOrders: 12,
    shippedOrders: 8,
    deliveredOrders: 125
}

function OrderStatusBadge({ status }) {
    const styles = {
        delivered: 'badge-success',
        shipped: 'badge-info',
        processing: 'badge-warning',
        pending: 'badge-ghost',
        cancelled: 'badge-error'
    }
    return <span className={`badge badge-sm ${styles[status] || 'badge-ghost'}`}>{status}</span>
}

export default function ResellerOrdersPage() {
    const [loading, setLoading] = useState(true)
    const [orders, setOrders] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    useEffect(() => {
        const timer = setTimeout(() => {
            setOrders(DEMO_RESELLER_ORDERS)
            setLoading(false)
        }, 500)
        return () => clearTimeout(timer)
    }, [])

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              order.reseller.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              order.region.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter
        return matchesSearch && matchesStatus
    })

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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                        <ShoppingCart className="w-8 h-8 text-primary" />
                        Reseller Orders
                    </h1>
                    <p className="text-base-content/70">Manage bulk orders from resellers</p>
                </div>
                <span className="badge badge-warning badge-lg">Demo Mode</span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-base-100 rounded-xl p-5 shadow-sm border border-base-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                            <ShoppingCart className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{DEMO_STATS.totalOrders}</p>
                            <p className="text-sm text-base-content/60">Total Orders</p>
                        </div>
                    </div>
                </div>
                <div className="bg-base-100 rounded-xl p-5 shadow-sm border border-base-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-warning/10">
                            <Clock className="w-6 h-6 text-warning" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{DEMO_STATS.pendingOrders}</p>
                            <p className="text-sm text-base-content/60">Pending</p>
                        </div>
                    </div>
                </div>
                <div className="bg-base-100 rounded-xl p-5 shadow-sm border border-base-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-info/10">
                            <Truck className="w-6 h-6 text-info" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{DEMO_STATS.shippedOrders}</p>
                            <p className="text-sm text-base-content/60">Shipped</p>
                        </div>
                    </div>
                </div>
                <div className="bg-base-100 rounded-xl p-5 shadow-sm border border-base-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-success/10">
                            <CheckCircle className="w-6 h-6 text-success" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{DEMO_STATS.deliveredOrders}</p>
                            <p className="text-sm text-base-content/60">Delivered</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        className="input input-bordered w-full pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select 
                    className="select select-bordered w-full md:w-48"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                </select>
            </div>

            {/* Orders Table */}
            <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Reseller</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => (
                                <tr key={order.id}>
                                    <td className="font-medium">{order.id}</td>
                                    <td>
                                        <div>
                                            <p className="font-medium">{order.reseller}</p>
                                            <p className="text-sm text-base-content/60 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />{order.region}
                                            </p>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-sm">
                                            {order.items.map((item, i) => (
                                                <p key={i}>{item.name} × {item.qty}</p>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="font-semibold">KES {order.total.toLocaleString()}</td>
                                    <td>
                                        <div className="text-sm">
                                            <p className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {order.orderDate}
                                            </p>
                                            {order.deliveryDate && (
                                                <p className="text-success text-xs">Delivered: {order.deliveryDate}</p>
                                            )}
                                            {order.eta && (
                                                <p className="text-info text-xs">ETA: {order.eta}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td><OrderStatusBadge status={order.status} /></td>
                                    <td>
                                        <button className="btn btn-ghost btn-sm btn-square">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
