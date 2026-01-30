'use client'

import { useState, useEffect } from 'react'
import { 
    Users, 
    TrendingUp, 
    DollarSign, 
    Package, 
    ShoppingCart,
    ArrowUpRight,
    ArrowDownRight,
    Eye,
    MoreVertical
} from 'lucide-react'

// Stats Card Component
export function StatsCard({ title, value, change, icon: Icon, trend, subtitle, onClick }) {
    const isPositive = trend === 'up' || (typeof change === 'string' && !change.startsWith('-'))
    
    return (
        <div 
            className={`bg-base-100 rounded-xl p-6 shadow-sm border border-base-200 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
            onClick={onClick}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-primary/10">
                    <Icon className="w-6 h-6 text-primary" />
                </div>
                {change && (
                    <span className={`flex items-center text-sm font-medium ${isPositive ? 'text-success' : 'text-error'}`}>
                        {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {change}
                    </span>
                )}
            </div>
            <h3 className="text-2xl font-bold mb-1">{value}</h3>
            <p className="text-base-content/60 text-sm">{title}</p>
            {subtitle && <p className="text-xs text-base-content/40 mt-1">{subtitle}</p>}
        </div>
    )
}

// Reseller Performance Card
export function ResellerPerformanceCard({ reseller, onViewDetails }) {
    const performanceScore = Math.min(100, Math.round(
        (reseller.totalSales / 100) + 
        (reseller.activeClients * 5) + 
        (reseller.completedOrders / reseller.totalOrders * 50)
    ))
    
    return (
        <div className="bg-base-100 rounded-xl p-4 shadow-sm border border-base-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                        <div className="bg-primary text-primary-content rounded-full w-10">
                            <span className="text-sm">{reseller.businessName?.charAt(0) || 'R'}</span>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold">{reseller.businessName}</h4>
                        <p className="text-xs text-base-content/60">{reseller.name}</p>
                    </div>
                </div>
                <button 
                    className="btn btn-ghost btn-xs"
                    onClick={() => onViewDetails?.(reseller)}
                >
                    <Eye className="w-4 h-4" />
                </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center">
                    <p className="text-lg font-bold text-primary">KES {reseller.totalRevenue?.toLocaleString() || 0}</p>
                    <p className="text-xs text-base-content/60">Revenue</p>
                </div>
                <div className="text-center">
                    <p className="text-lg font-bold">{reseller.totalOrders || 0}</p>
                    <p className="text-xs text-base-content/60">Orders</p>
                </div>
                <div className="text-center">
                    <p className="text-lg font-bold">{reseller.activeClients || 0}</p>
                    <p className="text-xs text-base-content/60">Clients</p>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <div className="flex-1 bg-base-200 rounded-full h-2">
                    <div 
                        className={`h-2 rounded-full ${performanceScore >= 70 ? 'bg-success' : performanceScore >= 40 ? 'bg-warning' : 'bg-error'}`}
                        style={{ width: `${performanceScore}%` }}
                    />
                </div>
                <span className="text-xs font-medium">{performanceScore}%</span>
            </div>
        </div>
    )
}

// Reseller List Component
export function ResellerList({ resellers = [], onViewReseller, loading }) {
    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse bg-base-200 rounded-xl h-32" />
                ))}
            </div>
        )
    }
    
    if (resellers.length === 0) {
        return (
            <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-base-content/30 mb-3" />
                <p className="text-base-content/60">No resellers found</p>
            </div>
        )
    }
    
    return (
        <div className="space-y-4">
            {resellers.map(reseller => (
                <ResellerPerformanceCard 
                    key={reseller._id} 
                    reseller={reseller}
                    onViewDetails={onViewReseller}
                />
            ))}
        </div>
    )
}

// Top Resellers Table
export function TopResellersTable({ resellers = [], loading }) {
    if (loading) {
        return <div className="animate-pulse bg-base-200 rounded-xl h-64" />
    }
    
    return (
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 overflow-hidden">
            <div className="p-4 border-b border-base-200">
                <h3 className="font-semibold">Top Performing Resellers</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Reseller</th>
                            <th>Location</th>
                            <th>Sales</th>
                            <th>Revenue</th>
                            <th>Commission</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resellers.slice(0, 10).map((reseller, index) => (
                            <tr key={reseller._id} className="hover">
                                <td>
                                    <span className={`badge ${index < 3 ? 'badge-primary' : 'badge-ghost'}`}>
                                        #{index + 1}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="avatar placeholder">
                                            <div className="bg-neutral text-neutral-content rounded-full w-8">
                                                <span className="text-xs">{reseller.businessName?.charAt(0)}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-medium">{reseller.businessName}</p>
                                            <p className="text-xs text-base-content/60">{reseller.name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td>{reseller.location || 'N/A'}</td>
                                <td>{reseller.totalSales || 0} units</td>
                                <td>KES {reseller.totalRevenue?.toLocaleString() || 0}</td>
                                <td>KES {reseller.totalCommission?.toLocaleString() || 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

// Reseller Summary Stats
export function ResellerSummaryStats({ stats, loading }) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="animate-pulse bg-base-200 rounded-xl h-28" />
                ))}
            </div>
        )
    }
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
                title="Total Resellers"
                value={stats?.totalResellers || 0}
                change={stats?.resellerGrowth || '0%'}
                icon={Users}
                trend={parseFloat(stats?.resellerGrowth) >= 0 ? 'up' : 'down'}
                subtitle="Active reseller accounts"
            />
            <StatsCard
                title="Reseller Revenue"
                value={`KES ${(stats?.resellerRevenue || 0).toLocaleString()}`}
                change={stats?.revenueGrowth || '0%'}
                icon={DollarSign}
                trend={parseFloat(stats?.revenueGrowth) >= 0 ? 'up' : 'down'}
                subtitle="Total reseller sales"
            />
            <StatsCard
                title="Cylinders Sold"
                value={(stats?.totalCylindersSold || 0).toLocaleString()}
                change={stats?.salesGrowth || '0%'}
                icon={Package}
                trend={parseFloat(stats?.salesGrowth) >= 0 ? 'up' : 'down'}
                subtitle="Through reseller network"
            />
            <StatsCard
                title="Active Clients"
                value={(stats?.totalClients || 0).toLocaleString()}
                change={stats?.clientGrowth || '0%'}
                icon={ShoppingCart}
                trend={parseFloat(stats?.clientGrowth) >= 0 ? 'up' : 'down'}
                subtitle="Reseller clients"
            />
        </div>
    )
}

export default {
    StatsCard,
    ResellerPerformanceCard,
    ResellerList,
    TopResellersTable,
    ResellerSummaryStats
}
