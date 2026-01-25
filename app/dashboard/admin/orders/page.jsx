// app/dashboard/admin/orders/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Package, Truck, CheckCircle, XCircle, Eye, Filter } from 'lucide-react'
import DataTable from '@/app/dashboard/components/DataTable'
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth'
import toast from 'react-hot-toast'

export default function AdminOrdersPage() {
    const { user, userData } = useFirebaseAuth()
    const [orders, setOrders] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('all')

    useEffect(() => {
        if (user && userData) {
            fetchOrders()
        }
    }, [user, userData])

    const fetchOrders = async () => {
        try {
            // Fetch all orders (no user filter for admin)
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
                    <div className="text-xs text-base-content/60">{row.buyerInfo?.email}</div>
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
            header: 'Payment',
            accessor: 'paymentStatus',
            render: (row) => (
                <span className={`badge ${row.paymentStatus === 'completed' ? 'badge-success' :
                        row.paymentStatus === 'pending' ? 'badge-warning' :
                            'badge-error'
                    }`}>
                    {row.paymentStatus}
                </span>
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
                <a
                    href={`/orders/${row.orderId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-ghost"
                >
                    <Eye className="w-4 h-4" />
                </a>
            )
        }
    ]

    const filteredOrders = orders.filter(order => {
        if (statusFilter === 'all') return true
        return order.status === statusFilter
    })

    const statusCounts = {
        all: orders.length,
        processing: orders.filter(o => o.status === 'processing').length,
        confirmed: orders.filter(o => o.status === 'confirmed').length,
        assigned: orders.filter(o => o.status === 'assigned').length,
        in_transit: orders.filter(o => ['collected', 'in_transit', 'out_for_delivery'].includes(o.status)).length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
                        <ShoppingCart className="w-8 h-8 text-primary" />
                        All Orders
                    </h1>
                    <p className="text-base-content/60 mt-1">
                        View and manage all customer orders
                    </p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="btn btn-primary"
                >
                    Refresh Orders
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="card bg-base-100 shadow-xl">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{statusCounts.all}</div>
                        <div className="text-xs text-base-content/60">Total Orders</div>
                    </div>
                </div>
                <div className="card bg-base-100 shadow-xl">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-info">{statusCounts.processing}</div>
                        <div className="text-xs text-base-content/60">Processing</div>
                    </div>
                </div>
                <div className="card bg-base-100 shadow-xl">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-warning">{statusCounts.assigned}</div>
                        <div className="text-xs text-base-content/60">Assigned</div>
                    </div>
                </div>
                <div className="card bg-base-100 shadow-xl">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{statusCounts.in_transit}</div>
                        <div className="text-xs text-base-content/60">In Transit</div>
                    </div>
                </div>
                <div className="card bg-base-100 shadow-xl">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-success">{statusCounts.delivered}</div>
                        <div className="text-xs text-base-content/60">Delivered</div>
                    </div>
                </div>
                <div className="card bg-base-100 shadow-xl">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-error">{statusCounts.cancelled}</div>
                        <div className="text-xs text-base-content/60">Cancelled</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3 overflow-x-auto pb-2">
                {[
                    { value: 'all', label: 'All Orders' },
                    { value: 'processing', label: 'Processing' },
                    { value: 'confirmed', label: 'Confirmed' },
                    { value: 'assigned', label: 'Assigned' },
                    { value: 'in_transit', label: 'In Transit' },
                    { value: 'delivered', label: 'Delivered' },
                    { value: 'cancelled', label: 'Cancelled' }
                ].map((filter) => (
                    <button
                        key={filter.value}
                        onClick={() => setStatusFilter(filter.value)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${statusFilter === filter.value
                                ? 'bg-gradient-to-r from-primary to-secondary text-primary-content shadow-lg'
                                : 'bg-base-200 text-base-content hover:bg-base-300'
                            }`}
                    >
                        {filter.label} ({statusCounts[filter.value] || 0})
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
                        itemsPerPage={5}
                        emptyMessage="No orders found"
                        EmptyIcon={ShoppingCart}
                    />
                )}
            </motion.div>
        </div>
    )
}
