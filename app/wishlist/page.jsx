'use client'

import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'

export default function WishlistPage() {
    const { wishlistItems, removeFromWishlist, addToCart } = useCart()

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
    }

    const handleAddToCart = (item) => {
        addToCart(item, 1)
        // Optionally show a success message
        alert(`${item.name} added to cart!`)
    }

    if (wishlistItems.length === 0) {
        return (
            <div className="min-h-screen pt-32">
                <div className="section-padding">
                    <div className="container-custom">
                        <motion.div
                            {...fadeInUp}
                            className="text-center max-w-md mx-auto"
                        >
                            <div className="w-32 h-32 mx-auto mb-6 bg-base-200 rounded-full flex items-center justify-center">
                                <Heart className="w-16 h-16 text-base-content/30" />
                            </div>
                            <h1 className="text-4xl font-bold text-base-content mb-4">Your Wishlist is Empty</h1>
                            <p className="text-base-content/70 mb-8 text-lg">
                                Start adding products you love to your wishlist!
                            </p>
                            <Link
                                href="/products"
                                className="inline-flex items-center gap-2 bg-linear-to-r from-primary to-secondary text-primary-content px-8 py-4 rounded-lg font-semibold hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Browse Products
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-32">
            <div className="section-padding">
                <div className="container-custom">
                    {/* Header */}
                    <motion.div {...fadeInUp} className="mb-8">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold text-base-content mb-2">
                                    My Wishlist
                                </h1>
                                <p className="text-base-content/70">
                                    {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
                                </p>
                            </div>
                            <Link
                                href="/products"
                                className="flex items-center gap-2 px-6 py-3 bg-base-200 hover:bg-base-300 text-base-content rounded-lg font-semibold transition-all duration-200"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Continue Shopping
                            </Link>
                        </div>
                    </motion.div>

                    {/* Wishlist Grid */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlistItems.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="card bg-base-200 group"
                            >
                                {/* Product Image */}
                                <div className="relative aspect-square rounded-lg overflow-hidden bg-base-300 mb-4">
                                    <Link href={`/products/${item.id}`}>
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </Link>

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => removeFromWishlist(item.id)}
                                        className="absolute top-3 right-3 p-2 bg-base-100/90 hover:bg-error/90 text-error hover:text-white rounded-full transition-all duration-200 shadow-lg"
                                        aria-label="Remove from wishlist"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                    {/* Category Badge */}
                                    <div className="absolute top-3 left-3 px-3 py-1 bg-primary/90 text-primary-content text-xs font-semibold rounded-full">
                                        {item.category}
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div>
                                    <Link
                                        href={`/products/${item.id}`}
                                        className="text-lg font-bold text-base-content hover:text-primary transition-colors line-clamp-2 mb-2 block"
                                    >
                                        {item.name}
                                    </Link>

                                    {/* Rating */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex text-warning">
                                            {[...Array(5)].map((_, i) => (
                                                <svg
                                                    key={i}
                                                    className={`w-4 h-4 ${i < Math.floor(item.rating)
                                                        ? 'fill-current'
                                                        : 'fill-base-300'
                                                        }`}
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <span className="text-sm text-base-content/60">{item.rating}</span>
                                    </div>

                                    {/* Price */}
                                    <div className="text-2xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
                                        ${item.price}
                                    </div>

                                    {/* Add to Cart Button */}
                                    <button
                                        onClick={() => handleAddToCart(item)}
                                        className="w-full bg-linear-to-r from-primary to-secondary text-primary-content px-4 py-3 rounded-lg font-semibold hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                        Add to Cart
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Add All to Cart */}
                    {wishlistItems.length > 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mt-8 text-center"
                        >
                            <button
                                onClick={() => {
                                    wishlistItems.forEach(item => addToCart(item, 1))
                                    alert('All items added to cart!')
                                }}
                                className="inline-flex items-center gap-2 bg-base-200 hover:bg-base-300 text-base-content px-8 py-4 rounded-lg font-semibold transition-all duration-300 border-2 border-base-300"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                Add All to Cart
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    )
}
