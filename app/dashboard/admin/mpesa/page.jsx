'use client'

import { useState } from 'react'
import { DollarSign, Search, Phone, CheckCircle, XCircle, Clock, ArrowUpRight, ArrowDownRight, Calendar, RefreshCw, Download } from 'lucide-react'

const DEMO_TRANSACTIONS = [
    {
        id: 'TXN-001',
        mpesaCode: 'SJK4R2X9YT',
        phone: '+254712345678',
        amount: 2800,
        orderId: 'ORD-2431',
        customerName: 'Mary Wanjiku',
        status: 'completed',
        type: 'payment',
        timestamp: '2026-01-30 14:35:22'
    },
    {
        id: 'TXN-002',
        mpesaCode: 'PLM8N3K7WQ',
        phone: '+254722234567',
        amount: 47600,
        orderId: 'RES-001',
        customerName: 'James Kamau',
        status: 'completed',
        type: 'reseller_payment',
        timestamp: '2026-01-30 12:20:15'
    },
    {
        id: 'TXN-003',
        mpesaCode: 'QWE5T1Z8RX',
        phone: '+254733456789',
        amount: 5200,
        orderId: 'ORD-2398',
        customerName: 'Peter Ochieng',
        status: 'pending',
        type: 'payment',
        timestamp: '2026-01-30 11:45:00'
    },
    {
        id: 'TXN-004',
        mpesaCode: 'ASD7Y9U2MP',
        phone: '+254744567890',
        amount: 1500,
        orderId: 'ORD-2395',
        customerName: 'Grace Akinyi',
        status: 'failed',
        type: 'payment',
        timestamp: '2026-01-30 10:30:45',
        failureReason: 'Insufficient funds'
    },
    {
        id: 'TXN-005',
        mpesaCode: 'ZXC3V6B4NM',
        phone: '+254755678901',
        amount: 19125,
        orderId: 'RES-002',
        customerName: 'Fatuma Hassan',
        status: 'completed',
        type: 'reseller_payment',
        timestamp: '2026-01-29 16:22:10'
    },
    {
        id: 'TXN-006',
        mpesaCode: 'RTY2U8I5OP',
        phone: '+254766789012',
        amount: 8400,
        orderId: 'ORD-2390',
        customerName: 'David Kimani',
        status: 'completed',
        type: 'payment',
        timestamp: '2026-01-29 14:15:33'
    },
    {
        id: 'TXN-007',
        mpesaCode: 'FGH6J4K8LZ',
        phone: '+254777890123',
        amount: 2800,
        orderId: null,
        customerName: 'John Mwangi',
        status: 'refunded',
        type: 'refund',
        timestamp: '2026-01-29 09:45:00',
        refundReason: 'Order cancelled by customer'
    }
]

const DEMO_STATS = {
    todayRevenue: 75700,
    todayTransactions: 6,
    pendingAmount: 5200,
    failedTransactions: 1,
    successRate: 85.7,
    weeklyRevenue: 425600
}

const STATUS_STYLES = {
    completed: { badge: 'badge-success', icon: CheckCircle },
    pending: { badge: 'badge-warning', icon: Clock },
    failed: { badge: 'badge-error', icon: XCircle },
    refunded: { badge: 'badge-info', icon: RefreshCw }
}

