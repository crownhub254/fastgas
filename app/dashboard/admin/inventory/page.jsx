'use client'

import { useState, useEffect } from 'react'
import { Package, Plus, Minus, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'

// FastGas Inventory Management
export default function InventoryPage() {
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(null)

    useEffect(() => {
        fetchInventory()
    }, [])

    const fetchInventory = async () => {
        try {
            const response = await fetch('/api/products')
            const data = await response.json()
            if (data.success && data.product) {
                setProduct(data.product)
            }
        } catch (error) {
            console.error('Failed to fetch inventory:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateStock = async (variantSku, change) => {
        setUpdating(variantSku)
        try {
            // In a real app, this would update the database
            setProduct(prev => ({
                ...prev,
                variants: prev.variants.map(v => 
                    v.sku === variantSku 
                        ? { ...v, stock: Math.max(0, v.stock + change) }
                        : v
                )
            }))
        } catch (error) {
            console.error('Failed to update stock:', error)
        } finally {
            setUpdating(null)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        )
    }

    const totalStock = product?.variants?.reduce((sum, v) => sum + v.stock, 0) || 0
    const lowStockVariants = product?.variants?.filter(v => v.stock < 20) || []

    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Inventory Management</h1>
                        <p className="text-base-content/70">Manage FastGas cylinder stock levels</p>
                    </div>
                    <button className="btn btn-primary">
                        <Plus className="w-4 h-4" />
                        Add Stock
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-base-100 rounded-xl p-6 border border-base-200">
                        <div className="flex items-center gap-3 mb-2">
                            <Package className="w-5 h-5 text-primary" />
                            <span className="text-base-content/70">Total Stock</span>
                        </div>
                        <p className="text-3xl font-bold">{totalStock}</p>
                        <p className="text-sm text-base-content/50">cylinders</p>
                    </div>
                    
                    <div className="bg-base-100 rounded-xl p-6 border border-base-200">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-5 h-5 text-success" />
                            <span className="text-base-content/70">This Week</span>
                        </div>
                        <p className="text-3xl font-bold text-success">+45</p>
                        <p className="text-sm text-base-content/50">units sold</p>
                    </div>
                    
                    <div className="bg-base-100 rounded-xl p-6 border border-base-200">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingDown className="w-5 h-5 text-error" />
                            <span className="text-base-content/70">Low Stock</span>
                        </div>
                        <p className="text-3xl font-bold text-error">{lowStockVariants.length}</p>
                        <p className="text-sm text-base-content/50">variants</p>
                    </div>
                    
                    <div className="bg-base-100 rounded-xl p-6 border border-base-200">
                        <div className="flex items-center gap-3 mb-2">
                            <Package className="w-5 h-5 text-warning" />
                            <span className="text-base-content/70">Pending Orders</span>
                        </div>
                        <p className="text-3xl font-bold">12</p>
                        <p className="text-sm text-base-content/50">to fulfill</p>
                    </div>
                </div>

                {/* Low Stock Alert */}
                {lowStockVariants.length > 0 && (
                    <div className="alert alert-warning">
                        <AlertTriangle className="w-5 h-5" />
                        <div>
                            <h4 className="font-bold">Low Stock Alert</h4>
                            <p className="text-sm">
                                {lowStockVariants.map(v => v.size).join(', ')} cylinders are running low. 
                                Consider restocking soon.
                            </p>
                        </div>
                    </div>
                )}

                {/* Inventory Table */}
                <div className="bg-base-100 rounded-xl border border-base-200 overflow-hidden">
                    <div className="p-4 border-b border-base-200">
                        <h2 className="font-semibold">FastGas Cylinder Variants</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>SKU</th>
                                    <th>Size</th>
                                    <th>Retail Price</th>
                                    <th>Reseller Price</th>
                                    <th>Wholesale Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {product?.variants?.map((variant) => (
                                    <tr key={variant.sku} className="hover">
                                        <td className="font-mono">{variant.sku}</td>
                                        <td>
                                            <span className="badge badge-primary">{variant.size}</span>
                                        </td>
                                        <td>KES {variant.retailPrice.toLocaleString()}</td>
                                        <td>KES {variant.resellerPrice.toLocaleString()}</td>
                                        <td>KES {variant.wholesalePrice.toLocaleString()}</td>
                                        <td>
                                            <span className={`font-bold ${variant.stock < 20 ? 'text-error' : variant.stock < 50 ? 'text-warning' : 'text-success'}`}>
                                                {variant.stock}
                                            </span>
                                        </td>
                                        <td>
                                            {variant.stock === 0 ? (
                                                <span className="badge badge-error">Out of Stock</span>
                                            ) : variant.stock < 20 ? (
                                                <span className="badge badge-warning">Low Stock</span>
                                            ) : (
                                                <span className="badge badge-success">In Stock</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    className="btn btn-sm btn-ghost"
                                                    onClick={() => updateStock(variant.sku, -1)}
                                                    disabled={updating === variant.sku || variant.stock === 0}
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-ghost"
                                                    onClick={() => updateStock(variant.sku, 1)}
                                                    disabled={updating === variant.sku}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                                <button className="btn btn-sm btn-primary">
                                                    Restock
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Stock History */}
                <div className="bg-base-100 rounded-xl border border-base-200 p-6">
                    <h2 className="font-semibold mb-4">Recent Stock Changes</h2>
                    <div className="space-y-3">
                        {[
                            { action: 'Added', variant: '13kg', qty: 50, by: 'Admin', time: '2 hours ago' },
                            { action: 'Sold', variant: '6kg', qty: 5, by: 'Reseller John', time: '4 hours ago' },
                            { action: 'Sold', variant: '13kg', qty: 10, by: 'Client Order', time: '6 hours ago' },
                            { action: 'Added', variant: '25kg', qty: 20, by: 'Admin', time: '1 day ago' },
                        ].map((log, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-base-200 last:border-0">
                                <div className="flex items-center gap-3">
                                    <span className={`badge ${log.action === 'Added' ? 'badge-success' : 'badge-error'}`}>
                                        {log.action === 'Added' ? '+' : '-'}{log.qty}
                                    </span>
                                    <span>{log.variant} cylinders</span>
                                </div>
                                <div className="text-sm text-base-content/50">
                                    <span>{log.by}</span>
                                    <span className="mx-2">•</span>
                                    <span>{log.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}
