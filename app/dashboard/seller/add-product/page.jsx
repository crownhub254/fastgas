'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Upload, DollarSign, Package, Tag, FileText, Image as ImgIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth'

export default function SellerAddProduct() {
    const router = useRouter()
    const { userData } = useFirebaseAuth()
    const [loading, setLoading] = useState(false)
    const [imagePreview, setImagePreview] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        image: '',
        category: 'Electronics',
        stock: '',
        features: [''],
        specifications: {
            Display: '', Processor: '', Memory: '', Sensors: '',
            Connectivity: '', Battery: '', 'Water Resistance': '', Compatibility: ''
        }
    })

    const categories = ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Food', 'Other']

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (name === 'image') setImagePreview(value)
    }

    const handleSubmit = async () => {
        if (!userData || !formData.name || !formData.price || !formData.stock || !formData.image || !formData.description) {
            toast.error('Please fill in all required fields')
            return
        }

        setLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    stock: parseInt(formData.stock),
                    rating: 0,
                    features: formData.features.filter(f => f.trim()),
                    sellerEmail: userData.email,
                    userId: userData.uid,
                    sellerName: userData.displayName
                })
            })

            const data = await response.json()
            if (data.success) {
                toast.success('Product added successfully!')
                router.push('/dashboard/seller/products')
            } else {
                toast.error(data.error || 'Failed to add product')
            }
        } catch (error) {
            toast.error('Failed to add product')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 max-w-6xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                        Add New Product
                    </h1>
                    <p className="text-base-content/70">Create a new product listing for your store</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="card bg-base-200 p-6 sticky top-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <ImgIcon className="w-5 h-5 text-primary" />
                            Product Preview
                        </h3>
                        <div className="aspect-square rounded-xl bg-base-300 overflow-hidden mb-4">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-base-content/30">
                                    <ImgIcon className="w-20 h-20 mb-2" />
                                    <p className="text-sm">Image preview</p>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-base-content/60">Name:</span>
                                <span className="font-semibold">{formData.name || 'Not set'}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-base-content/60">Price:</span>
                                <span className="font-bold text-primary text-lg">${formData.price || '0.00'}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-base-content/60">Stock:</span>
                                <span className="font-semibold">{formData.stock || '0'} units</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="card bg-gradient-to-br from-base-200 to-base-300 p-6 shadow-xl">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Package className="w-6 h-6 text-primary" />
                            Basic Information
                        </h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-control md:col-span-2">
                                    <label className="label"><span className="label-text font-semibold">Product Name *</span></label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="input input-bordered input-lg" placeholder="e.g., Smart Watch Elite" />
                                </div>

                                <div className="form-control">
                                    <label className="label"><span className="label-text font-semibold flex items-center gap-2"><Tag className="w-4 h-4" />Category *</span></label>
                                    <select name="category" value={formData.category} onChange={handleChange} className="select select-bordered select-lg">
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>

                                <div className="form-control">
                                    <label className="label"><span className="label-text font-semibold flex items-center gap-2"><DollarSign className="w-4 h-4" />Price *</span></label>
                                    <input type="number" name="price" value={formData.price} onChange={handleChange} className="input input-bordered input-lg" placeholder="399.99" step="0.01" min="0" />
                                </div>

                                <div className="form-control">
                                    <label className="label"><span className="label-text font-semibold flex items-center gap-2"><Package className="w-4 h-4" />Stock *</span></label>
                                    <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="input input-bordered input-lg" placeholder="50" min="0" />
                                </div>

                                <div className="form-control">
                                    <label className="label"><span className="label-text font-semibold flex items-center gap-2"><Upload className="w-4 h-4" />Image URL *</span></label>
                                    <input type="url" name="image" value={formData.image} onChange={handleChange} className="input input-bordered input-lg" placeholder="https://example.com/image.jpg" />
                                </div>

                                <div className="form-control md:col-span-2">
                                    <label className="label"><span className="label-text font-semibold flex items-center gap-2"><FileText className="w-4 h-4" />Description *</span></label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} className="textarea textarea-bordered textarea-lg h-32" placeholder="Transform your fitness journey..." />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card bg-base-200 p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2"><Plus className="w-6 h-6 text-primary" />Features</h2>
                            <button onClick={() => setFormData(prev => ({ ...prev, features: [...prev.features, ''] }))} className="btn btn-primary btn-sm gap-2"><Plus className="w-4 h-4" />Add</button>
                        </div>
                        <div className="space-y-3">
                            {formData.features.map((feature, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <span className="badge badge-lg badge-primary">{idx + 1}</span>
                                    <input type="text" value={feature} onChange={(e) => {
                                        const newFeatures = [...formData.features]
                                        newFeatures[idx] = e.target.value
                                        setFormData(prev => ({ ...prev, features: newFeatures }))
                                    }} className="input input-bordered flex-1" placeholder="Feature description" />
                                    {formData.features.length > 1 && (
                                        <button onClick={() => setFormData(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== idx) }))} className="btn btn-square btn-error btn-sm"><X className="w-4 h-4" /></button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card bg-base-200 p-6 shadow-xl">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><FileText className="w-6 h-6 text-primary" />Specifications</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.keys(formData.specifications).map((key) => (
                                <div key={key} className="form-control">
                                    <label className="label"><span className="label-text font-semibold">{key}</span></label>
                                    <input type="text" value={formData.specifications[key]} onChange={(e) => setFormData(prev => ({ ...prev, specifications: { ...prev.specifications, [key]: e.target.value } }))} className="input input-bordered" placeholder={`Enter ${key.toLowerCase()}`} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4 justify-end sticky bottom-4 bg-base-100 p-4 rounded-xl shadow-2xl border border-base-300">
                        <button onClick={() => router.back()} className="btn btn-ghost btn-lg" disabled={loading}>Cancel</button>
                        <button onClick={handleSubmit} className="btn btn-primary btn-lg gap-2 shadow-xl" disabled={loading}>
                            {loading ? <><span className="loading loading-spinner"></span>Adding...</> : <><Plus className="w-5 h-5" />Add Product</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
