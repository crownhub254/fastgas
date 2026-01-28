'use client'

import { useState, useEffect } from 'react'
import { Download, FileText, Users, Package, DollarSign, CreditCard, TrendingUp, Calendar, Filter, Bell, Bike } from 'lucide-react'
import toast from 'react-hot-toast'
import DataTable from '../../components/DataTable'
import { StatsCard } from '../../components/charts/Index'

export default function AdminReports() {
    const [loading, setLoading] = useState(false)
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalUsers: 0,
        totalProducts: 0,
        totalRevenue: 0,
        totalTransactions: 0,
        totalRiders: 0,
        totalNotifications: 0
    })
    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    })
    const [previewData, setPreviewData] = useState([])
    const [selectedReport, setSelectedReport] = useState(null)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const [ordersRes, usersRes, productsRes, paymentsRes, ridersRes, notificationsRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/users`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/riders`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`)
            ])

            const ordersData = await ordersRes.json()
            const usersData = await usersRes.json()
            const productsData = await productsRes.json()
            const paymentsData = await paymentsRes.json()
            const ridersData = await ridersRes.json()
            const notificationsData = await notificationsRes.json()

            const orders = ordersData.orders || []
            const users = usersData.users || []
            const products = productsData.products || []
            const payments = paymentsData.payments || []
            const riders = ridersData.riders || []
            const notifications = notificationsData.notifications || []

            const totalRevenue = payments
                .filter(p => p.status === 'succeeded')
                .reduce((sum, p) => sum + p.amount, 0)

            setStats({
                totalOrders: orders.length,
                totalUsers: users.length,
                totalProducts: products.length,
                totalRevenue: totalRevenue,
                totalTransactions: payments.length,
                totalRiders: riders.length,
                totalNotifications: notifications.length
            })
        } catch (error) {
            console.error('Error fetching stats:', error)
            toast.error('Failed to fetch statistics')
        }
    }

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

    const toTitleCase = (str) => {
        return str
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (s) => s.toUpperCase())
            .trim()
    }

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
                if (typeof value === 'string') {
                    value = value.replace(/\n/g, ' ')
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
                const ordersWithUserData = await Promise.all(
                    data.orders.map(async (order) => {
                        const user = await fetchUserByUid(order.userId)
                        const productNames = order.items?.map(item => item.name).join('; ') || 'N/A'
                        const productQuantities = order.items?.map(item => `${item.name} (x${item.quantity})`).join('; ') || 'N/A'

                        return {
                            orderId: order.orderId,
                            trackingId: order.trackingId || 'N/A',
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
                            riderStatus: order.riderStatus || 'N/A',
                            riderId: order.riderId || 'N/A',
                            orderDate: formatDate(order.createdAt),
                            lastUpdated: formatDate(order.updatedAt)
                        }
                    })
                )

                const headers = ['orderId', 'trackingId', 'customerName', 'customerEmail', 'customerPhone', 'products', 'quantities', 'itemsCount', 'subtotal', 'shipping', 'tax', 'total', 'paymentMethod', 'paymentStatus', 'orderStatus', 'riderStatus', 'riderId', 'orderDate']

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
                const headers = ['userId', 'displayName', 'email', 'phoneNumber', 'role', 'provider', 'accountCreated']
                const exportData = data.users.map(user => ({
                    userId: user.uid || 'N/A',
                    displayName: user.displayName || 'N/A',
                    email: user.email || 'N/A',
                    phoneNumber: user.phoneNumber || 'N/A',
                    role: user.role || 'user',
                    provider: user.provider || 'N/A',
                    accountCreated: formatDate(user.createdAt)
                }))

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
                const headers = ['productId', 'productName', 'category', 'price', 'stock', 'stockStatus', 'rating', 'reviewsCount', 'sellerEmail', 'sellerName']
                const exportData = data.products.map(product => {
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
                        sellerEmail: product.sellerEmail || 'N/A',
                        sellerName: product.sellerName || 'N/A'
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
                const orderMap = {}
                ordersData.orders.forEach(order => {
                    orderMap[order.orderId] = order
                })

                const paymentsWithDetails = await Promise.all(
                    paymentsData.payments.map(async (payment) => {
                        const order = orderMap[payment.orderId]
                        const user = order ? await fetchUserByUid(order.userId) : null

                        return {
                            transactionId: payment.transactionId || 'N/A',
                            orderId: payment.orderId || 'N/A',
                            customerName: user?.displayName || 'N/A',
                            amount: `$${payment.amount?.toFixed(2) || '0.00'}`,
                            currency: (payment.currency || 'usd').toUpperCase(),
                            paymentMethod: payment.paymentMethod || 'N/A',
                            status: payment.status || 'N/A',
                            paymentDate: formatDate(payment.createdAt)
                        }
                    })
                )

                const headers = ['transactionId', 'orderId', 'customerName', 'amount', 'currency', 'paymentMethod', 'status', 'paymentDate']

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

    const exportRiders = async (format) => {
        setLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/riders`)
            const data = await response.json()

            if (data.success) {
                const headers = ['riderId', 'riderName', 'email', 'phoneNumber', 'vehicleType', 'vehicleNumber', 'licenseNumber', 'isAvailable', 'isVerified', 'completedDeliveries', 'rating', 'totalEarnings', 'joinedDate']
                const exportData = data.riders.map(rider => ({
                    riderId: rider.uid || 'N/A',
                    riderName: rider.displayName || 'N/A',
                    email: rider.email || 'N/A',
                    phoneNumber: rider.phoneNumber || 'N/A',
                    vehicleType: rider.vehicleType || 'N/A',
                    vehicleNumber: rider.vehicleNumber || 'N/A',
                    licenseNumber: rider.licenseNumber || 'N/A',
                    isAvailable: rider.isAvailable ? 'Yes' : 'No',
                    isVerified: rider.isVerified ? 'Yes' : 'No',
                    completedDeliveries: rider.completedDeliveries || 0,
                    rating: rider.rating?.toFixed(1) || '0.0',
                    totalEarnings: `$${rider.earnings?.toFixed(2) || '0.00'}`,
                    joinedDate: formatDate(rider.createdAt)
                }))

                if (format === 'csv') {
                    const csv = convertToCSV(exportData, headers)
                    downloadCSV(csv, 'riders_report')
                } else {
                    await downloadExcel(exportData, headers, 'riders_report')
                }
                toast.success(`Riders exported as ${format.toUpperCase()}!`)
            }
        } catch (error) {
            console.error('Export error:', error)
            toast.error('Failed to export riders')
        } finally {
            setLoading(false)
        }
    }

    const exportNotifications = async (format) => {
        setLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`)
            const data = await response.json()

            if (data.success) {
                const headers = ['notificationId', 'userId', 'type', 'title', 'message', 'read', 'priority', 'createdAt']
                const exportData = data.notifications.map(notif => ({
                    notificationId: notif._id || 'N/A',
                    userId: notif.userId || 'N/A',
                    type: notif.type || 'N/A',
                    title: notif.title || 'N/A',
                    message: notif.message || 'N/A',
                    read: notif.read ? 'Yes' : 'No',
                    priority: notif.priority || 'medium',
                    createdAt: formatDate(notif.createdAt)
                }))

                if (format === 'csv') {
                    const csv = convertToCSV(exportData, headers)
                    downloadCSV(csv, 'notifications_report')
                } else {
                    await downloadExcel(exportData, headers, 'notifications_report')
                }
                toast.success(`Notifications exported as ${format.toUpperCase()}!`)
            }
        } catch (error) {
            console.error('Export error:', error)
            toast.error('Failed to export notifications')
        } finally {
            setLoading(false)
        }
    }

    const previewReport = async (reportType) => {
        setLoading(true)
        setSelectedReport(reportType)
        try {
            let response
            let columns = []
            let data = []

            switch (reportType) {
                case 'orders':
                    response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`)
                    const ordersData = await response.json()
                    if (ordersData.success) {
                        columns = [
                            { header: 'Order ID', accessor: 'orderId' },
                            { header: 'Customer', accessor: 'customerName' },
                            { header: 'Total', accessor: 'total' },
                            { header: 'Status', accessor: 'status' },
                            { header: 'Date', accessor: 'date' }
                        ]
                        data = await Promise.all(ordersData.orders.slice(0, 10).map(async (order) => {
                            const user = await fetchUserByUid(order.userId)
                            return {
                                orderId: order.orderId,
                                customerName: user?.displayName || 'N/A',
                                total: `$${order.total?.toFixed(2)}`,
                                status: order.status,
                                date: formatDate(order.createdAt)
                            }
                        }))
                    }
                    break

                case 'riders':
                    response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/riders`)
                    const ridersData = await response.json()
                    if (ridersData.success) {
                        columns = [
                            { header: 'Name', accessor: 'name' },
                            { header: 'Email', accessor: 'email' },
                            { header: 'Vehicle', accessor: 'vehicle' },
                            { header: 'Status', accessor: 'status' },
                            { header: 'Deliveries', accessor: 'deliveries' }
                        ]
                        data = ridersData.riders.slice(0, 10).map(rider => ({
                            name: rider.displayName,
                            email: rider.email,
                            vehicle: rider.vehicleType,
                            status: rider.isVerified ? 'Verified' : 'Pending',
                            deliveries: rider.completedDeliveries || 0
                        }))
                    }
                    break

                case 'users':
                    response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/users`)
                    const usersData = await response.json()
                    if (usersData.success) {
                        columns = [
                            { header: 'Name', accessor: 'name' },
                            { header: 'Email', accessor: 'email' },
                            { header: 'Role', accessor: 'role' },
                            { header: 'Phone', accessor: 'phone' },
                            { header: 'Joined', accessor: 'joined' }
                        ]
                        data = usersData.users.slice(0, 10).map(user => ({
                            name: user.displayName,
                            email: user.email,
                            role: user.role,
                            phone: user.phoneNumber,
                            joined: formatDate(user.createdAt)
                        }))
                    }
                    break

                case 'products':
                    response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)
                    const productsData = await response.json()
                    if (productsData.success) {
                        columns = [
                            { header: 'Name', accessor: 'name' },
                            { header: 'Category', accessor: 'category' },
                            { header: 'Price', accessor: 'price' },
                            { header: 'Stock', accessor: 'stock' },
                            { header: 'Rating', accessor: 'rating' }
                        ]
                        data = productsData.products.slice(0, 10).map(product => ({
                            name: product.name,
                            category: product.category,
                            price: `$${product.price?.toFixed(2)}`,
                            stock: product.stock,
                            rating: `${product.rating?.toFixed(1)} ⭐`
                        }))
                    }
                    break

                case 'notifications':
                    response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`)
                    const notifsData = await response.json()
                    if (notifsData.success) {
                        columns = [
                            { header: 'Title', accessor: 'title' },
                            { header: 'Type', accessor: 'type' },
                            { header: 'Priority', accessor: 'priority' },
                            { header: 'Read', accessor: 'read' },
                            { header: 'Date', accessor: 'date' }
                        ]
                        data = notifsData.notifications.slice(0, 10).map(notif => ({
                            title: notif.title,
                            type: notif.type,
                            priority: notif.priority,
                            read: notif.read ? 'Yes' : 'No',
                            date: formatDate(notif.createdAt)
                        }))
                    }
                    break
            }

            setPreviewData({ columns, data })
        } catch (error) {
            console.error('Preview error:', error)
            toast.error('Failed to load preview')
        } finally {
            setLoading(false)
        }
    }

    const reportTypes = [
        {
            title: 'Orders',
            icon: Package,
            count: stats.totalOrders,
            color: 'from-blue-500 to-cyan-500',
            exportFn: exportOrders,
            preview: 'orders'
        },
        {
            title: 'Users',
            icon: Users,
            count: stats.totalUsers,
            color: 'from-purple-500 to-pink-500',
            exportFn: exportUsers,
            preview: 'users'
        },
        {
            title: 'Products',
            icon: Package,
            count: stats.totalProducts,
            color: 'from-green-500 to-emerald-500',
            exportFn: exportProducts,
            preview: 'products'
        },
        {
            title: 'Payments',
            icon: CreditCard,
            count: stats.totalTransactions,
            color: 'from-orange-500 to-red-500',
            exportFn: exportPayments,
            preview: 'payments'
        },
        {
            title: 'Riders',
            icon: Bike,
            count: stats.totalRiders,
            color: 'from-indigo-500 to-purple-500',
            exportFn: exportRiders,
            preview: 'riders'
        },
        {
            title: 'Notifications',
            icon: Bell,
            count: stats.totalNotifications,
            color: 'from-pink-500 to-rose-500',
            exportFn: exportNotifications,
            preview: 'notifications'
        }
    ]

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
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

                {/* Stats Overview - Using StatsCard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="Total Revenue"
                        value={`$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        icon={DollarSign}
                        color="from-blue-500 to-cyan-500"
                    />
                    <StatsCard
                        title="Total Orders"
                        value={stats.totalOrders}
                        icon={Package}
                        color="from-purple-500 to-pink-500"
                    />
                    <StatsCard
                        title="Total Users"
                        value={stats.totalUsers}
                        icon={Users}
                        color="from-green-500 to-emerald-500"
                    />
                    <StatsCard
                        title="Total Riders"
                        value={stats.totalRiders}
                        icon={Bike}
                        color="from-indigo-500 to-purple-500"
                    />
                </div>

                {/* Date Range Filter */}
                <div className="card bg-base-100 shadow-xl border border-base-300">
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

                {/* Export Table - Using DataTable */}
                <div className="card bg-base-100 shadow-xl border border-base-300">
                    <div className="card-body">
                        <h2 className="text-2xl font-bold mb-4">Export Reports</h2>
                        <DataTable
                            columns={[
                                {
                                    header: 'Report Type',
                                    accessor: 'type',
                                    render: (row) => (
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg bg-linear-to-br ${row.color} flex items-center justify-center`}>
                                                <row.icon className="w-5 h-5 text-white" />
                                            </div>
                                            <span className="font-semibold text-base-content">{row.title}</span>
                                        </div>
                                    )
                                },
                                {
                                    header: 'Total Count',
                                    accessor: 'count',
                                    render: (row) => (
                                        <span className="font-bold text-lg text-primary">{row.count}</span>
                                    )
                                },
                                {
                                    header: 'Actions',
                                    accessor: 'actions',
                                    render: (row) => (
                                        <div className="flex gap-2 flex-wrap">
                                            <button
                                                onClick={() => previewReport(row.preview)}
                                                className="btn btn-sm btn-outline btn-info gap-2"
                                                disabled={loading}
                                            >
                                                Preview
                                            </button>
                                            <button
                                                onClick={() => row.exportFn('csv')}
                                                disabled={loading}
                                                className="btn btn-sm btn-outline btn-primary gap-2"
                                            >
                                                {loading ? (
                                                    <span className="loading loading-spinner loading-sm"></span>
                                                ) : (
                                                    <>
                                                        <Download className="w-4 h-4" />
                                                        CSV
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => row.exportFn('excel')}
                                                disabled={loading}
                                                className="btn btn-sm btn-outline btn-success gap-2"
                                            >
                                                {loading ? (
                                                    <span className="loading loading-spinner loading-sm"></span>
                                                ) : (
                                                    <>
                                                        <Download className="w-4 h-4" />
                                                        Excel
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )
                                }
                            ]}
                            data={reportTypes}
                            itemsPerPage={10}
                            emptyMessage="No reports available"
                            EmptyIcon={FileText}
                        />
                    </div>
                </div>

                {/* Preview Section */}
                {selectedReport && previewData.data && previewData.data.length > 0 && (
                    <div className="card bg-base-100 shadow-xl border border-base-300">
                        <div className="card-body">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold">
                                    {selectedReport.charAt(0).toUpperCase() + selectedReport.slice(1)} Preview (First 10 entries)
                                </h2>
                                <button
                                    onClick={() => { setSelectedReport(null); setPreviewData([]) }}
                                    className="btn btn-sm btn-ghost"
                                >
                                    Close
                                </button>
                            </div>
                            <DataTable
                                columns={previewData.columns}
                                data={previewData.data}
                                itemsPerPage={5}
                                emptyMessage="No preview data available"
                            />
                        </div>
                    </div>
                )}

                {/* Export All */}
                <div className="card bg-linear-to-br from-primary to-secondary text-white shadow-xl">
                    <div className="card-body">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <TrendingUp className="w-12 h-12" />
                                <div>
                                    <h3 className="text-2xl font-bold">Export All Data</h3>
                                    <p className="text-white/80">Download complete dataset in one click</p>
                                </div>
                            </div>
                            <button
                                onClick={async () => {
                                    for (const report of reportTypes) {
                                        await report.exportFn('csv')
                                        await new Promise(resolve => setTimeout(resolve, 1000))
                                    }
                                }}
                                className="btn btn-lg bg-white text-primary hover:bg-white/90 gap-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="loading loading-spinner"></span>
                                ) : (
                                    <>
                                        <Download className="w-5 h-5" />
                                        Export All (CSV)
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
