'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'
import { Heart, Share2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const [product, setProduct] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [quantity, setQuantity] = useState(1)
    const [selectedTab, setSelectedTab] = useState('description')
    const [selectedImage, setSelectedImage] = useState(0)
    const { addToCart, addToWishlist, isInWishlist, removeFromWishlist } = useCart()

    useEffect(() => {
        if (!id) return
        fetchProduct()
    }, [id])

    const fetchProduct = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`)
            if (response.ok) {
                const data = await response.json()
                setProduct(data.product || data)
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

    const handleAddToCart = () => {
        addToCart(product, quantity)
        toast.success(`${quantity} ${product.name}(s) added to cart!`)
    }

    const handleWishlistToggle = () => {
        if (isInWishlist(product._id)) {
            removeFromWishlist(product._id)
        } else {
            addToWishlist(product)
        }
    }

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.name,
                    text: product.description.split('\n\n')[0],
                    url: window.location.href
                })
            } catch (err) {
                console.log('Error sharing:', err)
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href)
            toast.success('Link copied to clipboard!')
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-base-content/70 text-lg">Loading product details...</p>
                </div>
            </div>
        )
    }

    if (!product) return null

    const images = [product.image, product.image, product.image, product.image]
    const averageRating = product.rating || 0
    const totalReviews = product.reviews?.length || 0
    const inWishlist = isInWishlist(product.id)

    return (
        <div className="min-h-screen">
            <div className="section-padding">
                <div className="container-custom">
                    {/* Breadcrumb */}
                    <motion.nav
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-sm mb-8 text-base-content/60 flex-wrap"
                    >
                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                        <span>/</span>
                        <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
                        <span>/</span>
                        <span className="text-base-content truncate max-w-50">{product.name}</span>
                    </motion.nav>

                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                        {/* Product Images */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-4"
                        >
                            <div className="card overflow-hidden sticky top-24">
                                <div className="relative aspect-square w-full bg-base-200 rounded-lg overflow-hidden group">
                                    <Image
                                        src={images[selectedImage]}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        priority
                                    />
                                    {product.stock === 0 && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <span className="bg-error text-error-content px-6 py-3 rounded-lg text-lg font-bold">
                                                Out of Stock
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-4 gap-3 mt-4">
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(idx)}
                                            className={`relative aspect-square rounded-lg overflow-hidden bg-base-200 transition-all ${selectedImage === idx
                                                ? 'ring-2 ring-primary ring-offset-2 ring-offset-base-100'
                                                : 'hover:ring-2 hover:ring-base-300'
                                                }`}
                                        >
                                            <Image src={img} alt={`View ${idx + 1}`} fill className="object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Product Details */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-6"
                        >
                            {/* Badges */}
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full">
                                    {product.category}
                                </span>
                                <span
                                    className={`px-4 py-1.5 text-sm font-semibold rounded-full ${product.stock > 50
                                        ? 'bg-success/10 text-success'
                                        : product.stock > 20
                                            ? 'bg-warning/10 text-warning'
                                            : product.stock > 0
                                                ? 'bg-error/10 text-error'
                                                : 'bg-neutral/10 text-neutral-content'
                                        }`}
                                >
                                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-base-content leading-tight">
                                {product.name}
                            </h1>

                            {/* Rating */}
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <svg
                                            key={i}
                                            className={`w-5 h-5 ${i < Math.floor(averageRating)
                                                ? 'text-warning fill-current'
                                                : 'text-base-300 fill-current'
                                                }`}
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                        </svg>
                                    ))}
                                </div>
                                <span className="text-base-content/70 font-medium">
                                    {averageRating.toFixed(1)} ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                                </span>
                            </div>

                            {/* Price Card */}
                            <div className="card bg-linear-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
                                <div className="flex items-center gap-4 flex-wrap">
                                    <div>
                                        <div className="text-base-content/60 text-sm mb-1">Price</div>
                                        <div className="text-4xl md:text-5xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                                            ${product.price}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-base-content/50 line-through text-lg">
                                            ${(product.price * 1.2).toFixed(2)}
                                        </span>
                                        <span className="px-2 py-1 bg-error text-error-content text-xs font-bold rounded">
                                            -20% OFF
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Short Description */}
                            <div className="card bg-base-200">
                                <p className="text-base-content/80 leading-relaxed">
                                    {product.description?.split('\n\n')[0]}
                                </p>
                            </div>

                            {/* Quantity Selector */}
                            <div className="card bg-base-200">
                                <label className="text-lg font-semibold mb-3 text-base-content block">Quantity</label>
                                <div className="flex items-center gap-4 flex-wrap">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-10 h-10 rounded-lg bg-primary text-primary-content hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={quantity <= 1}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                            </svg>
                                        </button>
                                        <span className="text-2xl font-bold w-16 text-center text-base-content">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                            className="w-10 h-10 rounded-lg bg-primary text-primary-content hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={quantity >= product.stock || product.stock === 0}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </button>
                                    </div>
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
                                    onClick={handleAddToCart}
                                    disabled={product.stock === 0}
                                    className="w-full bg-linear-to-r from-primary to-secondary text-primary-content px-6 py-4 rounded-lg font-semibold hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 text-lg"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                                </button>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={handleWishlistToggle}
                                        className={`${isInWishlist
                                            ? 'bg-error/10 text-error border-error/20'
                                            : 'bg-base-100 text-base-content border-base-300'
                                            } px-6 py-3 rounded-lg font-semibold hover:bg-base-200 transition-all duration-300 border-2 flex items-center justify-center gap-2`}
                                    >
                                        <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                                        <span>{isInWishlist ? 'Saved' : 'Wishlist'}</span>
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="bg-base-100 text-base-content px-6 py-3 rounded-lg font-semibold hover:bg-base-200 transition-all duration-300 border-2 border-base-300 flex items-center justify-center gap-2"
                                    >
                                        <Share2 className="w-5 h-5" />
                                        <span>Share</span>
                                    </button>
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-base-300">
                                {[
                                    { icon: '🚚', text: 'Free Shipping', subtext: 'Orders over $50' },
                                    { icon: '🔒', text: 'Secure Payment', subtext: '100% Protected' },
                                    { icon: '↩️', text: 'Easy Returns', subtext: '30-day guarantee' },
                                ].map((badge, idx) => (
                                    <div key={idx} className="text-center">
                                        <div className="text-3xl mb-2">{badge.icon}</div>
                                        <div className="text-sm font-semibold text-base-content">{badge.text}</div>
                                        <div className="text-xs text-base-content/60 mt-1">{badge.subtext}</div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Detailed Information Tabs */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-16"
                    >
                        <div className="border-b border-base-300 overflow-x-auto">
                            <div className="flex gap-1 min-w-max">
                                {['description', 'features', 'specifications', 'reviews'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setSelectedTab(tab)}
                                        className={`px-6 py-3 font-semibold capitalize transition-all whitespace-nowrap ${selectedTab === tab
                                            ? 'text-primary border-b-2 border-primary'
                                            : 'text-base-content/60 hover:text-base-content'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8">
                            <AnimatePresence mode="wait">
                                {selectedTab === 'description' && (
                                    <motion.div
                                        key="description"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="card bg-base-200"
                                    >
                                        <h3 className="text-2xl font-bold mb-6 text-base-content">Product Description</h3>
                                        <div className="space-y-4">
                                            {product.description?.split('\n\n').map((paragraph, idx) => (
                                                <p key={idx} className="text-base-content/80 leading-relaxed text-lg">
                                                    {paragraph}
                                                </p>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {selectedTab === 'features' && (
                                    <motion.div
                                        key="features"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="card bg-base-200"
                                    >
                                        <h3 className="text-2xl font-bold mb-6 text-base-content">Key Features</h3>
                                        {product.features && product.features.length > 0 ? (
                                            <ul className="space-y-4">
                                                {product.features.map((feature, index) => (
                                                    <motion.li
                                                        key={index}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className="flex items-start gap-3"
                                                    >
                                                        <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center shrink-0 mt-0.5">
                                                            <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                        <span className="text-base-content/80 text-lg">{feature}</span>
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-base-content/60">No features listed for this product.</p>
                                        )}
                                    </motion.div>
                                )}

                                {selectedTab === 'specifications' && (
                                    <motion.div
                                        key="specifications"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="card bg-base-200"
                                    >
                                        <h3 className="text-2xl font-bold mb-6 text-base-content">Technical Specifications</h3>
                                        {product.specifications && Object.keys(product.specifications).length > 0 ? (
                                            <div className="grid md:grid-cols-2 gap-4">
                                                {Object.entries(product.specifications).map(([key, value], idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        className="flex flex-col gap-1 p-4 bg-base-100 rounded-lg"
                                                    >
                                                        <span className="font-semibold text-base-content text-sm">{key}</span>
                                                        <span className="text-base-content/70">{value}</span>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-base-content/60">No specifications available.</p>
                                        )}
                                    </motion.div>
                                )}

                                {selectedTab === 'reviews' && (
                                    <motion.div
                                        key="reviews"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="card bg-base-200"
                                    >
                                        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                                            <div>
                                                <h3 className="text-2xl font-bold text-base-content">Customer Reviews</h3>
                                                <p className="text-base-content/60 mt-1">
                                                    {averageRating.toFixed(1)} out of 5 based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                                                </p>
                                            </div>
                                            <button className="bg-primary text-primary-content px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                                                Write a Review
                                            </button>
                                        </div>

                                        {product.reviews && product.reviews.length > 0 ? (
                                            <div className="space-y-4">
                                                {product.reviews.map((review, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.1 }}
                                                        className="bg-base-100 rounded-lg p-6"
                                                    >
                                                        <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                                                            <div>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="relative w-12 h-12 rounded-full overflow-hidden border border-base-300 bg-base-200">
                                                                        <Image
                                                                            src={review.image}
                                                                            alt={review.name}
                                                                            fill
                                                                            sizes="48px"
                                                                            className="object-cover"
                                                                        />
                                                                    </div>

                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <span className="font-semibold text-base-content text-lg">
                                                                            {review.name}
                                                                        </span>

                                                                        {review.verified && (
                                                                            <span className="px-2 py-0.5 bg-success/10 text-success text-xs font-semibold rounded">
                                                                                Verified Purchase
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="text-sm text-base-content/60 mt-1">{review.date}</div>
                                                            </div>
                                                            <div className="flex text-warning">
                                                                {[...Array(review.rating)].map((_, i) => (
                                                                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                                                    </svg>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <p className="text-base-content/70 leading-relaxed">{review.comment}</p>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <p className="text-base-content/60 text-lg mb-4">No reviews yet</p>
                                                <p className="text-base-content/50">Be the first to review this product!</p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
