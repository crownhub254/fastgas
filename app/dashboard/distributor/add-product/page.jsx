'use client'

import { useState } from 'react'
import { Package, Plus, X, DollarSign, Tag, Image, FileText, Settings, Sparkles, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AddProductPage() {
    const [loading, setLoading] = useState(false)
    const [user] = useState({ email: 'seller@example.com', uid: 'user123' })
    const [userData] = useState({ displayName: 'Test Seller' })

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        image: '',
        images: ['', '', ''],
        features: [''],
        specifications: {}
    })
    const [specKey, setSpecKey] = useState('')
    const [specValue, setSpecValue] = useState('')

    const categories = ['Electronics', 'Fashion', 'Home', 'Sports', 'Books', 'Toys', 'Beauty', 'Automotive', 'Fitness', 'Kitchen']

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleImageChange = (index, value) => {
        const newImages = [...formData.images]
        newImages[index] = value
        setFormData(prev => ({ ...prev, images: newImages }))
    }

    const addImage = () => {
        setFormData(prev => ({ ...prev, images: [...prev.images, ''] }))
    }

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }))
    }

    const handleFeatureChange = (index, value) => {
        const newFeatures = [...formData.features]
        newFeatures[index] = value
        setFormData(prev => ({ ...prev, features: newFeatures }))
    }

    const addFeature = () => {
        setFormData(prev => ({ ...prev, features: [...prev.features, ''] }))
    }

    const removeFeature = (index) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }))
    }

    const addSpecification = () => {
        if (specKey && specValue) {
            setFormData(prev => ({
                ...prev,
                specifications: { ...prev.specifications, [specKey]: specValue }
            }))
            setSpecKey('')
            setSpecValue('')
        } else {
            toast.error('Please fill in both specification name and value')
        }
    }

    const removeSpecification = (key) => {
        const newSpecs = { ...formData.specifications }
        delete newSpecs[key]
        setFormData(prev => ({ ...prev, specifications: newSpecs }))
    }

    const handleSubmit = async () => {
        if (!formData.name || !formData.price || !formData.category || !formData.stock) {
            toast.error('Please fill in all required fields')
            return
        }

        if (!formData.images[0]) {
            toast.error('Please add at least one main image')
            return
        }

        setLoading(true)

        try {
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                image: formData.images[0] || formData.image,
                images: formData.images.filter(img => img),
                features: formData.features.filter(f => f),
                sellerEmail: user.email,
                userId: user.uid,
                sellerName: userData?.displayName || 'Unknown Seller',
                rating: 0,
                reviews: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            })

            const data = await response.json()

            if (data.success) {
                toast.success('Product added successfully!', {
                    icon: '🎉',
                    style: { borderRadius: '10px', background: '#10b981', color: '#fff' }
                })
                setFormData({
                    name: '',
                    description: '',
                    price: '',
                    category: '',
                    stock: '',
                    image: '',
                    images: ['', '', ''],
                    features: [''],
                    specifications: {}
                })
                setSpecKey('')
                setSpecValue('')
            } else {
                toast.error(data.error || 'Failed to add product')
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Failed to add product: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-100">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                            <Package className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                                Add New Product
                            </h1>
                            <p className="text-base-content/70 text-lg mt-2">
                                Create a new product listing for your store
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Basic Information Card */}
                    <div className="card bg-base-100 shadow-xl border border-base-300">
                        <div className="card-body">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold">Basic Information</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Product Name */}
                                <div className="md:col-span-2">
                                    <label className="label">
                                        <span className="label-text font-bold text-base">Product Name *</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="input input-bordered input-lg w-full focus:input-primary"
                                        placeholder="e.g., Peloton Bike+ Premium Indoor Exercise Bike"
                                    />
                                </div>

                                {/* Description */}
                                <div className="md:col-span-2">
                                    <label className="label">
                                        <span className="label-text font-bold text-base">Description *</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="textarea textarea-bordered textarea-lg h-32 w-full focus:textarea-primary leading-relaxed"
                                        placeholder="Enter a detailed description of your product..."
                                    />
                                    <label className="label">
                                        <span className="label-text-alt text-base-content/60">
                                            {formData.description.length} characters
                                        </span>
                                    </label>
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="label">
                                        <span className="label-text font-bold text-base flex items-center gap-2">
                                            <DollarSign className="w-5 h-5" />
                                            Price *
                                        </span>
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="input input-bordered input-lg w-full focus:input-primary"
                                        placeholder="2495"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="label">
                                        <span className="label-text font-bold text-base flex items-center gap-2">
                                            <Tag className="w-5 h-5" />
                                            Category *
                                        </span>
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="select select-bordered select-lg w-full focus:select-primary"
                                    >
                                        <option value="">Select category</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Stock */}
                                <div>
                                    <label className="label">
                                        <span className="label-text font-bold text-base flex items-center gap-2">
                                            <Package className="w-5 h-5" />
                                            Stock Quantity *
                                        </span>
                                    </label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        className="input input-bordered input-lg w-full focus:input-primary"
                                        placeholder="22"
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Images Card */}
                    <div className="card bg-base-100 shadow-xl border border-base-300">
                        <div className="card-body">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                        <Image className="w-6 h-6 text-white" />
                                    </div>
                                    <h2 className="text-3xl font-bold">Product Images</h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={addImage}
                                    className="btn btn-primary gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Image
                                </button>
                            </div>

                            <div className="space-y-4">
                                {formData.images.map((img, index) => (
                                    <div key={index} className="flex gap-4 items-start">
                                        <div className="flex-1">
                                            <label className="label">
                                                <span className="label-text font-semibold">
                                                    Image {index + 1} {index === 0 && '(Main Image) *'}
                                                </span>
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="url"
                                                    value={img}
                                                    onChange={(e) => handleImageChange(index, e.target.value)}
                                                    className="input input-bordered input-lg flex-1 focus:input-primary"
                                                    placeholder="https://images.unsplash.com/photo-..."
                                                />
                                                {index > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="btn btn-error btn-lg"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                            {img && (
                                                <div className="mt-2">
                                                    <img
                                                        src={img}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-48 object-cover rounded-lg"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none'
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Features Card */}
                    <div className="card bg-base-100 shadow-xl border border-base-300">
                        <div className="card-body">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                                        <Sparkles className="w-6 h-6 text-white" />
                                    </div>
                                    <h2 className="text-3xl font-bold">Product Features</h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={addFeature}
                                    className="btn btn-primary gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Feature
                                </button>
                            </div>

                            <div className="space-y-3">
                                {formData.features.map((feature, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={feature}
                                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                                            className="input input-bordered input-lg flex-1 focus:input-primary"
                                            placeholder="e.g., 24-inch rotating HD touchscreen"
                                        />
                                        {formData.features.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeFeature(index)}
                                                className="btn btn-error btn-lg"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Specifications Card */}
                    <div className="card bg-base-100 shadow-xl border border-base-300">
                        <div className="card-body">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                                    <Settings className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold">Specifications</h2>
                            </div>

                            <div className="flex gap-4 mb-4">
                                <input
                                    type="text"
                                    value={specKey}
                                    onChange={(e) => setSpecKey(e.target.value)}
                                    className="input input-bordered input-lg flex-1 focus:input-primary"
                                    placeholder="Specification name (e.g., Screen Size)"
                                />
                                <input
                                    type="text"
                                    value={specValue}
                                    onChange={(e) => setSpecValue(e.target.value)}
                                    className="input input-bordered input-lg flex-1 focus:input-primary"
                                    placeholder="Value (e.g., 24 inches HD)"
                                />
                                <button
                                    type="button"
                                    onClick={addSpecification}
                                    className="btn btn-primary btn-lg gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add
                                </button>
                            </div>

                            {Object.keys(formData.specifications).length > 0 && (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {Object.entries(formData.specifications).map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between p-4 bg-base-200 rounded-lg border border-base-300">
                                            <div>
                                                <p className="font-bold text-base-content">{key}</p>
                                                <p className="text-sm text-base-content/60">{value}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeSpecification(key)}
                                                className="btn btn-error btn-sm btn-circle"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            className="btn btn-lg btn-ghost"
                            onClick={() => window.history.back()}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="btn btn-primary btn-lg gap-2 px-8"
                        >
                            {loading ? (
                                <>
                                    <span className="loading loading-spinner"></span>
                                    Adding Product...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Add Product
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
