'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package, TrendingUp, Clock, CheckCircle, Bike, DollarSign, Star, MapPin } from 'lucide-react'
import { StatsCard, LineChart, AreaChart, PieChart } from '@/app/dashboard/components/charts/Index'
import { getCurrentUser } from '@/lib/firebase/auth'
import toast from 'react-hot-toast'

export default function RiderDashboard() {
    const [user, setUser] = useState(null)
    const [userData, setUserData] = useState(null)
    const [stats, setStats] = useState({
        totalDeliveries: 0,
        pendingDeliveries: 0,
        completedToday: 0,
        totalEarnings: 0,
        rating: 0
    })
    const [deliveryData, setDeliveryData] = useState([])
    const [earningsData, setEarningsData] = useState([])
    const [statusData, setStatusData] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const currentUser = getCurrentUser()
        if (currentUser) {
            setUser(currentUser)
            fetchUserData(currentUser.uid)
            fetchRiderStats(currentUser.uid)
        }
    }, [])

    const fetchUserData = async (uid) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/user/${uid}`)
            const data = await response.json()
            if (data.success) {
                setUserData(data.user)
            }
        } catch (error) {
            console.error('Error fetching user data:', error)
        }
    }

    const fetchRiderStats = async (uid) => {
        try {
            // Fetch rider orders
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/rider/${uid}`)
            const data = await response.json()

            if (data.success) {
                const orders = data.orders || []

                // Calculate stats
                const completed = orders.filter(o => o.status === 'delivered').length
                const pending = orders.filter(o => ['assigned', 'collected', 'in_transit', 'out_for_delivery'].includes(o.status)).length

                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const completedToday = orders.filter(o => {
                    const deliveryDate = new Date(o.actualDelivery)
                    return o.status === 'delivered' && deliveryDate >= today
                }).length

                // Calculate earnings (assuming $5 per delivery)
                const earnings = completed * 5

                setStats({
                    totalDeliveries: completed,
                    pendingDeliveries: pending,
                    completedToday: completedToday,
                    totalEarnings: earnings,
                    rating: userData?.riderInfo?.rating || 5.0
                })

                // Prepare chart data
                prepareChartData(orders)
            }
        } catch (error) {
            console.error('Error fetching rider stats:', error)
            toast.error('Failed to load statistics')
        } finally {
            setIsLoading(false)
        }
    }

    const prepareChartData = (orders) => {
        // Delivery trend data (last 7 days)
        const last7Days = []
        const deliveryTrend = []
        const earningsTrend = []

        for (let i = 6; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            date.setHours(0, 0, 0, 0)

            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            last7Days.push(dateStr)

            const deliveriesOnDate = orders.filter(o => {
                const deliveryDate = new Date(o.actualDelivery)
                deliveryDate.setHours(0, 0, 0, 0)
                return o.status === 'delivered' && deliveryDate.getTime() === date.getTime()
            }).length

            deliveryTrend.push(deliveriesOnDate)
            earningsTrend.push(deliveriesOnDate * 5)
        }

        setDeliveryData(last7Days.map((date, index) => ({
            name: date,
            deliveries: deliveryTrend[index]
        })))

        setEarningsData(last7Days.map((date, index) => ({
            name: date,
            earnings: earningsTrend[index]
        })))

        // Status distribution
        const statusCounts = {
            assigned: orders.filter(o => o.status === 'assigned').length,
            collected: orders.filter(o => o.status === 'collected').length,
            in_transit: orders.filter(o => o.status === 'in_transit').length,
            out_for_delivery: orders.filter(o => o.status === 'out_for_delivery').length,
            delivered: orders.filter(o => o.status === 'delivered').length
        }

        setStatusData([
            { name: 'Assigned', value: statusCounts.assigned, fill: '#f59e0b' },
            { name: 'Collected', value: statusCounts.collected, fill: '#3b82f6' },
            { name: 'In Transit', value: statusCounts.in_transit, fill: '#8b5cf6' },
            { name: 'Out for Delivery', value: statusCounts.out_for_delivery, fill: '#06b6d4' },
            { name: 'Delivered', value: statusCounts.delivered, fill: '#10b981' }
        ])
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-base-content/70">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
                        <Bike className="w-8 h-8 text-primary" />
                        Rider Dashboard
                    </h1>
                    <p className="text-base-content/60 mt-1">
                        Welcome back, {userData?.displayName || 'Rider'}! Track your deliveries and earnings.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-success/10 border border-success/20 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-success" />
                            <div>
                                <div className="text-xs text-success/80">Rating</div>
                                <div className="font-bold text-success">{stats.rating.toFixed(1)} ⭐</div>
                            </div>
                        </div>
                    </div>
                    <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Bike className="w-5 h-5 text-primary" />
                            <div>
                                <div className="text-xs text-primary/80">Vehicle</div>
                                <div className="font-bold text-primary capitalize">
                                    {userData?.riderInfo?.vehicleType || 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Deliveries"
                    value={stats.totalDeliveries}
                    icon={Package}
                    trend={{ value: 12, isPositive: true }}
                    color="primary"
                />
                <StatsCard
                    title="Pending Deliveries"
                    value={stats.pendingDeliveries}
                    icon={Clock}
                    color="warning"
                />
                <StatsCard
                    title="Completed Today"
                    value={stats.completedToday}
                    icon={CheckCircle}
                    trend={{ value: 8, isPositive: true }}
                    color="success"
                />
                <StatsCard
                    title="Total Earnings"
                    value={`$${stats.totalEarnings}`}
                    icon={DollarSign}
                    trend={{ value: 15, isPositive: true }}
                    color="accent"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Delivery Trend */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card bg-base-200"
                >
                    <h3 className="text-xl font-bold text-base-content mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Delivery Trend (Last 7 Days)
                    </h3>
                    <LineChart
                        data={deliveryData}
                        dataKey="deliveries"
                        stroke="#7c3aed"
                        height={300}
                    />
                </motion.div>

                {/* Earnings Trend */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card bg-base-200"
                >
                    <h3 className="text-xl font-bold text-base-content mb-6 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-success" />
                        Earnings Trend (Last 7 Days)
                    </h3>
                    <AreaChart
                        data={earningsData}
                        dataKey="earnings"
                        fill="#10b981"
                        stroke="#059669"
                        height={300}
                    />
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Status Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="card bg-base-200 lg:col-span-1"
                >
                    <h3 className="text-xl font-bold text-base-content mb-6">
                        Delivery Status Distribution
                    </h3>
                    <PieChart data={statusData} height={300} />
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="card bg-base-200 lg:col-span-2"
                >
                    <h3 className="text-xl font-bold text-base-content mb-6">Quick Actions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <a
                            href="/dashboard/rider/my-tasks"
                            className="flex items-center gap-4 p-4 bg-primary/10 border-2 border-primary/20 rounded-lg hover:bg-primary/20 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Package className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-base-content">View My Tasks</div>
                                <div className="text-sm text-base-content/60">
                                    {stats.pendingDeliveries} pending deliveries
                                </div>
                            </div>
                        </a>

                        <a
                            href="/dashboard/rider/earnings"
                            className="flex items-center gap-4 p-4 bg-success/10 border-2 border-success/20 rounded-lg hover:bg-success/20 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <DollarSign className="w-6 h-6 text-success" />
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-base-content">View Earnings</div>
                                <div className="text-sm text-base-content/60">
                                    ${stats.totalEarnings} total earned
                                </div>
                            </div>
                        </a>

                        <a
                            href="/dashboard/rider/settings"
                            className="flex items-center gap-4 p-4 bg-info/10 border-2 border-info/20 rounded-lg hover:bg-info/20 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-lg bg-info/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <MapPin className="w-6 h-6 text-info" />
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-base-content">Update Location</div>
                                <div className="text-sm text-base-content/60">Set your availability</div>
                            </div>
                        </a>

                        <a
                            href="/dashboard/rider/history"
                            className="flex items-center gap-4 p-4 bg-warning/10 border-2 border-warning/20 rounded-lg hover:bg-warning/20 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-lg bg-warning/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Clock className="w-6 h-6 text-warning" />
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-base-content">Delivery History</div>
                                <div className="text-sm text-base-content/60">
                                    {stats.totalDeliveries} completed
                                </div>
                            </div>
                        </a>
                    </div>
                </motion.div>
            </div>

            {/* Performance Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="card bg-linear-to-br from-primary/10 to-secondary/10 border-2 border-primary/20"
            >
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Star className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-base-content mb-2">
                            Excellent Performance! 🎉
                        </h3>
                        <p className="text-base-content/70 mb-4">
                            You&apos;ve completed {stats.completedToday} deliveries today and maintained a {stats.rating.toFixed(1)} star rating.
                            Keep up the great work to unlock bonus rewards!
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <div className="px-4 py-2 bg-base-100 rounded-lg">
                                <div className="text-xs text-base-content/60">On-Time Rate</div>
                                <div className="font-bold text-success">98%</div>
                            </div>
                            <div className="px-4 py-2 bg-base-100 rounded-lg">
                                <div className="text-xs text-base-content/60">Customer Satisfaction</div>
                                <div className="font-bold text-primary">{stats.rating.toFixed(1)}/5.0</div>
                            </div>
                            <div className="px-4 py-2 bg-base-100 rounded-lg">
                                <div className="text-xs text-base-content/60">This Week</div>
                                <div className="font-bold text-accent">{stats.completedToday * 7} deliveries</div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
