'use client'

import { useEffect, useState } from 'react'
import { Package, Truck, CheckCircle, Clock, Calendar, MapPin, Eye } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth'
import DataTable from '../../components/DataTable'
import Loading from '../../loading'

export default function UserOrders() {
    const [orders, setOrders] = useState([])
    const [filteredOrders, setFilteredOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('all')
    const { userData } = useFirebaseAuth()

    useEffect(() => {
        if (userData) {
            fetchOrders()
        }
    }, [userData])

    useEffect(() => {
        filterOrders()
    }, [statusFilter, orders])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/orders/user/${userData.uid}`
            )
            const data = await response.json()

            if (data.success) {
                setOrders(data.orders || [])
                setFilteredOrders(data.orders || [])
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error)
            toast.error('Failed to load orders')
        } finally {
            setLoading(false)
        }
    }

    const filterOrders = () => {
        if (statusFilter === 'all') {
            setFilteredOrders(orders)
        } else {
            setFilteredOrders(orders.filter(order => order.status === statusFilter))
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-warning/10 text-warning border-warning/20'
            case 'processing':
            case 'confirmed':
                return 'bg-info/10 text-info border-info/20'
            case 'shipped':
                return 'bg-primary/10 text-primary border-primary/20'
            case 'delivered':
                return 'bg-success/10 text-success border-success/20'
            case 'cancelled':
                return 'bg-error/10 text-error border-error/20'
            default:
                return 'bg-base-300 text-base-content border-base-300'
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
            case 'processing':
            case 'confirmed':
                return <Clock className="w-4 h-4" />
            case 'shipped':
                return <Truck className="w-4 h-4" />
            case 'delivered':
                return <CheckCircle className="w-4 h-4" />
            default:
                return <Package className="w-4 h-4" />
        }
    }

    const statusFilters = [
        { value: 'all', label: 'All Orders', count: orders.length },
        { value: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending' || o.status === 'processing' || o.status === 'confirmed').length },
        { value: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
        { value: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length }
    ]

    const columns = [
        {
            header: 'Order ID',
            accessor: 'orderId',
            render: (order) => (
                <div>
                    <div className="font-bold text-base-content">#{order.orderId}</div>
                    <div className="text-xs text-base-content/60">
                        {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                </div>
            )
        },
        {
            header: 'Items',
            accessor: 'items',
            render: (order) => (
                <div>
                    <div className="font-semibold text-base-content">{order.items?.length || 0} item(s)</div>
                    <div className="text-xs text-base-content/60">
                        {order.items?.map(i => i.name).join(', ')}
                    </div>
                </div>
            )
        },
        {
            header: 'Total',
            accessor: 'total',
            render: (order) => (
                <div className="font-bold text-primary text-lg">
                    ${order.total?.toFixed(2) || '0.00'}
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (order) => (
                <span className={`px-3 py-1 rounded-lg font-semibold border-2 flex items-center gap-2 w-fit ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
            )
        },
        {
            header: 'Address',
            accessor: 'shippingAddress',
            render: (order) => (
                <div className="text-sm">
                    <div className="font-semibold text-base-content">
                        {order.shippingAddress?.city}
                    </div>
                    <div className="text-xs text-base-content/60">
                        {order.shippingAddress?.street}
                    </div>
                </div>
            )
        },
        {
            header: 'Actions',
            accessor: 'actions',
            render: (order) => (
                <div className="flex gap-2">
                    <Link
                        href={`/orders/${order.orderId}`}
                        className="btn btn-primary btn-sm btn-outline"
                    >
                        <Eye className="w-4 h-4" />
                        View
                    </Link>
                    {order.status === 'delivered' && (
                        <button className="btn btn-outline btn-sm">
                            Reorder
                        </button>
                    )}
                </div>
            )
        }
    ]

    if (loading) {
        return <Loading />
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">My Orders</h1>
                <p className="text-base-content/70">Track and manage your orders</p>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2">
                {statusFilters.map((filter) => (
                    <button
                        key={filter.value}
                        onClick={() => setStatusFilter(filter.value)}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap ${statusFilter === filter.value
                            ? 'bg-gradient-to-r from-primary to-secondary text-primary-content shadow-lg'
                            : 'bg-base-200 text-base-content hover:bg-base-300'
                            }`}
                    >
                        {filter.label} ({filter.count})
                    </button>
                ))}
            </div>

            {/* DataTable */}
            {filteredOrders.length > 0 ? (
                <DataTable
                    columns={columns}
                    data={filteredOrders}
                    itemsPerPage={10}
                    emptyMessage="No orders found"
                    EmptyIcon={Package}
                />
            ) : (
                <div className="text-center py-12 bg-base-200 rounded-xl">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-base-content/70 font-semibold">
                        {statusFilter !== 'all'
                            ? `No ${statusFilter} orders found`
                            : 'No orders yet'}
                    </p>
                    {statusFilter === 'all' && (
                        <Link href="/products" className="btn btn-primary mt-4">
                            Start Shopping
                        </Link>
                    )}
                </div>
            )}
        </div>
    )
}
