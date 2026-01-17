'use client'

import { useEffect, useState } from 'react'
import { Package, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react'
import { LineChart, AreaChart, PieChart, StatsCard } from '../components/charts/Index'
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth'

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

            // Filter orders that contain seller's products
            const productIds = products.map(p => p.id)
            const sellerOrders = allOrders.filter(order =>
                order.items.some(item => productIds.includes(item.id))
            )

            // Calculate earnings
            const totalEarnings = sellerOrders
                .filter(o => o.paymentStatus === 'completed')
                .reduce((sum, order) => {
                    const sellerItems = order.items.filter(item => productIds.includes(item.id))
                    const orderTotal = sellerItems.reduce((s, item) => s + (item.price * item.quantity), 0)
                    return sum + orderTotal
                }, 0)

            // Generate sales over time (last 7 days)
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

            // Product orders distribution
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

            // Orders by status
            const statusCounts = sellerOrders.reduce((acc, order) => {
                acc[order.status] = (acc[order.status] || 0) + 1
                return acc
            }, {})

            const ordersByStatus = Object.entries(statusCounts).map(([name, value]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                value
            }))

            setStats({
                totalProducts: products.length,
                totalOrders: sellerOrders.length,
                totalEarnings,
                pendingOrders: sellerOrders.filter(o => o.status === 'processing' || o.status === 'pending').length
            })

            setChartData({
                salesOverTime,
                productOrders,
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
        </div>
    )
}
