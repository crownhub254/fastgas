'use client'

import { useEffect, useState } from 'react'
import { Package, ShoppingCart, DollarSign, TrendingUp, CreditCard, Eye } from 'lucide-react'
import { LineChart, AreaChart, PieChart, StatsCard } from '../components/charts/Index'
import DataTable from '../components/DataTable'
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth'
import Link from 'next/link'
import Loading from '../loading'

export default function SellerDashboardHome() {
    const [loading, setLoading] = useState(true)
    const { user, userData } = useFirebaseAuth()
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalEarnings: 0,
        pendingOrders: 0
    })
    const [chartData, setChartData] = useState({
        salesOverTime: [],
        productOrders: [],
        ordersByStatus: []
    })
    const [tableData, setTableData] = useState({
        recentOrders: [],
        recentPayments: []
    })

    useEffect(() => {
        if (userData) {
            fetchDashboardData()
        }
    }, [userData])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)
            const userEmail = userData.email

            // Fetch seller's products
            const productsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)
            const productsData = await productsRes.json()
            const allProducts = productsData.products || []
            const products = allProducts.filter(p => p.sellerEmail === userEmail)

            // Fetch all orders
            const ordersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`)
            const ordersData = await ordersRes.json()
            const allOrders = ordersData.orders || []

            // Filter orders containing seller's products
            const productIds = products.map(p => p.id)
            const sellerOrders = allOrders.filter(order =>
                order.items.some(item => productIds.includes(item.id))
            )

            // Fetch payments for seller's orders
            const paymentsPromises = sellerOrders.map(order =>
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/order/${order.orderId}`)
                    .then(res => res.json())
                    .catch(() => null)
            )
            const paymentsResults = await Promise.all(paymentsPromises)
            const payments = paymentsResults
                .filter(p => p && p.success && p.payment)
                .map(p => p.payment)

            // Calculate earnings
            const totalEarnings = sellerOrders
                .filter(o => o.paymentStatus === 'completed')
                .reduce((sum, order) => {
                    const sellerItems = order.items.filter(item => productIds.includes(item.id))
                    return sum + sellerItems.reduce((s, item) => s + (item.price * item.quantity), 0)
                }, 0)

            // Generate charts
            const now = new Date()
            const salesOverTime = []
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

                const dayOrders = sellerOrders.filter(o => {
                    const oDate = new Date(o.createdAt)
                    return oDate.toDateString() === date.toDateString()
                })

                const daySales = dayOrders.reduce((sum, order) => {
                    const sellerItems = order.items.filter(item => productIds.includes(item.id))
                    return sum + sellerItems.reduce((s, item) => s + (item.price * item.quantity), 0)
                }, 0)

                salesOverTime.push({
                    name: dateStr,
                    sales: daySales,
                    orders: dayOrders.length
                })
            }

            const productOrderCounts = {}
            sellerOrders.forEach(order => {
                order.items.forEach(item => {
                    if (productIds.includes(item.id)) {
                        productOrderCounts[item.name] = (productOrderCounts[item.name] || 0) + item.quantity
                    }
                })
            })

            const productOrders = Object.entries(productOrderCounts)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 5)

            const statusCounts = sellerOrders.reduce((acc, order) => {
                acc[order.status] = (acc[order.status] || 0) + 1
                return acc
            }, {})

            const ordersByStatus = Object.entries(statusCounts).map(([name, value]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                value
            }))

            // Prepare table data
            const recentOrders = sellerOrders
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 10)
                .map(order => ({
                    ...order,
                    sellerTotal: order.items
                        .filter(item => productIds.includes(item.id))
                        .reduce((sum, item) => sum + (item.price * item.quantity), 0)
                }))

            const recentPayments = payments
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 10)

            setStats({
                totalProducts: products.length,
                totalOrders: sellerOrders.length,
                totalEarnings,
                pendingOrders: sellerOrders.filter(o => o.status === 'processing' || o.status === 'pending').length
            })

            setChartData({ salesOverTime, productOrders, ordersByStatus })
            setTableData({ recentOrders, recentPayments })
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const orderColumns = [
        { header: 'Order ID', accessor: 'orderId' },
        {
            header: 'Customer',
            render: (row) => row.shippingAddress?.city || 'N/A'
        },
        {
            header: 'Items',
            render: (row) => {
                const sellerItems = row.items.filter(item =>
                    tableData.recentOrders.find(o => o.orderId === row.orderId)
                )
                return sellerItems.length || row.items.length
            }
        },
        {
            header: 'Earnings',
            render: (row) => `$${row.sellerTotal?.toFixed(2) || '0.00'}`
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

    if (loading) {
        return <Loading />
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Seller Dashboard</h1>
                <p className="text-base-content/70">Manage your products and track your sales</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Products"
                    value={stats.totalProducts.toLocaleString()}
                    icon={Package}
                    trend="up"
                />
                <StatsCard
                    title="Total Orders"
                    value={stats.totalOrders.toLocaleString()}
                    icon={ShoppingCart}
                    trend="up"
                />
                <StatsCard
                    title="Total Earnings"
                    value={`$${stats.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    icon={DollarSign}
                    trend="up"
                />
                <StatsCard
                    title="Pending Orders"
                    value={stats.pendingOrders.toLocaleString()}
                    icon={TrendingUp}
                    trend="up"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AreaChart
                    data={chartData.salesOverTime}
                    dataKeys={[
                        { key: 'sales', name: 'Sales ($)' },
                        { key: 'orders', name: 'Orders' }
                    ]}
                    title="Sales Performance (Last 7 Days)"
                    colors={['#8b5cf6', '#ec4899']}
                />
                <PieChart
                    data={chartData.ordersByStatus}
                    title="Orders by Status"
                    colors={['#8b5cf6', '#ec4899', '#06b6d4', '#10b981']}
                />
            </div>

            <div className="grid grid-cols-1 gap-6">
                <PieChart
                    data={chartData.productOrders}
                    title="Top 5 Products by Orders"
                    colors={['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b']}
                />
            </div>

            {/* Tables Section */}
            <div className="grid grid-cols-1 gap-6">
                {/* Recent Orders */}
                <div className="card bg-base-200">
                    <div className="card-body">
                        <h2 className="card-title text-2xl mb-4">
                            <ShoppingCart className="w-6 h-6" />
                            Recent Orders
                        </h2>
                        <DataTable
                            columns={orderColumns}
                            data={tableData.recentOrders}
                            itemsPerPage={5}
                            emptyMessage="No orders found"
                            EmptyIcon={ShoppingCart}
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
            </div>
        </div>
    )
}
