'use client'

import { useEffect, useState } from 'react'
import { Users, Package, ShoppingCart, DollarSign, Truck, TrendingUp, ArrowUpRight, ArrowDownRight, Flame, MapPin } from 'lucide-react'
import Link from 'next/link'

// Demo data for FastGas Admin Dashboard
const DEMO_STATS = {
    totalUsers: 1247,
    totalResellers: 34,
    totalOrders: 856,
    totalRevenue: 2847500,
    cylindersSold: 1423,
    activeDeliveries: 12,
    userGrowth: 12.5,
    orderGrowth: 8.3,
    revenueGrowth: 15.2
}

const DEMO_CHART_DATA = {
    revenueOverTime: [
        { name: 'Mon', revenue: 245000, orders: 45 },
        { name: 'Tue', revenue: 312000, orders: 52 },
        { name: 'Wed', revenue: 287000, orders: 48 },
        { name: 'Thu', revenue: 398000, orders: 67 },
        { name: 'Fri', revenue: 425000, orders: 72 },
        { name: 'Sat', revenue: 534000, orders: 89 },
        { name: 'Sun', revenue: 378000, orders: 63 }
    ],
    ordersByStatus: [
        { name: 'Delivered', value: 423, color: '#22c55e' },
        { name: 'Processing', value: 156, color: '#eab308' },
        { name: 'Pending', value: 89, color: '#3b82f6' },
        { name: 'Shipped', value: 134, color: '#8b5cf6' },
        { name: 'Cancelled', value: 54, color: '#ef4444' }
    ],
    cylinderSales: [
        { size: '6kg', sold: 423, revenue: 634500 },
        { size: '13kg', sold: 567, revenue: 1587600 },
        { size: '25kg', sold: 298, revenue: 1549600 },
        { size: '50kg', sold: 135, revenue: 1282500 }
    ]
}

const DEMO_RECENT_ORDERS = [
    { id: 'ORD-001', customer: 'John Mwangi', variant: '13kg', qty: 2, total: 5600, status: 'delivered', date: '2026-01-30' },
    { id: 'ORD-002', customer: 'Mary Wanjiku', variant: '6kg', qty: 1, total: 1500, status: 'processing', date: '2026-01-30' },
    { id: 'ORD-003', customer: 'Peter Ochieng', variant: '25kg', qty: 1, total: 5200, status: 'shipped', date: '2026-01-29' },
    { id: 'ORD-004', customer: 'Grace Akinyi', variant: '50kg', qty: 2, total: 19000, status: 'pending', date: '2026-01-29' },
    { id: 'ORD-005', customer: 'David Kimani', variant: '13kg', qty: 3, total: 8400, status: 'delivered', date: '2026-01-28' }
]

const DEMO_RESELLERS = [
    { id: 1, name: 'Nairobi Gas Supplies', owner: 'James Kamau', region: 'Nairobi', orders: 145, revenue: 812000, status: 'active' },
    { id: 2, name: 'Mombasa LPG Hub', owner: 'Fatuma Hassan', region: 'Mombasa', orders: 98, revenue: 567000, status: 'active' },
    { id: 3, name: 'Kisumu Gas Center', owner: 'Otieno Odhiambo', region: 'Kisumu', orders: 67, revenue: 378000, status: 'active' },
    { id: 4, name: 'Nakuru Energy', owner: 'Alice Njeri', region: 'Nakuru', orders: 54, revenue: 298000, status: 'pending' }
]

const DEMO_LOW_STOCK = [
    { variant: '50kg', current: 8, minimum: 20, status: 'critical' },
    { variant: '25kg', current: 15, minimum: 30, status: 'low' }
]

