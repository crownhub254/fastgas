'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence } from 'framer-motion'
import { Sparkles, Truck, Shield, Phone, MapPin, Clock, ChevronRight, Star, Package, Coffee, GlassWater, Cake, ChefHat, Zap, CheckCircle, Award, Beaker, IceCream, ArrowDown, Play, LayoutDashboard, Users, ShoppingBag, Bike } from 'lucide-react'
import Link from 'next/link'

// FastGas N₂O Cylinder Products - Official Products from fast-gas.com
const CYLINDER_DATA = [
    {
        size: '670g',
        name: 'FastGas Original',
        category: 'Cream Charger',
        image: 'https://fast-gas.com/wp-content/uploads/2022/07/PRODUCT-PAGE_670_side-view.png',
        caseImage: 'https://fast-gas.com/wp-content/uploads/2022/07/PRODUCT-PAGE_670_box.png',
        palletImage: 'https://fast-gas.com/wp-content/uploads/2022/07/PRODUCT-PAGE_670_pallet.png',
        idealFor: ['Cafés & bakeries', 'Cocktail bars', 'Restaurants', 'Professional kitchens'],
        features: [
            'Bestselling size worldwide',
            'M10X1 standard valve',
            'Carbon steel cylinder',
            '6 units per case'
        ],
        description: 'European quality nitrous oxide in a safe and disposable steel canister. Always at full capacity, this 670g canister is our bestselling size globally.',
        application: 'Equivalent to ~80 cream chargers',
        icon: Coffee,
        popular: true,
        color: 'from-cyan-400 to-blue-400',
        specs: {
            weight: '1.4 kg',
            dimensions: '8.0 × 8.0 × 25.2 cm',
            capacity: '670 grams',
            gas: 'Nitrous Oxide (N₂O)',
            casing: 'Disposable Carbon Steel',
            valve: 'M10X1',
            unNumber: 'UN.Nr 1070',
            unitsPerCase: 6,
            caseSize: '25.5 × 17.5 × 27 cm',
            caseWeight: '12.6 kg'
        }
    },
    {
        size: 'Regulator',
        name: 'Pressure Regulator',
        category: 'Accessory',
        idealFor: ['All cylinder users', 'Precision control', 'Syphon connection', 'Professional setup'],
        features: [
            'M10X1 valve compatible',
            'Precise pressure control',
            'Easy syphon attachment',
            'Durable construction'
        ],
        description: 'Essential pressure regulator for connecting FastGas cylinders to cream syphons and dispensers.',
        application: 'Required for cylinder use',
        icon: Zap,
        color: 'from-violet-400 to-purple-400'
    },
    {
        size: 'Creamer',
        name: 'FastGas Creamer',
        category: 'Dispenser',
        idealFor: ['Espumas', 'Whipped cream', 'Sauces', 'Molecular gastronomy'],
        features: [
            'Professional stand mount',
            'Integrated cylinder holder',
            'Premium matte black finish',
            'Restaurant-grade quality'
        ],
        description: 'Professional all-in-one cream dispenser with integrated stand and cylinder mount.',
        application: 'Creates perfect creams & foams',
        icon: IceCream,
        color: 'from-pink-400 to-rose-400'
    }
]

// Floating Particle Component
function FloatingParticles() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(50)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        x: [0, Math.random() * 20 - 10, 0],
                        opacity: [0.2, 0.8, 0.2],
                        scale: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: 3 + Math.random() * 4,
                        repeat: Infinity,
                        delay: Math.random() * 5,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    )
}

// Animated Gradient Orb
function GradientOrb({ className, delay = 0 }) {
    return (
        <motion.div
            className={`absolute rounded-full blur-3xl opacity-30 ${className}`}
            animate={{
                scale: [1, 1.2, 1],
                x: [0, 30, -30, 0],
                y: [0, -30, 30, 0],
            }}
            transition={{
                duration: 8,
                repeat: Infinity,
                delay,
                ease: "easeInOut",
            }}
        />
    )
}

