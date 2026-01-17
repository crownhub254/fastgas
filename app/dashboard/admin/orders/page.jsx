'use client'

import { useEffect, useState } from 'react'
import { Search, Package, Truck, CheckCircle, Clock, Calendar, Eye } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

export default function AdminOrders() {
    const [orders, setOrders] = useState([])
    const [filteredOrders, setFilteredOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    useEffect(() => {
        fetchOrders()
    }, [])

    useEffect(() => {
        filterOrders()
    }, [searchQuery, statusFilter, orders])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`)
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
        let filtered = orders

        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status === statusFilter)
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(order =>
                order.orderId?.toLowerCase().includes(query) ||
                order.userId?.toLowerCase().includes(query)
            )
        }

        setFilteredOrders(filtered)
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-warning/10 text-warning border-warning/20'
            case 'processing':
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
            case 'confirmed':
                return <Clock className="w-5 h-5" />
            case 'shipped':
                return <Truck className="w-5 h-5" />
            case 'delivered':
                return <CheckCircle className="w-5 h-5" />
            default:
                return <Package className="w-5 h-5" />
        }
    }

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/status`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                }
            )

            const data = await response.json()

            if (data.success) {
                toast.success('Order status updated')
                setOrders(orders.map(o =>
                    o.orderId === orderId ? { ...o, status: newStatus } : o
                ))
            } else {
                toast.error(data.error || 'Failed to update status')
            }
        } catch (error) {
            console.error('Failed to update status:', error)
            toast.error('Failed to update status')
        }
    }

    const statusFilters = [
        { value: 'all', label: 'All Orders', count: orders.length },
        { value: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
        { value: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'processing' || o.status === 'confirmed').length },
        { value: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
        { value: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length }
    ]

    const totalRevenue = orders
        .filter(o => o.paymentStatus === 'completed')
        .reduce((sum, o) => sum + o.total, 0)

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-base-content/70">Loading orders...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">All Orders</h1>
                <p className="text-base-content/70">Manage and track all customer orders</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card bg-base-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Package className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{orders.length}</p>
                            <p className="text-sm text-base-content/70">Total Orders</p>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-warning" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {orders.filter(o => o.status === 'pending' || o.status === 'processing').length}
                            </p>
                            <p className="text-sm text-base-content/70">Pending</p>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-success" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {orders.filter(o => o.status === 'delivered').length}
                            </p>
                            <p className="text-sm text-base-content/70">Delivered</p>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center">
                            <Package className="w-6 h-6 text-info" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
                            <p className="text-sm text-base-content/70">Revenue</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3 overflow-x-auto pb-2">
                {statusFilters.map((filter) => (
                    <button
                        key={filter.value}
                        onClick={() => setStatusFilter(filter.value)}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap ${statusFilter === filter.value
                                ? 'bg-linear-to-r from-primary to-secondary text-primary-content shadow-lg'
                                : 'bg-base-200 text-base-content hover:bg-base-300'
                            }`}
                    >
                        {filter.label} ({filter.count})
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="card bg-base-200 p-6">
                <div className="form-control">
                    <div className="input">
                        <span className="">
                            <Search className="w-5 h-5" />
                        </span>
                        <input
                            type="text"
                            placeholder="Search by order ID or user ID..."
                            className="flex-1"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="card bg-base-200 overflow-x-auto">
                <table className="table table-zebra">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Payment</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map((order) => (
                            <tr key={order.orderId}>
                                <td className="font-mono text-sm">{order.orderId}</td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-base-content/60" />
                                        <span className="text-sm">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        {order.items.slice(0, 3).map((item, idx) => (
                                            <div key={idx} className="avatar">
                                                <div className="w-8 h-8 rounded">
                                                    {item.image ? (
                                                        <Image
                                                            src={item.image}
                                                            alt={item.name}
                                                            width={32}
                                                            height={32}
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-base-300 flex items-center justify-center">
                                                            <Package className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {order.items.length > 3 && (
                                            <span className="text-xs text-base-content/60">
                                                +{order.items.length - 3}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="font-bold text-primary">${order.total.toFixed(2)}</td>
                                <td>
                                    <span className={`badge ${order.paymentStatus === 'completed'
                                            ? 'badge-success'
                                            : 'badge-warning'
                                        }`}>
                                        {order.paymentStatus}
                                    </span>
                                </td>
                                <td>
                                    <select
                                        className="select select-sm select-bordered"
                                        value={order.status}
                                        onChange={(e) => handleUpdateStatus(order.orderId, e.target.value)}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </td>
                                <td>
                                    <button className="btn btn-sm btn-ghost">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredOrders.length === 0 && (
                    <div className="text-center py-12">
                        <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-base-content/70">No orders found</p>
                    </div>
                )}
            </div>
        </div>
    )
}
