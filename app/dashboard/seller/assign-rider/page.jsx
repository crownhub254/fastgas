'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bike, Package, MapPin, Phone, Star, CheckCircle, X, Search } from 'lucide-react'
import DataTable from '../../components/DataTable'
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function AssignRiderPage() {
    const { user, userData } = useFirebaseAuth()
    const [orders, setOrders] = useState([])
    const [riders, setRiders] = useState([])
    const [filteredRiders, setFilteredRiders] = useState([])
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingRiders, setIsLoadingRiders] = useState(false)
    const [showRiderModal, setShowRiderModal] = useState(false)
    const [searchRider, setSearchRider] = useState('')

    useEffect(() => {
        if (user && userData) {
            fetchOrders()
        }
    }, [user, userData])

    useEffect(() => {
        filterRiders()
    }, [riders, searchRider])

    const fetchOrders = async () => {
        try {
            setIsLoading(true)
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/orders/pending-assignment`
            )
            const data = await response.json()

            if (data.success) {
                setOrders(data.orders || [])
                console.log('✅ Orders loaded:', data.orders?.length || 0)
            } else {
                toast.error(data.error || 'Failed to load orders')
            }
        } catch (error) {
            console.error('❌ Error fetching orders:', error)
            toast.error('Failed to load orders')
        } finally {
            setIsLoading(false)
        }
    }

    const fetchRiders = async (order) => {
        try {
            setIsLoadingRiders(true)

            const division = order.shippingAddress?.division
            const district = order.shippingAddress?.district

            console.log('🔍 Fetching riders for order:', {
                orderId: order.orderId,
                division,
                district,
                fullAddress: order.shippingAddress
            })

            let url = `${process.env.NEXT_PUBLIC_API_URL}/riders/available`
            const params = new URLSearchParams()

            if (division && district) {
                params.append('division', division)
                params.append('district', district)
            } else if (division) {
                params.append('division', division)
            }

            if (params.toString()) {
                url += `?${params.toString()}`
            }

            console.log('📡 Fetching riders from URL:', url)

            const response = await fetch(url)
            const data = await response.json()

            console.log('📦 API Response:', {
                success: data.success,
                count: data.riders?.length || 0,
                riders: data.riders
            })

            if (data.success) {
                const availableRiders = data.riders || []
                console.log(`✅ Found ${availableRiders.length} riders`)

                if (availableRiders.length > 0) {
                    setRiders(availableRiders)

                    if (division && district) {
                        toast.success(`Found ${availableRiders.length} rider(s) in ${district}, ${division}`)
                    } else if (division) {
                        toast.success(`Found ${availableRiders.length} rider(s) in ${division} division`)
                    }
                } else {
                    console.log('⚠️ No riders found with current filters')

                    if (division && district) {
                        console.log('🔄 Trying with division only...')
                        toast('No riders in specific district. Searching in the division...', {
                            icon: '🔍',
                        })

                        const divisionResponse = await fetch(
                            `${process.env.NEXT_PUBLIC_API_URL}/riders/available?division=${division}`
                        )
                        const divisionData = await divisionResponse.json()

                        if (divisionData.success && divisionData.riders?.length > 0) {
                            setRiders(divisionData.riders)
                            toast.success(`Found ${divisionData.riders.length} rider(s) in ${division} division`)
                            console.log(`✅ Found ${divisionData.riders.length} riders in division`)
                        } else {
                            console.log('🔄 No riders in division, fetching all available riders...')
                            await fetchAllAvailableRiders()
                        }
                    } else if (division) {
                        console.log('🔄 No riders in division, fetching all available riders...')
                        await fetchAllAvailableRiders()
                    } else {
                        setRiders([])
                        toast.error('No available riders found')
                    }
                }
            } else {
                console.error('❌ API error:', data.error)
                toast.error(data.error || 'Failed to load riders')
                setRiders([])
            }
        } catch (error) {
            console.error('❌ Error fetching riders:', error)
            toast.error('Failed to load riders. Please try again.')
            setRiders([])
        } finally {
            setIsLoadingRiders(false)
        }
    }

    const fetchAllAvailableRiders = async () => {
        try {
            toast('No riders in delivery location. Showing all available riders...', {
                icon: 'ℹ️',
            })

            const allResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/riders/available`)
            const allData = await allResponse.json()

            if (allData.success) {
                setRiders(allData.riders || [])
                console.log(`✅ Loaded ${allData.riders?.length || 0} total available riders`)

                if (allData.riders?.length > 0) {
                    toast.success(`Showing ${allData.riders.length} available rider(s) from all locations`)
                } else {
                    toast.error('No verified riders available in the system')
                }
            } else {
                setRiders([])
                toast.error('No riders available')
            }
        } catch (fallbackError) {
            console.error('❌ Error fetching all riders:', fallbackError)
            setRiders([])
            toast.error('Failed to load riders')
        }
    }

    const filterRiders = () => {
        let filtered = [...riders]

        if (searchRider) {
            const query = searchRider.toLowerCase()
            filtered = filtered.filter(rider =>
                rider.displayName?.toLowerCase().includes(query) ||
                rider.phoneNumber?.includes(query) ||
                rider.vehicleType?.toLowerCase().includes(query) ||
                rider.vehicleNumber?.toLowerCase().includes(query) ||
                rider.address?.division?.toLowerCase().includes(query) ||
                rider.address?.district?.toLowerCase().includes(query)
            )
        }

        filtered.sort((a, b) => {
            if (b.rating !== a.rating) {
                return b.rating - a.rating
            }
            return (b.completedDeliveries || 0) - (a.completedDeliveries || 0)
        })

        setFilteredRiders(filtered)
    }

    const handleAssignRider = async (rider) => {
        if (!selectedOrder) return

        try {
            const loadingToast = toast.loading('Assigning rider...')

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
            toast.dismiss(loadingToast)

            if (data.success) {
                toast.success(`✅ Rider ${rider.displayName} assigned successfully!`)
                setShowRiderModal(false)
                setSelectedOrder(null)
                setSearchRider('')
                setRiders([])
                fetchOrders()
            } else {
                toast.error(data.error || 'Failed to assign rider')
            }
        } catch (error) {
            console.error('❌ Error assigning rider:', error)
            toast.error('Failed to assign rider')
        }
    }

    const handleOpenRiderModal = (order) => {
        setSelectedOrder(order)
        setShowRiderModal(true)
        setSearchRider('')
        fetchRiders(order)
    }

    const handleCloseRiderModal = () => {
        setShowRiderModal(false)
        setSelectedOrder(null)
        setSearchRider('')
        setRiders([])
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
                    {row.trackingId || 'N/A'}
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
                        {row.shippingAddress?.city || 'N/A'}, {row.shippingAddress?.district || 'N/A'}
                    </div>
                    <div className="text-xs text-base-content/60">
                        {row.shippingAddress?.division || 'N/A'}
                    </div>
                </div>
            )
        },
        {
            header: 'Amount',
            accessor: 'total',
            render: (row) => (
                <div className="font-bold text-success">
                    ${row.total?.toFixed(2) || '0.00'}
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
                    onClick={() => handleOpenRiderModal(row)}
                    className="btn btn-sm btn-primary"
                >
                    <Bike className="w-4 h-4" />
                    Assign
                </button>
            )
        }
    ]

    const riderColumns = [
        {
            header: 'Rider',
            accessor: 'displayName',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="avatar placeholder">
                        <div className="w-10 h-10 rounded-full bg-primary/20">
                            {row.photoURL ? (
                                <Image
                                    src={row.photoURL}
                                    alt={row.displayName}
                                    width={40}
                                    height={40}
                                    className="object-cover"
                                />
                            ) : (
                                <span className="text-lg text-primary">
                                    {row.displayName?.charAt(0) || '?'}
                                </span>
                            )}
                        </div>
                    </div>
                    <div>
                        <div className="font-bold text-sm">{row.displayName}</div>
                        <div className="text-xs text-base-content/60 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {row.phoneNumber}
                        </div>
                    </div>
                </div>
            )
        },
        {
            header: 'Vehicle',
            accessor: 'vehicleType',
            render: (row) => (
                <div className="text-sm">
                    <div className="flex items-center gap-1 capitalize">
                        <Bike className="w-3 h-3 text-primary" />
                        <span className="font-semibold">{row.vehicleType}</span>
                    </div>
                    <div className="text-xs text-base-content/60">{row.vehicleNumber}</div>
                </div>
            )
        },
        {
            header: 'Location',
            accessor: 'address',
            render: (row) => (
                <div className="text-sm">
                    <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-base-content/50" />
                        <span>{row.address?.district}</span>
                    </div>
                    <div className="text-xs text-base-content/60">{row.address?.division}</div>
                </div>
            )
        },
        {
            header: 'Stats',
            accessor: 'stats',
            render: (row) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-warning fill-warning" />
                        <span className="font-semibold text-sm">{row.rating?.toFixed(1) || '5.0'}</span>
                    </div>
                    <div className="text-xs text-base-content/60">
                        {row.completedDeliveries || 0} deliveries
                    </div>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <div className="flex flex-col gap-1">
                    {row.isAvailable && (
                        <div className="badge badge-xs badge-success">Available</div>
                    )}
                    {row.isVerified && (
                        <div className="badge badge-xs badge-info">Verified</div>
                    )}
                </div>
            )
        },
        {
            header: 'Actions',
            accessor: 'actions',
            render: (row) => (
                <button
                    onClick={() => handleAssignRider(row)}
                    className="btn btn-sm btn-primary"
                    disabled={!row.isAvailable}
                >
                    <CheckCircle className="w-4 h-4" />
                    Assign
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

            {/* Compact Rider Selection Modal */}
            {showRiderModal && selectedOrder && (
                <div className="modal modal-open">
                    <div className="modal-box w-11/12 max-w-4xl h-[85vh] flex flex-col p-0">
                        {/* Fixed Header */}
                        <div className="flex items-center justify-between p-6 border-b border-base-300 bg-base-100 sticky top-0 z-10">
                            <div>
                                <h3 className="font-bold text-xl">Select Rider for Order</h3>
                                <p className="text-sm text-base-content/60 mt-1">
                                    Order #{selectedOrder.orderId} • {selectedOrder.shippingAddress?.district}, {selectedOrder.shippingAddress?.division}
                                </p>
                            </div>
                            <button
                                onClick={handleCloseRiderModal}
                                className="btn btn-ghost btn-sm btn-circle"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {/* Compact Order Summary */}
                            <div className="grid grid-cols-3 gap-3 p-3 bg-base-200 rounded-lg mb-4 text-sm">
                                <div>
                                    <div className="text-xs text-base-content/60">Customer</div>
                                    <div className="font-semibold">{selectedOrder.buyerInfo?.name}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-base-content/60">Amount</div>
                                    <div className="font-semibold text-success">${selectedOrder.total?.toFixed(2)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-base-content/60">Items</div>
                                    <div className="font-semibold">{selectedOrder.items?.length || 0} items</div>
                                </div>
                            </div>

                            {/* Search Bar */}
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
                                <input
                                    type="text"
                                    value={searchRider}
                                    onChange={(e) => setSearchRider(e.target.value)}
                                    placeholder="Search riders..."
                                    className="w-full pl-10 pr-4 py-2 text-sm bg-base-200 border border-base-300 rounded-lg focus:outline-none focus:border-primary"
                                />
                            </div>

                            {/* Results Info */}
                            <div className="flex items-center justify-between mb-3 text-xs text-base-content/60">
                                <span>
                                    {filteredRiders.length} rider(s) available
                                </span>
                                {isLoadingRiders && (
                                    <span className="loading loading-spinner loading-xs"></span>
                                )}
                            </div>

                            {/* Riders DataTable */}
                            {isLoadingRiders ? (
                                <div className="text-center py-12">
                                    <div className="loading loading-spinner loading-lg text-primary mx-auto mb-3"></div>
                                    <p className="text-base-content/70">Loading riders...</p>
                                </div>
                            ) : (
                                <DataTable
                                    data={filteredRiders}
                                    columns={riderColumns}
                                    itemsPerPage={5}
                                    emptyMessage="No available riders found"
                                    EmptyIcon={Bike}
                                />
                            )}
                        </div>

                        {/* Fixed Footer */}
                        <div className="p-4 border-t border-base-300 bg-base-100 sticky bottom-0">
                            <button
                                onClick={handleCloseRiderModal}
                                className="btn btn-outline btn-error w-full btn-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                    <div className="modal-backdrop" onClick={handleCloseRiderModal}></div>
                </div>
            )}
        </div>
    )
}
