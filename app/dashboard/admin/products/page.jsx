'use client'

import { useEffect, useState } from 'react'
import { Search, Trash2, Package, User } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import DataTable from '../../components/DataTable'

export default function AdminProducts() {
    const [products, setProducts] = useState([])
    const [sellers, setSellers] = useState({})
    const [filteredProducts, setFilteredProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        filterProducts()
    }, [searchQuery, categoryFilter, products])

    const fetchData = async () => {
        try {
            setLoading(true)

            // Fetch products
            const productsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)
            const productsData = await productsRes.json()
            const allProducts = productsData.products || []

            // Fetch users to get seller info
            const usersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/users`)
            const usersData = await usersRes.json()
            const users = usersData.users || []

            // Create seller lookup map
            const sellerMap = {}
            users.forEach(user => {
                sellerMap[user.uid] = {
                    name: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL
                }
            })

            setSellers(sellerMap)
            setProducts(allProducts)
            setFilteredProducts(allProducts)
        } catch (error) {
            console.error('Failed to fetch data:', error)
            toast.error('Failed to load products')
        } finally {
            setLoading(false)
        }
    }

    const filterProducts = () => {
        let filtered = products

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(product => product.category === categoryFilter)
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(product =>
                product.name?.toLowerCase().includes(query) ||
                product.description?.toLowerCase().includes(query) ||
                product.id?.toLowerCase().includes(query) ||
                sellers[product.userId]?.name?.toLowerCase().includes(query) ||
                sellers[product.userId]?.email?.toLowerCase().includes(query)
            )
        }

        setFilteredProducts(filtered)
    }

    const handleDeleteProduct = async (productId) => {
        if (!confirm('Are you sure you want to delete this product?')) return

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`, {
                method: 'DELETE'
            })

            const data = await response.json()

            if (data.success) {
                toast.success('Product deleted successfully')
                setProducts(products.filter(p => p.id !== productId))
            } else {
                toast.error(data.error || 'Failed to delete product')
            }
        } catch (error) {
            console.error('Failed to delete product:', error)
            toast.error('Failed to delete product')
        }
    }

    const categories = ['all', ...new Set(products.map(p => p.category))]

    const columns = [
        {
            header: 'Product',
            accessor: 'name',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="avatar">
                        <div className="w-12 h-12 rounded-lg">
                            {row.image ? (
                                <Image src={row.image} alt={row.name} width={48} height={48} className="object-cover" />
                            ) : (
                                <div className="w-full h-full bg-base-300 flex items-center justify-center">
                                    <Package className="w-6 h-6 text-base-content/30" />
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <div className="font-bold">{row.name}</div>
                        <div className="text-xs opacity-50">{row.id}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Category',
            accessor: 'category',
            render: (row) => <span className="badge badge-outline capitalize">{row.category}</span>
        },
        {
            header: 'Price',
            accessor: 'price',
            render: (row) => <span className="font-bold text-primary">${row.price.toFixed(2)}</span>
        },
        {
            header: 'Stock',
            accessor: 'stock',
            render: (row) => (
                <span className={`badge ${(row.stock || 0) < 5 ? 'badge-error' : 'badge-success'}`}>
                    {row.stock || 0}
                </span>
            )
        },
        {
            header: 'Seller',
            accessor: 'userId',
            render: (row) => {
                const seller = sellers[row.userId]
                return seller ? (
                    <div className="flex items-center gap-2">
                        <div className="avatar">
                            <div className="w-8 h-8 rounded-full">
                                {seller.photoURL ? (
                                    <Image src={seller.photoURL} alt={seller.name} width={32} height={32} />
                                ) : (
                                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                        <User className="w-4 h-4 text-primary" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="text-xs">
                            <div className="font-semibold">{seller.name}</div>
                            <div className="text-base-content/60">{seller.email}</div>
                        </div>
                    </div>
                ) : (
                    <span className="text-xs text-base-content/60">No seller</span>
                )
            }
        },
        {
            header: 'Rating',
            accessor: 'rating',
            render: (row) => (
                <div className="flex items-center gap-1">
                    <span className="text-warning">★</span>
                    <span>{(row.rating || 0).toFixed(1)}</span>
                </div>
            )
        },
        {
            header: 'Actions',
            accessor: 'actions',
            render: (row) => (
                <button onClick={() => handleDeleteProduct(row.id)} className="btn btn-sm btn-ghost text-error">
                    <Trash2 className="w-4 h-4" />
                </button>
            )
        }
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-base-content/70">Loading products...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">All Products</h1>
                <p className="text-base-content/70">Manage all products in the system</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card bg-base-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Package className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{products.length}</p>
                            <p className="text-sm text-base-content/70">Total Products</p>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                            <Package className="w-6 h-6 text-success" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{products.filter(p => (p.stock || 0) > 0).length}</p>
                            <p className="text-sm text-base-content/70">In Stock</p>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                            <Package className="w-6 h-6 text-warning" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{products.filter(p => (p.stock || 0) < 5).length}</p>
                            <p className="text-sm text-base-content/70">Low Stock</p>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center">
                            <Package className="w-6 h-6 text-info" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{categories.length - 1}</p>
                            <p className="text-sm text-base-content/70">Categories</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card bg-base-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                        <div className="input">
                            <span className=""><Search className="w-5 h-5" /></span>
                            <input type="text" placeholder="Search products or sellers..." className="flex-1" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                    </div>

                    <div className="form-control">
                        <select className="select select-bordered" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                            {categories.map(category => (
                                <option key={category} value={category}>{category === 'all' ? 'All Categories' : category}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="card bg-base-200 p-6">
                <DataTable columns={columns} data={filteredProducts} itemsPerPage={5} emptyMessage="No products found" EmptyIcon={Package} />
            </div>
        </div>
    )
}
