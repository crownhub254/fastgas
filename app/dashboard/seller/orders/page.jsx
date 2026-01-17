'use client'

import { useEffect, useState } from 'react'
import { Search, Package, Truck, CheckCircle, Clock, Calendar } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth'
import DataTable from '../../components/DataTable'

export default function SellerOrders() {
    const [orders, setOrders] = useState([])
    const [filteredOrders, setFilteredOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const { userData } = useFirebaseAuth()

    useEffect(() => {
        if (userData) {
            fetchOrders()
        }
    }, [userData])

    useEffect(() => {
        filterOrders()
    }, [searchQuery, statusFilter, orders])

    const fetchOrders = async () => {
        try {
            setLoading(true)

            const productsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)
            const productsData = await productsRes.json()
            const sellerProducts = (productsData.products || []).filter(
                p => p.sellerEmail === userData.email
            )
            const sellerProductIds = sellerProducts.map(p => p.id)

            const ordersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`)
            const ordersData = await ordersRes.json()
            const allOrders = ordersData.orders || []

            const sellerOrders = allOrders.filter(order =>
                order.items.some(item => sellerProductIds.includes(item.id))
            ).map(order => ({
                ...order,
                sellerItems: order.items.filter(item => sellerProductIds.includes(item.id)),
                sellerTotal: order.items
                    .filter(item => sellerProductIds.includes(item.id))
                    .reduce((sum, item) => sum + (item.price * item.quantity), 0)
            }))

            setOrders(sellerOrders)
            setFilteredOrders(sellerOrders)
        } catch (error) {
            console.error('Failed to fetch orders:', error)
            toast.error('Failed to load orders')
        } finally {
            setLoading(false)
        }
    }

    const filterOrders = () => {
        let filtered = orders

        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status === statusFilter)
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(order =>
                order.orderId?.toLowerCase().includes(query) ||
                order.userId?.toLowerCase().includes(query)
            )
        }

        setFilteredOrders(filtered)
    }

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-warning/10 text-warning border-warning/20',
            processing: 'bg-info/10 text-info border-info/20',
            shipped: 'bg-primary/10 text-primary border-primary/20',
            delivered: 'bg-success/10 text-success border-success/20',
            cancelled: 'bg-error/10 text-error border-error/20'
        }
        return colors[status] || 'bg-base-300 text-base-content border-base-300'
    }

    const getStatusIcon = (status) => {
        const icons = {
            pending: Clock,
            processing: Package,
            shipped: Truck,
            delivered: CheckCircle
        }
        const Icon = icons[status] || Package
        return <Icon className="w-5 h-5" />
    }

    const statusFilters = [
        { value: 'all', label: 'All Orders', count: orders.length },
        { value: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
        { value: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'processing').length },
        { value: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
        { value: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length }
    ]

    const columns = [
        {
            header: 'Order ID',
            accessor: 'orderId',
            render: (row) => <span className="font-mono text-sm">{row.orderId}</span>
        },
        {
            header: 'Date',
            accessor: 'createdAt',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-base-content/60" />
                    <span className="text-sm">{new Date(row.createdAt).toLocaleDateString()}</span>
                </div>
            )
        },
        {
            header: 'Products',
            accessor: 'sellerItems',
            render: (row) => (
                <div className="flex items-center gap-2">
                    {row.sellerItems.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="avatar">
                            <div className="w-8 h-8 rounded">
                                {item.image ? (
                                    <Image src={item.image} alt={item.name} width={32} height={32} className="object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-base-300 flex items-center justify-center">
                                        <Package className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {row.sellerItems.length > 2 && (
                        <span className="text-xs text-base-content/60">+{row.sellerItems.length - 2}</span>
                    )}
                </div>
            )
        },
        {
            header: 'Items',
            accessor: 'itemCount',
            render: (row) => <span className="badge badge-outline">{row.sellerItems.length}</span>
        },
        {
            header: 'Your Earnings',
            accessor: 'sellerTotal',
            render: (row) => <span className="font-bold text-primary">${row.sellerTotal.toFixed(2)}</span>
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <span className={`px-3 py-1 rounded-lg font-semibold border-2 flex items-center gap-2 w-fit ${getStatusColor(row.status)}`}>
                    {getStatusIcon(row.status)}
                    <span className="text-xs capitalize">{row.status}</span>
                </span>
            )
        }
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-base-content/70">Loading orders...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">My Orders</h1>
                <p className="text-base-content/70">Track and manage orders for your products</p>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2">
                {statusFilters.map((filter) => (
                    <button
                        key={filter.value}
                        onClick={() => setStatusFilter(filter.value)}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap ${statusFilter === filter.value
                                ? 'bg-linear-to-r from-primary to-secondary text-primary-content shadow-lg'
                                : 'bg-base-200 text-base-content hover:bg-base-300'
                            }`}
                    >
                        {filter.label} ({filter.count})
                    </button>
                ))}
            </div>

            <div className="card bg-base-200 p-6">
                <div className="form-control">
                    <div className="input">
                        <span className="">
                            <Search className="w-5 h-5" />
                        </span>
                        <input
                            type="text"
                            placeholder="Search by order ID..."
                            className="flex-1"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="card bg-base-200 p-6">
                <DataTable
                    columns={columns}
                    data={filteredOrders}
                    itemsPerPage={5}
                    emptyMessage={
                        searchQuery || statusFilter !== 'all'
                            ? 'No orders found matching your filters'
                            : 'No orders yet for your products'
                    }
                    EmptyIcon={Package}
                />
            </div>
        </div>
    )
}
