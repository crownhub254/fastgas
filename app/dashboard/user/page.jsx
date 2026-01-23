'use client'

import { useEffect, useState } from 'react'
import { ShoppingBag, Package, DollarSign, TrendingUp, CreditCard, Eye, FileText } from 'lucide-react'
import { LineChart, AreaChart, PieChart, StatsCard } from '../components/charts/Index'
import DataTable from '../components/DataTable'
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth'
import Link from 'next/link'
import Loading from '../loading'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function UserDashboardHome() {
    const [loading, setLoading] = useState(true)
    const { user, userData } = useFirebaseAuth()
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalSpent: 0
    })
    const [chartData, setChartData] = useState({
        spendingOverTime: [],
        ordersByStatus: [],
        monthlySpending: []
    })
    const [tableData, setTableData] = useState({
        recentOrders: [],
        recentPayments: [],
        savedItems: []
    })

    useEffect(() => {
        if (userData) {
            fetchDashboardData()
        }
    }, [userData])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)

            // Fetch user's orders
            const ordersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/user/${userData.uid}`)
            const ordersData = await ordersRes.json()
            const orders = ordersData.orders || []

            // Fetch payments for user's orders
            const paymentsPromises = orders.map(order =>
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/order/${order.orderId}`)
                    .then(res => res.json())
                    .catch(() => null)
            )
            const paymentsResults = await Promise.all(paymentsPromises)
            const payments = paymentsResults
                .filter(p => p && p.success && p.payment)
                .map(p => p.payment)

            // Calculate stats
            const totalSpent = orders
                .filter(o => o.paymentStatus === 'completed')
                .reduce((sum, o) => sum + o.total, 0)

            const pendingOrders = orders.filter(o =>
                o.status === 'pending' || o.status === 'processing'
            ).length

            const completedOrders = orders.filter(o =>
                o.status === 'delivered'
            ).length

            // Generate charts
            const now = new Date()
            const spendingOverTime = []
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

                const dayOrders = orders.filter(o => {
                    const oDate = new Date(o.createdAt)
                    return oDate.toDateString() === date.toDateString()
                })

                const daySpending = dayOrders
                    .filter(o => o.paymentStatus === 'completed')
                    .reduce((sum, o) => sum + o.total, 0)

                spendingOverTime.push({
                    name: dateStr,
                    spent: daySpending,
                    orders: dayOrders.length
                })
            }

            const statusCounts = orders.reduce((acc, order) => {
                const status = order.status || 'pending'
                acc[status] = (acc[status] || 0) + 1
                return acc
            }, {})

            const ordersByStatus = Object.entries(statusCounts).map(([name, value]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                value
            }))

            const monthlySpending = []
            for (let i = 5; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
                const monthStr = date.toLocaleDateString('en-US', { month: 'short' })

                const monthOrders = orders.filter(o => {
                    const oDate = new Date(o.createdAt)
                    return oDate.getMonth() === date.getMonth() &&
                        oDate.getFullYear() === date.getFullYear()
                })

                const monthSpending = monthOrders
                    .filter(o => o.paymentStatus === 'completed')
                    .reduce((sum, o) => sum + o.total, 0)

                monthlySpending.push({
                    name: monthStr,
                    amount: monthSpending
                })
            }

            // Prepare table data
            const recentOrders = orders
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 10)

            const recentPayments = payments
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 10)

            // Get saved/wishlist items from localStorage
            const wishlistStr = typeof window !== 'undefined' ? localStorage.getItem('wishlist') : null
            const savedItems = wishlistStr ? JSON.parse(wishlistStr).slice(0, 10) : []

            setStats({
                totalOrders: orders.length,
                pendingOrders,
                completedOrders,
                totalSpent
            })

            setChartData({ spendingOverTime, ordersByStatus, monthlySpending })
            setTableData({ recentOrders, recentPayments, savedItems })
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const orderColumns = [
        { header: 'Order ID', accessor: 'orderId' },
        {
            header: 'Items',
            render: (row) => row.items?.length || 0
        },
        {
            header: 'Total',
            render: (row) => `$${row.total?.toFixed(2) || '0.00'}`
        },
        {
            header: 'Payment',
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
            render: (row) => (
                <span className={`badge ${row.status === 'delivered' ? 'badge-success' :
                    row.status === 'shipped' ? 'badge-info' :
                        row.status === 'processing' ? 'badge-warning' :
                            'badge-error'
                    }`}>
                    {row.status}
                </span>
            )
        },
        {
            header: 'Date',
            render: (row) => new Date(row.createdAt).toLocaleDateString()
        },
        {
            header: 'Actions',
            render: (row) => (
                <Link
                    href={`/orders/${row.orderId}`}
                    className="btn btn-xs btn-ghost"
                >
                    <Eye className="w-3 h-3" />
                </Link>
            )
        }
    ]

    const paymentColumns = [
        {
            header: 'Transaction ID',
            render: (row) => (
                <span className="font-mono text-xs">
                    {row.transactionId?.substring(0, 16)}...
                </span>
            )
        },
        { header: 'Order ID', accessor: 'orderId' },
        {
            header: 'Amount',
            render: (row) => `$${row.amount?.toFixed(2) || '0.00'}`
        },
        {
            header: 'Status',
            render: (row) => (
                <span className={`badge ${row.status === 'succeeded' ? 'badge-success' :
                    row.status === 'pending' ? 'badge-warning' :
                        'badge-error'
                    }`}>
                    {row.status}
                </span>
            )
        },
        {
            header: 'Method',
            accessor: 'paymentMethod'
        },
        {
            header: 'Date',
            render: (row) => new Date(row.createdAt).toLocaleDateString()
        }
    ]

    const wishlistColumns = [
        {
            header: 'Product',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <img
                        src={row.image}
                        alt={row.name}
                        className="w-12 h-12 object-cover rounded"
                    />
                    <span className="font-semibold">{row.name}</span>
                </div>
            )
        },
        { header: 'Category', accessor: 'category' },
        {
            header: 'Price',
            render: (row) => `$${row.price?.toFixed(2) || '0.00'}`
        },
        {
            header: 'Rating',
            render: (row) => (
                <div className="flex items-center gap-1">
                    <span className="text-warning">★</span>
                    <span>{row.rating?.toFixed(1) || '0.0'}</span>
                </div>
            )
        },
        {
            header: 'Actions',
            render: (row) => (
                <Link
                    href={`/products/${row.id}`}
                    className="btn btn-xs btn-primary"
                >
                    View
                </Link>
            )
        }
    ]

    if (loading) {
        return <Loading />
    }

    return (
        <ProtectedRoute allowedRoles={['user']}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Welcome back, {userData?.displayName}!</h1>
                    <p className="text-base-content/70">Track your orders and manage your account</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="Total Orders"
                        value={stats.totalOrders.toLocaleString()}
                        icon={ShoppingBag}
                        trend="up"
                    />
                    <StatsCard
                        title="Pending Orders"
                        value={stats.pendingOrders.toLocaleString()}
                        icon={TrendingUp}
                        trend="up"
                    />
                    <StatsCard
                        title="Completed Orders"
                        value={stats.completedOrders.toLocaleString()}
                        icon={Package}
                        trend="up"
                    />
                    <StatsCard
                        title="Total Spent"
                        value={`$${stats.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        icon={DollarSign}
                        trend="up"
                    />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AreaChart
                        data={chartData.spendingOverTime}
                        dataKeys={[
                            { key: 'spent', name: 'Spent ($)' },
                            { key: 'orders', name: 'Orders' }
                        ]}
                        title="Spending Activity (Last 7 Days)"
                        colors={['#8b5cf6', '#ec4899']}
                    />
                    <PieChart
                        data={chartData.ordersByStatus}
                        title="Orders by Status"
                        colors={['#8b5cf6', '#ec4899', '#06b6d4', '#10b981']}
                    />
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <LineChart
                        data={chartData.monthlySpending}
                        dataKeys={[{ key: 'amount', name: 'Spending ($)' }]}
                        title="Monthly Spending Trend (Last 6 Months)"
                        colors={['#8b5cf6']}
                    />
                </div>

                {/* Tables Section */}
                <div className="grid grid-cols-1 gap-6">
                    {/* Recent Orders */}
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h2 className="card-title text-2xl mb-4">
                                <ShoppingBag className="w-6 h-6" />
                                Recent Orders
                            </h2>
                            <DataTable
                                columns={orderColumns}
                                data={tableData.recentOrders}
                                itemsPerPage={5}
                                emptyMessage="No orders found"
                                EmptyIcon={ShoppingBag}
                            />
                        </div>
                    </div>

                    {/* Recent Payments */}
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h2 className="card-title text-2xl mb-4">
                                <CreditCard className="w-6 h-6" />
                                Recent Payments
                            </h2>
                            <DataTable
                                columns={paymentColumns}
                                data={tableData.recentPayments}
                                itemsPerPage={5}
                                emptyMessage="No payments found"
                                EmptyIcon={CreditCard}
                            />
                        </div>
                    </div>

                    {/* Saved Items / Wishlist */}
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h2 className="card-title text-2xl mb-4">
                                <Package className="w-6 h-6 text-warning" />
                                Wishlist Items
                            </h2>
                            <DataTable
                                columns={wishlistColumns}
                                data={tableData.savedItems}
                                itemsPerPage={5}
                                emptyMessage="No items in wishlist"
                                EmptyIcon={Package}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}