// 3D Product Card with Tilt Effect
function ProductCard3D({ cylinder, index }) {
    const [rotateX, setRotateX] = useState(0)
    const [rotateY, setRotateY] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
    const cardRef = useRef(null)
    const isInView = useInView(cardRef, { once: true, margin: "-100px" })
    const IconComponent = cylinder.icon

    const handleMouseMove = (e) => {
        if (!cardRef.current) return
        const rect = cardRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const rotateXValue = (e.clientY - centerY) / 20
        const rotateYValue = (centerX - e.clientX) / 20
        setRotateX(rotateXValue)
        setRotateY(rotateYValue)
    }

    const handleMouseLeave = () => {
        setRotateX(0)
        setRotateY(0)
        setIsHovered(false)
    }

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 100, rotateX: 45 }}
            animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
            transition={{ duration: 0.8, delay: index * 0.2, type: "spring", stiffness: 100 }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            style={{
                transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                transformStyle: 'preserve-3d',
            }}
            className={`relative bg-base-100 rounded-3xl shadow-2xl border-2 overflow-hidden transition-all duration-300 ${
                cylinder.popular ? 'border-primary ring-4 ring-primary/20' : 'border-base-200'
            } ${isHovered ? 'shadow-primary/20' : ''}`}
        >
            {/* Glow Effect */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 opacity-0"
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
            />

            {cylinder.popular && (
                <motion.div 
                    className="bg-gradient-to-r from-primary to-secondary text-primary-content text-center py-3 text-sm font-bold"
                    animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    style={{ backgroundSize: '200%' }}
                >
                    <motion.span
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="inline-flex items-center gap-2"
                    >
                        <Star className="w-4 h-4 fill-current" /> BEST SELLER <Star className="w-4 h-4 fill-current" />
                    </motion.span>
                </motion.div>
            )}
            
            {/* Product Image with 3D Float Effect */}
            <div className={`relative h-72 ${cylinder.image ? 'bg-gradient-to-br from-slate-100 to-slate-200' : `bg-gradient-to-br ${cylinder.color}`} flex items-center justify-center overflow-hidden`}>
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
                        backgroundSize: '20px 20px',
                    }} />
                </div>

                {cylinder.image ? (
                    <motion.div 
                        className="relative z-10"
                        animate={isHovered ? { y: -10, scale: 1.05, rotateY: 5 } : { y: 0, scale: 1, rotateY: 0 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        <motion.img 
                            src={cylinder.image} 
                            alt={cylinder.name}
                            className="h-56 w-auto object-contain drop-shadow-2xl"
                            animate={isHovered ? { filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.3))' } : {}}
                        />
                    </motion.div>
                ) : (
                    <motion.div 
                        animate={{ 
                            y: [0, -15, 0],
                            rotateZ: [0, 5, -5, 0],
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="text-8xl"
                    >
                        {cylinder.category === 'Accessory' ? '⚙️' : '🍨'}
                    </motion.div>
                )}

                {/* Floating Badges */}
                <motion.div 
                    className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-full font-bold text-lg shadow-xl"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    {cylinder.size}
                </motion.div>
                <motion.div 
                    className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg"
                    initial={{ x: -50, opacity: 0 }}
                    animate={isInView ? { x: 0, opacity: 1 } : {}}
                    transition={{ delay: index * 0.2 + 0.4 }}
                >
                    {cylinder.category}
                </motion.div>
            </div>
            
            <div className="p-6 relative z-10">
                <motion.h3 
                    className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                    animate={isHovered ? { scale: 1.02 } : { scale: 1 }}
                >
                    {cylinder.name}
                </motion.h3>
                
                <p className="text-base-content/70 text-sm mb-4 line-clamp-2">
                    {cylinder.description}
                </p>

                {/* Animated Features */}
                <div className="space-y-2 mb-4">
                    {cylinder.features.slice(0, 3).map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ x: -20, opacity: 0 }}
                            animate={isInView ? { x: 0, opacity: 1 } : {}}
                            transition={{ delay: index * 0.2 + i * 0.1 + 0.5 }}
                            className="flex items-center gap-2 text-sm"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                            >
                                <CheckCircle className="w-4 h-4 text-success" />
                            </motion.div>
                            <span className="text-base-content/80">{feature}</span>
                        </motion.div>
                    ))}
                </div>

                {/* CTA Button with Shine Effect */}
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full btn btn-primary relative overflow-hidden group"
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        Learn More
                        <motion.span
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </motion.span>
                    </span>
                </motion.button>
            </div>
        </motion.div>
    )
}

