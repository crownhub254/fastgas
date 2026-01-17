'use client'

import { useEffect, useState } from 'react'
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { LineChart, AreaChart, PieChart, StatsCard } from '../components/charts/Index'

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

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)

            // Fetch all necessary data in parallel
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


            // Calculate stats
            const users = usersData.users || []
            const products = productsData.products || []
            const orders = ordersData.orders || []
            const payments = paymentsData.payments || []

            // Calculate total revenue
            const totalRevenue = payments
                .filter(p => p.status === 'succeeded')
                .reduce((sum, p) => sum + p.amount, 0)

            // Calculate growth rates (compare last 30 days vs previous 30 days)
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

            // Generate user activity chart data (last 7 days)
            const userActivity = []
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                const newUsers = users.filter(u => {
                    const uDate = new Date(u.createdAt)
                    return uDate.toDateString() === date.toDateString()
                }).length

                userActivity.push({
                    name: dateStr,
                    users: newUsers
                })
            }

            // Generate revenue over time chart (last 7 days)
            const revenueOverTime = []
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                const dayRevenue = payments.filter(p => {
                    const pDate = new Date(p.createdAt)
                    return pDate.toDateString() === date.toDateString() && p.status === 'succeeded'
                }).reduce((sum, p) => sum + p.amount, 0)

                const dayOrders = orders.filter(o => {
                    const oDate = new Date(o.createdAt)
                    return oDate.toDateString() === date.toDateString()
                }).length

                revenueOverTime.push({
                    name: dateStr,
                    revenue: dayRevenue,
                    orders: dayOrders
                })
            }

            // Generate orders by status pie chart
            const statusCounts = orders.reduce((acc, order) => {
                const status = order.status || 'pending'
                acc[status] = (acc[status] || 0) + 1
                return acc
            }, {})

            const ordersByStatus = Object.entries(statusCounts).map(([name, value]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                value
            }))

            setStats({
                totalUsers: users.length,
                totalProducts: products.length,
                totalOrders: orders.length,
                totalRevenue: totalRevenue,
                userGrowth: `${userGrowth}%`,
                productGrowth: '0%',
                orderGrowth: `${orderGrowth}%`,
                revenueGrowth: '0%'
            })

            setChartData({
                userActivity,
                revenueOverTime,
                ordersByStatus
            })
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-base-content/70">Loading dashboard...</p>
                </div>
            </div>
        )
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

            {/* Charts Row 1 */}
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

            {/* Charts Row 2 */}
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
        </div>
    )
}
