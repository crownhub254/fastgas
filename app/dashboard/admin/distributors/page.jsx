'use client'

import { useState, useEffect } from 'react'
import { Users, MapPin, Package, Phone, Mail, Plus, Search, Filter, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'

// Demo distributor data - Single Product: 670g N₂O Cream Charger
const DEMO_DISTRIBUTORS = [
    { 
        id: 1, 
        businessName: 'Nairobi Central Hub', 
        ownerName: 'James Kamau', 
        email: 'james@nairobihub.co.ke',
        phone: '+254 712 345 678',
        location: 'Nairobi CBD',
        region: 'Nairobi',
        status: 'active',
        stock: { creamChargers: 620 },
        totalOrders: 456,
        joinedDate: '2024-03-15'
    },
    { 
        id: 2, 
        businessName: 'Mombasa Warehouse', 
        ownerName: 'Fatuma Hassan', 
        email: 'fatuma@mombasawh.co.ke',
        phone: '+254 723 456 789',
        location: 'Mombasa Island',
        region: 'Mombasa',
        status: 'active',
        stock: { creamChargers: 480 },
        totalOrders: 312,
        joinedDate: '2024-05-20'
    },
    { 
        id: 3, 
        businessName: 'Kisumu Distribution', 
        ownerName: 'Otieno Odhiambo', 
        email: 'otieno@kisumudist.co.ke',
        phone: '+254 734 567 890',
        location: 'Kisumu Town',
        region: 'Kisumu',
        status: 'active',
        stock: { creamChargers: 380 },
        totalOrders: 189,
        joinedDate: '2024-06-10'
    },
    { 
        id: 4, 
        businessName: 'Nakuru Depot', 
        ownerName: 'Alice Njeri', 
        email: 'alice@nakurudepot.co.ke',
        phone: '+254 745 678 901',
        location: 'Nakuru Town',
        region: 'Nakuru',
        status: 'pending',
        stock: { creamChargers: 320 },
        totalOrders: 145,
        joinedDate: '2024-07-05'
    },
    { 
        id: 5, 
        businessName: 'Eldoret Store', 
        ownerName: 'Brian Kiplagat', 
        email: 'brian@eldoretstore.co.ke',
        phone: '+254 756 789 012',
        location: 'Eldoret CBD',
        region: 'Eldoret',
        status: 'active',
        stock: { creamChargers: 250 },
        totalOrders: 98,
        joinedDate: '2024-08-15'
    }
]

export default function DistributorsPage() {
    const [loading, setLoading] = useState(true)
    const [distributors, setDistributors] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    useEffect(() => {
        const timer = setTimeout(() => {
            setDistributors(DEMO_DISTRIBUTORS)
            setLoading(false)
        }, 500)
        return () => clearTimeout(timer)
    }, [])

    const filteredDistributors = distributors.filter(dist => {
        const matchesSearch = dist.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              dist.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              dist.region.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || dist.status === statusFilter
        return matchesSearch && matchesStatus
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                        <Users className="w-8 h-8 text-primary" />
                        Distributors
                    </h1>
                    <p className="text-base-content/70">Manage your FastGas distributors network</p>
                </div>
                <div className="flex gap-2">
                    <span className="badge badge-warning badge-lg">Demo Mode</span>
                    <button className="btn btn-primary gap-2">
                        <Plus className="w-4 h-4" />
                        Add Distributor
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-base-100 rounded-xl p-5 shadow-sm border border-base-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                            <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{distributors.length}</p>
                            <p className="text-sm text-base-content/60">Total Distributors</p>
                        </div>
                    </div>
                </div>
                <div className="bg-base-100 rounded-xl p-5 shadow-sm border border-base-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-success/10">
                            <Users className="w-6 h-6 text-success" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{distributors.filter(d => d.status === 'active').length}</p>
                            <p className="text-sm text-base-content/60">Active</p>
                        </div>
                    </div>
                </div>
                <div className="bg-base-100 rounded-xl p-5 shadow-sm border border-base-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-warning/10">
                            <Users className="w-6 h-6 text-warning" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{distributors.filter(d => d.status === 'pending').length}</p>
                            <p className="text-sm text-base-content/60">Pending</p>
                        </div>
                    </div>
                </div>
                <div className="bg-base-100 rounded-xl p-5 shadow-sm border border-base-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-info/10">
                            <Package className="w-6 h-6 text-info" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{distributors.reduce((sum, d) => sum + d.stock.cylinders, 0)}</p>
                            <p className="text-sm text-base-content/60">Total Cylinders</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                    <input
                        type="text"
                        placeholder="Search distributors..."
                        className="input input-bordered w-full pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select 
                    className="select select-bordered w-full md:w-48"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            {/* Distributors Table */}
            <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Business</th>
                                <th>Contact</th>
                                <th>Location</th>
                                <th>Stock</th>
                                <th>Orders</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDistributors.map((dist) => (
                                <tr key={dist.id}>
                                    <td>
                                        <div>
                                            <p className="font-medium">{dist.businessName}</p>
                                            <p className="text-sm text-base-content/60">{dist.ownerName}</p>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-sm">
                                            <p className="flex items-center gap-1"><Mail className="w-3 h-3" />{dist.email}</p>
                                            <p className="flex items-center gap-1"><Phone className="w-3 h-3" />{dist.phone}</p>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {dist.region}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="text-sm">
                                            <p>670g Cream Chargers: <span className="font-semibold text-success">{dist.stock.creamChargers}</span></p>
                                        </div>
                                    </td>
                                    <td className="font-semibold">{dist.totalOrders}</td>
                                    <td>
                                        <span className={`badge badge-sm ${dist.status === 'active' ? 'badge-success' : dist.status === 'pending' ? 'badge-warning' : 'badge-ghost'}`}>
                                            {dist.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-1">
                                            <button className="btn btn-ghost btn-sm btn-square">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="btn btn-ghost btn-sm btn-square">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
