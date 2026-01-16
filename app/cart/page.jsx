'use client'

import { motion } from 'framer-motion'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Tag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'

export default function CartPage() {
    const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart()

    const subtotal = getCartTotal()
    const shipping = subtotal > 100 ? 0 : 10
    const tax = subtotal * 0.1
    const total = subtotal + shipping + tax

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen pt-32">
                <div className="section-padding">
                    <div className="container-custom">
                        <motion.div
                            {...fadeInUp}
                            className="text-center max-w-md mx-auto"
                        >
                            <div className="w-32 h-32 mx-auto mb-6 bg-base-200 rounded-full flex items-center justify-center">
                                <ShoppingBag className="w-16 h-16 text-base-content/30" />
                            </div>
                            <h1 className="text-4xl font-bold text-base-content mb-4">Your Cart is Empty</h1>
                            <p className="text-base-content/70 mb-8 text-lg">
                                Looks like you haven&apos;t added anything to your cart yet.
                            </p>
                            <Link
                                href="/products"
                                className="inline-flex items-center gap-2 bg-linear-to-r from-primary to-secondary text-primary-content px-8 py-4 rounded-lg font-semibold hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Continue Shopping
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
                                    Shopping Cart
                                </h1>
                                <p className="text-base-content/70">
                                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                                </p>
                            </div>
                            <button
                                onClick={clearCart}
                                className="flex items-center gap-2 px-4 py-2 text-error hover:bg-error/10 rounded-lg transition-all duration-200"
                            >
                                <Trash2 className="w-4 h-4" />
                                Clear Cart
                            </button>
                        </div>
                    </motion.div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item, index) => (
                                <motion.div
                                    key={item._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="card bg-base-200"
                                >
                                    <div className="flex gap-4 md:gap-6" key={index}>
                                        {/* Product Image */}
                                        <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden bg-base-300 shrink-0">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <Link
                                                        href={`/products/${item.id}`}
                                                        className="text-xl font-bold text-base-content hover:text-primary transition-colors line-clamp-1"
                                                    >
                                                        {item.name}
                                                    </Link>
                                                    <p className="text-sm text-base-content/60 mt-1">
                                                        {item.category}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="p-2 text-error hover:bg-error/10 rounded-lg transition-all duration-200 shrink-0"
                                                    aria-label="Remove item"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="w-8 h-8 rounded-lg bg-base-300 hover:bg-primary hover:text-primary-content transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="text-lg font-bold text-base-content w-8 text-center">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="w-8 h-8 rounded-lg bg-base-300 hover:bg-primary hover:text-primary-content transition-all duration-200 flex items-center justify-center"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {/* Price */}
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </div>
                                                    <div className="text-sm text-base-content/60">
                                                        ${item.price.toFixed(2)} each
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-1"
                        >
                            <div className="card bg-base-200 sticky top-24">
                                <h2 className="text-2xl font-bold text-base-content mb-6">Order Summary</h2>

                                {/* Promo Code */}
                                <div className="mb-6">
                                    <label className="text-sm font-semibold text-base-content block mb-2">
                                        Promo Code
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Enter code"
                                            className="flex-1 px-4 py-2 rounded-lg bg-base-100 border border-base-300 text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                        <button className="px-4 py-2 bg-primary text-primary-content rounded-lg font-semibold hover:opacity-90 transition-opacity">
                                            Apply
                                        </button>
                                    </div>
                                </div>

                                {/* Price Breakdown */}
                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-base-content/70">
                                        <span>Subtotal</span>
                                        <span className="font-semibold">${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-base-content/70">
                                        <span>Shipping</span>
                                        <span className="font-semibold">
                                            {shipping === 0 ? (
                                                <span className="text-success">Free</span>
                                            ) : (
                                                `$${shipping.toFixed(2)}`
                                            )}
                                        </span>
                                    </div>
                                    {shipping > 0 && (
                                        <div className="text-xs text-base-content/60 bg-info/10 klala px-3 py-2 rounded-lg">
                                            💡 Add ${(100 - subtotal).toFixed(2)} more for free shipping!
                                        </div>
                                    )}
                                    <div className="flex justify-between text-base-content/70">
                                        <span>Tax (10%)</span>
                                        <span className="font-semibold">${tax.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-base-300 pt-4">
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-lg font-semibold text-base-content">Total</span>
                                            <span className="text-3xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                                                ${total.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Checkout Button */}
                                <Link href='/checkout' className="text-center w-full bg-linear-to-r from-primary to-secondary text-primary-content px-6 py-4 rounded-lg font-semibold hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg mb-3">
                                    Proceed to Checkout
                                </Link>

                                {/* Continue Shopping */}
                                <Link
                                    href="/products"
                                    className="flex items-center justify-center gap-2 w-full bg-base-100 text-base-content px-6 py-3 rounded-lg font-semibold hover:bg-base-300 transition-all duration-300 border-2 border-base-300"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Continue Shopping
                                </Link>

                                {/* Security Badges */}
                                <div className="mt-6 pt-6 border-t border-base-300">
                                    <div className="grid grid-cols-3 gap-3 text-center">
                                        <div>
                                            <div className="text-2xl mb-1">🔒</div>
                                            <div className="text-xs text-base-content/60">Secure Payment</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl mb-1">🚚</div>
                                            <div className="text-xs text-base-content/60">Fast Delivery</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl mb-1">↩️</div>
                                            <div className="text-xs text-base-content/60">Easy Returns</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}
