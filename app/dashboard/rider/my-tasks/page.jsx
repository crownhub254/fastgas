'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package, MapPin, Phone, CheckCircle, Truck, Eye, Clock, X } from 'lucide-react'
import DataTable from '@/app/dashboard/components/DataTable'
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth'
import toast from 'react-hot-toast'

export default function RiderMyTasks() {
    const { user, userData } = useFirebaseAuth()
    const [tasks, setTasks] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [selectedTask, setSelectedTask] = useState(null)

    useEffect(() => {
        if (user && userData) {
            fetchTasks()
        }
    }, [user, userData])

    const fetchTasks = async () => {
        try {
            if (!user) return

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/rider/${user.uid}`)
            const data = await response.json()

            if (data.success) {
                setTasks(data.orders || [])
            } else {
                toast.error('Failed to fetch tasks')
            }
        } catch (error) {
            console.error('Error fetching tasks:', error)
            toast.error('Failed to load tasks')
        } finally {
            setIsLoading(false)
        }
    }

    const handleAcceptTask = async (orderId) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/accept-delivery`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        status: 'collected',
                        timeline: {
                            status: 'collected',
                            timestamp: new Date(),
                            location: 'Warehouse',
                            note: 'Package collected by rider'
                        }
                    })
                }
            )

            const data = await response.json()

            if (data.success) {
                toast.success('Task accepted! Package marked as collected.')
                fetchTasks()
            } else {
                toast.error('Failed to accept task')
            }
        } catch (error) {
            console.error('Error accepting task:', error)
            toast.error('Failed to accept task')
        }
    }

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const statusMessages = {
                in_transit: 'Package is now in transit',
                out_for_delivery: 'Package is out for delivery',
                delivered: 'Package delivered successfully'
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/update-delivery-status`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        status: newStatus,
                        timeline: {
                            status: newStatus,
                            timestamp: new Date(),
                            location: newStatus === 'delivered' ? 'Customer Location' : 'In Transit',
                            note: statusMessages[newStatus]
                        }
                    })
                }
            )

            const data = await response.json()

            if (data.success) {
                toast.success(statusMessages[newStatus])
                fetchTasks()
            } else {
                toast.error('Failed to update status')
            }
        } catch (error) {
            console.error('Error updating status:', error)
            toast.error('Failed to update status')
        }
    }

    const getStatusBadge = (status) => {
        const badges = {
            assigned: { class: 'badge-warning', text: 'Assigned' },
            collected: { class: 'badge-info', text: 'Collected' },
            in_transit: { class: 'badge-primary', text: 'In Transit' },
            out_for_delivery: { class: 'badge-secondary', text: 'Out for Delivery' },
            delivered: { class: 'badge-success', text: 'Delivered' }
        }
        return badges[status] || { class: 'badge-ghost', text: status }
    }

    const getNextAction = (status) => {
        const actions = {
            assigned: { text: 'Accept & Collect', nextStatus: 'collected', icon: Package },
            collected: { text: 'Start Transit', nextStatus: 'in_transit', icon: Truck },
            in_transit: { text: 'Out for Delivery', nextStatus: 'out_for_delivery', icon: MapPin },
            out_for_delivery: { text: 'Mark Delivered', nextStatus: 'delivered', icon: CheckCircle }
        }
        return actions[status] || null
    }

    const columns = [
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
                    <div className="text-xs text-base-content/60 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {row.buyerInfo?.phoneNumber || 'N/A'}
                    </div>
                </div>
            )
        },
        {
            header: 'Delivery Address',
            accessor: 'shippingAddress',
            render: (row) => (
                <div className="text-sm max-w-xs">
                    <div className="flex items-start gap-1">
                        <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div>
                            <div>{row.shippingAddress?.street}</div>
                            <div className="text-xs text-base-content/60">
                                {row.shippingAddress?.city}, {row.shippingAddress?.district}
                            </div>
                        </div>
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
            header: 'Status',
            accessor: 'status',
            render: (row) => {
                const badge = getStatusBadge(row.status)
                return <span className={`badge ${badge.class}`}>{badge.text}</span>
            }
        },
        {
            header: 'Actions',
            accessor: 'actions',
            render: (row) => {
                const action = getNextAction(row.status)

                return (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSelectedTask(row)}
                            className="btn btn-sm btn-ghost"
                            title="View Details"
                        >
                            <Eye className="w-4 h-4" />
                        </button>

                        {action && row.status !== 'delivered' && (
                            <button
                                onClick={() => {
                                    if (row.status === 'assigned') {
                                        handleAcceptTask(row.orderId)
                                    } else {
                                        handleUpdateStatus(row.orderId, action.nextStatus)
                                    }
                                }}
                                className="btn btn-sm btn-primary"
                            >
                                <action.icon className="w-4 h-4" />
                                {action.text}
                            </button>
                        )}

                        {row.status === 'delivered' && (
                            <span className="badge badge-success gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Completed
                            </span>
                        )}
                    </div>
                )
            }
        }
    ]

    const filteredTasks = tasks.filter(task => {
        if (filter === 'all') return true
        if (filter === 'pending') return ['assigned', 'collected', 'in_transit', 'out_for_delivery'].includes(task.status)
        if (filter === 'completed') return task.status === 'delivered'
        return task.status === filter
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
                        <Package className="w-8 h-8 text-primary" />
                        My Tasks
                    </h1>
                    <p className="text-base-content/60 mt-1">
                        Manage your delivery assignments
                    </p>
                </div>
                <button
                    onClick={fetchTasks}
                    className="btn btn-primary"
                >
                    Refresh Tasks
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-3 overflow-x-auto pb-2">
                {[
                    { value: 'all', label: 'All Tasks', count: tasks.length },
                    { value: 'pending', label: 'Pending', count: tasks.filter(t => ['assigned', 'collected', 'in_transit', 'out_for_delivery'].includes(t.status)).length },
                    { value: 'assigned', label: 'Assigned', count: tasks.filter(t => t.status === 'assigned').length },
                    { value: 'collected', label: 'Collected', count: tasks.filter(t => t.status === 'collected').length },
                    { value: 'in_transit', label: 'In Transit', count: tasks.filter(t => t.status === 'in_transit').length },
                    { value: 'out_for_delivery', label: 'Out for Delivery', count: tasks.filter(t => t.status === 'out_for_delivery').length },
                    { value: 'completed', label: 'Delivered', count: tasks.filter(t => t.status === 'delivered').length }
                ].map((filterOption) => (
                    <button
                        key={filterOption.value}
                        onClick={() => setFilter(filterOption.value)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${filter === filterOption.value
                                ? 'bg-gradient-to-r from-primary to-secondary text-primary-content shadow-lg'
                                : 'bg-base-200 text-base-content hover:bg-base-300'
                            }`}
                    >
                        {filterOption.label} ({filterOption.count})
                    </button>
                ))}
            </div>

            {/* Tasks Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card bg-base-100 shadow-xl"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-base-content/70">Loading tasks...</p>
                        </div>
                    </div>
                ) : (
                    <DataTable
                        data={filteredTasks}
                        columns={columns}
                        itemsPerPage={10}
                        emptyMessage="No tasks found"
                        EmptyIcon={Package}
                    />
                )}
            </motion.div>

            {/* Task Details Modal */}
            {selectedTask && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-2xl">Task Details</h3>
                            <button
                                onClick={() => setSelectedTask(null)}
                                className="btn btn-ghost btn-sm btn-circle"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Order Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm text-base-content/60">Order ID</div>
                                    <div className="font-bold text-primary">#{selectedTask.orderId}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-base-content/60">Tracking ID</div>
                                    <div className="font-mono text-sm">{selectedTask.trackingId}</div>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="p-4 bg-base-200 rounded-lg">
                                <h4 className="font-bold mb-2">Customer Information</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Package className="w-4 h-4 text-primary" />
                                        <span>{selectedTask.buyerInfo?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-primary" />
                                        <a href={`tel:${selectedTask.buyerInfo?.phoneNumber}`} className="text-primary hover:underline">
                                            {selectedTask.buyerInfo?.phoneNumber}
                                        </a>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-primary mt-1" />
                                        <div>
                                            <div>{selectedTask.shippingAddress?.street}</div>
                                            <div className="text-sm text-base-content/60">
                                                {selectedTask.shippingAddress?.city}, {selectedTask.shippingAddress?.district}, {selectedTask.shippingAddress?.division}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Items */}
                            <div>
                                <h4 className="font-bold mb-2">Items</h4>
                                <div className="space-y-2">
                                    {selectedTask.items?.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center p-2 bg-base-200 rounded">
                                            <div>
                                                <div className="font-semibold">{item.name}</div>
                                                <div className="text-sm text-base-content/60">Qty: {item.quantity}</div>
                                            </div>
                                            <div className="font-bold">${(item.price * item.quantity).toFixed(2)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total */}
                            <div className="flex justify-between items-center p-4 bg-success/10 border border-success/20 rounded-lg">
                                <span className="font-bold">Total Amount</span>
                                <span className="text-2xl font-bold text-success">${selectedTask.total?.toFixed(2)}</span>
                            </div>

                            {/* Timeline */}
                            {selectedTask.timeline && selectedTask.timeline.length > 0 && (
                                <div>
                                    <h4 className="font-bold mb-2">Delivery Timeline</h4>
                                    <div className="space-y-2">
                                        {selectedTask.timeline.map((event, index) => (
                                            <div key={index} className="flex gap-3">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                                                    {index < selectedTask.timeline.length - 1 && (
                                                        <div className="w-0.5 h-full bg-primary/30"></div>
                                                    )}
                                                </div>
                                                <div className="flex-1 pb-4">
                                                    <div className="font-semibold capitalize">{event.status.replace('_', ' ')}</div>
                                                    <div className="text-sm text-base-content/60">{event.note}</div>
                                                    <div className="text-xs text-base-content/40">
                                                        {new Date(event.timestamp).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-action">
                            <button
                                onClick={() => setSelectedTask(null)}
                                className="btn"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                    <div className="modal-backdrop" onClick={() => setSelectedTask(null)}></div>
                </div>
            )}
        </div>
    )
}
