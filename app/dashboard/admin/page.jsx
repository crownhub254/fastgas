'use client'

import { useEffect, useState } from 'react'
import { Users, Package, ShoppingCart, Truck, TrendingUp, ArrowUpRight, ArrowDownRight, Flame, MapPin, AlertTriangle, Box, Warehouse, BarChart3 } from 'lucide-react'
import Link from 'next/link'

// Demo data for FastGas Admin Dashboard - Stock Focused
const DEMO_STATS = {
    totalStock: 2450,
    lowStockItems: 3,
    outOfStock: 1,
    pendingRestocks: 5,
    totalDistributors: 12,
    activeDeliveries: 8,
    stockGrowth: 12.5,
    distributorGrowth: 8.3
}

// Stock levels by product
const DEMO_STOCK_BY_PRODUCT = [
    { name: '670g Cylinder', inStock: 850, allocated: 120, available: 730, minLevel: 200, status: 'good' },
    { name: 'Pressure Regulator', inStock: 45, allocated: 15, available: 30, minLevel: 50, status: 'low' },
    { name: 'FastGas Creamer', inStock: 180, allocated: 40, available: 140, minLevel: 100, status: 'good' },
    { name: 'Cream Syphon', inStock: 12, allocated: 5, available: 7, minLevel: 25, status: 'critical' }
]

// Stock by distributor/location
const DEMO_DISTRIBUTOR_STOCK = [
    { id: 1, name: 'Nairobi Central Hub', location: 'Nairobi CBD', cylinders: 320, regulators: 45, creamers: 85, syphons: 20, lastRestock: '2026-01-28' },
    { id: 2, name: 'Mombasa Warehouse', location: 'Mombasa', cylinders: 180, regulators: 30, creamers: 45, syphons: 12, lastRestock: '2026-01-25' },
    { id: 3, name: 'Kisumu Distribution', location: 'Kisumu', cylinders: 150, regulators: 25, creamers: 30, syphons: 8, lastRestock: '2026-01-27' },
    { id: 4, name: 'Nakuru Depot', location: 'Nakuru', cylinders: 120, regulators: 18, creamers: 25, syphons: 5, lastRestock: '2026-01-24' },
    { id: 5, name: 'Eldoret Store', location: 'Eldoret', cylinders: 80, regulators: 12, creamers: 15, syphons: 3, lastRestock: '2026-01-26' }
]

// Recent stock movements
const DEMO_STOCK_MOVEMENTS = [
    { id: 'MOV-001', type: 'in', product: '670g Cylinder', qty: 100, from: 'Main Warehouse', to: 'Nairobi Central Hub', date: '2026-01-30' },
    { id: 'MOV-002', type: 'out', product: 'Pressure Regulator', qty: 15, from: 'Nairobi Central Hub', to: 'Customer Order', date: '2026-01-30' },
    { id: 'MOV-003', type: 'in', product: 'FastGas Creamer', qty: 50, from: 'Supplier', to: 'Main Warehouse', date: '2026-01-29' },
    { id: 'MOV-004', type: 'transfer', product: '670g Cylinder', qty: 30, from: 'Nairobi Central Hub', to: 'Mombasa Warehouse', date: '2026-01-29' },
    { id: 'MOV-005', type: 'out', product: 'Cream Syphon', qty: 5, from: 'Mombasa Warehouse', to: 'Customer Order', date: '2026-01-28' }
]

// Pending restocks
const DEMO_PENDING_RESTOCKS = [
    { product: 'Pressure Regulator', currentStock: 45, targetStock: 150, eta: '2026-02-02', status: 'ordered' },
    { product: 'Cream Syphon', currentStock: 12, targetStock: 50, eta: '2026-02-01', status: 'shipping' },
    { product: '670g Cylinder', currentStock: 850, targetStock: 1200, eta: '2026-02-05', status: 'pending' }
]

