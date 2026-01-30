'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    ShoppingBag,
    TrendingUp,
    Star,
    Zap,
    Package,
    Truck,
    ShieldCheck,
    HeadphonesIcon,
    ArrowRight,
    Heart,
    Eye,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Gift,
    Clock,
    Tag,
    TrendingDown,
    Award,
    Percent,
    Crown,
    Timer,
    BadgeCheck,
    Flame,
    ShoppingCart
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'
import toast from 'react-hot-toast'

export default function AuthenticatedHome({ user }) {
    const [products, setProducts] = useState([])
    const [featuredProducts, setFeaturedProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [newArrivals, setNewArrivals] = useState([])
    const [topRated, setTopRated] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentBanner, setCurrentBanner] = useState(0)
    const { addToCart, addToWishlist, cartItems, wishlistItems } = useCart()

    // Fetch products from API
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)
                const data = await response.json()

                if (data.success) {
                    const allProducts = data.products || []
                    setProducts(allProducts)

                    // Get featured products (top rated with high stock)
                    const featured = [...allProducts]
                        .filter(p => (p.stock || 0) > 10)
                        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                        .slice(0, 8)
                    setFeaturedProducts(featured)

                    // Get new arrivals (recently added)
                    const newItems = [...allProducts]
                        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                        .slice(0, 8)
                    setNewArrivals(newItems)

                    // Get top rated products
                    const topRatedItems = [...allProducts]
                        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                        .slice(0, 6)
                    setTopRated(topRatedItems)

                    // Extract unique categories
                    const uniqueCategories = [...new Set(allProducts.map(p => p.category))]
                    setCategories(uniqueCategories)
                }
            } catch (error) {
                console.error('Error fetching products:', error)
                toast.error('Failed to load products')
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [])

    // Personalized banner slider data
    const banners = [
        {
            id: 1,
            title: `Welcome Back, ${user?.displayName || 'Valued Customer'}!`,
            subtitle: "Exclusive Member Deals",
            description: "Get up to 60% OFF on your favorite items",
            bgColor: "from-purple-600 to-pink-600",
            icon: Crown
        },
        {
            id: 2,
            title: "Flash Sale Alert!",
            subtitle: "24 Hours Only",
            description: "Limited time offers just for you",
            bgColor: "from-orange-500 to-red-600",
            icon: Flame
        },
        {
            id: 3,
            title: "Free Premium Shipping",
            subtitle: "On All Orders",
            description: "As a valued member, enjoy free delivery",
            bgColor: "from-blue-600 to-cyan-500",
            icon: Truck
        },
        {
            id: 4,
            title: "New Arrivals",
            subtitle: "Fresh Collections",
            description: "Check out what's trending this week",
            bgColor: "from-green-600 to-teal-500",
            icon: Sparkles
        }
    ]

    // Auto-rotate banner
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentBanner((prev) => (prev + 1) % banners.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [banners.length])

    const nextBanner = () => {
        setCurrentBanner((prev) => (prev + 1) % banners.length)
    }

    const prevBanner = () => {
        setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)
    }

    const handleAddToCart = (product) => {
        addToCart(product)
        toast.success(`${product.name} added to cart!`)
    }

    const handleAddToWishlist = (product) => {
        addToWishlist(product)
        toast.success(`${product.name} added to wishlist!`)
    }

    const isInWishlist = (productId) => {
        return wishlistItems.some(item => item.id === productId)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-base-content/70">Loading your personalized experience...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            {/* 1. PERSONALIZED HERO BANNER SLIDER */}
            <section className="relative overflow-hidden">
                <div className="relative h-[500px] md:h-[600px]">
                    {banners.map((banner, index) => (
                        <motion.div
                            key={banner.id}
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: currentBanner === index ? 1 : 0,
                                x: currentBanner === index ? 0 : 100
                            }}
                            transition={{ duration: 0.5 }}
                            className={`absolute inset-0 bg-linear-to-r ${banner.bgColor}`}
                            style={{ display: currentBanner === index ? 'block' : 'none' }}
                        >
                            <div className="container-custom h-full">
                                <div className="grid lg:grid-cols-2 gap-8 h-full items-center py-12 px-4 sm:px-6 lg:px-8">
                                    <motion.div
                                        initial={{ opacity: 0, x: -50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-white space-y-6"
                                    >
                                        <div className="flex items-center gap-3">
                                            <banner.icon className="w-8 h-8" />
                                            <span className="text-sm font-semibold uppercase tracking-wider">
                                                VIP Member Benefits
                                            </span>
                                        </div>
                                        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                                            {banner.title}
                                        </h1>
                                        <p className="text-2xl md:text-3xl font-semibold">
                                            {banner.subtitle}
                                        </p>
                                        <p className="text-xl opacity-90">
                                            {banner.description}
                                        </p>
                                        <div className="flex gap-4 flex-wrap">
                                            <Link
                                                href="/products"
                                                className="btn btn-lg bg-white text-primary hover:bg-white/90 border-none"
                                            >
                                                Shop Now
                                                <ArrowRight className="w-5 h-5" />
                                            </Link>
                                            <Link
                                                href="/orders"
                                                className="btn btn-lg btn-outline border-white text-white hover:bg-white hover:text-primary"
                                            >
                                                My Orders
                                            </Link>
                                        </div>
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="relative h-full hidden lg:flex items-center justify-center"
                                    >
                                        <div className="relative">
                                            <div className="w-64 h-64 bg-white/20 rounded-full backdrop-blur-sm flex items-center justify-center">
                                                <banner.icon className="w-32 h-32 text-white/80" />
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Banner Navigation */}
                    <button
                        onClick={prevBanner}
                        className="absolute left-4 top-1/2 -translate-y-1/2 btn btn-circle bg-white/20 hover:bg-white/30 border-none text-white backdrop-blur-sm"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={nextBanner}
                        className="absolute right-4 top-1/2 -translate-y-1/2 btn btn-circle bg-white/20 hover:bg-white/30 border-none text-white backdrop-blur-sm"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Dots Indicator */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentBanner(index)}
                                className={`h-3 rounded-full transition-all ${currentBanner === index
                                        ? 'bg-white w-8'
                                        : 'bg-white/50 w-3'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* 2. QUICK STATS & BENEFITS */}
            <section className="section-padding bg-base-100">
                <div className="container-custom">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: Package, title: 'Orders', value: '0', color: 'text-primary', link: '/orders' },
                            { icon: Heart, title: 'Wishlist', value: wishlistItems.length, color: 'text-error', link: '/wishlist' },
                            { icon: ShoppingCart, title: 'Cart Items', value: cartItems.length, color: 'text-success', link: '/cart' },
                            { icon: Award, title: 'VIP Status', value: 'Gold', color: 'text-warning', link: '/profile' }
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link
                                    href={stat.link}
                                    className="card bg-base-200 hover:shadow-xl transition-all duration-300 group"
                                >
                                    <div className="card-body items-center text-center p-6">
                                        <stat.icon className={`w-12 h-12 ${stat.color} group-hover:scale-110 transition-transform`} />
                                        <h3 className="text-3xl font-bold">{stat.value}</h3>
                                        <p className="text-sm text-base-content/70">{stat.title}</p>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. EXCLUSIVE FLASH DEALS */}
            <section className="section-padding bg-linear-to-br from-primary/10 to-secondary/10">
                <div className="container-custom">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <Flame className="w-8 h-8 text-error fill-error" />
                                <h2 className="text-3xl md:text-4xl font-bold text-base-content">
                                    Member-Only Flash Deals
                                </h2>
                            </div>
                            <p className="text-base-content/70">
                                Exclusive offers just for you - Limited time only!
                            </p>
                        </motion.div>
                        <div className="flex items-center gap-3 bg-error/10 px-6 py-3 rounded-xl border-2 border-error/30">
                            <Timer className="w-6 h-6 text-error" />
                            <div>
                                <p className="text-xs text-error/70 font-medium">Ends in</p>
                                <p className="text-xl font-bold text-error">23:45:12</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.slice(0, 4).map((product, index) => (
                            <motion.div
                                key={product._id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden"
                            >
                                <figure className="relative h-64 overflow-hidden">
                                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                                        <span className="badge badge-error text-white font-bold px-3 py-3">
                                            <Percent className="w-3 h-3 mr-1" />
                                            {Math.floor(Math.random() * 40 + 30)}% OFF
                                        </span>
                                        <span className="badge badge-warning text-white font-bold">
                                            MEMBER DEAL
                                        </span>
                                    </div>
                                    {isInWishlist(product._id) && (
                                        <div className="absolute top-4 right-4 z-10">
                                            <Heart className="w-6 h-6 text-error fill-error" />
                                        </div>
                                    )}
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                className="btn btn-sm btn-primary flex-1"
                                            >
                                                <ShoppingBag className="w-4 h-4" />
                                                Add to Cart
                                            </button>
                                            <button
                                                onClick={() => handleAddToWishlist(product)}
                                                className="btn btn-sm btn-circle btn-ghost bg-white/20 text-white hover:bg-white/30"
                                            >
                                                <Heart className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </figure>
                                <div className="card-body p-4">
                                    <div className="flex items-center gap-1 mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${i < Math.floor(product.rating || 0)
                                                        ? 'text-warning fill-warning'
                                                        : 'text-base-300'
                                                    }`}
                                            />
                                        ))}
                                        <span className="text-xs text-base-content/60 ml-1">
                                            ({product.reviews?.length || 0})
                                        </span>
                                    </div>
                                    <h3 className="card-title text-base line-clamp-2 min-h-[48px]">
                                        {product.name}
                                    </h3>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-primary">
                                            ${product.price?.toFixed(2)}
                                        </span>
                                        <span className="text-sm line-through text-base-content/40">
                                            ${(product.price * 1.6).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="badge badge-success badge-sm">
                                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                        </div>
                                        {product.stock < 20 && product.stock > 0 && (
                                            <div className="badge badge-warning badge-sm">
                                                Only {product.stock} left!
                                            </div>
                                        )}
                                    </div>
                                    <Link
                                        href={`/products/${product._id}`}
                                        className="btn btn-sm btn-outline mt-3"
                                    >
                                        View Details
                                        <Eye className="w-4 h-4" />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. SHOP BY CATEGORY */}
            <section className="section-padding bg-base-100">
                <div className="container-custom">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-base-content mb-4">
                            Shop by Category
                        </h2>
                        <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
                            Explore our wide range of products across different categories
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {categories.slice(0, 6).map((category, index) => {
                            const categoryProducts = products.filter(p => p.category === category)
                            const categoryImage = categoryProducts[0]?.image || '/placeholder.jpg'

                            return (
                                <motion.div
                                    key={category}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link
                                        href={`/products?category=${encodeURIComponent(category)}`}
                                        className="card bg-base-200 hover:shadow-xl transition-all duration-300 group overflow-hidden"
                                    >
                                        <figure className="relative h-32 overflow-hidden">
                                            <Image
                                                src={categoryImage}
                                                alt={category}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
                                        </figure>
                                        <div className="card-body p-4 text-center">
                                            <h3 className="font-bold text-sm line-clamp-2">
                                                {category}
                                            </h3>
                                            <p className="text-xs text-base-content/60">
                                                {categoryProducts.length} items
                                            </p>
                                        </div>
                                    </Link>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* 5. NEW ARRIVALS */}
            <section className="section-padding bg-base-200">
                <div className="container-custom">
                    <div className="flex items-center justify-between mb-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <Sparkles className="w-8 h-8 text-primary" />
                                <h2 className="text-3xl md:text-4xl font-bold text-base-content">
                                    New Arrivals
                                </h2>
                            </div>
                            <p className="text-base-content/70">
                                Fresh products just added to our collection
                            </p>
                        </motion.div>
                        <Link
                            href="/products?sort=newest"
                            className="btn btn-outline btn-primary"
                        >
                            View All
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {newArrivals.slice(0, 4).map((product, index) => (
                            <motion.div
                                key={product._id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="card bg-base-100 shadow-lg hover:shadow-2xl transition-all duration-300"
                            >
                                <figure className="relative h-56 overflow-hidden group">
                                    <div className="absolute top-4 left-4 z-10">
                                        <span className="badge badge-accent text-white font-bold">
                                            NEW
                                        </span>
                                    </div>
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </figure>
                                <div className="card-body p-4">
                                    <h3 className="font-bold text-base line-clamp-2">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm text-base-content/70 line-clamp-2">
                                        {product.description}
                                    </p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-xl font-bold text-primary">
                                            ${product.price?.toFixed(2)}
                                        </span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                className="btn btn-primary"
                                            >
                                                <ShoppingBag className="w-4 h-4"/>
                                            </button>
                                            <Link
                                                href={`/products/${product._id}`}
                                                className="btn "
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. SPECIAL OFFER CARDS */}
            <section className="section-padding bg-base-100">
                <div className="container-custom">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Offer Card 1 */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="card bg-linear-to-br from-purple-500 to-pink-500 text-white shadow-2xl overflow-hidden"
                        >
                            <div className="card-body relative">
                                <Gift className="absolute -right-8 -bottom-8 w-32 h-32 opacity-20" />
                                <div className="relative z-10">
                                    <div className="badge badge-accent mb-4">EXCLUSIVE</div>
                                    <h3 className="text-2xl font-bold mb-2">
                                        First Purchase Bonus
                                    </h3>
                                    <p className="text-white/90 mb-4">
                                        Get extra 20% OFF on your first order as a new member
                                    </p>
                                    <Link href="/products" className="btn btn-white">
                                        Claim Now
                                    </Link>
                                </div>
                            </div>
                        </motion.div>

                        {/* Offer Card 2 */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="card bg-linear-to-br from-blue-500 to-cyan-500 text-white shadow-2xl overflow-hidden"
                        >
                            <div className="card-body relative">
                                <Truck className="absolute -right-8 -bottom-8 w-32 h-32 opacity-20" />
                                <div className="relative z-10">
                                    <div className="badge badge-warning mb-4">FREE SHIPPING</div>
                                    <h3 className="text-2xl font-bold mb-2">
                                        Premium Delivery
                                    </h3>
                                    <p className="text-white/90 mb-4">
                                        Free express shipping on all orders - No minimum purchase
                                    </p>
                                    <Link href="/products" className="btn btn-white">
                                        Start Shopping
                                    </Link>
                                </div>
                            </div>
                        </motion.div>

                        {/* Offer Card 3 */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="card bg-linear-to-br from-orange-500 to-red-500 text-white shadow-2xl overflow-hidden"
                        >
                            <div className="card-body relative">
                                <Crown className="absolute -right-8 -bottom-8 w-32 h-32 opacity-20" />
                                <div className="relative z-10">
                                    <div className="badge badge-success mb-4">VIP REWARDS</div>
                                    <h3 className="text-2xl font-bold mb-2">
                                        Loyalty Points
                                    </h3>
                                    <p className="text-white/90 mb-4">
                                        Earn points on every purchase and redeem for rewards
                                    </p>
                                    <Link href="/profile" className="btn btn-white">
                                        Learn More
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 7. TOP RATED PRODUCTS */}
            <section className="section-padding bg-linear-to-br from-amber-50 to-orange-50 dark:from-base-300 dark:to-base-200">
                <div className="container-custom">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Award className="w-10 h-10 text-warning" />
                            <h2 className="text-3xl md:text-4xl font-bold text-base-content">
                                Top Rated Products
                            </h2>
                        </div>
                        <p className="text-lg text-base-content/70">
                            Customer favorites with highest ratings
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {topRated.map((product, index) => (
                            <motion.div
                                key={product._id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="card bg-base-100 shadow-lg hover:shadow-2xl transition-all duration-300 group"
                            >
                                <figure className="relative h-40 overflow-hidden">
                                    <div className="absolute top-2 right-2 z-10 bg-warning text-white rounded-full px-2 py-1 flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-current" />
                                        <span className="text-xs font-bold">
                                            {product.rating?.toFixed(1)}
                                        </span>
                                    </div>
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                </figure>
                                <div className="card-body p-3">
                                    <h3 className="font-semibold text-xs line-clamp-2 min-h-[32px]">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm font-bold text-primary">
                                        ${product.price?.toFixed(2)}
                                    </p>
                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        className="btn btn-xs btn-primary w-full mt-2"
                                    >
                                        <ShoppingBag className="w-3 h-3" />
                                        Add
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 8. TRENDING NOW */}
            <section className="section-padding bg-base-100">
                <div className="container-custom">
                    <div className="flex items-center justify-between mb-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <TrendingUp className="w-8 h-8 text-success" />
                                <h2 className="text-3xl md:text-4xl font-bold text-base-content">
                                    Trending Now
                                </h2>
                            </div>
                            <p className="text-base-content/70">
                                Most popular products this week
                            </p>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {products.slice(4, 6).map((product, index) => (
                            <motion.div
                                key={product._id}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="card lg:card-side bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300"
                            >
                                <figure className="lg:w-1/2 relative h-64 lg:h-auto">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                </figure>
                                <div className="card-body lg:w-1/2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-5 h-5 text-success" />
                                        <span className="badge badge-success">TRENDING</span>
                                    </div>
                                    <h3 className="card-title text-xl">
                                        {product.name}
                                    </h3>
                                    <p className="text-base-content/70 line-clamp-3">
                                        {product.description}
                                    </p>
                                    <div className="flex items-center gap-2 my-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${i < Math.floor(product.rating || 0)
                                                        ? 'text-warning fill-warning'
                                                        : 'text-base-300'
                                                    }`}
                                            />
                                        ))}
                                        <span className="text-sm text-base-content/60">
                                            ({product.reviews?.length || 0} reviews)
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl font-bold text-primary">
                                            ${product.price?.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="card-actions justify-end mt-4">
                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            className="btn btn-primary"
                                        >
                                            <ShoppingBag className="w-4 h-4" />
                                            Add to Cart
                                        </button>
                                        <Link
                                            href={`/products/${product._id}`}
                                            className="btn btn-outline"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 9. RECOMMENDED FOR YOU */}
            <section className="section-padding bg-base-200">
                <div className="container-custom">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-base-content mb-4">
                            Recommended for You
                        </h2>
                        <p className="text-lg text-base-content/70">
                            Personalized picks based on your interests
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.slice(8, 12).map((product, index) => (
                            <motion.div
                                key={product._id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="card bg-base-100 shadow-lg hover:shadow-2xl transition-all duration-300"
                            >
                                <figure className="relative h-56 overflow-hidden group">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                </figure>
                                <div className="card-body p-4">
                                    <div className="badge badge-primary badge-sm">For You</div>
                                    <h3 className="font-bold line-clamp-2 mt-2">
                                        {product.name}
                                    </h3>
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-3 h-3 ${i < Math.floor(product.rating || 0)
                                                        ? 'text-warning fill-warning'
                                                        : 'text-base-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-xl font-bold text-primary">
                                            ${product.price?.toFixed(2)}
                                        </span>
                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            className="btn btn-sm btn-primary"
                                        >
                                            <ShoppingBag className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 10. WHY SHOP WITH US */}
            <section className="section-padding bg-linear-to-br from-primary/10 via-secondary/10 to-accent/10">
                <div className="container-custom">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-base-content mb-4">
                            Why Shop With Us
                        </h2>
                        <p className="text-lg text-base-content/70">
                            Premium benefits for our valued members
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: Truck,
                                title: 'Free Shipping',
                                description: 'Free delivery on all orders for members',
                                color: 'text-blue-500'
                            },
                            {
                                icon: ShieldCheck,
                                title: 'Secure Payment',
                                description: '100% secure payment with SSL encryption',
                                color: 'text-green-500'
                            },
                            {
                                icon: HeadphonesIcon,
                                title: '24/7 Support',
                                description: 'Dedicated support team always ready to help',
                                color: 'text-purple-500'
                            },
                            {
                                icon: BadgeCheck,
                                title: 'Verified Products',
                                description: 'All products are quality checked and authentic',
                                color: 'text-orange-500'
                            }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 text-center"
                            >
                                <div className="card-body items-center">
                                    <div className={`w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mb-4`}>
                                        <feature.icon className={`w-8 h-8 ${feature.color}`} />
                                    </div>
                                    <h3 className="card-title text-xl">
                                        {feature.title}
                                    </h3>
                                    <p className="text-base-content/70">
                                        {feature.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 11. NEWSLETTER SIGNUP */}
            <section className="section-padding bg-linear-to-r from-primary to-secondary text-white">
                <div className="container-custom">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-3xl mx-auto text-center"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Get Exclusive Member Updates
                        </h2>
                        <p className="text-white/90 text-lg mb-8">
                            Subscribe to receive special offers, early access to sales, and personalized recommendations
                        </p>
                        <div className="flex gap-4 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="input input-lg flex-1 text-base-content"
                                defaultValue={user?.email || ''}
                            />
                            <button className="btn btn-lg bg-white text-primary hover:bg-white/90 border-none">
                                Subscribe
                            </button>
                        </div>
                        <p className="text-sm text-white/70 mt-4">
                            You&apos;re already subscribed! Check your email for latest offers.
                        </p>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}
