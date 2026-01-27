'use client'

import { useEffect, useState } from 'react'
import { Search, Edit, Trash2, UserCog, X, Check, AlertCircle, Bike, Store, CheckCircle, XCircle, Phone, MapPin, CreditCard } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import DataTable from '../../components/DataTable'
import Loading from '../../loading'

export default function UserManagement() {
    const [users, setUsers] = useState([])
    const [filteredUsers, setFilteredUsers] = useState([])
    const [unverifiedRiders, setUnverifiedRiders] = useState([])
    const [verifiedRiders, setVerifiedRiders] = useState([])
    const [allRiders, setAllRiders] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')
    const [editingUser, setEditingUser] = useState(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [pendingRole, setPendingRole] = useState(null)
    const [activeTab, setActiveTab] = useState('users') // 'users', 'verify-riders', 'verify-sellers'
    const [riderVerificationTab, setRiderVerificationTab] = useState('unverified') // 'unverified', 'verified', 'all'

    useEffect(() => {
        fetchData()
    }, [activeTab])

    useEffect(() => {
        if (activeTab === 'users') {
            filterUsers()
        }
    }, [searchQuery, roleFilter, users])

    const fetchData = async () => {
        setLoading(true)
        try {
            if (activeTab === 'users') {
                await fetchUsers()
            } else if (activeTab === 'verify-riders') {
                await fetchRiders()
            }
        } catch (error) {
            console.error('Failed to fetch data:', error)
            toast.error('Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/users`)
            const data = await response.json()

            if (data.success) {
                setUsers(data.users || [])
                setFilteredUsers(data.users || [])
            }
        } catch (error) {
            console.error('Failed to fetch users:', error)
            toast.error('Failed to load users')
        }
    }

    const fetchRiders = async () => {
        try {
            console.log('🔄 Fetching riders...')

            // Fetch ALL riders first
            const allRidersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/riders`)
            const allRidersData = await allRidersRes.json()

            console.log('📊 All Riders Response:', allRidersData)

            if (allRidersData.success && allRidersData.riders) {
                const riders = allRidersData.riders
                setAllRiders(riders)

                // Filter unverified and verified locally
                const unverified = riders.filter(r => !r.isVerified)
                const verified = riders.filter(r => r.isVerified)

                setUnverifiedRiders(unverified)
                setVerifiedRiders(verified)

                console.log('✅ Riders loaded:', {
                    total: riders.length,
                    unverified: unverified.length,
                    verified: verified.length
                })
            } else {
                console.warn('⚠️ No riders found or failed to fetch')
                setAllRiders([])
                setUnverifiedRiders([])
                setVerifiedRiders([])
            }
        } catch (error) {
            console.error('❌ Error fetching riders:', error)
            toast.error('Failed to load riders')
            setAllRiders([])
            setUnverifiedRiders([])
            setVerifiedRiders([])
        }
    }

    const filterUsers = () => {
        let filtered = users

        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => user.role === roleFilter)
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(user =>
                user.displayName?.toLowerCase().includes(query) ||
                user.email?.toLowerCase().includes(query) ||
                user.uid?.toLowerCase().includes(query)
            )
        }

        setFilteredUsers(filtered)
    }

    const handleEditUser = (user) => {
        setEditingUser({ ...user })
        setShowEditModal(true)
    }

    const handleDeleteUser = async (uid) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/users/${uid}`, {
                method: 'DELETE'
            })

            const data = await response.json()

            if (data.success) {
                toast.success('User deleted successfully')
                setUsers(users.filter(u => u.uid !== uid))
            } else {
                toast.error(data.error || 'Failed to delete user')
            }
        } catch (error) {
            console.error('Failed to delete user:', error)
            toast.error('Failed to delete user')
        }
    }

    const handleInitiateRoleChange = (newRole) => {
        setPendingRole(newRole)
        setShowConfirmModal(true)
    }

    const handleConfirmRoleChange = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/users/${editingUser.uid}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: pendingRole })
            })

            const data = await response.json()

            if (data.success) {
                toast.success(`User role changed to ${pendingRole}`)
                setEditingUser({ ...editingUser, role: pendingRole })
                setUsers(users.map(u => u.uid === editingUser.uid ? data.user : u))
                setShowConfirmModal(false)
                setPendingRole(null)
            } else {
                toast.error(data.error || 'Failed to change role')
            }
        } catch (error) {
            console.error('Failed to change role:', error)
            toast.error('Failed to change role')
        }
    }

    const handleVerifyRider = async (uid, isVerified) => {
        const action = isVerified ? 'verify' : 'unverify'

        try {
            console.log(`🔄 ${action}ing rider: ${uid}`)

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/riders/${uid}/verify`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ isVerified })
                }
            )

            const data = await response.json()
            console.log('📊 Verification response:', data)

            if (data.success) {
                toast.success(data.message || `Rider ${action}ed successfully`)

                // Refresh the rider list
                await fetchRiders()
            } else {
                toast.error(data.error || `Failed to ${action} rider`)
            }
        } catch (error) {
            console.error(`❌ Error ${action}ing rider:`, error)
            toast.error(`Failed to ${action} rider`)
        }
    }

    const handleVerifyAllRiders = async () => {
        if (!confirm(`Are you sure you want to verify all ${unverifiedRiders.length} pending riders?`)) {
            return
        }

        try {
            console.log('🔄 Verifying all riders...')

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/riders/verify-all`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            )

            const data = await response.json()
            console.log('📊 Verify all response:', data)

            if (data.success) {
                toast.success(data.message || 'All riders verified successfully')
                await fetchRiders()
            } else {
                toast.error(data.error || 'Failed to verify riders')
            }
        } catch (error) {
            console.error('❌ Error verifying all riders:', error)
            toast.error('Failed to verify riders')
        }
    }

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin':
                return 'badge-error'
            case 'seller':
                return 'badge-warning'
            case 'rider':
                return 'badge-success'
            case 'user':
                return 'badge-info'
            default:
                return 'badge-ghost'
        }
    }

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text)
        toast.success(`${label} copied to clipboard!`)
    }

    const userColumns = [
        {
            header: 'User',
            accessor: 'displayName',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="avatar">
                        <div className="w-10 h-10 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
                            {row.photoURL ? (
                                <Image
                                    src={row.photoURL}
                                    alt={row.displayName}
                                    width={40}
                                    height={40}
                                    className="object-cover"
                                />
                            ) : (
                                <div className="bg-primary/10 flex items-center justify-center w-full h-full text-primary font-bold">
                                    {row.displayName?.charAt(0) || 'U'}
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <div className="font-bold">{row.displayName}</div>
                        <div className="text-xs opacity-50">{row.uid.slice(0, 8)}...</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Email',
            accessor: 'email'
        },
        {
            header: 'Role',
            accessor: 'role',
            render: (row) => (
                <span className={`badge badge-sm capitalize ${getRoleBadgeColor(row.role)}`}>
                    {row.role}
                </span>
            )
        },
        {
            header: 'Provider',
            accessor: 'provider',
            render: (row) => (
                <span className="badge badge-sm capitalize">{row.provider}</span>
            )
        },
        {
            header: 'Joined',
            accessor: 'createdAt',
            render: (row) => (
                new Date(row.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                })
            )
        },
        {
            header: 'Actions',
            accessor: 'actions',
            render: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleEditUser(row)}
                        className="btn btn-sm btn-primary btn-outline"
                        title="Edit User"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDeleteUser(row.uid)}
                        className="btn btn-sm btn-error btn-outline"
                        title="Delete User"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ]

    const riderColumns = [
        {
            header: 'Rider',
            accessor: 'displayName',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="avatar">
                        <div className="w-10 h-10 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
                            {row.photoURL ? (
                                <Image
                                    src={row.photoURL}
                                    alt={row.displayName}
                                    width={40}
                                    height={40}
                                    className="object-cover"
                                />
                            ) : (
                                <div className="bg-primary/10 flex items-center justify-center w-full h-full text-primary font-bold">
                                    {row.displayName?.charAt(0) || 'R'}
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <div className="font-bold">{row.displayName}</div>
                        <div className="text-xs opacity-50">{row.email}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Phone',
            accessor: 'phoneNumber',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-base-content/50" />
                    <span>{row.phoneNumber}</span>
                </div>
            )
        },
        {
            header: 'Vehicle',
            accessor: 'vehicleType',
            render: (row) => (
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Bike className="w-4 h-4 text-primary" />
                        <span className="font-semibold capitalize">{row.vehicleType}</span>
                    </div>
                    <div className="text-xs text-base-content/60">{row.vehicleNumber}</div>
                </div>
            )
        },
        {
            header: 'Location',
            accessor: 'address',
            render: (row) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm">
                        <MapPin className="w-3 h-3 text-base-content/50" />
                        <span>{row.address?.area}, {row.address?.district}</span>
                    </div>
                    <div className="text-xs text-base-content/60">{row.address?.division}</div>
                </div>
            )
        },
        {
            header: 'License',
            accessor: 'licenseNumber',
            render: (row) => (
                <div className="text-sm">
                    <div className="font-mono">{row.licenseNumber}</div>
                    <div className="text-xs text-base-content/60">NID: {row.nidNumber || 'N/A'}</div>
                </div>
            )
        },
        {
            header: 'Stats',
            accessor: 'stats',
            render: (row) => (
                <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1">
                        <span className="text-base-content/60">Deliveries:</span>
                        <span className="font-semibold">{row.completedDeliveries || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-base-content/60">Rating:</span>
                        <span className="font-semibold text-warning">⭐ {row.rating?.toFixed(1) || '5.0'}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'isVerified',
            render: (row) => (
                <span className={`badge badge-sm ${row.isVerified ? 'badge-success' : 'badge-warning'}`}>
                    {row.isVerified ? (
                        <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                        </>
                    ) : (
                        <>
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Pending
                        </>
                    )}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: 'actions',
            render: (row) => (
                <div className="flex gap-2">
                    {!row.isVerified ? (
                        <button
                            onClick={() => handleVerifyRider(row.uid, true)}
                            className="btn btn-sm btn-success"
                            title="Verify Rider"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Verify
                        </button>
                    ) : (
                        <button
                            onClick={() => handleVerifyRider(row.uid, false)}
                            className="btn btn-sm btn-error btn-outline"
                            title="Unverify Rider"
                        >
                            <XCircle className="w-4 h-4" />
                            Unverify
                        </button>
                    )}
                </div>
            )
        }
    ]

    // Get current riders based on tab
    const getCurrentRiders = () => {
        switch (riderVerificationTab) {
            case 'unverified':
                return unverifiedRiders
            case 'verified':
                return verifiedRiders
            case 'all':
                return allRiders
            default:
                return []
        }
    }

    if (loading) {
        return <Loading />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">User Management</h1>
                    <p className="text-base-content/70">
                        {activeTab === 'users' && 'Manage all users, roles, and permissions'}
                        {activeTab === 'verify-riders' && 'Review and verify rider accounts'}
                        {activeTab === 'verify-sellers' && 'Review and verify seller accounts'}
                    </p>
                </div>
                <div className="stats bg-base-100 shadow-xl">
                    {activeTab === 'users' && (
                        <div className="stat">
                            <div className="stat-title">Total Users</div>
                            <div className="stat-value text-primary">{filteredUsers.length}</div>
                        </div>
                    )}
                    {activeTab === 'verify-riders' && (
                        <>
                            <div className="stat">
                                <div className="stat-title">Total</div>
                                <div className="stat-value text-info">{allRiders.length}</div>
                            </div>
                            <div className="stat">
                                <div className="stat-title">Pending</div>
                                <div className="stat-value text-warning">{unverifiedRiders.length}</div>
                            </div>
                            <div className="stat">
                                <div className="stat-title">Verified</div>
                                <div className="stat-value text-success">{verifiedRiders.length}</div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Main Tabs */}
            <div className="tabs tabs-boxed bg-base-100 p-1 shadow-lg">
                <button
                    className={`tab gap-2 ${activeTab === 'users' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    <UserCog className="w-4 h-4" />
                    All Users
                </button>
                <button
                    className={`tab gap-2 ${activeTab === 'verify-riders' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('verify-riders')}
                >
                    <Bike className="w-4 h-4" />
                    Verify Riders
                    {unverifiedRiders.length > 0 && (
                        <span className="badge badge-warning badge-sm">{unverifiedRiders.length}</span>
                    )}
                </button>
                <button
                    className={`tab gap-2 ${activeTab === 'verify-sellers' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('verify-sellers')}
                    disabled
                >
                    <Store className="w-4 h-4" />
                    Verify Sellers
                    <span className="badge badge-sm">Coming Soon</span>
                </button>
            </div>

            {/* Users Tab Content */}
            {activeTab === 'users' && (
                <>
                    {/* Filters */}
                    <div className="card bg-base-100 p-6 border border-base-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-control">
                                <div className="input input-bordered flex items-center gap-2">
                                    <Search className="w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, or ID..."
                                        className="flex-1 outline-none bg-transparent"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="form-control">
                                <select
                                    className="select select-bordered"
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                >
                                    <option value="all">All Roles</option>
                                    <option value="admin">Admin</option>
                                    <option value="seller">Seller</option>
                                    <option value="rider">Rider</option>
                                    <option value="user">User</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="card bg-base-100 p-6 border border-base-300">
                        <DataTable
                            columns={userColumns}
                            data={filteredUsers}
                            itemsPerPage={10}
                            emptyMessage="No users found"
                            EmptyIcon={UserCog}
                        />
                    </div>
                </>
            )}

            {/* Verify Riders Tab Content */}
            {activeTab === 'verify-riders' && (
                <>
                    {/* Rider Verification Tabs */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="tabs tabs-boxed">
                            <button
                                className={`tab ${riderVerificationTab === 'all' ? 'tab-active' : ''}`}
                                onClick={() => setRiderVerificationTab('all')}
                            >
                                All Riders ({allRiders.length})
                            </button>
                            <button
                                className={`tab ${riderVerificationTab === 'unverified' ? 'tab-active' : ''}`}
                                onClick={() => setRiderVerificationTab('unverified')}
                            >
                                Pending ({unverifiedRiders.length})
                            </button>
                            <button
                                className={`tab ${riderVerificationTab === 'verified' ? 'tab-active' : ''}`}
                                onClick={() => setRiderVerificationTab('verified')}
                            >
                                Verified ({verifiedRiders.length})
                            </button>
                        </div>

                        {unverifiedRiders.length > 0 && riderVerificationTab === 'unverified' && (
                            <button
                                onClick={handleVerifyAllRiders}
                                className="btn btn-success"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Verify All ({unverifiedRiders.length})
                            </button>
                        )}
                    </div>

                    {/* Riders Table */}
                    <div className="card bg-base-100 p-6 border border-base-300">
                        <DataTable
                            columns={riderColumns}
                            data={getCurrentRiders()}
                            itemsPerPage={10}
                            emptyMessage={
                                riderVerificationTab === 'unverified'
                                    ? 'No pending verifications'
                                    : riderVerificationTab === 'verified'
                                        ? 'No verified riders yet'
                                        : 'No riders found'
                            }
                            EmptyIcon={Bike}
                        />
                    </div>
                </>
            )}

            {/* Edit User Modal */}
            {showEditModal && editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-base-100 rounded-2xl max-w-lg w-full shadow-2xl border border-base-300">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-base-300 bg-linear-to-r from-primary to-secondary">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                    <Edit className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Edit User</h2>
                            </div>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="btn btn-ghost btn-sm btn-circle text-white hover:bg-white/20"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-4">
                            {/* User Avatar and Name */}
                            <div className="flex items-center gap-4 max-w-full">
                                <div className="avatar">
                                    <div className="w-14 h-14 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
                                        {editingUser.photoURL ? (
                                            <Image
                                                src={editingUser.photoURL}
                                                alt={editingUser.displayName}
                                                width={56}
                                                height={56}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="bg-primary/10 flex items-center justify-center w-full h-full text-primary font-bold text-xl">
                                                {editingUser.displayName?.charAt(0) || 'U'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-base-content/60">Name</p>
                                    <p className="font-semibold text-base-content">{editingUser.displayName}</p>
                                </div>
                            </div>

                            {/* UID, Email, Provider, Joined */}
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-xs text-base-content/60">UID</p>
                                        <p className="font-mono text-base-content break-all">{editingUser.uid}</p>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(editingUser.uid, 'UID')}
                                        className="btn btn-ghost btn-xs ml-2"
                                        title="Copy UID"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-xs text-base-content/60">Email</p>
                                        <p className="font-mono text-base-content">{editingUser.email}</p>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(editingUser.email, 'Email')}
                                        className="btn btn-ghost btn-xs ml-2"
                                        title="Copy Email"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-base-content/60">Provider</p>
                                        <p className="capitalize text-base-content">{editingUser.provider}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-base-content/60">Joined</p>
                                        <p className="text-base-content">{new Date(editingUser.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Role Section */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-sm">Current Role</span>
                                    <span className={`badge badge-md capitalize ${getRoleBadgeColor(editingUser.role)}`}>
                                        {editingUser.role}
                                    </span>
                                </div>

                                <div className="grid grid-cols-4 gap-2">
                                    {['user', 'seller', 'rider', 'admin'].map((role) => (
                                        <button
                                            key={role}
                                            onClick={() => {
                                                if (editingUser.role !== role) {
                                                    handleInitiateRoleChange(role)
                                                }
                                            }}
                                            disabled={editingUser.role === role}
                                            className={`btn btn-xs capitalize ${editingUser.role === role
                                                ? 'btn-disabled btn-ghost'
                                                : role === 'admin'
                                                    ? 'btn-error btn-outline'
                                                    : role === 'seller'
                                                        ? 'btn-warning btn-outline'
                                                        : role === 'rider'
                                                            ? 'btn-success btn-outline'
                                                            : 'btn-info btn-outline'
                                                }`}
                                        >
                                            {role}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex gap-3 p-4 border-t border-base-300 bg-base-200">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="btn btn-ghost flex-1 btn-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Role Change Modal */}
            {showConfirmModal && pendingRole && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-base-100 rounded-2xl max-w-md w-full shadow-2xl border border-base-300">
                        <div className="flex items-center justify-between p-6 border-b border-base-300 bg-linear-to-r from-warning to-error">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                    <AlertCircle className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Confirm Role Change</h2>
                            </div>
                            <button
                                onClick={() => {
                                    setShowConfirmModal(false)
                                    setPendingRole(null)
                                }}
                                className="btn btn-ghost btn-sm btn-circle text-white hover:bg-white/20"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-warning/10 border border-warning/20 p-4 rounded-lg">
                                <p className="text-base-content text-sm">
                                    Change <span className="font-bold">{editingUser?.displayName}</span> from <span className={`badge badge-sm capitalize ${getRoleBadgeColor(editingUser?.role)}`}>{editingUser?.role}</span> to <span className={`badge badge-sm capitalize ${getRoleBadgeColor(pendingRole)}`}>{pendingRole}</span>?
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 p-4 border-t border-base-300 bg-base-200">
                            <button
                                onClick={handleConfirmRoleChange}
                                className="btn btn-error flex-1 btn-sm"
                            >
                                <Check className="w-4 h-4" />
                                Confirm
                            </button>
                            <button
                                onClick={() => {
                                    setShowConfirmModal(false)
                                    setPendingRole(null)
                                }}
                                className="btn btn-ghost flex-1 btn-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