// Animated Counter Component
function AnimatedCounter({ value, suffix = '', prefix = '' }) {
    const [count, setCount] = useState(0)
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true })

    useEffect(() => {
        if (isInView) {
            const numValue = parseFloat(value.replace(/[^0-9.]/g, ''))
            const duration = 2000
            const steps = 60
            const increment = numValue / steps
            let current = 0

            const timer = setInterval(() => {
                current += increment
                if (current >= numValue) {
                    setCount(numValue)
                    clearInterval(timer)
                } else {
                    setCount(Math.floor(current * 100) / 100)
                }
            }, duration / steps)

            return () => clearInterval(timer)
        }
    }, [isInView, value])

    return (
        <span ref={ref}>
            {prefix}{count.toLocaleString()}{suffix}
        </span>
    )
}

// Main Component
export default function FastGasHomePage({ user = null }) {
    const { scrollYProgress } = useScroll()
    const scaleProgress = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])
    const opacityProgress = useTransform(scrollYProgress, [0, 0.3], [1, 0.8])
    const yProgress = useTransform(scrollYProgress, [0, 1], [0, -100])
    const springY = useSpring(yProgress, { stiffness: 100, damping: 30 })

    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY })
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    return (
        <div className="min-h-screen overflow-hidden">
            {/* Hero Section with Parallax */}
            <motion.section 
                style={{ scale: scaleProgress, opacity: opacityProgress }}
                className="relative min-h-screen flex items-center justify-center overflow-hidden"
            >
                {/* Animated Gradient Background */}
                <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-cyan-900"
                    animate={{
                        background: [
                            'linear-gradient(135deg, #1e3a5f 0%, #4a1e7a 50%, #1e5f5f 100%)',
                            'linear-gradient(135deg, #4a1e7a 0%, #1e5f5f 50%, #1e3a5f 100%)',
                            'linear-gradient(135deg, #1e5f5f 0%, #1e3a5f 50%, #4a1e7a 100%)',
                            'linear-gradient(135deg, #1e3a5f 0%, #4a1e7a 50%, #1e5f5f 100%)',
                        ]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />

                {/* Floating Gradient Orbs */}
                <GradientOrb className="w-96 h-96 bg-cyan-500 -top-20 -left-20" delay={0} />
                <GradientOrb className="w-80 h-80 bg-purple-500 top-1/2 -right-20" delay={2} />
                <GradientOrb className="w-72 h-72 bg-blue-500 -bottom-20 left-1/3" delay={4} />

                {/* Floating Particles */}
                <FloatingParticles />

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px',
                }} />

                {/* Mouse Follower Glow */}
                <motion.div
                    className="absolute w-96 h-96 rounded-full pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)',
                        left: mousePosition.x - 192,
                        top: mousePosition.y - 192,
                    }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                        className="max-w-6xl mx-auto text-center text-white"
                    >
                        {/* Animated Badge */}
                        <motion.div 
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                            className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-8 py-4 rounded-full mb-8 border border-white/20"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            >
                                <Sparkles className="w-6 h-6 text-cyan-300" />
                            </motion.div>
                            <span className="font-medium text-lg bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                                Premium Culinary Grade N₂O
                            </span>
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="w-2 h-2 bg-green-400 rounded-full"
                            />
                        </motion.div>
                        
                        {/* Main Title with Glitch Effect */}
                        <motion.h1 
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
                            className="text-7xl md:text-9xl font-black mb-6 relative"
                        >
                            <motion.span
                                className="relative inline-block"
                                animate={{ 
                                    textShadow: [
                                        '0 0 20px rgba(6,182,212,0.5)',
                                        '0 0 40px rgba(6,182,212,0.8)',
                                        '0 0 20px rgba(6,182,212,0.5)',
                                    ]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                Fast
                            </motion.span>
                            <motion.span 
                                className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400"
                                animate={{ 
                                    backgroundPosition: ['0%', '100%', '0%'],
                                }}
                                transition={{ duration: 5, repeat: Infinity }}
                                style={{ backgroundSize: '200%' }}
                            >
                                Gas
                            </motion.span>
                        </motion.h1>
                        
                        <motion.p 
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-3xl md:text-4xl mb-4 font-light"
                        >
                            <span className="bg-gradient-to-r from-cyan-200 to-white bg-clip-text text-transparent">
                                99.99% Pure Nitrous Oxide
                            </span>
                        </motion.p>
                        
                        <motion.p 
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="text-xl mb-12 text-white/70 max-w-3xl mx-auto leading-relaxed"
                        >
                            Professional-grade N₂O cylinders for culinary excellence. 
                            Create perfect whipped cream, silky foams, espumas, and craft cocktail infusions.
                        </motion.p>
                        
                        {/* CTA Buttons with Advanced Effects */}
                        <motion.div 
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
                        >
                            <motion.div
                                whileHover={{ scale: 1.05, y: -3 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Link href="#products" className="btn btn-lg px-10 bg-gradient-to-r from-cyan-500 to-blue-500 border-none text-white shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50">
                                    <Package className="w-5 h-5 mr-2" />
                                    Explore Products
                                    <motion.span
                                        animate={{ x: [0, 5, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </motion.span>
                                </Link>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.05, y: -3 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Link href="/contact" className="btn btn-lg px-10 bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20">
                                    <Phone className="w-5 h-5 mr-2" />
                                    Contact Us
                                </Link>
                            </motion.div>
                        </motion.div>

                        {/* Animated Stats */}
                        <motion.div 
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
                        >
                            {[
                                { value: '99.99', suffix: '%', label: 'Purity Grade' },
                                { value: '5000', suffix: '+', label: 'Happy Customers' },
                                { value: '670', suffix: 'g', label: 'Cylinder Size' },
                                { value: '4.9', suffix: '★', label: 'Rating' },
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 1.2 + i * 0.1, type: "spring" }}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
                                >
                                    <p className="text-4xl font-bold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                                        <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                                    </p>
                                    <p className="text-sm text-white/60 mt-1">{stat.label}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
                >
                    <motion.div
                        animate={{ y: [0, 15, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="flex flex-col items-center text-white/50"
                    >
                        <span className="text-sm mb-2">Scroll to explore</span>
                        <ArrowDown className="w-6 h-6" />
                    </motion.div>
                </motion.div>
            </motion.section>

            {/* Products Section */}
            <section id="products" className="py-24 bg-base-200 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                        backgroundSize: '40px 40px',
                    }} />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <motion.span
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            className="inline-block px-6 py-2 bg-primary/10 rounded-full text-primary font-semibold mb-4"
                        >
                            Our Products
                        </motion.span>
                        <h2 className="text-5xl md:text-6xl font-bold mb-6">
                            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                Premium Quality
                            </span>
                        </h2>
                        <p className="text-base-content/70 max-w-2xl mx-auto text-xl">
                            FastGas 670g cream chargers and professional accessories.
                            All products are 99.99% pure food-grade N₂O from Europe.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {CYLINDER_DATA.map((cylinder, index) => (
                            <ProductCard3D key={cylinder.size} cylinder={cylinder} index={index} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section with Stagger Animation */}
            <section className="py-24 bg-base-100 relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-5xl font-bold mb-4">Why Choose FastGas?</h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {[
                            { icon: <Truck className="w-12 h-12" />, title: 'Fast Delivery', desc: 'Same-day delivery in Nairobi. Next-day shipping nationwide.', color: 'from-blue-500 to-cyan-500' },
                            { icon: <Award className="w-12 h-12" />, title: 'Premium Quality', desc: '99.99% pure food-grade N₂O. European manufactured.', color: 'from-purple-500 to-pink-500' },
                            { icon: <Phone className="w-12 h-12" />, title: 'Expert Support', desc: 'Culinary support and technical guidance.', color: 'from-orange-500 to-red-500' }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 50, rotateX: 45 }}
                                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2, type: "spring" }}
                                whileHover={{ y: -10, scale: 1.02 }}
                                className="relative bg-base-200 rounded-3xl p-8 text-center overflow-hidden group"
                            >
                                {/* Gradient Background on Hover */}
                                <motion.div
                                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                                />
                                
                                <motion.div 
                                    className={`inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br ${feature.color} text-white mb-6 shadow-lg`}
                                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    {feature.icon}
                                </motion.div>
                                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-base-content/70">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section with Parallax */}
            <section className="py-24 relative overflow-hidden">
                <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600"
                    animate={{
                        background: [
                            'linear-gradient(90deg, #0891b2 0%, #2563eb 50%, #7c3aed 100%)',
                            'linear-gradient(90deg, #7c3aed 0%, #0891b2 50%, #2563eb 100%)',
                            'linear-gradient(90deg, #2563eb 0%, #7c3aed 50%, #0891b2 100%)',
                            'linear-gradient(90deg, #0891b2 0%, #2563eb 50%, #7c3aed 100%)',
                        ]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
                
                <FloatingParticles />
                
                <div className="container mx-auto px-4 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <motion.h2 
                            className="text-5xl md:text-6xl font-bold mb-6 text-white"
                            animate={{ 
                                textShadow: [
                                    '0 0 20px rgba(255,255,255,0.3)',
                                    '0 0 40px rgba(255,255,255,0.5)',
                                    '0 0 20px rgba(255,255,255,0.3)',
                                ]
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            Ready to Elevate Your Creations?
                        </motion.h2>
                        <p className="text-2xl mb-10 text-white/80">Order premium N₂O cylinders today!</p>
                        
                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <motion.a 
                                href="tel:+254700000000" 
                                whileHover={{ scale: 1.05, y: -3 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn btn-lg px-10 bg-white text-blue-600 hover:bg-gray-100 border-none shadow-2xl"
                            >
                                <Phone className="w-5 h-5 mr-2" />
                                +254 700 000 000
                            </motion.a>
                            <motion.a 
                                href="https://wa.me/254700000000" 
                                whileHover={{ scale: 1.05, y: -3 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn btn-lg px-10 bg-green-500 text-white hover:bg-green-600 border-none shadow-2xl"
                            >
                                WhatsApp Us
                            </motion.a>
                        </div>

                        <motion.div 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 }}
                            className="flex flex-wrap justify-center gap-8 mt-16 text-white/80"
                        >
                            {[
                                { icon: <MapPin className="w-5 h-5" />, text: 'Nairobi, Kenya' },
                                { icon: <Clock className="w-5 h-5" />, text: 'Same-Day Delivery' },
                                { icon: <Star className="w-5 h-5" />, text: '99.99% Pure N₂O' },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ scale: 1.1 }}
                                    className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full"
                                >
                                    {item.icon}
                                    <span>{item.text}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Quick Dashboard Access - Demo Mode */}
            <section className="py-16 bg-base-300">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-10"
                    >
                        <span className="badge badge-warning badge-lg mb-4">Demo Mode</span>
                        <h2 className="text-3xl font-bold mb-2">Quick Dashboard Access</h2>
                        <p className="text-base-content/60">Preview all dashboards without signing in</p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                        {[
                            { href: '/dashboard/admin', label: 'Admin Dashboard', icon: <LayoutDashboard className="w-8 h-8" />, color: 'from-red-500 to-orange-500', desc: 'Full control panel' },
                            { href: '/dashboard/seller', label: 'Seller Dashboard', icon: <ShoppingBag className="w-8 h-8" />, color: 'from-blue-500 to-cyan-500', desc: 'Manage products & orders' },
                            { href: '/dashboard/reseller', label: 'Reseller Dashboard', icon: <Users className="w-8 h-8" />, color: 'from-purple-500 to-pink-500', desc: 'Wholesale operations' },
                            { href: '/dashboard/user', label: 'User Dashboard', icon: <Users className="w-8 h-8" />, color: 'from-green-500 to-emerald-500', desc: 'Customer account' },
                        ].map((dashboard, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Link
                                    href={dashboard.href}
                                    className="block bg-base-100 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all border-2 border-base-200 hover:border-primary group"
                                >
                                    <motion.div 
                                        className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${dashboard.color} text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                                    >
                                        {dashboard.icon}
                                    </motion.div>
                                    <h3 className="font-bold text-sm mb-1">{dashboard.label}</h3>
                                    <p className="text-xs text-base-content/50">{dashboard.desc}</p>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
