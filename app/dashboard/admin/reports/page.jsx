'use client'

import { useState, useEffect } from 'react'
import { Download, FileText, Users, Package, DollarSign, CreditCard, TrendingUp, Calendar, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import Loading from '../../loading'

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
            const [ordersRes, usersRes, productsRes, paymentsRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/users`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments`)
            ])

            const ordersData = await ordersRes.json()
            const usersData = await usersRes.json()
            const productsData = await productsRes.json()
            const paymentsData = await paymentsRes.json()

            const orders = ordersData.orders || []
            const users = usersData.users || []
            const products = productsData.products || []
            const payments = paymentsData.payments || []

            const totalRevenue = payments
                .filter(p => p.status === 'succeeded')
                .reduce((sum, p) => sum + p.amount, 0)

            setStats({
                totalOrders: orders.length,
                totalUsers: users.length,
                totalProducts: products.length,
                totalRevenue: totalRevenue,
                totalTransactions: payments.length
            })
        } catch (error) {
            console.error('Error fetching stats:', error)
        }
    }

    // Format date from ISO to readable format
    const formatDate = (isoDate) => {
        if (!isoDate) return 'N/A'
        const date = new Date(isoDate)
        const dateStr = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        })
        const timeStr = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
        return `${dateStr}, ${timeStr}`
    }

    // Convert camelCase to Title Case
    const toTitleCase = (str) => {
        return str
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (s) => s.toUpperCase())
            .trim()
    }

    // Fetch user data by UID
    const fetchUserByUid = async (uid) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/user/${uid}`)
            const data = await response.json()
            return data.success ? data.user : null
        } catch (error) {
            console.error('Error fetching user:', error)
            return null
        }
    }

    const convertToCSV = (data, headers) => {
        const headerRow = headers.map(h => toTitleCase(h)).join(',')
        const rows = data.map(row =>
            headers.map(header => {
                let value = row[header] || 'N/A'
                // Escape commas, quotes, and newlines
                if (typeof value === 'string') {
                    // Replace newlines with spaces
                    value = value.replace(/\n/g, ' ')
                    // Wrap in quotes if contains comma, quote, or newline
                    if (value.includes(',') || value.includes('"')) {
                        value = `"${value.replace(/"/g, '""')}"`
                    }
                }
                return value
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
        // Create properly formatted Excel HTML with styling
        let htmlContent = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
    <meta charset="utf-8">
    <xml>
        <x:ExcelWorkbook>
            <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                    <x:Name>${filename}</x:Name>
                    <x:WorksheetOptions>
                        <x:DisplayGridlines/>
                        <x:Print>
                            <x:ValidPrinterInfo/>
                        </x:Print>
                    </x:WorksheetOptions>
                </x:ExcelWorksheet>
            </x:ExcelWorksheets>
        </x:ExcelWorkbook>
    </xml>
    <style>
        table {
            border-collapse: collapse;
            width: 100%;
            font-family: 'Segoe UI', Arial, sans-serif;
        }
        th {
            background-color: #4F46E5;
            color: white;
            font-weight: bold;
            padding: 14px 20px;
            text-align: left;
            border: 2px solid #3730A3;
            font-size: 13px;
            white-space: nowrap;
        }
        td {
            padding: 12px 20px;
            border: 1px solid #d1d5db;
            font-size: 12px;
            vertical-align: top;
        }
        tr:nth-child(even) {
            background-color: #f9fafb;
        }
        tr:hover {
            background-color: #f3f4f6;
        }
        .number {
            text-align: right;
        }
    </style>
