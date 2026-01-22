'use client'

import { useEffect, useState } from 'react'
import { CreditCard, CheckCircle, XCircle, Clock, Calendar, DollarSign, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth'
import Loading from '../../loading'

export default function UserPayments() {
    const [payments, setPayments] = useState([])
    const [filteredPayments, setFilteredPayments] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const { userData } = useFirebaseAuth()

    useEffect(() => {
        if (userData) {
            fetchPayments()
        }
    }, [userData])

    useEffect(() => {
        filterPayments()
    }, [searchQuery, statusFilter, payments])

    const fetchPayments = async () => {
        try {
            setLoading(true)

            // Fetch user's orders first
            const ordersRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/orders/user/${userData.uid}`
            )
            const ordersData = await ordersRes.json()
            const orders = ordersData.orders || []

            // Fetch all payments
            const paymentsRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/payments`
            )
            const paymentsData = await paymentsRes.json()
            const allPayments = paymentsData.payments || []

            // Filter payments for user's orders
            const orderIds = orders.map(o => o.orderId)
            const userPayments = allPayments.filter(p => orderIds.includes(p.orderId))

            // Merge with order data
            const paymentsWithOrders = userPayments.map(payment => {
                const order = orders.find(o => o.orderId === payment.orderId)
                return {
                    ...payment,
                    orderDate: order?.createdAt,
                    orderStatus: order?.status
                }
            })

            setPayments(paymentsWithOrders)
            setFilteredPayments(paymentsWithOrders)
        } catch (error) {
            console.error('Failed to fetch payments:', error)
            toast.error('Failed to load payments')
        } finally {
            setLoading(false)
        }
    }

    const filterPayments = () => {
        let filtered = payments

        if (statusFilter !== 'all') {
            filtered = filtered.filter(payment => payment.status === statusFilter)
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(payment =>
                payment.orderId?.toLowerCase().includes(query) ||
                payment.transactionId?.toLowerCase().includes(query)
            )
        }

        setFilteredPayments(filtered)
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'succeeded':
            case 'completed':
                return 'bg-success/10 text-success border-success/20'
            case 'pending':
                return 'bg-warning/10 text-warning border-warning/20'
            case 'failed':
            case 'cancelled':
                return 'bg-error/10 text-error border-error/20'
            default:
                return 'bg-base-300 text-base-content border-base-300'
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'succeeded':
            case 'completed':
                return <CheckCircle className="w-5 h-5" />
            case 'pending':
                return <Clock className="w-5 h-5" />
            case 'failed':
            case 'cancelled':
                return <XCircle className="w-5 h-5" />
            default:
                return <CreditCard className="w-5 h-5" />
        }
    }

    const totalPaid = payments
        .filter(p => p.status === 'succeeded' || p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0)

    const statusFilters = [
        { value: 'all', label: 'All Payments', count: payments.length },
        { value: 'succeeded', label: 'Completed', count: payments.filter(p => p.status === 'succeeded' || p.status === 'completed').length },
        { value: 'pending', label: 'Pending', count: payments.filter(p => p.status === 'pending').length },
        { value: 'failed', label: 'Failed', count: payments.filter(p => p.status === 'failed' || p.status === 'cancelled').length }
    ]

    if (loading) {
        return <Loading />
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">My Payments</h1>
                <p className="text-base-content/70">Track your payment history and transactions</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card bg-base-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">${totalPaid.toFixed(2)}</p>
                            <p className="text-sm text-base-content/70">Total Paid</p>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-success" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {payments.filter(p => p.status === 'succeeded').length}
                            </p>
                            <p className="text-sm text-base-content/70">Successful</p>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-warning" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {payments.filter(p => p.status === 'pending').length}
                            </p>
                            <p className="text-sm text-base-content/70">Pending</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
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

            {/* Search */}
            <div className="card bg-base-200 p-6">
                <div className="form-control">
                    <div className="input">
                        <span className="">
                            <Search className="w-5 h-5" />
                        </span>
                        <input
                            type="text"
                            placeholder="Search by order ID or transaction ID..."
                            className="flex-1"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Payments Table */}
            <div className="card bg-base-200 overflow-x-auto">
                <table className="table table-zebra">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Order ID</th>
                            <th>Transaction ID</th>
                            <th>Method</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPayments.map((payment) => (
                            <tr key={payment._id}>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-base-content/60" />
                                        <span className="text-sm">
                                            {new Date(payment.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <span className="font-mono text-sm">{payment.orderId}</span>
                                </td>
                                <td>
                                    <span className="font-mono text-xs text-base-content/60">
                                        {payment.transactionId?.slice(0, 20)}...
                                    </span>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="w-4 h-4" />
                                        <span className="text-sm">{payment.paymentMethod}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className="font-bold text-primary">
                                        ${payment.amount.toFixed(2)}
                                    </span>
                                </td>
                                <td>
                                    <span className={`px-3 py-1 rounded-lg font-semibold border-2 flex items-center gap-2 w-fit ${getStatusColor(payment.status)}`}>
                                        {getStatusIcon(payment.status)}
                                        <span className="text-xs capitalize">
                                            {payment.status}
                                        </span>
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredPayments.length === 0 && (
                    <div className="text-center py-12">
                        <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-base-content/70">
                            {searchQuery || statusFilter !== 'all'
                                ? 'No payments found matching your filters'
                                : 'No payment history yet'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
