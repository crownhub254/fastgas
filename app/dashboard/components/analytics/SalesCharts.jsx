'use client'

import { useState, useEffect } from 'react'
import { 
    TrendingUp, 
    Calendar,
    Filter,
    Download,
    RefreshCw
} from 'lucide-react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend,
    LineChart,
    Line
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

// Sales Over Time Chart
export function SalesOverTimeChart({ data = [], loading, title = "Sales Over Time" }) {
    if (loading) {
        return <div className="animate-pulse bg-base-200 rounded-xl h-80" />
    }
    
    return (
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 p-4">
            <h3 className="font-semibold mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-base-300" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: 'hsl(var(--b1))', 
                            border: '1px solid hsl(var(--b3))',
                            borderRadius: '8px'
                        }} 
                    />
                    <Legend />
                    <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3b82f6" 
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                        name="Revenue (KES)"
                    />
                    <Area 
                        type="monotone" 
                        dataKey="orders" 
                        stroke="#10b981" 
                        fillOpacity={1} 
                        fill="url(#colorOrders)" 
                        name="Orders"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

// Cylinder Size Distribution Chart
export function CylinderSizeDistribution({ data = [], loading }) {
    if (loading) {
        return <div className="animate-pulse bg-base-200 rounded-xl h-80" />
    }
    
    return (
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 p-4">
            <h3 className="font-semibold mb-4">Sales by Cylinder Size</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}

// Reseller vs Client Sales Comparison
export function ResellerClientComparison({ data = [], loading }) {
    if (loading) {
        return <div className="animate-pulse bg-base-200 rounded-xl h-80" />
    }
    
    return (
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 p-4">
            <h3 className="font-semibold mb-4">Reseller vs Client Sales</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-base-300" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: 'hsl(var(--b1))', 
                            border: '1px solid hsl(var(--b3))',
                            borderRadius: '8px'
                        }} 
                    />
                    <Legend />
                    <Bar dataKey="reseller" fill="#3b82f6" name="Reseller Sales" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="client" fill="#10b981" name="Direct Client Sales" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

// Regional Sales Map/Chart
export function RegionalSalesChart({ data = [], loading }) {
    if (loading) {
        return <div className="animate-pulse bg-base-200 rounded-xl h-80" />
    }
    
    return (
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 p-4">
            <h3 className="font-semibold mb-4">Sales by Region</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-base-300" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="region" type="category" className="text-xs" width={100} />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: 'hsl(var(--b1))', 
                            border: '1px solid hsl(var(--b3))',
                            borderRadius: '8px'
                        }} 
                    />
                    <Bar dataKey="sales" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

// Revenue Trends Chart
export function RevenueTrendsChart({ data = [], loading }) {
    if (loading) {
        return <div className="animate-pulse bg-base-200 rounded-xl h-80" />
    }
    
    return (
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 p-4">
            <h3 className="font-semibold mb-4">Revenue Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-base-300" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: 'hsl(var(--b1))', 
                            border: '1px solid hsl(var(--b3))',
                            borderRadius: '8px'
                        }} 
                    />
                    <Legend />
                    <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6' }}
                        name="Revenue (KES)"
                    />
                    <Line 
                        type="monotone" 
                        dataKey="commission" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        dot={{ fill: '#f59e0b' }}
                        name="Commission (KES)"
                    />
                    <Line 
                        type="monotone" 
                        dataKey="profit" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={{ fill: '#10b981' }}
                        name="Profit (KES)"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

// Stock Levels Chart
export function StockLevelsChart({ data = [], loading }) {
    if (loading) {
        return <div className="animate-pulse bg-base-200 rounded-xl h-80" />
    }
    
    return (
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 p-4">
            <h3 className="font-semibold mb-4">Stock Levels by Variant</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-base-300" />
                    <XAxis dataKey="size" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: 'hsl(var(--b1))', 
                            border: '1px solid hsl(var(--b3))',
                            borderRadius: '8px'
                        }} 
                    />
                    <Legend />
                    <Bar dataKey="inStock" fill="#10b981" name="In Stock" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="allocated" fill="#f59e0b" name="Allocated" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="lowStock" fill="#ef4444" name="Low Stock Alert" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

// Dashboard Filter Component
export function DashboardFilters({ onFilterChange, onRefresh, onExport }) {
    const [dateRange, setDateRange] = useState('7d')
    const [region, setRegion] = useState('all')
    
    const handleDateChange = (range) => {
        setDateRange(range)
        onFilterChange?.({ dateRange: range, region })
    }
    
    const handleRegionChange = (r) => {
        setRegion(r)
        onFilterChange?.({ dateRange, region: r })
    }
    
    return (
        <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-base-content/60" />
                <select 
                    className="select select-bordered select-sm"
                    value={dateRange}
                    onChange={(e) => handleDateChange(e.target.value)}
                >
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                    <option value="1y">Last Year</option>
                </select>
            </div>
            
            <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-base-content/60" />
                <select 
                    className="select select-bordered select-sm"
                    value={region}
                    onChange={(e) => handleRegionChange(e.target.value)}
                >
                    <option value="all">All Regions</option>
                    <option value="nairobi">Nairobi</option>
                    <option value="mombasa">Mombasa</option>
                    <option value="kisumu">Kisumu</option>
                    <option value="nakuru">Nakuru</option>
                </select>
            </div>
            
            <div className="flex-1" />
            
            <button 
                className="btn btn-ghost btn-sm"
                onClick={onRefresh}
            >
                <RefreshCw className="w-4 h-4" />
                Refresh
            </button>
            
            <button 
                className="btn btn-primary btn-sm"
                onClick={onExport}
            >
                <Download className="w-4 h-4" />
                Export
            </button>
        </div>
    )
}

export default {
    SalesOverTimeChart,
    CylinderSizeDistribution,
    ResellerClientComparison,
    RegionalSalesChart,
    RevenueTrendsChart,
    StockLevelsChart,
    DashboardFilters
}