export default function AdminMpesaPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [filterType, setFilterType] = useState('all')
    const [dateRange, setDateRange] = useState('today')

    const filteredTransactions = DEMO_TRANSACTIONS.filter(txn => {
        const matchesSearch = 
            txn.mpesaCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            txn.phone.includes(searchTerm) ||
            txn.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (txn.orderId && txn.orderId.toLowerCase().includes(searchTerm.toLowerCase()))
        const matchesStatus = filterStatus === 'all' || txn.status === filterStatus
        const matchesType = filterType === 'all' || txn.type === filterType
        return matchesSearch && matchesStatus && matchesType
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <DollarSign className="w-7 h-7 text-success" />
                        M-Pesa Transactions
                    </h1>
                    <p className="text-base-content/70">Monitor all M-Pesa payments and transactions</p>
                </div>
                <div className="flex gap-2">
                    <span className="badge badge-warning">Demo Mode</span>
                    <button className="btn btn-outline btn-sm">
                        <Download className="w-4 h-4" /> Export
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white">
                    <p className="text-white/80 text-sm">Today's Revenue</p>
                    <p className="text-2xl font-bold">KES {DEMO_STATS.todayRevenue.toLocaleString()}</p>
                    <p className="text-xs text-white/70 flex items-center gap-1 mt-1">
                        <ArrowUpRight className="w-3 h-3" /> +12.5% from yesterday
                    </p>
                </div>
                <div className="bg-base-100 rounded-xl p-4 shadow-sm border border-base-200">
                    <p className="text-sm text-base-content/60">Transactions Today</p>
                    <p className="text-2xl font-bold">{DEMO_STATS.todayTransactions}</p>
                </div>
                <div className="bg-base-100 rounded-xl p-4 shadow-sm border border-base-200">
                    <p className="text-sm text-base-content/60">Pending</p>
                    <p className="text-2xl font-bold text-warning">KES {DEMO_STATS.pendingAmount.toLocaleString()}</p>
                </div>
                <div className="bg-base-100 rounded-xl p-4 shadow-sm border border-base-200">
                    <p className="text-sm text-base-content/60">Failed</p>
                    <p className="text-2xl font-bold text-error">{DEMO_STATS.failedTransactions}</p>
                </div>
                <div className="bg-base-100 rounded-xl p-4 shadow-sm border border-base-200">
                    <p className="text-sm text-base-content/60">Success Rate</p>
                    <p className="text-2xl font-bold text-success">{DEMO_STATS.successRate}%</p>
                </div>
                <div className="bg-base-100 rounded-xl p-4 shadow-sm border border-base-200">
                    <p className="text-sm text-base-content/60">Weekly Revenue</p>
                    <p className="text-2xl font-bold">KES {(DEMO_STATS.weeklyRevenue / 1000).toFixed(0)}K</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-base-100 rounded-xl p-4 shadow-sm border border-base-200">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                        <input
                            type="text"
                            placeholder="Search by M-Pesa code, phone, customer, order ID..."
                            className="input input-bordered w-full pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        className="select select-bordered"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                    </select>
                    <select 
                        className="select select-bordered"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all">All Types</option>
                        <option value="payment">Customer Payment</option>
                        <option value="reseller_payment">Reseller Payment</option>
                        <option value="refund">Refund</option>
                    </select>
                    <select 
                        className="select select-bordered"
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                    >
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="all">All Time</option>
                    </select>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>M-Pesa Code</th>
                                <th>Customer</th>
                                <th>Phone</th>
                                <th>Amount</th>
                                <th>Order</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map((txn) => {
                                const StatusIcon = STATUS_STYLES[txn.status].icon
                                return (
                                    <tr key={txn.id} className="hover">
                                        <td>
                                            <code className="text-sm font-mono bg-base-200 px-2 py-1 rounded">
                                                {txn.mpesaCode}
                                            </code>
                                        </td>
                                        <td className="font-medium">{txn.customerName}</td>
                                        <td>
                                            <span className="flex items-center gap-1 text-sm">
                                                <Phone className="w-3 h-3" />
                                                {txn.phone}
                                            </span>
                                        </td>
                                        <td className={`font-bold ${txn.type === 'refund' ? 'text-error' : 'text-success'}`}>
                                            {txn.type === 'refund' ? '-' : '+'}KES {txn.amount.toLocaleString()}
                                        </td>
                                        <td>
                                            {txn.orderId ? (
                                                <span className="badge badge-ghost">{txn.orderId}</span>
                                            ) : '-'}
                                        </td>
                                        <td>
                                            <span className={`badge badge-sm ${
                                                txn.type === 'reseller_payment' ? 'badge-secondary' :
                                                txn.type === 'refund' ? 'badge-error' : 'badge-primary'
                                            }`}>
                                                {txn.type === 'reseller_payment' ? 'Reseller' :
                                                 txn.type === 'refund' ? 'Refund' : 'Customer'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1">
                                                <span className={`badge ${STATUS_STYLES[txn.status].badge}`}>
                                                    <StatusIcon className="w-3 h-3 mr-1" />
                                                    {txn.status}
                                                </span>
                                            </div>
                                            {txn.failureReason && (
                                                <p className="text-xs text-error mt-1">{txn.failureReason}</p>
                                            )}
                                            {txn.refundReason && (
                                                <p className="text-xs text-info mt-1">{txn.refundReason}</p>
                                            )}
                                        </td>
                                        <td className="text-sm text-base-content/60">
                                            {txn.timestamp}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Summary */}
            <div className="bg-base-100 rounded-xl p-6 shadow-sm border border-base-200">
                <h3 className="font-semibold mb-4">Transaction Summary</h3>
                <div className="flex flex-wrap gap-6">
                    <div>
                        <p className="text-sm text-base-content/60">Completed</p>
                        <p className="text-xl font-bold text-success">
                            {DEMO_TRANSACTIONS.filter(t => t.status === 'completed').length} transactions
                        </p>
                        <p className="text-sm">
                            KES {DEMO_TRANSACTIONS.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-base-content/60">Pending</p>
                        <p className="text-xl font-bold text-warning">
                            {DEMO_TRANSACTIONS.filter(t => t.status === 'pending').length} transactions
                        </p>
                        <p className="text-sm">
                            KES {DEMO_TRANSACTIONS.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-base-content/60">Failed</p>
                        <p className="text-xl font-bold text-error">
                            {DEMO_TRANSACTIONS.filter(t => t.status === 'failed').length} transactions
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-base-content/60">Refunded</p>
                        <p className="text-xl font-bold text-info">
                            {DEMO_TRANSACTIONS.filter(t => t.status === 'refunded').length} transactions
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
