'use client'

import { useState, useEffect } from 'react'
import { Download, FileText, Users, Package, DollarSign, CreditCard, TrendingUp, Calendar, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminReports() {
    const [loading, setLoading] = useState(false)
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalUsers: 0,
        totalProducts: 0,
        totalRevenue: 0,
        totalTransactions: 0
    })
    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    })

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            // Fetch statistics from your API
            const [ordersRes, usersRes, productsRes, paymentsRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/users`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments`)
            ])

            const orders = await ordersRes.json()
            const users = await usersRes.json()
            const products = await productsRes.json()
            const payments = await paymentsRes.json()

            setStats({
                totalOrders: orders.count || 0,
                totalUsers: users.count || 0,
                totalProducts: products.count || 0,
                totalRevenue: payments.totalRevenue || 0,
                totalTransactions: payments.count || 0
            })
        } catch (error) {
            console.error('Error fetching stats:', error)
        }
    }

    const convertToCSV = (data, headers) => {
        const headerRow = headers.join(',')
        const rows = data.map(row =>
            headers.map(header => {
                const value = row[header] || ''
                return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
            }).join(',')
        )
        return [headerRow, ...rows].join('\n')
    }

    const downloadCSV = (csvContent, filename) => {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const downloadExcel = async (data, headers, filename) => {
        // For Excel, we'll create a simple HTML table that Excel can read
        let htmlContent = '<table><thead><tr>'
        headers.forEach(header => {
            htmlContent += `<th>${header}</th>`
        })
        htmlContent += '</tr></thead><tbody>'

        data.forEach(row => {
            htmlContent += '<tr>'
            headers.forEach(header => {
                htmlContent += `<td>${row[header] || ''}</td>`
            })
            htmlContent += '</tr>'
        })
        htmlContent += '</tbody></table>'

        const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.xls`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const exportOrders = async (format) => {
        setLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`)
            const data = await response.json()

            if (data.success) {
                const headers = ['orderId', 'customerName', 'total', 'status', 'paymentStatus', 'date', 'paymentMethod']
                const exportData = data.orders.map(order => ({
                    orderId: order.orderId,
                    customerName: order.customerName || 'N/A',
                    total: order.total,
                    status: order.status,
                    paymentStatus: order.paymentStatus,
                    date: order.date || order.createdAt,
                    paymentMethod: order.paymentMethod
                }))

                if (format === 'csv') {
                    const csv = convertToCSV(exportData, headers)
                    downloadCSV(csv, 'orders')
                } else {
                    await downloadExcel(exportData, headers, 'orders')
                }
                toast.success(`Orders exported as ${format.toUpperCase()}!`)
            }
        } catch (error) {
            console.error('Export error:', error)
            toast.error('Failed to export orders')
        } finally {
            setLoading(false)
        }
    }

    const exportUsers = async (format) => {
        setLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/users`)
            const data = await response.json()

            if (data.success) {
                const headers = ['uid', 'email', 'displayName', 'role', 'provider', 'createdAt']
                const exportData = data.users.map(user => ({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    role: user.role,
                    provider: user.provider,
                    createdAt: user.createdAt
                }))

                if (format === 'csv') {
                    const csv = convertToCSV(exportData, headers)
                    downloadCSV(csv, 'users')
                } else {
                    await downloadExcel(exportData, headers, 'users')
                }
                toast.success(`Users exported as ${format.toUpperCase()}!`)
            }
        } catch (error) {
            console.error('Export error:', error)
            toast.error('Failed to export users')
        } finally {
            setLoading(false)
        }
    }

    const exportProducts = async (format) => {
        setLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)
            const data = await response.json()

            if (data.success) {
                const headers = ['id', 'name', 'price', 'category', 'stock', 'rating', 'sellerName', 'createdAt']
                const exportData = data.products.map(product => ({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    category: product.category,
                    stock: product.stock,
                    rating: product.rating,
                    sellerName: product.sellerName,
                    createdAt: product.createdAt
                }))

                if (format === 'csv') {
                    const csv = convertToCSV(exportData, headers)
                    downloadCSV(csv, 'products')
                } else {
                    await downloadExcel(exportData, headers, 'products')
                }
                toast.success(`Products exported as ${format.toUpperCase()}!`)
            }
        } catch (error) {
            console.error('Export error:', error)
            toast.error('Failed to export products')
        } finally {
            setLoading(false)
        }
    }

    const exportPayments = async (format) => {
        setLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments`)
            const data = await response.json()

            if (data.success) {
                const headers = ['transactionId', 'orderId', 'amount', 'status', 'paymentMethod', 'currency', 'createdAt']
                const exportData = data.payments.map(payment => ({
                    transactionId: payment.transactionId,
                    orderId: payment.orderId,
                    amount: payment.amount,
                    status: payment.status,
                    paymentMethod: payment.paymentMethod,
                    currency: payment.currency,
                    createdAt: payment.createdAt
                }))

                if (format === 'csv') {
                    const csv = convertToCSV(exportData, headers)
                    downloadCSV(csv, 'payments')
                } else {
                    await downloadExcel(exportData, headers, 'payments')
                }
                toast.success(`Payments exported as ${format.toUpperCase()}!`)
            }
        } catch (error) {
            console.error('Export error:', error)
            toast.error('Failed to export payments')
        } finally {
            setLoading(false)
        }
    }

    const exportTransactions = async (format) => {
        setLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments`)
            const data = await response.json()

            if (data.success) {
                const headers = ['transactionId', 'orderId', 'amount', 'status', 'paymentMethod', 'currency', 'createdAt']
                const exportData = data.payments.map(payment => ({
                    transactionId: payment.transactionId,
                    orderId: payment.orderId,
                    amount: payment.amount,
                    status: payment.status,
                    paymentMethod: payment.paymentMethod,
                    currency: payment.currency,
                    createdAt: payment.createdAt
                }))

                if (format === 'csv') {
                    const csv = convertToCSV(exportData, headers)
                    downloadCSV(csv, 'transactions')
                } else {
                    await downloadExcel(exportData, headers, 'transactions')
                }
                toast.success(`Transactions exported as ${format.toUpperCase()}!`)
            }
        } catch (error) {
            console.error('Export error:', error)
            toast.error('Failed to export transactions')
        } finally {
            setLoading(false)
        }
    }

    const exportCards = [
        {
            title: 'Orders',
            icon: Package,
            count: stats.totalOrders,
            gradient: 'from-blue-500 to-cyan-500',
            exportFn: exportOrders
        },
        {
            title: 'Users',
            icon: Users,
            count: stats.totalUsers,
            gradient: 'from-purple-500 to-pink-500',
            exportFn: exportUsers
        },
        {
            title: 'Products',
            icon: Package,
            count: stats.totalProducts,
            gradient: 'from-green-500 to-emerald-500',
            exportFn: exportProducts
        },
        {
            title: 'Payments',
            icon: CreditCard,
            count: stats.totalTransactions,
            gradient: 'from-orange-500 to-red-500',
            exportFn: exportPayments
        },
        {
            title: 'Transactions',
            icon: DollarSign,
            count: stats.totalTransactions,
            gradient: 'from-yellow-500 to-amber-500',
            exportFn: exportTransactions
        }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-100">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                            <FileText className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                                Reports & Analytics
                            </h1>
                            <p className="text-base-content/70 text-lg mt-2">
                                Export and analyze your business data
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="card bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-xl">
                        <div className="card-body">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white/80 text-sm font-semibold">Total Revenue</p>
                                    <p className="text-3xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                                </div>
                                <DollarSign className="w-12 h-12 text-white/50" />
                            </div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-xl">
                        <div className="card-body">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white/80 text-sm font-semibold">Total Orders</p>
                                    <p className="text-3xl font-bold">{stats.totalOrders}</p>
                                </div>
                                <Package className="w-12 h-12 text-white/50" />
                            </div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-xl">
                        <div className="card-body">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white/80 text-sm font-semibold">Total Users</p>
                                    <p className="text-3xl font-bold">{stats.totalUsers}</p>
                                </div>
                                <Users className="w-12 h-12 text-white/50" />
                            </div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-xl">
                        <div className="card-body">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white/80 text-sm font-semibold">Total Products</p>
                                    <p className="text-3xl font-bold">{stats.totalProducts}</p>
                                </div>
                                <Package className="w-12 h-12 text-white/50" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Date Range Filter */}
                <div className="card bg-base-200 shadow-xl border border-base-300 mb-8">
                    <div className="card-body">
                        <div className="flex items-center gap-3 mb-4">
                            <Calendar className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-bold">Date Range Filter</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <label className="label">
                                    <span className="label-text font-semibold">Start Date</span>
                                </label>
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                    className="input input-bordered w-full"
                                />
                            </div>
                            <div>
                                <label className="label">
                                    <span className="label-text font-semibold">End Date</span>
                                </label>
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                    className="input input-bordered w-full"
                                />
                            </div>
                            <div className="flex items-end">
                                <button className="btn btn-primary w-full gap-2">
                                    <Filter className="w-5 h-5" />
                                    Apply Filter
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Export Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exportCards.map((card) => {
                        const Icon = card.icon
                        return (
                            <div key={card.title} className="card bg-base-200 shadow-xl border border-base-300 hover:shadow-2xl transition-all duration-300">
                                <div className="card-body">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                                            <Icon className="w-7 h-7 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold">{card.title}</h3>
                                            <p className="text-base-content/60">Total: {card.count}</p>
                                        </div>
                                    </div>

                                    <div className="divider my-2"></div>

                                    <div className="space-y-2">
                                        <button
                                            onClick={() => card.exportFn('csv')}
                                            disabled={loading}
                                            className="btn btn-outline btn-primary w-full gap-2"
                                        >
                                            {loading ? (
                                                <span className="loading loading-spinner"></span>
                                            ) : (
                                                <>
                                                    <Download className="w-5 h-5" />
                                                    Export as CSV
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => card.exportFn('excel')}
                                            disabled={loading}
                                            className="btn btn-outline btn-success w-full gap-2"
                                        >
                                            {loading ? (
                                                <span className="loading loading-spinner"></span>
                                            ) : (
                                                <>
                                                    <Download className="w-5 h-5" />
                                                    Export as Excel
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Export All */}
                <div className="card bg-gradient-to-br from-primary to-secondary text-white shadow-xl mt-8">
                    <div className="card-body">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <TrendingUp className="w-12 h-12" />
                                <div>
                                    <h3 className="text-2xl font-bold">Export All Data</h3>
                                    <p className="text-white/80">Download complete dataset in one click</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button className="btn btn-lg bg-white text-primary hover:bg-white/90 gap-2">
                                    <Download className="w-5 h-5" />
                                    Export All (CSV)
                                </button>
                                <button className="btn btn-lg bg-white text-primary hover:bg-white/90 gap-2">
                                    <Download className="w-5 h-5" />
                                    Export All (Excel)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