function StatsCard({ title, value, change, icon: Icon, trend, variant = 'default' }) {
    const isPositive = trend === 'up'
    const variantStyles = {
        default: 'bg-base-100 border-base-200',
        warning: 'bg-warning/10 border-warning/30',
        error: 'bg-error/10 border-error/30',
        success: 'bg-success/10 border-success/30'
    }
    return (
        <div className={`rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow ${variantStyles[variant]}`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${variant === 'default' ? 'bg-primary/10' : variant === 'warning' ? 'bg-warning/20' : variant === 'error' ? 'bg-error/20' : 'bg-success/20'}`}>
                    <Icon className={`w-6 h-6 ${variant === 'default' ? 'text-primary' : variant === 'warning' ? 'text-warning' : variant === 'error' ? 'text-error' : 'text-success'}`} />
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

function StockLevelBar({ current, min, max = 500 }) {
    const percentage = Math.min((current / max) * 100, 100)
    const isLow = current <= min
    const isCritical = current <= min * 0.5
    
    return (
        <div className="w-full">
            <div className="h-3 bg-base-200 rounded-full overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all duration-500 ${isCritical ? 'bg-error' : isLow ? 'bg-warning' : 'bg-success'}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="flex justify-between text-xs mt-1 text-base-content/60">
                <span>{current} units</span>
                <span>Min: {min}</span>
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
                        <Warehouse className="w-8 h-8 text-primary" />
                        Stock Management Dashboard
                    </h1>
                    <p className="text-base-content/70">Monitor inventory levels across all distributors</p>
                </div>
                <div className="badge badge-warning badge-lg">Demo Mode</div>
            </div>

            {/* Stock Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard title="Total Stock Units" value={DEMO_STATS.totalStock.toLocaleString()} change={DEMO_STATS.stockGrowth} icon={Package} trend="up" variant="success" />
                <StatsCard title="Low Stock Items" value={DEMO_STATS.lowStockItems} icon={AlertTriangle} variant="warning" />
                <StatsCard title="Out of Stock" value={DEMO_STATS.outOfStock} icon={Box} variant="error" />
                <StatsCard title="Active Distributors" value={DEMO_STATS.totalDistributors} change={DEMO_STATS.distributorGrowth} icon={Truck} trend="up" />
            </div>

            {/* Critical Alerts */}
            {DEMO_STOCK_BY_PRODUCT.filter(p => p.status === 'critical' || p.status === 'low').length > 0 && (
                <div className="alert alert-warning shadow-lg">
                    <AlertTriangle className="w-6 h-6" />
                    <div className="flex-1">
                        <h3 className="font-bold">Stock Alert!</h3>
                        <div className="text-sm">
                            {DEMO_STOCK_BY_PRODUCT.filter(p => p.status === 'critical' || p.status === 'low').map((item, i, arr) => (
                                <span key={item.name} className={item.status === 'critical' ? 'text-error font-semibold' : ''}>
                                    {item.name}: {item.available} available ({item.status}){i < arr.length - 1 ? ' | ' : ''}
                                </span>
                            ))}
                        </div>
                    </div>
                    <Link href="/dashboard/admin/inventory" className="btn btn-sm">Manage Stock</Link>
                </div>
            )}

            {/* Stock by Product */}
            <div className="bg-base-100 rounded-xl p-6 shadow-sm border border-base-200">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Stock Levels by Product
                </h3>
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>In Stock</th>
                                <th>Allocated</th>
                                <th>Available</th>
                                <th>Stock Level</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {DEMO_STOCK_BY_PRODUCT.map((product) => (
                                <tr key={product.name}>
                                    <td className="font-medium">{product.name}</td>
                                    <td>{product.inStock}</td>
                                    <td className="text-warning">{product.allocated}</td>
                                    <td className="font-bold">{product.available}</td>
                                    <td className="w-48">
                                        <StockLevelBar current={product.available} min={product.minLevel} />
                                    </td>
                                    <td>
                                        <span className={`badge badge-sm ${product.status === 'good' ? 'badge-success' : product.status === 'low' ? 'badge-warning' : 'badge-error'}`}>
                                            {product.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Distributor Stock Levels */}
            <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 overflow-hidden">
                <div className="p-4 border-b border-base-200 flex justify-between items-center">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Truck className="w-5 h-5 text-primary" />
                        Distributor Stock Levels
                    </h3>
                    <Link href="/dashboard/admin/resellers" className="btn btn-ghost btn-sm">View All</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Distributor</th>
                                <th>Location</th>
                                <th>670g Cylinders</th>
                                <th>Regulators</th>
                                <th>Creamers</th>
                                <th>Syphons</th>
                                <th>Last Restock</th>
                            </tr>
                        </thead>
                        <tbody>
                            {DEMO_DISTRIBUTOR_STOCK.map((dist) => (
                                <tr key={dist.id}>
                                    <td>
                                        <div>
                                            <p className="font-medium">{dist.name}</p>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {dist.location}
                                        </span>
                                    </td>
                                    <td className={dist.cylinders < 100 ? 'text-warning font-semibold' : ''}>{dist.cylinders}</td>
                                    <td className={dist.regulators < 20 ? 'text-warning font-semibold' : ''}>{dist.regulators}</td>
                                    <td className={dist.creamers < 30 ? 'text-warning font-semibold' : ''}>{dist.creamers}</td>
                                    <td className={dist.syphons < 10 ? 'text-error font-semibold' : ''}>{dist.syphons}</td>
                                    <td className="text-base-content/60">{dist.lastRestock}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Stock Movements */}
                <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 overflow-hidden">
                    <div className="p-4 border-b border-base-200">
                        <h3 className="font-semibold flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Recent Stock Movements
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="table table-sm">
                            <thead>
                                <tr><th>ID</th><th>Type</th><th>Product</th><th>Qty</th><th>Details</th></tr>
                            </thead>
                            <tbody>
                                {DEMO_STOCK_MOVEMENTS.map((mov) => (
                                    <tr key={mov.id}>
                                        <td className="font-medium">{mov.id}</td>
                                        <td>
                                            <span className={`badge badge-sm ${mov.type === 'in' ? 'badge-success' : mov.type === 'out' ? 'badge-error' : 'badge-info'}`}>
                                                {mov.type}
                                            </span>
                                        </td>
                                        <td>{mov.product}</td>
                                        <td className={mov.type === 'in' ? 'text-success' : 'text-error'}>
                                            {mov.type === 'in' ? '+' : '-'}{mov.qty}
                                        </td>
                                        <td className="text-xs text-base-content/60">{mov.from} → {mov.to}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pending Restocks */}
                <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 overflow-hidden">
                    <div className="p-4 border-b border-base-200">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            Pending Restocks
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="table table-sm">
                            <thead>
                                <tr><th>Product</th><th>Current</th><th>Target</th><th>ETA</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                                {DEMO_PENDING_RESTOCKS.map((restock, i) => (
                                    <tr key={i}>
                                        <td className="font-medium">{restock.product}</td>
                                        <td className={restock.currentStock < restock.targetStock * 0.3 ? 'text-error font-semibold' : ''}>{restock.currentStock}</td>
                                        <td>{restock.targetStock}</td>
                                        <td>{restock.eta}</td>
                                        <td>
                                            <span className={`badge badge-sm ${restock.status === 'shipping' ? 'badge-success' : restock.status === 'ordered' ? 'badge-info' : 'badge-ghost'}`}>
                                                {restock.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/dashboard/admin/inventory" className="btn btn-outline btn-primary"><Package className="w-4 h-4" />Manage Inventory</Link>
                <Link href="/dashboard/admin/orders" className="btn btn-outline btn-secondary"><ShoppingCart className="w-4 h-4" />View Orders</Link>
                <Link href="/dashboard/admin/resellers" className="btn btn-outline btn-accent"><Users className="w-4 h-4" />Distributors</Link>
                <Link href="/dashboard/admin/reports" className="btn btn-outline"><BarChart3 className="w-4 h-4" />Stock Reports</Link>
            </div>
        </div>
    )
}
