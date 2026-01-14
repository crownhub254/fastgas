'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

export default function ProductDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [product, setProduct] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [quantity, setQuantity] = useState(1)
    const [selectedTab, setSelectedTab] = useState('description')

    useEffect(() => {
        fetchProduct()
    }, [params.id])

    const fetchProduct = async () => {
        try {
            const response = await fetch(`/api/products/${params.id}`)
            if (response.ok) {
                const data = await response.json()
                setProduct(data)
            } else {
                router.push('/products')
            }
        } catch (error) {
            console.error('Error fetching product:', error)
            router.push('/products')
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-100">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                    <p className="text-base-content/70 text-lg">Loading product details...</p>
                </div>
            </div>
        )
    }

    if (!product) {
        return null
    }

    return (
        <div className="section-padding bg-base-100 min-h-screen">
            <div className="container-custom">
                {/* Breadcrumb */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-sm mb-8 text-base-content/60"
                >
                    <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
                    <span>/</span>
                    <span className="text-base-content">{product.name}</span>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Product Image */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="card bg-base-100 sticky top-24">
                            <div className="relative rounded-2xl overflow-hidden h-125 group">
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>

                            {/* Thumbnail Gallery */}
                            <div className="grid grid-cols-4 gap-3 mt-4">
                                {[1, 2, 3, 4].map((_, idx) => (
                                    <div
                                        key={idx}
                                        className="relative aspect-square rounded-lg overflow-hidden bg-base-200 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                                    >
                                        <Image
                                            src={product.image}
                                            alt={`${product.name} view ${idx + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Product Details */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-6"
                    >
                        {/* Header */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-4 py-1.5 bg-primary/10 text-primary text-sm font-bold rounded-full">
                                    {product.category}
                                </span>
                                <span className={`px-4 py-1.5 text-sm font-bold rounded-full ${product.stock > 50
                                        ? 'bg-success/10 text-success'
                                        : product.stock > 20
                                            ? 'bg-warning/10 text-warning'
                                            : 'bg-error/10 text-error'
                                    }`}>
                                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold text-base-content mb-4 leading-tight">
                                {product.name}
                            </h1>

                            {/* Rating */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex text-warning">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className={`w-6 h-6 ${i < Math.floor(product.rating) ? 'fill-current' : 'fill-base-300'}`} viewBox="0 0 20 20">
                                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                        </svg>
                                    ))}
                                </div>
                                <span className="text-base-content/70 text-lg font-medium">
                                    {product.rating} ({Math.floor(Math.random() * 200) + 100} reviews)
                                </span>
                            </div>
                        </div>

                        {/* Price Card */}
                        <div className="card bg-linear-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
                            <div className="flex items-end gap-4">
                                <div>
                                    <div className="text-base-content/60 text-sm mb-1">Price</div>
                                    <div className="text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary">
                                        ${product.price}
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <span className="text-base-content/50 line-through text-lg">
                                        ${(product.price * 1.2).toFixed(2)}
                                    </span>
                                    <span className="ml-2 px-2 py-1 bg-error text-error-content text-xs font-bold rounded">
                                        -20% OFF
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-base-content/10">
                            <div className="flex gap-1">
                                {['description', 'features', 'reviews'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setSelectedTab(tab)}
                                        className={`px-6 py-3 font-semibold capitalize transition-all ${selectedTab === tab
                                                ? 'text-primary border-b-2 border-primary'
                                                : 'text-base-content/60 hover:text-base-content'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="card bg-base-200">
                            {selectedTab === 'description' && (
                                <div>
                                    <h3 className="text-xl font-bold mb-3 text-base-content">Product Description</h3>
                                    <p className="text-base-content/70 text-lg leading-relaxed">{product.description}</p>
                                </div>
                            )}

                            {selectedTab === 'features' && product.features && (
                                <div>
                                    <h3 className="text-xl font-bold mb-4 text-base-content">Key Features</h3>
                                    <ul className="space-y-3">
                                        {product.features.map((feature, index) => (
                                            <motion.li
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="flex items-center gap-3 text-base-content/80"
                                            >
                                                <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                                                    <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <span className="text-lg">{feature}</span>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {selectedTab === 'reviews' && (
                                <div>
                                    <h3 className="text-xl font-bold mb-4 text-base-content">Customer Reviews</h3>
                                    <div className="space-y-4">
                                        {[
                                            { name: 'John D.', rating: 5, comment: 'Excellent product! Exceeded my expectations.', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
                                            { name: 'Sarah M.', rating: 4, comment: 'Great quality, fast shipping. Very satisfied!', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
                                            { name: 'Mike R.', rating: 5, comment: 'Best purchase I\'ve made this year. Highly recommend!', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
                                        ].map((review, idx) => (
                                            <div key={idx} className="bg-base-100 rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="relative w-8 h-8 rounded-full overflow-hidden">
                                                        <Image
                                                            src={review.image}
                                                            alt={review.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <span className="font-semibold">{review.name}</span>
                                                    <div className="flex text-warning ml-auto">
                                                        {[...Array(review.rating)].map((_, i) => (
                                                            <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                                            </svg>
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-base-content/70">{review.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quantity Selector */}
                        <div className="card bg-base-200">
                            <label className="text-lg font-bold mb-3 text-base-content">Quantity</label>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="btn btn-circle btn-primary"
                                    disabled={quantity <= 1}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                    </svg>
                                </button>
                                <span className="text-3xl font-bold w-20 text-center text-base-content">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    className="btn btn-circle btn-primary"
                                    disabled={quantity >= product.stock}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                                <div className="ml-auto text-right">
                                    <div className="text-base-content/60 text-sm">Total</div>
                                    <div className="text-2xl font-bold text-primary">
                                        ${(product.price * quantity).toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                disabled={product.stock === 0}
                                className="btn-primary w-full flex items-center justify-center gap-3 text-lg"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span>Add to Cart</span>
                            </button>

                            <div className="grid grid-cols-2 gap-3">
                                <button className="btn-secondary flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    <span>Wishlist</span>
                                </button>
                                <button className="btn-secondary flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                    <span>Share</span>
                                </button>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-base-content/10">
                            {[
                                { icon: '🚚', text: 'Free Shipping' },
                                { icon: '🔒', text: 'Secure Payment' },
                                { icon: '↩️', text: 'Easy Returns' },
                            ].map((badge, idx) => (
                                <div key={idx} className="text-center">
                                    <div className="text-3xl mb-1">{badge.icon}</div>
                                    <div className="text-xs text-base-content/60 font-medium">{badge.text}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Related Products Section */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20"
                >
                    <h2 className="text-3xl font-bold text-base-content mb-8">You May Also Like</h2>
                    <div className="text-center text-base-content/60">
                        <p>Related products will appear here</p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
