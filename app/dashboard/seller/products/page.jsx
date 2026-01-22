'use client'

import { useEffect, useState } from 'react'
import { Search, Trash2, Package, Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth'
import DataTable from '../../components/DataTable'
import Loading from '../../loading'

export default function SellerProducts() {
    const [products, setProducts] = useState([])
    const [filteredProducts, setFilteredProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const { userData } = useFirebaseAuth()

    useEffect(() => {
        if (userData) {
            fetchProducts()
        }
    }, [userData])

    useEffect(() => {
        filterProducts()
    }, [searchQuery, categoryFilter, products])

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)
            const data = await response.json()

            if (data.success) {
                const sellerProducts = (data.products || []).filter(
                    p => p.sellerEmail === userData.email
                )
                setProducts(sellerProducts)
                setFilteredProducts(sellerProducts)
            }
        } catch (error) {
            console.error('Failed to fetch products:', error)
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
                product.id?.toLowerCase().includes(query)
            )
        }

        setFilteredProducts(filtered)
    }

    const handleDeleteProduct = async (productId) => {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            return
        }

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
                                <Image
                                    src={row.image}
                                    alt={row.name}
                                    width={48}
                                    height={48}
                                    className="object-cover"
                                />
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
                <button
                    onClick={() => handleDeleteProduct(row.id)}
                    className="btn btn-sm btn-ghost text-error"
                    title="Delete Product"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )
        }
    ]

    if (loading) {
        return <Loading />
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">My Products</h1>
                    <p className="text-base-content/70">Manage your product inventory</p>
                </div>
                <Link
                    href="/dashboard/seller/add-product"
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add New Product
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                            <p className="text-2xl font-bold">
                                {products.filter(p => (p.stock || 0) > 0).length}
                            </p>
                            <p className="text-sm text-base-content/70">In Stock</p>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-error/10 flex items-center justify-center">
                            <Package className="w-6 h-6 text-error" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {products.filter(p => (p.stock || 0) < 5).length}
                            </p>
                            <p className="text-sm text-base-content/70">Low Stock</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card bg-base-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                        <div className="input">
                            <span className="">
                                <Search className="w-5 h-5" />
                            </span>
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="flex-1"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-control">
                        <select
                            className="select select-bordered"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category === 'all' ? 'All Categories' : category}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="card bg-base-200 p-6">
                <DataTable
                    columns={columns}
                    data={filteredProducts}
                    itemsPerPage={5}
                    emptyMessage={
                        searchQuery || categoryFilter !== 'all'
                            ? 'No products found matching your filters'
                            : "You haven't added any products yet"
                    }
                    EmptyIcon={Package}
                />
            </div>
        </div>
    )
}
