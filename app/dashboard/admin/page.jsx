'use client'

import { useEffect, useState } from 'react'
import { Users, Package, ShoppingCart, DollarSign, Eye, FileText, Truck } from 'lucide-react'
import { LineChart, AreaChart, PieChart, StatsCard } from '../components/charts/Index'
import DataTable from '../components/DataTable'
import Loading from '../loading'
import Link from 'next/link'

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        userGrowth: 0,
        productGrowth: 0,
        orderGrowth: 0,
        revenueGrowth: 0
    })
    const [chartData, setChartData] = useState({
        userActivity: [],
        revenueOverTime: [],
        ordersByStatus: []
    })
    const [tableData, setTableData] = useState({
        recentUsers: [],
        recentOrders: [],
        lateInvoices: [],
        pendingShipments: []
    })

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)

            // Fetch all necessary data
            const [usersRes, productsRes, ordersRes, paymentsRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/users`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments`)
            ])

            const usersData = await usersRes.json()
            const productsData = await productsRes.json()
            const ordersData = await ordersRes.json()
            const paymentsData = await paymentsRes.json()

            const users = usersData.users || []
            const products = productsData.products || []
            const orders = ordersData.orders || []
            const payments = paymentsData.payments || []

            // Calculate total revenue
            const totalRevenue = payments
                .filter(p => p.status === 'succeeded')
                .reduce((sum, p) => sum + p.amount, 0)

            // Calculate growth rates
            const now = new Date()
            const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            const previous30Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

            const usersLast30 = users.filter(u => new Date(u.createdAt) >= last30Days).length
            const usersPrevious30 = users.filter(u =>
                new Date(u.createdAt) >= previous30Days && new Date(u.createdAt) < last30Days
            ).length
            const userGrowth = usersPrevious30 > 0
                ? ((usersLast30 - usersPrevious30) / usersPrevious30 * 100).toFixed(1)
                : 0

            const ordersLast30 = orders.filter(o => new Date(o.createdAt) >= last30Days).length
            const ordersPrevious30 = orders.filter(o =>
                new Date(o.createdAt) >= previous30Days && new Date(o.createdAt) < last30Days
            ).length
            const orderGrowth = ordersPrevious30 > 0
                ? ((ordersLast30 - ordersPrevious30) / ordersPrevious30 * 100).toFixed(1)
                : 0

            // Generate charts data
            const userActivity = []
            const revenueOverTime = []
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

                const newUsers = users.filter(u => {
                    const uDate = new Date(u.createdAt)
                    return uDate.toDateString() === date.toDateString()
                }).length

                const dayRevenue = payments.filter(p => {
                    const pDate = new Date(p.createdAt)
                    return pDate.toDateString() === date.toDateString() && p.status === 'succeeded'
                }).reduce((sum, p) => sum + p.amount, 0)

                const dayOrders = orders.filter(o => {
                    const oDate = new Date(o.createdAt)
                    return oDate.toDateString() === date.toDateString()
                }).length

                userActivity.push({ name: dateStr, users: newUsers })
                revenueOverTime.push({ name: dateStr, revenue: dayRevenue, orders: dayOrders })
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

            // Prepare table data
            const recentUsers = users
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 10)

            const recentOrders = orders
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 10)

            // Late invoices: orders older than 3 days with pending payment
            const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
            const lateInvoices = orders.filter(o =>
                new Date(o.createdAt) < threeDaysAgo &&
                o.paymentStatus === 'pending'
            ).slice(0, 10)

            // Pending shipments: confirmed orders not yet shipped
            const pendingShipments = orders.filter(o =>
                (o.status === 'confirmed' || o.status === 'processing') &&
                o.paymentStatus === 'completed'
            ).slice(0, 10)

            setStats({
                totalUsers: users.length,
                totalProducts: products.length,
                totalOrders: orders.length,
                totalRevenue,
                userGrowth: `${userGrowth}%`,
                productGrowth: '0%',
                orderGrowth: `${orderGrowth}%`,
                revenueGrowth: '0%'
            })

            setChartData({ userActivity, revenueOverTime, ordersByStatus })
            setTableData({ recentUsers, recentOrders, lateInvoices, pendingShipments })
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const userColumns = [
        { header: 'Name', accessor: 'displayName' },
        { header: 'Email', accessor: 'email' },
        {
            header: 'Role',
            render: (row) => (
                <span className={`badge ${row.role === 'seller' ? 'badge-primary' : 'badge-secondary'}`}>
                    {row.role}
                </span>
            )
        },
        {
            header: 'Joined',
            render: (row) => new Date(row.createdAt).toLocaleDateString()
        }
    ]

    const orderColumns = [
        { header: 'Order ID', accessor: 'orderId' },
        {
            header: 'Customer',
            render: (row) => row.shippingAddress?.street || 'N/A'
        },
        {
            header: 'Total',
            render: (row) => `$${row.total?.toFixed(2) || '0.00'}`
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
        }
    ]

    const invoiceColumns = [
        { header: 'Order ID', accessor: 'orderId' },
        {
            header: 'Amount',
            render: (row) => `$${row.total?.toFixed(2) || '0.00'}`
        },
        {
            header: 'Days Overdue',
            render: (row) => {
                const days = Math.floor((new Date() - new Date(row.createdAt)) / (1000 * 60 * 60 * 24))
                return <span className="text-error font-semibold">{days} days</span>
            }
        },
        {
            header: 'Actions',
            render: (row) => (
                <Link
                    href={`/orders/${row.orderId}`}
                    className="btn btn-xs btn-primary"
                >
                    <FileText className="w-3 h-3 mr-1" />
                    View Invoice
                </Link>
            )
        }
    ]

    const shipmentColumns = [
        { header: 'Order ID', accessor: 'orderId' },
        {
            header: 'Destination',
            render: (row) => `${row.shippingAddress?.city || 'N/A'}, ${row.shippingAddress?.division || ''}`
        },
        {
            header: 'Items',
            render: (row) => row.items?.length || 0
        },
        {
            header: 'Date',
            render: (row) => new Date(row.createdAt).toLocaleDateString()
        },
        {
            header: 'Actions',
            render: (row) => (
                <button className="btn btn-xs btn-success">
                    <Truck className="w-3 h-3 mr-1" />
                    Ship Now
                </button>
            )
        }
    ]

    if (loading) {
        return <Loading />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-base-content/70">Overview of your platform performance</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Users"
                    value={stats.totalUsers.toLocaleString()}
                    change={stats.userGrowth}
                    icon={Users}
                    trend={parseFloat(stats.userGrowth) >= 0 ? 'up' : 'down'}
                />
                <StatsCard
                    title="Total Products"
                    value={stats.totalProducts.toLocaleString()}
                    change={stats.productGrowth}
                    icon={Package}
                    trend="up"
                />
                <StatsCard
                    title="Total Orders"
                    value={stats.totalOrders.toLocaleString()}
                    change={stats.orderGrowth}
                    icon={ShoppingCart}
                    trend={parseFloat(stats.orderGrowth) >= 0 ? 'up' : 'down'}
                />
                <StatsCard
                    title="Total Revenue"
                    value={`$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    change={stats.revenueGrowth}
                    icon={DollarSign}
                    trend="up"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6">
                <AreaChart
                    data={chartData.revenueOverTime}
                    dataKeys={[
                        { key: 'revenue', name: 'Revenue ($)' },
                        { key: 'orders', name: 'Orders' }
                    ]}
                    title="Revenue & Orders Over Time (Last 7 Days)"
                    colors={['#8b5cf6', '#ec4899']}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LineChart
                    data={chartData.userActivity}
                    dataKeys={[{ key: 'users', name: 'New Users' }]}
                    title="User Growth (Last 7 Days)"
                    colors={['#8b5cf6']}
                />
                <PieChart
                    data={chartData.ordersByStatus}
                    title="Orders by Status"
                    colors={['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b']}
                />
            </div>

            {/* Tables Section */}
            <div className="grid grid-cols-1 gap-6">
                {/* Recent Users */}
                <div className="card bg-base-200">
                    <div className="card-body">
                        <h2 className="card-title text-2xl mb-4">
                            <Users className="w-6 h-6" />
                            Recent Users
                        </h2>
                        <DataTable
                            columns={userColumns}
                            data={tableData.recentUsers}
                            itemsPerPage={5}
                            emptyMessage="No users found"
                            EmptyIcon={Users}
                        />
                    </div>
                </div>

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

                {/* Late Invoices */}
                <div className="card bg-base-200">
                    <div className="card-body">
                        <h2 className="card-title text-2xl mb-4">
                            <FileText className="w-6 h-6 text-error" />
                            Late Invoices
                        </h2>
                        <DataTable
                            columns={invoiceColumns}
                            data={tableData.lateInvoices}
                            itemsPerPage={5}
                            emptyMessage="No late invoices"
                            EmptyIcon={FileText}
                        />
                    </div>
                </div>

                {/* Pending Shipments */}
                <div className="card bg-base-200">
                    <div className="card-body">
                        <h2 className="card-title text-2xl mb-4">
                            <Truck className="w-6 h-6 text-warning" />
                            Pending Shipments
                        </h2>
                        <DataTable
                            columns={shipmentColumns}
                            data={tableData.pendingShipments}
                            itemsPerPage={5}
                            emptyMessage="No pending shipments"
                            EmptyIcon={Truck}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
