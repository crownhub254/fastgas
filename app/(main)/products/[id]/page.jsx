'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'
import { Heart, Share2, ShoppingCart, ChevronRight, Check, Truck, Shield, RotateCcw, Star, Package, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const [product, setProduct] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [quantity, setQuantity] = useState(1)
    const [selectedTab, setSelectedTab] = useState('description')
    const [selectedImage, setSelectedImage] = useState(0)
    const [activeImageIndex, setActiveImageIndex] = useState(0)
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
        if (isInWishlist(product._id || product.id)) {
            removeFromWishlist(product._id || product.id)
            toast.success('Removed from wishlist')
        } else {
            addToWishlist(product)
            toast.success('Added to wishlist')
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
            navigator.clipboard.writeText(window.location.href)
            toast.success('Link copied to clipboard!')
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-100">
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
    const inWishlist = isInWishlist(product._id || product.id)

    return (
        <div className="min-h-screen bg-gradient-to-b from-base-100 via-base-100 to-base-200">
            {/* Breadcrumb */}
            <div className="px-4 md:px-8 pt-6 pb-4">
                <div className="container mx-auto max-w-7xl">
                    <motion.nav
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-xs md:text-sm text-base-content/60"
                    >
                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4" />
                        <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-base-content font-semibold truncate">{product.name.slice(0, 30)}</span>
                    </motion.nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 md:px-8 pb-20">
                <div className="container mx-auto max-w-7xl">
                    {/* Product Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-20">
                        {/* Images - 2 columns */}
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="lg:col-span-2 space-y-4"
                        >
                            {/* Main Image with Zoom */}
                            <div className="relative w-full aspect-square bg-gradient-to-br from-base-200 via-base-100 to-base-200 rounded-3xl overflow-hidden group sticky top-4 z-10">
                                <Image
                                    src={images[selectedImage]}
                                    alt={product.name}
                                    fill
                                    className="object-cover group-hover:scale-125 transition-transform duration-1000"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                {/* Stock Overlay */}
                                {product.stock === 0 && (
                                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center">
                                        <div className="text-center">
                                            <Package className="w-20 h-20 text-error mx-auto mb-4 opacity-50" />
                                            <span className="bg-error text-error-content px-8 py-4 rounded-2xl text-lg font-bold block">
                                                Out of Stock
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Badge */}
                                <div className="absolute top-4 left-4">
                                    <span className="inline-block px-4 py-2 bg-primary/90 backdrop-blur-md text-primary-content text-xs font-bold rounded-full">
                                        {product.category}
                                    </span>
                                </div>
                            </div>

                            {/* Thumbnails */}
                            <div className="grid grid-cols-4 gap-3">
                                {images.map((img, idx) => (
                                    <motion.button
                                        key={idx}
                                        whileHover={{ scale: 1.08 }}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`relative aspect-square rounded-2xl overflow-hidden transition-all duration-300 border-2 ${selectedImage === idx
                                                ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-base-100'
                                                : 'border-base-300/50 hover:border-primary/50'
                                            }`}
                                    >
                                        <Image src={img} alt={`View ${idx + 1}`} fill className="object-cover" />
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Details - 3 columns */}
                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="lg:col-span-3 space-y-6"
                        >
                            {/* Title & Rating */}
                            <div>
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-base-content leading-tight mb-6">
                                    {product.name}
                                </h1>

                                <div className="flex items-center gap-3 flex-wrap mb-6">
                                    <div className="flex items-center gap-2 bg-base-100 rounded-full px-4 py-2 border border-base-300/50">
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-5 h-5 ${i < Math.floor(averageRating)
                                                            ? 'fill-warning text-warning'
                                                            : 'text-base-300'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="font-bold text-base-content ml-2">{averageRating.toFixed(1)}</span>
                                        <span className="text-base-content/60 text-sm">({totalReviews})</span>
                                    </div>

                                    <div className={`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 ${product.stock > 0
                                            ? 'bg-success/10 text-success'
                                            : 'bg-error/10 text-error'
                                        }`}>
                                        <span className="w-2.5 h-2.5 rounded-full bg-current"></span>
                                        {product.stock > 0 ? `${product.stock} Available` : 'Out of Stock'}
                                    </div>
                                </div>
                            </div>

                            {/* Price Card - Modern Design */}
                            <div className="relative bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-2 border-primary/20 rounded-3xl p-8 overflow-hidden">
                                <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
                                <div className="relative z-10">
                                    <p className="text-base-content/70 text-sm font-bold mb-3 tracking-wide">CURRENT PRICE</p>
                                    <div className="flex items-baseline gap-4 mb-6">
                                        <span className="text-5xl md:text-6xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                                            KES {(product.retailPrice || product.price || 0).toLocaleString()}
                                        </span>
                                        <div className="flex flex-col gap-2">
                                            <span className="text-sm text-base-content/50 line-through font-semibold">
                                                KES {Math.round((product.retailPrice || product.price || 0) * 1.2).toLocaleString()}
                                            </span>
                                            <span className="text-sm font-black text-error">SAVE 20%</span>
                                        </div>
                                    </div>
                                    <p className="text-base-content/70 text-sm">Limited time offer • Free delivery on orders above KES 5,000</p>
                                </div>
                            </div>

                            {/* Seller Info */}
                            {product.sellerName && (
                                <div className="bg-base-100 border-2 border-base-300/50 rounded-2xl p-5">
                                    <p className="text-base-content/70 text-sm mb-1">Sold by</p>
                                    <p className="font-bold text-base-content text-lg">{product.sellerName}</p>
                                </div>
                            )}

                            {/* Quantity */}
                            <div className="bg-base-100 border-2 border-base-300/50 rounded-2xl p-6">
                                <p className="text-base-content/70 text-sm font-bold mb-4">SELECT QUANTITY</p>
                                <div className="flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-1 bg-base-200 rounded-xl p-1 inline-flex">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-12 h-12 rounded-lg bg-primary text-primary-content hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xl"
                                            disabled={quantity <= 1}
                                        >
                                            −
                                        </button>
                                        <span className="text-2xl font-black w-20 text-center text-base-content">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                            className="w-12 h-12 rounded-lg bg-primary text-primary-content hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xl"
                                            disabled={quantity >= product.stock || product.stock === 0}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <div>
                                        <p className="text-base-content/70 text-xs font-bold mb-2">TOTAL PRICE</p>
                                        <p className="text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                            KES {((product.retailPrice || product.price || 0) * quantity).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Add to Cart Button */}
                            <motion.button
                                whileHover={{ scale: product.stock > 0 ? 1.03 : 1 }}
                                whileTap={{ scale: product.stock > 0 ? 0.97 : 1 }}
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                className={`w-full py-5 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${product.stock > 0
                                        ? 'bg-gradient-to-r from-primary via-secondary to-accent text-primary-content hover:shadow-2xl hover:shadow-primary/40'
                                        : 'bg-base-300 text-base-content/40 cursor-not-allowed'
                                    }`}
                            >
                                <ShoppingCart className="w-6 h-6" />
                                <span>{product.stock === 0 ? 'Out of Stock' : `Add ${quantity} to Cart`}</span>
                            </motion.button>

                            {/* Buy Now - Direct to Checkout */}
                            <Link href="/checkout" className="block w-full">
                                <motion.button
                                    whileHover={{ scale: product.stock > 0 ? 1.03 : 1 }}
                                    whileTap={{ scale: product.stock > 0 ? 0.97 : 1 }}
                                    onClick={() => product.stock > 0 && addToCart(product, quantity)}
                                    disabled={product.stock === 0}
                                    className={`w-full py-5 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 border-2 ${product.stock > 0
                                            ? 'border-primary text-primary hover:bg-primary hover:text-primary-content'
                                            : 'border-base-300 text-base-content/40 cursor-not-allowed'
                                        }`}
                                >
                                    <Zap className="w-6 h-6" />
                                    <span>{product.stock === 0 ? 'Out of Stock' : 'Buy Now - Proceed to Checkout'}</span>
                                </motion.button>
                            </Link>
                                        : 'bg-base-300 text-base-content/40 cursor-not-allowed'
                                    }`}
                            >
                                <ShoppingCart className="w-6 h-6" />
                                <span>{product.stock === 0 ? 'Out of Stock' : `Add ${quantity} to Cart`}</span>
                            </motion.button>

                            {/* Secondary Actions */}
                            <div className="grid grid-cols-2 gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleWishlistToggle}
                                    className={`py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 border-2 ${inWishlist
                                            ? 'bg-error/20 border-error/50 text-error hover:bg-error/30'
                                            : 'bg-base-100 border-base-300/50 text-base-content hover:border-primary/50 hover:bg-base-200'
                                        }`}
                                >
                                    <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                                    <span>{inWishlist ? 'Saved' : 'Save'}</span>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleShare}
                                    className="py-4 rounded-xl font-bold transition-all duration-300 bg-base-100 border-2 border-base-300/50 text-base-content hover:border-primary/50 hover:bg-base-200 flex items-center justify-center gap-2"
                                >
                                    <Share2 className="w-5 h-5" />
                                    <span>Share</span>
                                </motion.button>
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-3 gap-3 pt-6 border-t-2 border-base-300">
                                {[
                                    { icon: Truck, text: 'Free Shipping', sub: 'Orders $50+' },
                                    { icon: Shield, text: 'Secure', sub: '100% Safe' },
                                    { icon: RotateCcw, text: 'Returns', sub: '30 Days' },
                                ].map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        whileHover={{ y: -8 }}
                                        className="text-center p-4 rounded-xl hover:bg-base-200 transition-colors"
                                    >
                                        <item.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                                        <p className="text-xs font-bold text-base-content">{item.text}</p>
                                        <p className="text-xs text-base-content/60 mt-1">{item.sub}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Tabs */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        {/* Tab Navigation */}
                        <div className="flex gap-2 border-b-2 border-base-300 overflow-x-auto mb-8 pb-0">
                            {['description', 'features', 'specifications', 'reviews'].map((tab) => (
                                <motion.button
                                    key={tab}
                                    onClick={() => setSelectedTab(tab)}
                                    className={`px-6 py-4 font-bold capitalize whitespace-nowrap transition-all text-sm md:text-base relative ${selectedTab === tab
                                            ? 'text-primary'
                                            : 'text-base-content/60 hover:text-base-content'
                                        }`}
                                >
                                    {tab}
                                    {selectedTab === tab && (
                                        <motion.div
                                            layoutId="tab-underline"
                                            className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary"
                                        />
                                    )}
                                </motion.button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <AnimatePresence mode="wait">
                            {selectedTab === 'description' && (
                                <motion.div
                                    key="desc"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-base-100 border-2 border-base-300/50 rounded-3xl p-8 md:p-10"
                                >
                                    <h3 className="text-3xl font-black mb-8 text-base-content">About this Product</h3>
                                    <div className="space-y-6 text-base-content/80 text-lg leading-relaxed">
                                        {product.description?.split('\n\n').map((para, i) => (
                                            <p key={i}>{para}</p>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {selectedTab === 'features' && (
                                <motion.div
                                    key="feat"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-base-100 border-2 border-base-300/50 rounded-3xl p-8 md:p-10"
                                >
                                    <h3 className="text-3xl font-black mb-8 text-base-content">Key Features</h3>
                                    {product.features?.length > 0 ? (
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {product.features.map((feat, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    className="flex gap-4 p-4 rounded-2xl bg-gradient-to-r from-success/5 to-transparent hover:bg-success/10 transition-colors"
                                                >
                                                    <Check className="w-6 h-6 text-success shrink-0 mt-1 font-bold" />
                                                    <span className="text-base-content/80 font-medium">{feat}</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-base-content/60 text-center py-12">No features listed</p>
                                    )}
                                </motion.div>
                            )}

                            {selectedTab === 'specifications' && (
                                <motion.div
                                    key="spec"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-base-100 border-2 border-base-300/50 rounded-3xl p-8 md:p-10"
                                >
                                    <h3 className="text-3xl font-black mb-4 text-base-content">Technical Specifications</h3>
                                    <p className="text-base-content/60 mb-8">Detailed product specifications to help you make an informed decision.</p>
                                    
                                    {/* SEO-Friendly Specifications Table */}
                                    {product.specifications && Object.keys(product.specifications).length > 0 ? (
                                        <div className="space-y-6">
                                            {/* Specifications Grid */}
                                            <div className="overflow-hidden rounded-2xl border border-base-300">
                                                <table className="w-full" itemScope itemType="https://schema.org/Product">
                                                    <tbody>
                                                        {Object.entries(product.specifications).map(([key, val], i) => (
                                                            <tr 
                                                                key={i}
                                                                className={`${i % 2 === 0 ? 'bg-base-200/50' : 'bg-base-100'} border-b border-base-300 last:border-b-0`}
                                                            >
                                                                <td className="px-6 py-4 font-bold text-base-content/80 w-1/3 text-sm uppercase tracking-wide">
                                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                                </td>
                                                                <td className="px-6 py-4 text-base-content font-medium" itemProp={key.toLowerCase()}>
                                                                    {val}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Quick Specs Cards for Mobile */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                                                {product.weight && (
                                                    <div className="text-center p-4 bg-primary/5 rounded-xl">
                                                        <Package className="w-6 h-6 mx-auto mb-2 text-primary" />
                                                        <p className="text-xs text-base-content/60 font-bold uppercase">Weight</p>
                                                        <p className="font-bold text-base-content">{product.weight} kg</p>
                                                    </div>
                                                )}
                                                {product.dimensions && (
                                                    <div className="text-center p-4 bg-secondary/5 rounded-xl">
                                                        <Package className="w-6 h-6 mx-auto mb-2 text-secondary" />
                                                        <p className="text-xs text-base-content/60 font-bold uppercase">Dimensions</p>
                                                        <p className="font-bold text-base-content">{product.dimensions.height}cm H</p>
                                                    </div>
                                                )}
                                                <div className="text-center p-4 bg-success/5 rounded-xl">
                                                    <Shield className="w-6 h-6 mx-auto mb-2 text-success" />
                                                    <p className="text-xs text-base-content/60 font-bold uppercase">Quality</p>
                                                    <p className="font-bold text-base-content">Food Grade</p>
                                                </div>
                                                <div className="text-center p-4 bg-accent/5 rounded-xl">
                                                    <Check className="w-6 h-6 mx-auto mb-2 text-accent" />
                                                    <p className="text-xs text-base-content/60 font-bold uppercase">Certified</p>
                                                    <p className="font-bold text-base-content">KEBS ✓</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <Package className="w-16 h-16 text-base-300 mx-auto mb-4" />
                                            <p className="text-base-content/60">No specifications available</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {selectedTab === 'reviews' && (
                                <motion.div
                                    key="rev"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-base-100 border-2 border-base-300/50 rounded-3xl p-8 md:p-10"
                                >
                                    <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                                        <div>
                                            <h3 className="text-3xl font-black text-base-content">Reviews</h3>
                                            <p className="text-base-content/60 mt-2">{totalReviews} reviews • {averageRating.toFixed(1)} avg rating</p>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-primary-content rounded-xl font-bold"
                                        >
                                            Write Review
                                        </motion.button>
                                    </div>

                                    {product.reviews?.length > 0 ? (
                                        <div className="space-y-5">
                                            {product.reviews.map((rev, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    className="bg-base-200 rounded-2xl p-6 border border-base-300/50 hover:border-primary/30 transition-colors"
                                                >
                                                    <div className="flex items-start justify-between mb-4 gap-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-base-300 bg-base-100">
                                                                <Image
                                                                    src={rev.userPhoto || 'https://via.placeholder.com/48'}
                                                                    alt={rev.userName}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-base-content">{rev.userName}</p>
                                                                <p className="text-xs text-base-content/60">{rev.date}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-0.5">
                                                            {[...Array(5)].map((_, j) => (
                                                                <Star
                                                                    key={j}
                                                                    className={`w-4 h-4 ${j < rev.rating
                                                                            ? 'fill-warning text-warning'
                                                                            : 'text-base-300'
                                                                        }`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {rev.verified && (
                                                        <div className="inline-block px-3 py-1 bg-success/10 text-success text-xs font-bold rounded-full mb-3">
                                                            ✓ Verified Purchase
                                                        </div>
                                                    )}
                                                    <p className="text-base-content/80 text-sm">{rev.comment}</p>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-16">
                                            <Zap className="w-16 h-16 text-base-300 mx-auto mb-4 opacity-50" />
                                            <p className="text-base-content/60 text-lg">No reviews yet</p>
                                            <p className="text-base-content/50 text-sm mt-2">Be the first to review!</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
