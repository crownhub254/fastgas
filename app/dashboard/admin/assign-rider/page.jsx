'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bike, Package, MapPin, Phone, Star, CheckCircle, X, Search, Filter } from 'lucide-react'
import DataTable from '../../components/DataTable'
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth'
import toast from 'react-hot-toast'

export default function AssignRiderPage() {
    const { user, userData } = useFirebaseAuth()
    const [orders, setOrders] = useState([])
    const [riders, setRiders] = useState([])
    const [filteredRiders, setFilteredRiders] = useState([])
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showRiderModal, setShowRiderModal] = useState(false)
    const [searchRider, setSearchRider] = useState('')

    useEffect(() => {
        if (user && userData) {
            fetchOrders()
            fetchRiders()
        }
    }, [user, userData])

    useEffect(() => {
        filterRiders()
    }, [riders, searchRider])

    const fetchOrders = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/orders/pending-assignment`
            )
            const data = await response.json()

            if (data.success) {
                setOrders(data.orders || [])
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
            toast.error('Failed to load orders')
        } finally {
            setIsLoading(false)
        }
    }

    const fetchRiders = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/riders/available`)
            const data = await response.json()

            if (data.success) {
                setRiders(data.riders || [])
            }
        } catch (error) {
            console.error('Error fetching riders:', error)
            toast.error('Failed to load riders')
        }
    }

    const filterRiders = () => {
        let filtered = riders.filter(rider => rider.riderInfo?.isAvailable)

        // Text search filter
        if (searchRider) {
            const query = searchRider.toLowerCase()
            filtered = filtered.filter(rider =>
                rider.displayName?.toLowerCase().includes(query) ||
                rider.phoneNumber?.includes(query) ||
                rider.riderInfo?.vehicleType?.toLowerCase().includes(query) ||
                rider.riderInfo?.vehicleNumber?.toLowerCase().includes(query)
            )
        }

        // Sort by rating
        filtered.sort((a, b) => (b.riderInfo?.rating || 0) - (a.riderInfo?.rating || 0))

        setFilteredRiders(filtered)
    }

    const handleAssignRider = async (rider) => {
        if (!selectedOrder) return

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/riders/assign`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        orderId: selectedOrder.orderId,
                        riderId: rider.uid
                    })
                }
            )

            const data = await response.json()

            if (data.success) {
                toast.success(`Rider ${rider.displayName} assigned successfully!`)
                setShowRiderModal(false)
                setSelectedOrder(null)
                setSearchRider('')
                fetchOrders()
            } else {
                toast.error(data.error || 'Failed to assign rider')
            }
        } catch (error) {
            console.error('Error assigning rider:', error)
            toast.error('Failed to assign rider')
        }
    }

    const orderColumns = [
        {
            header: 'Order ID',
            accessor: 'orderId',
            render: (row) => (
                <div className="font-mono text-sm font-semibold text-primary">
                    #{row.orderId}
                </div>
            )
        },
        {
            header: 'Tracking ID',
            accessor: 'trackingId',
            render: (row) => (
                <div className="font-mono text-xs">
                    {row.trackingId}
                </div>
            )
        },
        {
            header: 'Customer',
            accessor: 'buyerInfo',
            render: (row) => (
                <div>
                    <div className="font-semibold">{row.buyerInfo?.name || 'N/A'}</div>
                    <div className="text-xs text-base-content/60">{row.buyerInfo?.phoneNumber}</div>
                </div>
            )
        },
        {
            header: 'Delivery Location',
            accessor: 'shippingAddress',
            render: (row) => (
                <div className="text-sm">
                    <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-primary" />
                        {row.shippingAddress?.city}, {row.shippingAddress?.district}
                    </div>
                    <div className="text-xs text-base-content/60">
                        {row.shippingAddress?.division}
                    </div>
                </div>
            )
        },
        {
            header: 'Amount',
            accessor: 'total',
            render: (row) => (
                <div className="font-bold text-success">
                    ${row.total?.toFixed(2)}
                </div>
            )
        },
        {
            header: 'Order Date',
            accessor: 'createdAt',
            render: (row) => (
                <div className="text-sm">
                    {new Date(row.createdAt).toLocaleDateString()}
                </div>
            )
        },
        {
            header: 'Actions',
            accessor: 'actions',
            render: (row) => (
                <button
                    onClick={() => {
                        setSelectedOrder(row)
                        setShowRiderModal(true)
                    }}
                    className="btn btn-sm btn-primary"
                >
                    <Bike className="w-4 h-4" />
                    Assign Rider
                </button>
            )
        }
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
                        <Bike className="w-8 h-8 text-primary" />
                        Assign Rider to Orders
                    </h1>
                    <p className="text-base-content/60 mt-1">
                        Assign delivery riders to confirmed orders
                    </p>
                </div>
                <div className="stats bg-base-100 shadow-xl">
                    <div className="stat">
                        <div className="stat-title">Pending Assignment</div>
                        <div className="stat-value text-primary">{orders.length}</div>
                    </div>
                    <div className="stat">
                        <div className="stat-title">Available Riders</div>
                        <div className="stat-value text-success">
                            {riders.filter(r => r.riderInfo?.isAvailable).length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card bg-base-100 shadow-xl"
            >
                <h2 className="text-xl font-bold text-base-content mb-4">
                    Orders Awaiting Rider Assignment
                </h2>
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="loading loading-spinner loading-lg text-primary"></div>
                    </div>
                ) : (
                    <DataTable
                        data={orders}
                        columns={orderColumns}
                        itemsPerPage={5}
                        emptyMessage="No orders pending assignment"
                        EmptyIcon={Package}
                    />
                )}
            </motion.div>

            {/* Rider Selection Modal */}
            {showRiderModal && selectedOrder && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-5xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6 sticky top-0 bg-base-100 z-10 pb-4 border-b">
                            <h3 className="font-bold text-2xl">Select Rider</h3>
                            <button
                                onClick={() => {
                                    setShowRiderModal(false)
                                    setSelectedOrder(null)
                                    setSearchRider('')
                                }}
                                className="btn btn-ghost btn-sm btn-circle"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Order Info */}
                        <div className="p-4 bg-base-200 rounded-lg mb-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <div className="text-sm text-base-content/60">Order ID</div>
                                    <div className="font-bold">#{selectedOrder.orderId}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-base-content/60">Customer</div>
                                    <div className="font-bold">{selectedOrder.buyerInfo?.name}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-base-content/60">Delivery Location</div>
                                    <div className="font-bold">
                                        {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.district}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-base-content/60">Amount</div>
                                    <div className="font-bold text-success">${selectedOrder.total?.toFixed(2)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="space-y-4 mb-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                                <input
                                    type="text"
                                    value={searchRider}
                                    onChange={(e) => setSearchRider(e.target.value)}
                                    placeholder="Search riders by name, phone, or vehicle..."
                                    className="w-full pl-12 pr-4 py-3 bg-base-200 border border-base-300 rounded-lg focus:outline-none focus:border-primary"
                                />
                            </div>
                            <div className="text-sm text-base-content/60 text-right">
                                {filteredRiders.length} rider(s) found
                            </div>
                        </div>

                        {/* Riders List */}
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {filteredRiders.length === 0 ? (
                                <div className="text-center py-8">
                                    <Bike className="w-12 h-12 text-base-content/30 mx-auto mb-3" />
                                    <p className="text-base-content/70">No available riders found</p>
                                    {searchRider && (
                                        <button
                                            onClick={() => setSearchRider('')}
                                            className="btn btn-sm btn-ghost mt-2"
                                        >
                                            Clear Search
                                        </button>
                                    )}
                                </div>
                            ) : (
                                filteredRiders.map((rider) => (
                                    <div
                                        key={rider.uid}
                                        className="flex items-center gap-4 p-4 bg-base-200 rounded-lg hover:bg-base-300 transition-colors cursor-pointer"
                                        onClick={() => handleAssignRider(rider)}
                                    >
                                        <div className="avatar placeholder">
                                            <div className="w-16 h-16 rounded-full bg-primary/20">
                                                {rider.photoURL ? (
                                                    <img src={rider.photoURL} alt={rider.displayName} />
                                                ) : (
                                                    <span className="text-2xl text-primary">
                                                        {rider.displayName?.charAt(0)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-lg">{rider.displayName}</div>
                                            <div className="flex items-center gap-4 text-sm text-base-content/60 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    {rider.phoneNumber}
                                                </span>
                                                <span className="flex items-center gap-1 capitalize">
                                                    <Bike className="w-3 h-3" />
                                                    {rider.riderInfo?.vehicleType} - {rider.riderInfo?.vehicleNumber}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 text-warning fill-warning" />
                                                    <span className="font-semibold">{rider.riderInfo?.rating?.toFixed(1)}</span>
                                                </div>
                                                <div className="badge badge-sm badge-success">
                                                    {rider.riderInfo?.completedDeliveries || 0} deliveries
                                                </div>
                                                {rider.riderInfo?.isAvailable && (
                                                    <div className="badge badge-sm badge-primary">Available</div>
                                                )}
                                            </div>
                                        </div>
                                        <button className="btn btn-primary btn-sm">
                                            <CheckCircle className="w-4 h-4" />
                                            Assign
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="modal-action sticky bottom-0 bg-base-100 pt-4 border-t">
                            <button
                                onClick={() => {
                                    setShowRiderModal(false)
                                    setSelectedOrder(null)
                                    setSearchRider('')
                                }}
                                className="btn"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                    <div className="modal-backdrop" onClick={() => {
                        setShowRiderModal(false)
                        setSelectedOrder(null)
                        setSearchRider('')
                    }}></div>
                </div>
            )}
        </div>
    )
}
