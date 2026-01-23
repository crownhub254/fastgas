'use client'

import { motion } from 'framer-motion'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react'
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
            <div className="min-h-screen">
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
        <div className="min-h-screen">
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
                        {/* Cart Items Table */}
                        <div className="lg:col-span-2">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="overflow-hidden"
                            >
                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-base-200 bg-base-300/50">
                                                <th className="px-4 py-4 text-left text-sm font-semibold text-base-content">Product</th>
                                                <th className="px-4 py-4 text-center text-sm font-semibold text-base-content">Category</th>
                                                <th className="px-4 py-4 text-center text-sm font-semibold text-base-content">Price</th>
                                                <th className="px-4 py-4 text-center text-sm font-semibold text-base-content">Quantity</th>
                                                <th className="px-4 py-4 text-right text-sm font-semibold text-base-content">Subtotal</th>
                                                <th className="px-4 py-4 text-center text-sm font-semibold text-base-content">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cartItems.map((item, index) => (
                                                <motion.tr
                                                    key={item._id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="border-b border-base-300 hover:bg-base-300/30 transition-colors duration-200"
                                                >
                                                    {/* Product Column */}
                                                    <td className="px-4 py-4">
                                                        <Link
                                                            href={`/products/${item.id || item._id}`}
                                                            className="flex items-center gap-3 group"
                                                        >
                                                            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-base-300 shrink-0">
                                                                <Image
                                                                    src={item.image}
                                                                    alt={item.name}
                                                                    fill
                                                                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-semibold text-base-content hover:text-primary transition-colors line-clamp-2">
                                                                    {item.name}
                                                                </p>
                                                                <p className="text-xs text-base-content/50 mt-1">ID: {item._id?.slice(-6)}</p>
                                                            </div>
                                                        </Link>
                                                    </td>

                                                    {/* Category Column */}
                                                    <td className="px-4 py-4 text-center">
                                                        <span className="inline-block px-3 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full">
                                                            {item.category}
                                                        </span>
                                                    </td>

                                                    {/* Price Column */}
                                                    <td className="px-4 py-4 text-center">
                                                        <span className="font-semibold text-base-content">
                                                            ${item.price.toFixed(2)}
                                                        </span>
                                                    </td>

                                                    {/* Quantity Column */}
                                                    <td className="px-4 py-4 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                                className="w-7 h-7 rounded-md bg-base-300 hover:bg-primary hover:text-primary-content transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                                disabled={item.quantity <= 1}
                                                                title="Decrease quantity"
                                                            >
                                                                <Minus className="w-3 h-3" />
                                                            </button>
                                                            <span className="font-bold text-base-content w-8 text-center">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                                className="w-7 h-7 rounded-md bg-base-300 hover:bg-primary hover:text-primary-content transition-all duration-200 flex items-center justify-center"
                                                                title="Increase quantity"
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </td>

                                                    {/* Subtotal Column */}
                                                    <td className="px-4 py-4 text-right">
                                                        <span className="text-lg font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                                                            ${(item.price * item.quantity).toFixed(2)}
                                                        </span>
                                                    </td>

                                                    {/* Action Column */}
                                                    <td className="px-4 py-4 text-center">
                                                        <button
                                                            onClick={() => removeFromCart(item._id)}
                                                            className="inline-flex items-center justify-center p-2 text-error hover:bg-error/10 rounded-lg transition-all duration-200 hover:scale-110"
                                                            title="Remove from cart"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Cart Summary Footer */}
                                <div className="px-4 py-4 bg-base-300/50 border-t border-base-300">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="text-sm text-base-content/70">
                                            <p>Total Items: <span className="font-semibold text-base-content">{cartItems.length}</span></p>
                                            <p>Total Quantity: <span className="font-semibold text-base-content">{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span></p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-base-content/70">Cart Total</p>
                                            <p className="text-3xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                                                ${subtotal.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Order Summary Sidebar */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-1"
                        >
                            <div className="sticky top-24 space-y-6">
                                <div>
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
                                </div>

                                {/* Price Breakdown */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-base-content">Pricing Details</h3>

                                    <div className="space-y-3 bg-base-100 p-4 rounded-lg">
                                        <div className="flex justify-between text-base-content/70">
                                            <span>Subtotal</span>
                                            <span className="font-semibold">${subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-base-content/70">
                                            <span>Shipping</span>
                                            <span className="font-semibold">
                                                {shipping === 0 ? (
                                                    <span className="text-success font-bold">FREE</span>
                                                ) : (
                                                    `$${shipping.toFixed(2)}`
                                                )}
                                            </span>
                                        </div>
                                        {shipping > 0 && (
                                            <div className="text-xs text-base-content/60 bg-info/10 px-3 py-2 rounded-lg mt-2">
                                                💡 Add ${(100 - subtotal).toFixed(2)} more for free shipping!
                                            </div>
                                        )}
                                        <div className="flex justify-between text-base-content/70">
                                            <span>Tax (10%)</span>
                                            <span className="font-semibold">${tax.toFixed(2)}</span>
                                        </div>
                                        <div className="border-t border-base-300 pt-3">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-lg font-semibold text-base-content">Total</span>
                                                <span className="text-3xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                                                    ${total.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Info */}
                                <div className="space-y-2 bg-info/10 p-4 rounded-lg">
                                    <h3 className="text-sm font-semibold text-base-content">Order Information</h3>
                                    <div className="text-xs text-base-content/70 space-y-1">
                                        <p>• Free shipping on orders over $100</p>
                                        <p>• Tax calculated at checkout</p>
                                        <p>• Secure payment processing</p>
                                    </div>
                                </div>

                                {/* Checkout Button */}
                                <Link
                                    href='/checkout'
                                    className="w-full bg-linear-to-r from-primary to-secondary text-primary-content px-6 py-4 rounded-lg font-semibold hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg text-center block"
                                >
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
                                <div className="pt-4 border-t border-base-300">
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
