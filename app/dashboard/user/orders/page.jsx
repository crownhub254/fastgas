'use client'

import { useEffect, useState } from 'react'
import { Package, Truck, CheckCircle, Clock, Calendar, MapPin, Eye } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth'
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
                return <Clock className="w-5 h-5" />
            case 'shipped':
                return <Truck className="w-5 h-5" />
            case 'delivered':
                return <CheckCircle className="w-5 h-5" />
            default:
                return <Package className="w-5 h-5" />
        }
    }

    const statusFilters = [
        { value: 'all', label: 'All Orders', count: orders.length },
        { value: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending' || o.status === 'processing' || o.status === 'confirmed').length },
        { value: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
        { value: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length }
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
                            ? 'bg-linear-to-r from-primary to-secondary text-primary-content shadow-lg'
                            : 'bg-base-200 text-base-content hover:bg-base-300'
                            }`}
                    >
                        {filter.label} ({filter.count})
                    </button>
                ))}
            </div>

            <div className="space-y-6">
                {filteredOrders.map((order) => (
                    <div key={order.orderId} className="card bg-base-200">
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-base-300">
                            <div className="flex flex-wrap items-center gap-4">
                                <div>
                                    <div className="text-sm text-base-content/60">Order ID</div>
                                    <div className="font-bold text-base-content">#{order.orderId}</div>
                                </div>
                                <div className="h-8 w-px bg-base-300"></div>
                                <div>
                                    <div className="text-sm text-base-content/60">Date</div>
                                    <div className="font-semibold text-base-content flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="h-8 w-px bg-base-300"></div>
                                <div>
                                    <div className="text-sm text-base-content/60">Total</div>
                                    <div className="font-bold text-primary text-lg">
                                        ${order.total.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                            <span className={`px-4 py-2 rounded-lg font-semibold border-2 flex items-center gap-2 ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)}
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                        </div>

                        <div className="space-y-4 py-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex gap-4 items-center">
                                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-base-300 shrink-0">
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-8 h-8 text-base-content/30" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-base-content truncate">
                                            {item.name}
                                        </h3>
                                        <p className="text-sm text-base-content/60">
                                            Qty: {item.quantity} × ${item.price.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="font-bold text-base-content">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-base-300">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary mt-1 shrink-0" />
                                <div>
                                    <div className="font-semibold text-base-content mb-1">Shipping Address</div>
                                    <div className="text-sm text-base-content/70">
                                        {order.shippingAddress.street}<br />
                                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                                        {order.shippingAddress.country}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-base-300">
                            <Link
                                href={`/orders/${order.orderId}`}
                                className="btn btn-primary btn-sm"
                            >
                                <Eye className="w-4 h-4" />
                                View Details
                            </Link>
                            {order.status === 'delivered' && (
                                <button className="btn btn-outline btn-sm">
                                    Reorder
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredOrders.length === 0 && (
                <div className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-base-content/70">
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
