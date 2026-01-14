'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function ProductsPage() {
    const [products, setProducts] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products')
            const data = await response.json()
            setProducts(data)
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const categories = ['all', ...new Set(products.map(p => p.category))]
    const filteredProducts = filter === 'all'
        ? products
        : products.filter(p => p.category === filter)

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-100">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                    <p className="text-base-content/70 text-lg">Loading amazing products...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="section-padding bg-base-100 min-h-screen">
            <div className="container-custom">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6"
                    >
                        🎯 Premium Collection
                    </motion.span>

                    <h1 className="text-5xl md:text-6xl font-bold mb-6 text-base-content">
                        Our <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-secondary to-accent">Products</span>
                    </h1>
                    <p className="text-base-content/70 text-lg max-w-2xl mx-auto leading-relaxed">
                        Discover our carefully curated collection of premium products designed for excellence
                    </p>
                </motion.div>

                {/* Category Filter */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-wrap justify-center gap-3 mb-16"
                >
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setFilter(category)}
                            className={`px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105 ${filter === category
                                    ? 'bg-linear-to-r from-primary via-secondary to-accent text-primary-content shadow-xl scale-105'
                                    : 'bg-base-200 text-base-content hover:bg-base-300 shadow-md'
                                }`}
                        >
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                        </button>
                    ))}
                </motion.div>

                {/* Products Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProducts.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link href={`/products/${product.id}`}>
                                <div className="group cursor-pointer h-full">
                                    <div className="card overflow-hidden h-full hover:shadow-2xl transition-all duration-500 bg-base-100 border border-base-content/5">
                                        {/* Product Image */}
                                        <div className="relative h-64 rounded-xl mb-6 overflow-hidden bg-linear-to-br from-primary/10 via-secondary/10 to-accent/10">
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                            {/* Badge */}
                                            <div className="absolute top-4 right-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${product.stock > 50
                                                        ? 'bg-success text-success-content'
                                                        : product.stock > 20
                                                            ? 'bg-warning text-warning-content'
                                                            : 'bg-error text-error-content'
                                                    }`}>
                                                    {product.stock > 50 ? 'In Stock' : product.stock > 20 ? 'Low Stock' : 'Limited'}
                                                </span>
                                            </div>

                                            {/* Quick View Overlay */}
                                            {/* <div className="absolute inset-0 bg-base-100/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                                <div className="text-center space-y-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                    <div className="text-primary font-bold">Quick View</div>
                                                    <svg className="w-8 h-8 mx-auto text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </div>
                                            </div> */}
                                        </div>

                                        {/* Product Info */}
                                        <div className="px-2">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <span className="inline-block px-3 py-1 bg-base-200 text-base-content/60 text-xs font-semibold rounded-full mb-2">
                                                        {product.category}
                                                    </span>
                                                    <h3 className="text-xl font-bold text-base-content group-hover:text-primary transition-colors line-clamp-1">
                                                        {product.name}
                                                    </h3>
                                                </div>
                                            </div>

                                            <p className="text-base-content/70 mb-4 line-clamp-2 text-sm leading-relaxed">
                                                {product.description}
                                            </p>

                                            {/* Rating */}
                                            <div className="flex items-center mb-4">
                                                <div className="flex text-warning">
                                                    {[...Array(5)].map((_, i) => (
                                                        <svg key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'fill-base-300'}`} viewBox="0 0 20 20">
                                                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                                <span className="text-base-content/60 text-sm ml-2 font-medium">
                                                    {product.rating} ({Math.floor(Math.random() * 100) + 50} reviews)
                                                </span>
                                            </div>

                                            {/* Price and Stock */}
                                            <div className="flex items-center justify-between pt-4 border-t border-base-content/10">
                                                <div>
                                                    <div className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary">
                                                        ${product.price}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs text-base-content/50 mb-1">Stock</div>
                                                    <div className={`font-bold text-sm ${product.stock > 50
                                                            ? 'text-success'
                                                            : product.stock > 20
                                                                ? 'text-warning'
                                                                : 'text-error'
                                                        }`}>
                                                        {product.stock} units
                                                    </div>
                                                </div>
                                            </div>

                                            {/* View Details Button */}
                                            <button className="w-full mt-4 btn-primary flex items-center justify-center gap-2">
                                                <span>View Details</span>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* No Products Found */}
                {filteredProducts.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-2xl font-bold text-base-content mb-2">No Products Found</h3>
                        <p className="text-base-content/70 mb-6">Try selecting a different category</p>
                        <button
                            onClick={() => setFilter('all')}
                            className="btn-secondary"
                        >
                            View All Products
                        </button>
                    </motion.div>
                )}

                {/* Stats Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20 grid md:grid-cols-4 gap-6"
                >
                    {[
                        { icon: '📦', label: 'Total Products', value: products.length },
                        { icon: '⭐', label: 'Avg Rating', value: '4.7' },
                        { icon: '🏷️', label: 'Categories', value: categories.length - 1 },
                        { icon: '✨', label: 'Premium Items', value: products.filter(p => p.price > 500).length },
                    ].map((stat, idx) => (
                        <div key={idx} className="card bg-base-200 text-center hover:shadow-lg transition-all">
                            <div className="text-4xl mb-2">{stat.icon}</div>
                            <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                            <div className="text-base-content/60 text-sm">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    )
}
