'use client'

import { useState, useEffect } from 'react'
import { Users, Eye, CheckCircle, XCircle, TrendingUp, DollarSign, Package, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'
import { TopResellersTable, ResellerSummaryStats } from '../../components/analytics/ResellerAnalytics'

// Sample reseller data for demo
const DEMO_RESELLERS = [
    {
        _id: 'reseller-001',
        uid: 'test-reseller-001',
        displayName: 'John Reseller',
        email: 'reseller@fastgas.com',
        phoneNumber: '+254700000002',
        role: 'reseller',
        resellerProfile: {
            businessName: 'John Gas Supplies',
            businessRegistrationNumber: 'BN12345',
            businessLocation: { city: 'Nairobi', county: 'Nairobi' },
            isApproved: true,
            approvedAt: '2025-10-15',
            priceTier: 'premium',
            commissionRate: 15,
            totalSales: 45,
            totalRevenue: 250000,
            totalCommissionEarned: 37500,
            activeClients: 28,
            totalOrders: 45,
            currentStockLevel: 25
        },
        createdAt: '2025-10-01'
    },
    {
        _id: 'reseller-002',
        uid: 'test-reseller-002',
        displayName: 'Jane Distributor',
        email: 'reseller2@fastgas.com',
        phoneNumber: '+254700000003',
        role: 'reseller',
        resellerProfile: {
            businessName: 'Jane LPG Distributors',
            businessRegistrationNumber: 'BN67890',
            businessLocation: { city: 'Mombasa', county: 'Mombasa' },
            isApproved: true,
            approvedAt: '2025-07-20',
            priceTier: 'wholesale',
            commissionRate: 20,
            totalSales: 82,
            totalRevenue: 500000,
            totalCommissionEarned: 100000,
            activeClients: 45,
            totalOrders: 82,
            currentStockLevel: 50
        },
        createdAt: '2025-07-01'
    },
    {
        _id: 'reseller-003',
        uid: 'test-reseller-003',
        displayName: 'Peter Pending',
        email: 'pending@fastgas.com',
        phoneNumber: '+254700000010',
        role: 'reseller',
        resellerProfile: {
            businessName: 'Peter Gas Hub',
            businessRegistrationNumber: 'BN99999',
            businessLocation: { city: 'Kisumu', county: 'Kisumu' },
            isApproved: false,
            priceTier: 'standard',
            commissionRate: 10,
            totalSales: 0,
            totalRevenue: 0,
            totalCommissionEarned: 0,
            activeClients: 0,
            totalOrders: 0,
            currentStockLevel: 0
        },
        createdAt: '2026-01-25'
    }
]

export default function ResellersPage() {
    const [resellers, setResellers] = useState(DEMO_RESELLERS)
    const [loading, setLoading] = useState(false)
    const [filter, setFilter] = useState('all') // all, approved, pending
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedReseller, setSelectedReseller] = useState(null)

    // Calculate summary stats
    const stats = {
        totalResellers: resellers.length,
        approvedResellers: resellers.filter(r => r.resellerProfile?.isApproved).length,
        pendingResellers: resellers.filter(r => !r.resellerProfile?.isApproved).length,
        totalRevenue: resellers.reduce((sum, r) => sum + (r.resellerProfile?.totalRevenue || 0), 0),
        totalCommissions: resellers.reduce((sum, r) => sum + (r.resellerProfile?.totalCommissionEarned || 0), 0),
        totalClients: resellers.reduce((sum, r) => sum + (r.resellerProfile?.activeClients || 0), 0)
    }

    // Filter resellers
    const filteredResellers = resellers.filter(r => {
        const matchesFilter = filter === 'all' || 
            (filter === 'approved' && r.resellerProfile?.isApproved) ||
            (filter === 'pending' && !r.resellerProfile?.isApproved)
        
        const matchesSearch = searchQuery === '' ||
            r.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.resellerProfile?.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.email.toLowerCase().includes(searchQuery.toLowerCase())
        
        return matchesFilter && matchesSearch
    })

    const handleApprove = async (resellerId) => {
        setResellers(prev => prev.map(r => 
            r._id === resellerId 
                ? { ...r, resellerProfile: { ...r.resellerProfile, isApproved: true, approvedAt: new Date().toISOString() } }
                : r
        ))
    }

    const handleReject = async (resellerId) => {
        setResellers(prev => prev.filter(r => r._id !== resellerId))
    }

    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Reseller Management</h1>
                        <p className="text-base-content/70">Manage and monitor your reseller network</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="bg-base-100 rounded-xl p-4 border border-base-200">
                        <Users className="w-5 h-5 text-primary mb-2" />
                        <p className="text-2xl font-bold">{stats.totalResellers}</p>
                        <p className="text-xs text-base-content/60">Total Resellers</p>
                    </div>
                    <div className="bg-base-100 rounded-xl p-4 border border-base-200">
                        <CheckCircle className="w-5 h-5 text-success mb-2" />
                        <p className="text-2xl font-bold">{stats.approvedResellers}</p>
                        <p className="text-xs text-base-content/60">Approved</p>
                    </div>
                    <div className="bg-base-100 rounded-xl p-4 border border-base-200">
                        <XCircle className="w-5 h-5 text-warning mb-2" />
                        <p className="text-2xl font-bold">{stats.pendingResellers}</p>
                        <p className="text-xs text-base-content/60">Pending</p>
                    </div>
                    <div className="bg-base-100 rounded-xl p-4 border border-base-200">
                        <DollarSign className="w-5 h-5 text-success mb-2" />
                        <p className="text-2xl font-bold">KES {(stats.totalRevenue / 1000).toFixed(0)}K</p>
                        <p className="text-xs text-base-content/60">Total Revenue</p>
                    </div>
                    <div className="bg-base-100 rounded-xl p-4 border border-base-200">
                        <TrendingUp className="w-5 h-5 text-info mb-2" />
                        <p className="text-2xl font-bold">KES {(stats.totalCommissions / 1000).toFixed(0)}K</p>
                        <p className="text-xs text-base-content/60">Commissions Paid</p>
                    </div>
                    <div className="bg-base-100 rounded-xl p-4 border border-base-200">
                        <Users className="w-5 h-5 text-secondary mb-2" />
                        <p className="text-2xl font-bold">{stats.totalClients}</p>
                        <p className="text-xs text-base-content/60">Total Clients</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                        <input
                            type="text"
                            placeholder="Search resellers..."
                            className="input input-bordered w-full pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button 
                            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>
                        <button 
                            className={`btn ${filter === 'approved' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setFilter('approved')}
                        >
                            Approved
                        </button>
                        <button 
                            className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setFilter('pending')}
                        >
                            Pending
                        </button>
                    </div>
                </div>

                {/* Resellers Table */}
                <div className="bg-base-100 rounded-xl border border-base-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Business</th>
                                    <th>Contact</th>
                                    <th>Location</th>
                                    <th>Tier</th>
                                    <th>Sales</th>
                                    <th>Revenue</th>
                                    <th>Clients</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredResellers.map((reseller) => (
                                    <tr key={reseller._id} className="hover">
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="avatar placeholder">
                                                    <div className="bg-primary text-primary-content rounded-full w-10">
                                                        <span>{reseller.resellerProfile?.businessName?.charAt(0) || 'R'}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="font-medium">{reseller.resellerProfile?.businessName}</p>
                                                    <p className="text-xs text-base-content/60">{reseller.displayName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <p className="text-sm">{reseller.email}</p>
                                            <p className="text-xs text-base-content/60">{reseller.phoneNumber}</p>
                                        </td>
                                        <td>{reseller.resellerProfile?.businessLocation?.city || 'N/A'}</td>
                                        <td>
                                            <span className={`badge ${
                                                reseller.resellerProfile?.priceTier === 'wholesale' ? 'badge-primary' :
                                                reseller.resellerProfile?.priceTier === 'premium' ? 'badge-secondary' :
                                                'badge-ghost'
                                            }`}>
                                                {reseller.resellerProfile?.priceTier || 'standard'}
                                            </span>
                                        </td>
                                        <td>{reseller.resellerProfile?.totalSales || 0} units</td>
                                        <td>KES {(reseller.resellerProfile?.totalRevenue || 0).toLocaleString()}</td>
                                        <td>{reseller.resellerProfile?.activeClients || 0}</td>
                                        <td>
                                            {reseller.resellerProfile?.isApproved ? (
                                                <span className="badge badge-success">Approved</span>
                                            ) : (
                                                <span className="badge badge-warning">Pending</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button 
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => setSelectedReseller(reseller)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {!reseller.resellerProfile?.isApproved && (
                                                    <>
                                                        <button 
                                                            className="btn btn-success btn-sm"
                                                            onClick={() => handleApprove(reseller._id)}
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            className="btn btn-error btn-sm"
                                                            onClick={() => handleReject(reseller._id)}
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Reseller Detail Modal */}
                {selectedReseller && (
                    <div className="modal modal-open">
                        <div className="modal-box max-w-2xl">
                            <h3 className="font-bold text-lg mb-4">
                                {selectedReseller.resellerProfile?.businessName}
                            </h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-base-content/60">Owner</p>
                                    <p className="font-medium">{selectedReseller.displayName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-base-content/60">Email</p>
                                    <p className="font-medium">{selectedReseller.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-base-content/60">Phone</p>
                                    <p className="font-medium">{selectedReseller.phoneNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-base-content/60">Location</p>
                                    <p className="font-medium">
                                        {selectedReseller.resellerProfile?.businessLocation?.city}, 
                                        {selectedReseller.resellerProfile?.businessLocation?.county}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-base-content/60">Price Tier</p>
                                    <p className="font-medium">{selectedReseller.resellerProfile?.priceTier}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-base-content/60">Commission Rate</p>
                                    <p className="font-medium">{selectedReseller.resellerProfile?.commissionRate}%</p>
                                </div>
                                <div>
                                    <p className="text-sm text-base-content/60">Total Revenue</p>
                                    <p className="font-medium text-success">
                                        KES {(selectedReseller.resellerProfile?.totalRevenue || 0).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-base-content/60">Commission Earned</p>
                                    <p className="font-medium">
                                        KES {(selectedReseller.resellerProfile?.totalCommissionEarned || 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="modal-action">
                                <button className="btn" onClick={() => setSelectedReseller(null)}>
                                    Close
                                </button>
                            </div>
                        </div>
                        <div className="modal-backdrop" onClick={() => setSelectedReseller(null)}></div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    )
}