</head>
<body>
    <table>
        <thead>
            <tr>`

        headers.forEach(header => {
            htmlContent += `<th>${toTitleCase(header)}</th>`
        })
        htmlContent += '</tr></thead><tbody>'

        data.forEach(row => {
            htmlContent += '<tr>'
            headers.forEach(header => {
                const value = row[header] || 'N/A'
                const isNumber = typeof value === 'string' && (value.startsWith('$') || !isNaN(value))
                htmlContent += `<td class="${isNumber ? 'number' : ''}">${value}</td>`
            })
            htmlContent += '</tr>'
        })
        htmlContent += '</tbody></table></body></html>'

        const blob = new Blob([htmlContent], {
            type: 'application/vnd.ms-excel;charset=utf-8'
        })
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
                // Fetch user details for each order
                const ordersWithUserData = await Promise.all(
                    data.orders.map(async (order) => {
                        const user = await fetchUserByUid(order.userId)

                        // Get product details from items
                        const productNames = order.items?.map(item => item.name).join('; ') || 'N/A'
                        const productQuantities = order.items?.map(item => `${item.name} (x${item.quantity})`).join('; ') || 'N/A'

                        return {
                            orderId: order.orderId,
                            customerName: user?.displayName || 'N/A',
                            customerEmail: user?.email || 'N/A',
                            customerPhone: user?.phoneNumber || 'N/A',
                            products: productNames,
                            quantities: productQuantities,
                            itemsCount: order.items?.length || 0,
                            subtotal: `$${order.subtotal?.toFixed(2) || '0.00'}`,
                            shipping: `$${order.shipping?.toFixed(2) || '0.00'}`,
                            tax: `$${order.tax?.toFixed(2) || '0.00'}`,
                            total: `$${order.total?.toFixed(2) || '0.00'}`,
                            paymentMethod: order.paymentMethod || 'N/A',
                            paymentStatus: order.paymentStatus || 'N/A',
                            orderStatus: order.status || 'N/A',
                            street: order.shippingAddress?.street || 'N/A',
                            city: order.shippingAddress?.city || 'N/A',
                            district: order.shippingAddress?.district || 'N/A',
                            division: order.shippingAddress?.division || 'N/A',
                            zipCode: order.shippingAddress?.zipCode || 'N/A',
                            country: order.shippingAddress?.country || 'N/A',
                            fullAddress: `${order.shippingAddress?.street || ''}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.district || ''}, ${order.shippingAddress?.division || ''} - ${order.shippingAddress?.zipCode || ''}, ${order.shippingAddress?.country || ''}`.trim(),
                            orderDate: formatDate(order.createdAt),
                            lastUpdated: formatDate(order.updatedAt)
                        }
                    })
                )

                const headers = ['orderId', 'customerName', 'customerEmail', 'customerPhone', 'products', 'quantities', 'itemsCount', 'subtotal', 'shipping', 'tax', 'total', 'paymentMethod', 'paymentStatus', 'orderStatus', 'street', 'city', 'district', 'division', 'zipCode', 'country', 'fullAddress', 'orderDate', 'lastUpdated']

                if (format === 'csv') {
                    const csv = convertToCSV(ordersWithUserData, headers)
                    downloadCSV(csv, 'orders_report')
                } else {
                    await downloadExcel(ordersWithUserData, headers, 'orders_report')
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
                const headers = ['userId', 'displayName', 'email', 'phoneNumber', 'role', 'provider', 'photoURL', 'accountCreated', 'lastUpdated', 'accountAge']
                const exportData = data.users.map(user => {
                    const createdDate = new Date(user.createdAt)
                    const now = new Date()
                    const daysSinceCreation = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24))

                    return {
                        userId: user.uid || 'N/A',
                        displayName: user.displayName || 'N/A',
                        email: user.email || 'N/A',
                        phoneNumber: user.phoneNumber || 'N/A',
                        role: user.role || 'user',
                        provider: user.provider || 'N/A',
                        photoURL: user.photoURL || 'N/A',
                        accountCreated: formatDate(user.createdAt),
                        lastUpdated: formatDate(user.updatedAt),
                        accountAge: `${daysSinceCreation} days`
                    }
                })

                if (format === 'csv') {
                    const csv = convertToCSV(exportData, headers)
                    downloadCSV(csv, 'users_report')
                } else {
                    await downloadExcel(exportData, headers, 'users_report')
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
                const headers = ['productId', 'productName', 'category', 'price', 'stock', 'stockStatus', 'rating', 'reviewsCount', 'dateAdded', 'lastUpdated']
                const exportData = data.products.map(product => {
                    // Get stock status
                    const stock = product.stock || 0
                    let stockStatus = 'Out of Stock'
                    if (stock > 50) stockStatus = 'In Stock'
                    else if (stock > 10) stockStatus = 'Low Stock'
                    else if (stock > 0) stockStatus = 'Very Low Stock'


                    return {
                        productId: product.id || product._id || 'N/A',
                        productName: product.name || 'N/A',
                        category: product.category || 'N/A',
                        price: `$${product.price?.toFixed(2) || '0.00'}`,
                        stock: stock,
                        stockStatus: stockStatus,
                        rating: product.rating?.toFixed(1) || '0.0',
                        reviewsCount: product.reviews?.length || 0,
                        dateAdded: formatDate(product.createdAt),
                        lastUpdated: formatDate(product.updatedAt)
                    }
                })

                if (format === 'csv') {
                    const csv = convertToCSV(exportData, headers)
                    downloadCSV(csv, 'products_report')
                } else {
                    await downloadExcel(exportData, headers, 'products_report')
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
            const [paymentsRes, ordersRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`)
            ])

            const paymentsData = await paymentsRes.json()
            const ordersData = await ordersRes.json()

            if (paymentsData.success && ordersData.success) {
                // Create order lookup map
                const orderMap = {}
                ordersData.orders.forEach(order => {
                    orderMap[order.orderId] = order
                })

                // Fetch user details for each payment
                const paymentsWithDetails = await Promise.all(
                    paymentsData.payments.map(async (payment) => {
                        const order = orderMap[payment.orderId]
                        const user = order ? await fetchUserByUid(order.userId) : null

                        // Get order items summary
                        const itemsSummary = order?.items?.map(item => `${item.name} (x${item.quantity})`).join('; ') || 'N/A'

                        return {
                            paymentId: payment._id || 'N/A',
                            transactionId: payment.transactionId || 'N/A',
                            orderId: payment.orderId || 'N/A',
                            customerName: user?.displayName || 'N/A',
                            customerEmail: user?.email || 'N/A',
                            orderItems: itemsSummary,
                            amount: `$${payment.amount?.toFixed(2) || '0.00'}`,
                            currency: (payment.currency || 'usd').toUpperCase(),
                            paymentMethod: payment.paymentMethod || 'N/A',
                            status: payment.status || 'N/A',
                            orderStatus: order?.status || 'N/A',
                            paymentDate: formatDate(payment.createdAt),
                            processingTime: formatDate(payment.updatedAt)
                        }
                    })
                )

                const headers = ['paymentId', 'transactionId', 'orderId', 'customerName', 'customerEmail', 'orderItems', 'amount', 'currency', 'paymentMethod', 'status', 'orderStatus', 'paymentDate', 'processingTime']

                if (format === 'csv') {
                    const csv = convertToCSV(paymentsWithDetails, headers)
                    downloadCSV(csv, 'payments_report')
                } else {
                    await downloadExcel(paymentsWithDetails, headers, 'payments_report')
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
            const [paymentsRes, ordersRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`)
            ])

            const paymentsData = await paymentsRes.json()
            const ordersData = await ordersRes.json()

            if (paymentsData.success && ordersData.success) {
                const orderMap = {}
                ordersData.orders.forEach(order => {
                    orderMap[order.orderId] = order
                })

                const transactionsWithDetails = await Promise.all(
                    paymentsData.payments.map(async (payment) => {
                        const order = orderMap[payment.orderId]
                        const user = order ? await fetchUserByUid(order.userId) : null

                        const itemsSummary = order?.items?.map(item => `${item.name} (x${item.quantity})`).join('; ') || 'N/A'

                        return {
                            transactionId: payment.transactionId || 'N/A',
                            orderId: payment.orderId || 'N/A',
                            customerName: user?.displayName || 'N/A',
                            customerEmail: user?.email || 'N/A',
                            customerPhone: user?.phoneNumber || 'N/A',
                            orderItems: itemsSummary,
                            itemsCount: order?.items?.length || 0,
                            subtotal: order ? `$${order.subtotal?.toFixed(2) || '0.00'}` : 'N/A',
                            tax: order ? `$${order.tax?.toFixed(2) || '0.00'}` : 'N/A',
                            shipping: order ? `$${order.shipping?.toFixed(2) || '0.00'}` : 'N/A',
                            totalAmount: `$${payment.amount?.toFixed(2) || '0.00'}`,
                            currency: (payment.currency || 'usd').toUpperCase(),
                            paymentMethod: payment.paymentMethod || 'N/A',
                            transactionStatus: payment.status || 'N/A',
                            orderStatus: order?.status || 'N/A',
                            paymentStatus: order?.paymentStatus || 'N/A',
                            transactionDate: formatDate(payment.createdAt),
                            lastUpdated: formatDate(payment.updatedAt)
                        }
                    })
                )

                const headers = ['transactionId', 'orderId', 'customerName', 'customerEmail', 'customerPhone', 'orderItems', 'itemsCount', 'subtotal', 'tax', 'shipping', 'totalAmount', 'currency', 'paymentMethod', 'transactionStatus', 'orderStatus', 'paymentStatus', 'transactionDate', 'lastUpdated']

                if (format === 'csv') {
                    const csv = convertToCSV(transactionsWithDetails, headers)
                    downloadCSV(csv, 'transactions_report')
                } else {
                    await downloadExcel(transactionsWithDetails, headers, 'transactions_report')
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
            linear: 'from-blue-500 to-cyan-500',
            exportFn: exportOrders
        },
        {
            title: 'Users',
            icon: Users,
            count: stats.totalUsers,
            linear: 'from-purple-500 to-pink-500',
            exportFn: exportUsers
        },
        {
            title: 'Products',
            icon: Package,
            count: stats.totalProducts,
            linear: 'from-green-500 to-emerald-500',
            exportFn: exportProducts
        },
        {
            title: 'Payments',
            icon: CreditCard,
            count: stats.totalTransactions,
            linear: 'from-orange-500 to-red-500',
            exportFn: exportPayments
        },
        {
            title: 'Transactions',
            icon: DollarSign,
            count: stats.totalTransactions,
            linear: 'from-yellow-500 to-amber-500',
            exportFn: exportTransactions
        }
    ]

    if (loading) {
        return <Loading />
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-base-100 via-base-200 to-base-100">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                            <FileText className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-bold bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
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
                    <div className="card bg-linear-to-br from-blue-500 to-cyan-500 text-white shadow-xl">
                        <div className="card-body">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white/80 text-sm font-semibold">Total Revenue</p>
                                    <p className="text-3xl font-bold">${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                </div>
                                <DollarSign className="w-12 h-12 text-white/50" />
                            </div>
                        </div>
                    </div>

                    <div className="card bg-linear-to-br from-purple-500 to-pink-500 text-white shadow-xl">
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

                    <div className="card bg-linear-to-br from-green-500 to-emerald-500 text-white shadow-xl">
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

                    <div className="card bg-linear-to-br from-orange-500 to-red-500 text-white shadow-xl">
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
                                        <div className={`w-14 h-14 rounded-xl bg-linear-to-br ${card.linear} flex items-center justify-center shadow-lg`}>
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
                <div className="card bg-linear-to-br from-primary to-secondary text-white shadow-xl mt-8">
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
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
