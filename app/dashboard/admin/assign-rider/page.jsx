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

            // Get division and district from order shipping address
            const division = order.shippingAddress?.division
            const district = order.shippingAddress?.district

            console.log('🔍 Fetching riders for order:', {
                orderId: order.orderId,
                division,
                district,
                fullAddress: order.shippingAddress
            })

            // Build URL to fetch riders from same division
            let url = `${process.env.NEXT_PUBLIC_API_URL}/riders/available`

            // Priority 1: Try to get riders from same division and district
            // Priority 2: Get riders from same division only
            // Priority 3: Get all available riders

            const params = new URLSearchParams()

            // First attempt: same division and district
            if (division && district) {
                params.append('division', division)
                params.append('district', district)
            } else if (division) {
                // Second attempt: same division only
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

                // If we have riders, use them
                if (availableRiders.length > 0) {
                    setRiders(availableRiders)

                    // Show message about location
                    if (division && district) {
                        toast.success(`Found ${availableRiders.length} rider(s) in ${district}, ${division}`)
                    } else if (division) {
                        toast.success(`Found ${availableRiders.length} rider(s) in ${division} division`)
                    }
                } else {
                    // No riders found with filters, try different approaches
                    console.log('⚠️ No riders found with current filters')

                    // If we tried both division and district, try division only
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
                            // Still no riders, get all available
                            console.log('🔄 No riders in division, fetching all available riders...')
                            await fetchAllAvailableRiders()
                        }
                    } else if (division) {
                        // Already tried division only, get all
                        console.log('🔄 No riders in division, fetching all available riders...')
                        await fetchAllAvailableRiders()
                    } else {
                        // No location info, already got all
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

        // Text search filter
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

        // Sort by rating and then by completed deliveries
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
                fetchOrders() // Refresh orders list
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
                                onClick={handleCloseRiderModal}
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
                                    <div className="font-bold">{selectedOrder.buyerInfo?.name || 'N/A'}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-base-content/60">Delivery Location</div>
                                    <div className="font-bold">
                                        {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.district}
                                    </div>
                                    <div className="text-xs text-base-content/60">
                                        {selectedOrder.shippingAddress?.division}
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
                                    placeholder="Search riders by name, phone, vehicle, or location..."
                                    className="w-full pl-12 pr-4 py-3 bg-base-200 border border-base-300 rounded-lg focus:outline-none focus:border-primary"
                                />
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-base-content/60">
                                    {filteredRiders.length} rider(s) found
                                    {selectedOrder.shippingAddress?.division && (
                                        <span className="ml-2 text-primary">
                                            in {selectedOrder.shippingAddress.division}
                                        </span>
                                    )}
                                </span>
                                {isLoadingRiders && (
                                    <span className="loading loading-spinner loading-sm"></span>
                                )}
                            </div>
                        </div>

                        {/* Riders List */}
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {isLoadingRiders ? (
                                <div className="text-center py-8">
                                    <div className="loading loading-spinner loading-lg text-primary mx-auto mb-3"></div>
                                    <p className="text-base-content/70">Loading riders...</p>
                                </div>
                            ) : filteredRiders.length === 0 ? (
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
                                        className="flex items-center gap-4 p-4 bg-base-200 rounded-lg hover:bg-base-300 transition-colors cursor-pointer group"
                                        onClick={() => handleAssignRider(rider)}
                                    >
                                        <div className="avatar placeholder">
                                            <div className="w-16 h-16 rounded-full bg-primary/20">
                                                {rider.photoURL ? (
                                                    <img src={rider.photoURL} alt={rider.displayName} />
                                                ) : (
                                                    <span className="text-2xl text-primary">
                                                        {rider.displayName?.charAt(0) || '?'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-lg">{rider.displayName}</div>
                                            <div className="flex items-center gap-4 text-sm text-base-content/60 mt-1 flex-wrap">
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    {rider.phoneNumber}
                                                </span>
                                                <span className="flex items-center gap-1 capitalize">
                                                    <Bike className="w-3 h-3" />
                                                    {rider.vehicleType} - {rider.vehicleNumber}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {rider.address?.district}, {rider.address?.division}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 text-warning fill-warning" />
                                                    <span className="font-semibold">{rider.rating?.toFixed(1) || '5.0'}</span>
                                                </div>
                                                <div className="badge badge-sm badge-success">
                                                    {rider.completedDeliveries || 0} deliveries
                                                </div>
                                                {rider.isAvailable && (
                                                    <div className="badge badge-sm badge-primary">Available</div>
                                                )}
                                                {rider.isVerified && (
                                                    <div className="badge badge-sm badge-info">Verified</div>
                                                )}
                                            </div>
                                        </div>
                                        <button className="btn btn-primary btn-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                            <CheckCircle className="w-4 h-4" />
                                            Assign
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="modal-action sticky bottom-0 bg-base-100 pt-4 border-t">
                            <button
                                onClick={handleCloseRiderModal}
                                className="btn"
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
