'use client'

import { useEffect, useState } from 'react'
import { Search, Edit, Trash2, Package, Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth'

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                    <div key={product.id} className="card bg-base-200 overflow-hidden hover:shadow-xl transition-shadow">
                        <figure className="relative h-48 bg-base-300">
                            {product.image ? (
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-16 h-16 text-base-content/30" />
                                </div>
                            )}
                            {(product.stock || 0) < 5 && (
                                <div className="absolute top-2 right-2 badge badge-error">
                                    Low Stock
                                </div>
                            )}
                        </figure>
                        <div className="card-body">
                            <h2 className="card-title text-lg">{product.name}</h2>
                            <p className="text-sm text-base-content/70 line-clamp-2">
                                {product.description}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                                <div>
                                    <p className="text-2xl font-bold text-primary">
                                        ${product.price.toFixed(2)}
                                    </p>
                                    <p className="text-xs text-base-content/60">
                                        Stock: {product.stock || 0}
                                    </p>
                                </div>
                                <div className="badge badge-outline capitalize">
                                    {product.category}
                                </div>
                            </div>
                            <div className="card-actions justify-end mt-4">
                                <button
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="btn btn-sm btn-ghost text-error"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-base-content/70">
                        {searchQuery || categoryFilter !== 'all'
                            ? 'No products found matching your filters'
                            : 'You haven\'t added any products yet'}
                    </p>
                    {!searchQuery && categoryFilter === 'all' && (
                        <Link
                            href="/dashboard/seller/add-product"
                            className="btn btn-primary mt-4"
                        >
                            <Plus className="w-5 h-5" />
                            Add Your First Product
                        </Link>
                    )}
                </div>
            )}
        </div>
    )
}
