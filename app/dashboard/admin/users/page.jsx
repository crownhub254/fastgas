'use client'

import { useEffect, useState } from 'react'
import { Search, Edit, Trash2, UserCog, X, Check } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import Loading from '../../loading'
import DataTable from '../../components/DataTable'

export default function UserManagement() {
    const [users, setUsers] = useState([])
    const [filteredUsers, setFilteredUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')
    const [editingUser, setEditingUser] = useState(null)
    const [showEditModal, setShowEditModal] = useState(false)

    useEffect(() => {
        fetchUsers()
    }, [])

    useEffect(() => {
        filterUsers()
    }, [searchQuery, roleFilter, users])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/users`)
            const data = await response.json()

            if (data.success) {
                setUsers(data.users || [])
                setFilteredUsers(data.users || [])
            }
        } catch (error) {
            console.error('Failed to fetch users:', error)
            toast.error('Failed to load users')
        } finally {
            setLoading(false)
        }
    }

    const filterUsers = () => {
        let filtered = users

        // Apply role filter
        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => user.role === roleFilter)
        }

        // Apply search filter
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

    const handleUpdateUser = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/users/${editingUser.uid}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    displayName: editingUser.displayName,
                    role: editingUser.role
                })
            })

            const data = await response.json()

            if (data.success) {
                toast.success('User updated successfully')
                setUsers(users.map(u => u.uid === editingUser.uid ? data.user : u))
                setShowEditModal(false)
                setEditingUser(null)
            } else {
                toast.error(data.error || 'Failed to update user')
            }
        } catch (error) {
            console.error('Failed to update user:', error)
            toast.error('Failed to update user')
        }
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

    const handleChangeRole = async (uid, newRole) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/users/${uid}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            })

            const data = await response.json()

            if (data.success) {
                toast.success(`User role changed to ${newRole}`)
                setUsers(users.map(u => u.uid === uid ? data.user : u))
            } else {
                toast.error(data.error || 'Failed to change role')
            }
        } catch (error) {
            console.error('Failed to change role:', error)
            toast.error('Failed to change role')
        }
    }

    if (loading) {
        return <Loading />
    }

    // DataTable columns configuration
    const columns = [
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
                <select
                    className="select select-sm select-bordered capitalize"
                    value={row.role}
                    onChange={(e) => handleChangeRole(row.uid, e.target.value)}
                >
                    <option value="user">User</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                </select>
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
                        className="btn btn-sm btn-ghost"
                        title="Edit User"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDeleteUser(row.uid)}
                        className="btn btn-sm btn-ghost text-error"
                        title="Delete User"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">User Management</h1>
                    <p className="text-base-content/70">Manage all users, roles, and permissions</p>
                </div>
                <div className="badge badge-lg badge-primary">
                    {filteredUsers.length} Users
                </div>
            </div>

            {/* Filters */}
            <div className="card bg-base-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Search */}
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

                    {/* Role Filter */}
                    <div className="form-control">
                        <select
                            className="select select-bordered"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="seller">Seller</option>
                            <option value="user">User</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Table using DataTable Component */}
            <div className="card bg-base-200 p-6">
                <DataTable
                    columns={columns}
                    data={filteredUsers}
                    itemsPerPage={5}
                    emptyMessage="No users found"
                    EmptyIcon={UserCog}
                />
            </div>

            {/* Edit User Modal */}
            {showEditModal && editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-base-100 rounded-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Edit User</h2>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="btn btn-ghost btn-sm btn-circle"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Display Name</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered"
                                    value={editingUser.displayName}
                                    onChange={(e) =>
                                        setEditingUser({ ...editingUser, displayName: e.target.value })
                                    }
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Email</span>
                                </label>
                                <input
                                    type="email"
                                    className="input input-bordered"
                                    value={editingUser.email}
                                    disabled
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Role</span>
                                </label>
                                <select
                                    className="select select-bordered"
                                    value={editingUser.role}
                                    onChange={(e) =>
                                        setEditingUser({ ...editingUser, role: e.target.value })
                                    }
                                >
                                    <option value="user">User</option>
                                    <option value="seller">Seller</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleUpdateUser}
                                className="btn btn-primary flex-1"
                            >
                                <Check className="w-4 h-4" />
                                Save Changes
                            </button>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="btn btn-ghost flex-1"
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
