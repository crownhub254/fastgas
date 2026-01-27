'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { ShoppingBag, Star, Search, ChevronDown, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react'

// Skeleton Loader Component
const ProductSkeleton = () => (
    <div className="bg-base-200 rounded-2xl overflow-hidden animate-pulse h-full">
        <div className="h-64 bg-base-300"></div>
        <div className="p-5 space-y-4">
            <div className="h-4 bg-base-300 rounded w-20"></div>
            <div className="space-y-2">
                <div className="h-5 bg-base-300 rounded"></div>
                <div className="h-4 bg-base-300 rounded w-4/5"></div>
            </div>
            <div className="space-y-2">
                <div className="h-4 bg-base-300 rounded w-1/3"></div>
                <div className="flex gap-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-4 w-4 bg-base-300 rounded"></div>
                    ))}
                </div>
            </div>
            <div className="flex justify-between pt-4">
                <div className="h-6 bg-base-300 rounded w-24"></div>
                <div className="h-6 bg-base-300 rounded w-16"></div>
            </div>
            <div className="h-10 bg-base-300 rounded"></div>
        </div>
    </div>
)

export default function ProductsPage() {
    const [products, setProducts] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [dropdownOpen, setDropdownOpen] = useState(false)

    const itemsPerPage = 50

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)
            const data = await response.json()
            if (data.success && Array.isArray(data.products)) {
                setProducts(data.products)
            } else {
                setProducts([])
            }
        } catch (error) {
            console.error('Error fetching products:', error)
            setProducts([])
        } finally {
            setIsLoading(false)
        }
    }

    // Get unique categories
    const categories = ['all', ...new Set(products.map(p => p.category))]

    // Filter products by search query and category
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    // Pagination
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, selectedCategory])

    // Generate pagination numbers
    const getPaginationNumbers = () => {
        const pages = []
        const maxVisible = 5

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages)
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
            }
        }

        return pages
    }

    const handlePageChange = (page) => {
        if (typeof page === 'number' && page >= 1 && page <= totalPages) {
            setCurrentPage(page)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const gridClass = 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6'

    return (
        <div className="min-h-screen ">
            {/* Header Section */}
            <div className="relative overflow-hidden pt-12 px-4 md:px-8">
                {/* Background Elements */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-3xl"></div>
                    <div className="absolute -bottom-8 right-10 w-72 h-72 bg-secondary rounded-full mix-blend-multiply filter blur-3xl"></div>
                </div>

                <div className="relative container mx-auto max-w-7xl text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-8"
                    >
                        <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 mb-6">
                            <ShoppingBag className="w-4 h-4 text-primary" />
                            <span className="text-sm font-semibold text-primary">Explore Our Collection</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold text-base-content mb-4 leading-tight">
                            Discover Premium
                            <span className="block bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                                Products
                            </span>
                        </h1>
                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 md:px-8 pb-20">
                <div className="container mx-auto max-w-7xl">
                    {/* Results Header with Search and Filter */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                    >
                        {/* Left side - Results info */}
                        <div>
                            <p className="text-base-content/70 text-sm md:text-base">
                                Found <span className="font-semibold text-base-content text-lg md:text-xl">{filteredProducts.length}</span> products
                            </p>
                        </div>

                        {/* Right side - Search and Filter */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            {/* Search Bar */}
                            <div className="relative flex-1 sm:flex-none sm:w-64">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/40" />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-base-100 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-base-content/40 text-sm"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/40 hover:text-base-content"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Category Dropdown */}
                            <div className="relative w-full sm:w-auto">
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="w-full sm:w-auto px-4 py-2.5 md:py-3 bg-base-100 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all flex items-center justify-between gap-2 text-sm"
                                >
                                    <div className="flex items-center gap-2">
                                        <Filter className="w-4 h-4" />
                                        <span className="truncate">
                                            {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
                                        </span>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 transition-transform shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                {dropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute top-full mt-2 w-full bg-base-100 border border-base-300 rounded-lg shadow-xl z-50 overflow-hidden"
                                    >
                                        <div className="max-h-64 overflow-y-auto">
                                            {categories.map((category) => (
                                                <button
                                                    key={category}
                                                    onClick={() => {
                                                        setSelectedCategory(category)
                                                        setDropdownOpen(false)
                                                    }}
                                                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${selectedCategory === category
                                                            ? 'bg-primary text-primary-content font-semibold'
                                                            : 'hover:bg-base-200 text-base-content'
                                                        }`}
                                                >
                                                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Loading State */}
                    {isLoading ? (
                        <div className={gridClass}>
                            {[...Array(8)].map((_, i) => (
                                <ProductSkeleton key={i} />
                            ))}
                        </div>
                    ) : paginatedProducts.length > 0 ? (
                        <>
                            {/* Products Grid */}
                            <div className={gridClass}>
                                {paginatedProducts.map((product, index) => {
                                    const productId = product.id || product._id
                                    const isLowStock = product.stock <= 20
                                    const isOutOfStock = product.stock === 0

                                    return (
                                        <motion.div
                                            key={productId}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ y: -8 }}
                                        >
                                            <Link href={`/products/${productId}`}>
                                                <div className="group cursor-pointer h-full">
                                                    <div className="bg-base-100 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 h-full flex flex-col border border-base-300/50 hover:border-primary/30">
                                                        {/* Product Image Container */}
                                                        <div className="relative h-40 md:h-48 lg:h-56 overflow-hidden bg-linear-to-br from-base-200 to-base-300">
                                                            <Image
                                                                src={product.image}
                                                                alt={product.name}
                                                                fill
                                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                            />

                                                            {/* Overlay on Hover */}
                                                            <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                                            {/* Stock Badge */}
                                                            <div className="absolute top-2 right-2 md:top-3 md:right-3">
                                                                {isOutOfStock ? (
                                                                    <span className="inline-block px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold bg-error text-error-content shadow-lg">
                                                                        Out of Stock
                                                                    </span>
                                                                ) : isLowStock ? (
                                                                    <span className="inline-block px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold bg-warning text-warning-content shadow-lg">
                                                                        Limited
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-block px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold bg-success text-success-content shadow-lg">
                                                                        In Stock
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Category Badge */}
                                                            <div className="absolute top-2 left-2 md:top-3 md:left-3">
                                                                <span className="inline-block px-2 md:px-3 py-1 rounded-full text-xs font-semibold bg-base-100/90 backdrop-blur-sm text-base-content">
                                                                    {product.category}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Product Details */}
                                                        <div className="p-4 md:p-5 flex flex-col flex-1">
                                                            {/* Title */}
                                                            <h3 className="text-sm md:text-base font-bold text-base-content group-hover:text-primary transition-colors line-clamp-2 mb-3 leading-tight">
                                                                {product.name}
                                                            </h3>

                                                            {/* Seller Info */}
                                                            {product.sellerName && (
                                                                <div className="text-xs text-base-content/50 mb-3 pb-3 border-b border-base-300/50">
                                                                    <span className="font-semibold text-base-content/70">By:</span> {product.sellerName}
                                                                </div>
                                                            )}

                                                            {/* Rating */}
                                                            <div className="flex items-center gap-2 mb-4">
                                                                <div className="flex gap-0.5">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star
                                                                            key={i}
                                                                            className={`w-3 h-3 md:w-4 md:h-4 ${i < Math.floor(product.rating)
                                                                                    ? 'fill-warning text-warning'
                                                                                    : 'text-base-300'
                                                                                }`}
                                                                        />
                                                                    ))}
                                                                </div>
                                                                <span className="text-xs text-base-content/50 font-medium">
                                                                    {product.rating.toFixed(1)} ({product.reviews?.length || 0})
                                                                </span>
                                                            </div>

                                                            {/* Price & Stock */}
                                                            <div className="flex items-end justify-between gap-2 pt-3 border-t border-base-300/50 mb-4">
                                                                <div>
                                                                    <p className="text-xs text-base-content/50 mb-1">Price</p>
                                                                    <p className="text-lg md:text-xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                                                                        ${product.price.toFixed(2)}
                                                                    </p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-xs text-base-content/50 mb-1">Stock</p>
                                                                    <p className={`text-sm font-bold ${isOutOfStock ? 'text-error' : isLowStock ? 'text-warning' : 'text-success'
                                                                        }`}>
                                                                        {product.stock}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* View Button */}
                                                            <button className="w-full py-2.5 md:py-3 bg-linear-to-r from-primary to-secondary text-primary-content font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 text-xs md:text-sm hover:scale-105 transform">
                                                                View Details →
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    )
                                })}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-16 pt-8 border-t border-base-300 flex flex-col sm:flex-row items-center justify-center gap-4"
                                >
                                    {/* Previous Button */}
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`px-3 md:px-4 py-2 md:py-3 rounded-lg font-semibold transition-all text-sm md:text-base ${currentPage === 1
                                                ? 'bg-base-300 text-base-content/40 cursor-not-allowed'
                                                : 'bg-base-200 text-base-content hover:bg-primary hover:text-primary-content'
                                            }`}
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>

                                    {/* Page Numbers */}
                                    <div className="flex items-center gap-2">
                                        {getPaginationNumbers().map((page, index) => (
                                            <button
                                                key={index}
                                                onClick={() => typeof page === 'number' && handlePageChange(page)}
                                                disabled={page === '...'}
                                                className={`px-3 md:px-4 py-2 md:py-3 rounded-lg font-semibold transition-all text-sm md:text-base ${page === currentPage
                                                        ? 'bg-linear-to-r from-primary to-secondary text-primary-content shadow-lg shadow-primary/30'
                                                        : page === '...'
                                                            ? 'bg-transparent text-base-content/50 cursor-default'
                                                            : 'bg-base-200 text-base-content hover:bg-primary hover:text-primary-content'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Next Button */}
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className={`px-3 md:px-4 py-2 md:py-3 rounded-lg font-semibold transition-all text-sm md:text-base ${currentPage === totalPages
                                                ? 'bg-base-300 text-base-content/40 cursor-not-allowed'
                                                : 'bg-base-200 text-base-content hover:bg-primary hover:text-primary-content'
                                            }`}
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>

                                    {/* Page Info */}
                                    <div className="text-xs md:text-sm text-base-content/60">
                                        Page <span className="font-semibold text-base-content">{currentPage}</span> of{' '}
                                        <span className="font-semibold text-base-content">{totalPages}</span>
                                    </div>
                                </motion.div>
                            )}
                        </>
                    ) : (
                        /* Empty State */
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20"
                        >
                            <div className="text-6xl md:text-8xl mb-4">📦</div>
                            <h3 className="text-2xl md:text-3xl font-bold text-base-content mb-2">No Products Found</h3>
                            <p className="text-base-content/60 mb-8 text-sm md:text-base">
                                {searchQuery
                                    ? `No products match "${searchQuery}"`
                                    : 'Try selecting a different category'}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                {searchQuery && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSearchQuery('')}
                                        className="px-6 py-3 bg-base-200 text-base-content font-semibold rounded-lg hover:bg-base-300 transition-all duration-300 inline-block text-sm md:text-base"
                                    >
                                        Clear Search
                                    </motion.button>
                                )}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setSearchQuery('')
                                        setSelectedCategory('all')
                                    }}
                                    className="px-6 py-3 bg-linear-to-r from-primary to-secondary text-primary-content font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 inline-block text-sm md:text-base"
                                >
                                    View All Products
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    )
}