function StatsCard({ title, value, change, icon: Icon, trend }) {
    const isPositive = trend === 'up'
    return (
        <div className="bg-base-100 rounded-xl p-6 shadow-sm border border-base-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-primary/10">
                    <Icon className="w-6 h-6 text-primary" />
                </div>
                {change && (
                    <span className={`flex items-center text-sm font-medium ${isPositive ? 'text-success' : 'text-error'}`}>
                        {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {change}%
                    </span>
                )}
            </div>
            <h3 className="text-2xl font-bold mb-1">{value}</h3>
            <p className="text-base-content/60 text-sm">{title}</p>
        </div>
    )
}

function SimpleBarChart({ data, title }) {
    const maxValue = Math.max(...data.map(d => d.revenue))
    return (
        <div className="bg-base-100 rounded-xl p-6 shadow-sm border border-base-200">
            <h3 className="font-semibold mb-4">{title}</h3>
            <div className="space-y-3">
                {data.map((item, index) => (
                    <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span>{item.name}</span>
                            <span className="font-medium">KES {(item.revenue / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="h-2 bg-base-200 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                                style={{ width: `${(item.revenue / maxValue) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function CylinderSalesCard({ data }) {
    const total = data.reduce((sum, d) => sum + d.sold, 0)
    return (
        <div className="bg-base-100 rounded-xl p-6 shadow-sm border border-base-200">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Cylinder Sales by Size
            </h3>
            <div className="grid grid-cols-2 gap-4">
                {data.map((item) => (
                    <div key={item.size} className="text-center p-4 bg-base-200 rounded-lg">
                        <div className="text-3xl mb-2">🔥</div>
                        <p className="font-bold text-lg">{item.size}</p>
                        <p className="text-2xl font-bold text-primary">{item.sold}</p>
                        <p className="text-xs text-base-content/60">units sold</p>
                        <p className="text-sm font-medium text-success mt-1">KES {(item.revenue / 1000).toFixed(0)}K</p>
                    </div>
                ))}
            </div>
            <div className="mt-4 pt-4 border-t border-base-200 text-center">
                <p className="text-sm text-base-content/60">Total Cylinders Sold</p>
                <p className="text-3xl font-bold text-primary">{total.toLocaleString()}</p>
            </div>
        </div>
    )
}

export default function AdminDashboard() {
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                        <Flame className="w-8 h-8 text-orange-500" />
                        FastGas Admin Dashboard
                    </h1>
                    <p className="text-base-content/70">Overview of your LPG distribution business</p>
                </div>
                <div className="badge badge-warning badge-lg">Demo Mode</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard title="Total Customers" value={DEMO_STATS.totalUsers.toLocaleString()} change={DEMO_STATS.userGrowth} icon={Users} trend="up" />
                <StatsCard title="Active Resellers" value={DEMO_STATS.totalResellers} icon={Users} trend="up" change={5.2} />
                <StatsCard title="Total Orders" value={DEMO_STATS.totalOrders.toLocaleString()} change={DEMO_STATS.orderGrowth} icon={ShoppingCart} trend="up" />
                <StatsCard title="Total Revenue" value={`KES ${(DEMO_STATS.totalRevenue / 1000000).toFixed(2)}M`} change={DEMO_STATS.revenueGrowth} icon={DollarSign} trend="up" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/80 text-sm">Cylinders Sold</p>
                            <p className="text-3xl font-bold">{DEMO_STATS.cylindersSold.toLocaleString()}</p>
                        </div>
                        <Flame className="w-12 h-12 text-white/30" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/80 text-sm">Active Deliveries</p>
                            <p className="text-3xl font-bold">{DEMO_STATS.activeDeliveries}</p>
                        </div>
                        <Truck className="w-12 h-12 text-white/30" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/80 text-sm">Avg. Order Value</p>
                            <p className="text-3xl font-bold">KES {Math.round(DEMO_STATS.totalRevenue / DEMO_STATS.totalOrders).toLocaleString()}</p>
                        </div>
                        <TrendingUp className="w-12 h-12 text-white/30" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SimpleBarChart data={DEMO_CHART_DATA.revenueOverTime} title="Revenue This Week" />
                <CylinderSalesCard data={DEMO_CHART_DATA.cylinderSales} />
            </div>

            {DEMO_LOW_STOCK.length > 0 && (
                <div className="alert alert-warning">
                    <Package className="w-6 h-6" />
                    <div>
                        <h3 className="font-bold">Low Stock Alert!</h3>
                        <div className="text-sm">
                            {DEMO_LOW_STOCK.map((item, i) => (
                                <span key={item.variant}>{item.variant}: {item.current} units remaining{i < DEMO_LOW_STOCK.length - 1 ? ' | ' : ''}</span>
                            ))}
                        </div>
                    </div>
                    <Link href="/dashboard/admin/inventory" className="btn btn-sm">View Inventory</Link>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 overflow-hidden">
                    <div className="p-4 border-b border-base-200 flex justify-between items-center">
                        <h3 className="font-semibold flex items-center gap-2"><ShoppingCart className="w-5 h-5" />Recent Orders</h3>
                        <Link href="/dashboard/admin/orders" className="btn btn-ghost btn-sm">View All</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="table table-sm">
                            <thead><tr><th>Order</th><th>Customer</th><th>Variant</th><th>Total</th><th>Status</th></tr></thead>
                            <tbody>
                                {DEMO_RECENT_ORDERS.map((order) => (
                                    <tr key={order.id}>
                                        <td className="font-medium">{order.id}</td>
                                        <td>{order.customer}</td>
                                        <td>{order.variant} × {order.qty}</td>
                                        <td>KES {order.total.toLocaleString()}</td>
                                        <td><span className={`badge badge-sm ${order.status === 'delivered' ? 'badge-success' : order.status === 'shipped' ? 'badge-info' : order.status === 'processing' ? 'badge-warning' : 'badge-ghost'}`}>{order.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 overflow-hidden">
                    <div className="p-4 border-b border-base-200 flex justify-between items-center">
                        <h3 className="font-semibold flex items-center gap-2"><Users className="w-5 h-5" />Top Resellers</h3>
                        <Link href="/dashboard/admin/resellers" className="btn btn-ghost btn-sm">View All</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="table table-sm">
                            <thead><tr><th>Business</th><th>Region</th><th>Orders</th><th>Revenue</th><th>Status</th></tr></thead>
                            <tbody>
                                {DEMO_RESELLERS.map((reseller) => (
                                    <tr key={reseller.id}>
                                        <td><div><p className="font-medium">{reseller.name}</p><p className="text-xs text-base-content/60">{reseller.owner}</p></div></td>
                                        <td><span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{reseller.region}</span></td>
                                        <td>{reseller.orders}</td>
                                        <td>KES {(reseller.revenue / 1000).toFixed(0)}K</td>
                                        <td><span className={`badge badge-sm ${reseller.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{reseller.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="bg-base-100 rounded-xl p-6 shadow-sm border border-base-200">
                <h3 className="font-semibold mb-4">Order Status Distribution</h3>
                <div className="flex flex-wrap gap-4">
                    {DEMO_CHART_DATA.ordersByStatus.map((status) => (
                        <div key={status.name} className="flex items-center gap-3 bg-base-200 rounded-lg px-4 py-3">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: status.color }} />
                            <div><p className="text-sm text-base-content/60">{status.name}</p><p className="font-bold text-lg">{status.value}</p></div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/dashboard/admin/orders" className="btn btn-outline btn-primary"><ShoppingCart className="w-4 h-4" />Manage Orders</Link>
                <Link href="/dashboard/admin/resellers" className="btn btn-outline btn-secondary"><Users className="w-4 h-4" />Manage Resellers</Link>
                <Link href="/dashboard/admin/inventory" className="btn btn-outline btn-accent"><Package className="w-4 h-4" />Inventory</Link>
                <Link href="/dashboard/admin/users" className="btn btn-outline"><Users className="w-4 h-4" />All Users</Link>
            </div>
        </div>
    )
}
