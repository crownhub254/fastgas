'use client'

import { useState, useEffect, useRef, useCallback, Suspense, memo, useMemo } from 'react'
import { motion, useScroll, useTransform, useInView, AnimatePresence, useMotionValue, useSpring, animate } from 'framer-motion'
import { Sparkles, Truck, Shield, Phone, MapPin, Clock, ChevronRight, ChevronLeft, Star, Package, Coffee, GlassWater, Cake, ChefHat, Zap, CheckCircle, Award, Beaker, IceCream, ArrowDown, Play, LayoutDashboard, Users, ShoppingBag, Bike, Volume2, VolumeX } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// ============================================
// PERFORMANCE HOOKS
// ============================================

// Detect mobile/low-power devices
function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false)
    
    useEffect(() => {
        const checkDevice = () => {
            const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            const smallScreen = window.innerWidth < 768
            setIsMobile(mobile || smallScreen)
        }
        
        checkDevice()
        window.addEventListener('resize', checkDevice)
        return () => window.removeEventListener('resize', checkDevice)
    }, [])
    
    return isMobile
}

// Reduced motion preference - using lazy initial state
function usePrefersReducedMotion() {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
        if (typeof window === 'undefined') return false
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    })
    
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
        const handler = (e) => setPrefersReducedMotion(e.matches)
        mediaQuery.addEventListener('change', handler)
        return () => mediaQuery.removeEventListener('change', handler)
    }, [])
    
    return prefersReducedMotion
}

// Dynamic import for 3D scenes (client-side only) - with loading states
const Hero3DScene = dynamic(() => import('./three/Scene3D').then(mod => ({ default: mod.Hero3DScene })), { 
    ssr: false,
    loading: () => null
})
const Product3DScene = dynamic(() => import('./three/Scene3D').then(mod => ({ default: mod.Product3DScene })), { 
    ssr: false,
    loading: () => null 
})
const Minimal3DBackground = dynamic(() => import('./three/Scene3D').then(mod => ({ default: mod.Minimal3DBackground })), { 
    ssr: false,
    loading: () => null 
})
const ProductViewer3D = dynamic(() => import('./three/Scene3D').then(mod => ({ default: mod.ProductViewer3D })), { 
    ssr: false,
    loading: () => null 
})

// FastGas N₂O Cylinder Products - Official Products from fast-gas.com
const CYLINDER_DATA = [
    {
        size: '670g',
        slug: '670g-n2o-cylinder',
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
        color: 'from-[#0D2137] to-[#142d4c]',
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
        slug: 'pressure-regulator',
        name: 'Pressure Regulator',
        category: 'Accessory',
        image: 'https://fast-gas.com/wp-content/uploads/2025/03/Pressure-Regulator-transparent.png',
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
        color: 'from-violet-400 to-purple-400',
        specs: {
            weight: '0.3 kg',
            compatibility: 'M10X1 valve',
            material: 'Durable Brass',
            connection: 'Standard Syphon',
            warranty: '1 Year'
        }
    },
    {
        size: 'Creamer',
        slug: 'fastgas-creamer',
        name: 'FastGas Creamer',
        category: 'Dispenser',
        image: 'https://fast-gas.com/wp-content/uploads/2024/06/fg-new-branding-670-original.png',
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
        color: 'from-pink-400 to-rose-400',
        specs: {
            weight: '0.5 kg',
            dimensions: '10 × 10 × 35 cm',
            compatibility: 'All N₂O cylinders',
            finish: 'Premium Matte Black',
            warranty: '2 Years'
        }
    },
    {
        size: '0.5L',
        slug: 'cream-syphon',
        name: 'FastGas Cream Syphon',
        category: 'Equipment',
        image: 'https://fast-gas.com/wp-content/uploads/2025/03/3.png',
        idealFor: ['Whipped creams', 'Espumas', 'Foams', 'Culinary creations', 'Bar service'],
        features: [
            'Compatible with FastGas Creamer',
            'Works with Pressure Regulator',
            'Industry standard compatibility',
            'Cold mixtures only',
            'Professional grade quality'
        ],
        description: 'The FastGas cream syphon is designed to dispense the final product: whipped creams, espumas and foams on your culinary or bar creations. Compatible with the FastGas Creamer and the FastGas pressure regulator as well as most industry standards. Only suitable for cold mixtures.',
        application: 'Dispenses perfect creams & foams',
        icon: GlassWater,
        color: 'from-emerald-400 to-teal-400',
        specs: {
            weight: '1 kg',
            dimensions: '0.8 × 2.6 cm (nozzle)',
            capacity: '0.5 Liters (500ml)',
            compatibility: 'FastGas Creamer, Pressure Regulator, Industry Standard',
            suitableFor: 'Cold Mixtures Only',
            material: 'Food-Grade Stainless Steel',
            warranty: '2 Years'
        }
    }
]

// ============================================
// MOBILE PRODUCT CAROUSEL COMPONENT
// ============================================

function MobileProductCarousel({ products }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const containerRef = useRef(null)
    const dragX = useMotionValue(0)
    
    const totalProducts = products.length
    
    // Auto-rotate every 4 seconds (paused when dragging)
    useEffect(() => {
        if (isDragging) return
        
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % totalProducts)
        }, 4000)
        
        return () => clearInterval(interval)
    }, [isDragging, totalProducts])
    
    const goToSlide = (index) => {
        setCurrentIndex(index)
    }
    
    const goNext = () => {
        setCurrentIndex(prev => (prev + 1) % totalProducts)
    }
    
    const goPrev = () => {
        setCurrentIndex(prev => (prev - 1 + totalProducts) % totalProducts)
    }
    
    // Handle drag end
    const handleDragEnd = (event, info) => {
        setIsDragging(false)
        const threshold = 50
        
        if (info.offset.x < -threshold) {
            goNext()
        } else if (info.offset.x > threshold) {
            goPrev()
        }
    }
    
    const cylinder = products[currentIndex]
    const IconComponent = cylinder.icon
    
    return (
        <div className="relative w-full" ref={containerRef}>
            {/* Progress Bar */}
            <div className="flex gap-1 mb-4 px-4">
                {products.map((_, idx) => (
                    <motion.button
                        key={idx}
                        onClick={() => goToSlide(idx)}
                        className={`h-1 rounded-full flex-1 transition-all duration-300 ${
                            idx === currentIndex 
                                ? 'bg-primary' 
                                : 'bg-base-300 hover:bg-primary/50'
                        }`}
                        whileHover={{ scaleY: 1.5 }}
                    />
                ))}
            </div>
            
            {/* Carousel Container */}
            <div className="relative overflow-hidden">
                <motion.div
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={handleDragEnd}
                    className="cursor-grab active:cursor-grabbing"
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="px-4"
                        >
                            {/* Product Card */}
                            <div className={`relative bg-base-100 rounded-3xl shadow-2xl border-2 overflow-hidden ${
                                cylinder.popular ? 'border-primary ring-4 ring-primary/20' : 'border-base-200'
                            }`}>
                                {cylinder.popular && (
                                    <div className="bg-gradient-to-r from-primary to-secondary text-primary-content text-center py-2 text-sm font-bold">
                                        <span className="inline-flex items-center gap-2">
                                            <Star className="w-4 h-4 fill-current" /> BEST SELLER <Star className="w-4 h-4 fill-current" />
                                        </span>
                                    </div>
                                )}
                                
                                {/* Product Image */}
                                <div className={`relative h-56 ${cylinder.image ? 'bg-gradient-to-br from-slate-100 to-slate-200' : `bg-gradient-to-br ${cylinder.color}`} flex items-center justify-center overflow-hidden`}>
                                    {cylinder.image ? (
                                        <motion.img 
                                            src={cylinder.image} 
                                            alt={cylinder.name}
                                            className="h-44 w-auto object-contain drop-shadow-2xl"
                                            animate={{ y: [0, -8, 0] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                        />
                                    ) : (
                                        <motion.div 
                                            animate={{ y: [0, -10, 0] }}
                                            transition={{ duration: 3, repeat: Infinity }}
                                            className="text-7xl"
                                        >
                                            {cylinder.category === 'Accessory' ? '⚙️' : '🍨'}
                                        </motion.div>
                                    )}
                                    
                                    {/* Size Badge */}
                                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                                        {cylinder.size}
                                    </div>
                                    
                                    {/* Category Badge */}
                                    <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm text-primary-content px-3 py-1 rounded-full text-xs font-semibold">
                                        {cylinder.category}
                                    </div>
                                </div>
                                
                                {/* Product Info */}
                                <div className="p-5">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cylinder.color || 'from-primary to-secondary'} flex items-center justify-center text-white shadow-lg`}>
                                            <IconComponent className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">{cylinder.name}</h3>
                                            <p className="text-base-content/60 text-sm">{cylinder.application}</p>
                                        </div>
                                    </div>
                                    
                                    <p className="text-base-content/70 text-sm mb-4 line-clamp-2">
                                        {cylinder.description}
                                    </p>
                                    
                                    {/* Features Preview */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {cylinder.features.slice(0, 2).map((feature, idx) => (
                                            <span key={idx} className="text-xs bg-base-200 px-2 py-1 rounded-full text-base-content/70">
                                                {feature}
                                            </span>
                                        ))}
                                        {cylinder.features.length > 2 && (
                                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                                +{cylinder.features.length - 2} more
                                            </span>
                                        )}
                                    </div>
                                    
                                    {/* Action Button */}
                                    <Link href={`/products/${cylinder.slug}`} className="block">
                                        <motion.button
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-primary-content font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
                                        >
                                            View Details
                                            <ChevronRight className="w-5 h-5" />
                                        </motion.button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
                
                {/* Navigation Arrows */}
                <button
                    onClick={goPrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-base-100/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-base-content hover:bg-primary hover:text-primary-content transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={goNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-base-100/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-base-content hover:bg-primary hover:text-primary-content transition-colors"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>
            
            {/* Swipe Hint */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center text-base-content/50 text-xs mt-4 flex items-center justify-center gap-2"
            >
                <ChevronLeft className="w-4 h-4" />
                Swipe or tap arrows to browse products
                <ChevronRight className="w-4 h-4" />
            </motion.p>
            
            {/* Product Counter */}
            <div className="text-center mt-2">
                <span className="text-sm font-medium text-base-content/60">
                    {currentIndex + 1} / {totalProducts}
                </span>
            </div>
        </div>
    )
}

// ============================================
// ADVANCED ANIMATION COMPONENTS
// ============================================

// Text Scramble Effect - Cyberpunk style text reveal
function ScrambleText({ text, className = '', delay = 0 }) {
    const [displayText, setDisplayText] = useState('')
    const [isScrambling, setIsScrambling] = useState(true)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    
    useEffect(() => {
        let iteration = 0
        const maxIterations = text.length * 3
        
        const timeout = setTimeout(() => {
            const interval = setInterval(() => {
                setDisplayText(
                    text.split('').map((char, index) => {
                        if (char === ' ') return ' '
                        if (index < iteration / 3) return text[index]
                        return chars[Math.floor(Math.random() * chars.length)]
                    }).join('')
                )
                
                iteration++
                if (iteration >= maxIterations) {
                    setDisplayText(text)
                    setIsScrambling(false)
                    clearInterval(interval)
                }
            }, 30)
            
            return () => clearInterval(interval)
        }, delay)
        
        return () => clearTimeout(timeout)
    }, [text, delay])
    
    return <span className={className}>{displayText || text.split('').map(() => chars[Math.floor(Math.random() * chars.length)]).join('')}</span>
}

// Typewriter Effect
function TypewriterText({ words, className = '' }) {
    const [currentWordIndex, setCurrentWordIndex] = useState(0)
    const [currentText, setCurrentText] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)
    
    useEffect(() => {
        const word = words[currentWordIndex]
        const timeout = setTimeout(() => {
            if (!isDeleting) {
                setCurrentText(word.substring(0, currentText.length + 1))
                if (currentText === word) {
                    setTimeout(() => setIsDeleting(true), 2000)
                }
            } else {
                setCurrentText(word.substring(0, currentText.length - 1))
                if (currentText === '') {
                    setIsDeleting(false)
                    setCurrentWordIndex((prev) => (prev + 1) % words.length)
                }
            }
        }, isDeleting ? 50 : 100)
        
        return () => clearTimeout(timeout)
    }, [currentText, isDeleting, currentWordIndex, words])
    
    return (
        <span className={className}>
            {currentText}
            <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-1 h-[1em] bg-current ml-1 align-middle"
            />
        </span>
    )
}

// Magnetic Button Effect
function MagneticButton({ children, className = '', onClick, href }) {
    const buttonRef = useRef(null)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    
    const handleMouseMove = (e) => {
        if (!buttonRef.current) return
        const rect = buttonRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const distX = (e.clientX - centerX) * 0.3
        const distY = (e.clientY - centerY) * 0.3
        setPosition({ x: distX, y: distY })
    }
    
    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 })
    }
    
    const Component = href ? motion.a : motion.button
    
    return (
        <Component
            ref={buttonRef}
            href={href}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15 }}
            className={className}
        >
            {children}
        </Component>
    )
}

// Aurora/Northern Lights Background - OPTIMIZED
function AuroraBackground() {
    const isMobile = useIsMobile()
    const prefersReducedMotion = usePrefersReducedMotion()
    
    // Skip heavy animations on mobile or when reduced motion is preferred
    if (isMobile || prefersReducedMotion) {
        return (
            <div className="absolute inset-0 overflow-hidden">
                <div 
                    className="absolute inset-0 opacity-30"
                    style={{
                        background: 'linear-gradient(180deg, transparent 0%, rgba(6,182,212,0.15) 50%, transparent 100%)',
                    }}
                />
            </div>
        )
    }
    
    return (
        <div className="absolute inset-0 overflow-hidden">
            {/* Reduced from 5 to 2 animated elements */}
            {[0, 1].map((i) => (
                <motion.div
                    key={i}
                    className="absolute w-full h-64 will-change-transform"
                    style={{
                        background: `linear-gradient(90deg, transparent, ${
                            ['rgba(6,182,212,0.15)', 'rgba(139,92,246,0.15)'][i]
                        }, transparent)`,
                        top: `${i * 40}%`,
                        filter: 'blur(40px)',
                    }}
                    animate={{
                        x: ['-30%', '30%', '-30%'],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 15 + i * 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    )
}

// Infinite Marquee Component - OPTIMIZED with CSS animation
function InfiniteMarquee({ items, speed = 50, direction = 'left' }) {
    const isMobile = useIsMobile()
    
    // Use CSS animation for better performance
    return (
        <div className="overflow-hidden whitespace-nowrap">
            <div 
                className={`inline-flex ${direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'}`}
                style={{ 
                    animationDuration: `${isMobile ? speed * 1.5 : speed}s`,
                    willChange: 'transform'
                }}
            >
                {[...items, ...items].map((item, i) => (
                    <div key={i} className="inline-flex items-center mx-4 md:mx-8">
                        {item}
                    </div>
                ))}
            </div>
        </div>
    )
}

// Confetti Explosion Effect
function useConfetti() {
    const [confetti, setConfetti] = useState([])
    
    const explode = useCallback(() => {
        const colors = ['#06b6d4', '#8b5cf6', '#ec4899', '#22d3ee', '#a78bfa', '#f472b6', '#fbbf24', '#34d399']
        const newConfetti = [...Array(50)].map((_, i) => ({
            id: Date.now() + i,
            x: Math.random() * 100,
            color: colors[Math.floor(Math.random() * colors.length)],
            delay: Math.random() * 0.3,
            rotation: Math.random() * 360,
        }))
        setConfetti(newConfetti)
        setTimeout(() => setConfetti([]), 3000)
    }, [])
    
    const ConfettiComponent = () => (
        <AnimatePresence>
            {confetti.map((c) => (
                <motion.div
                    key={c.id}
                    className="fixed pointer-events-none z-[9999]"
                    style={{
                        left: `${c.x}%`,
                        top: '50%',
                        width: 10,
                        height: 10,
                        backgroundColor: c.color,
                        borderRadius: Math.random() > 0.5 ? '50%' : '0',
                    }}
                    initial={{ y: 0, opacity: 1, rotate: 0 }}
                    animate={{
                        y: [0, -200, 600],
                        x: [0, (Math.random() - 0.5) * 300],
                        opacity: [1, 1, 0],
                        rotate: c.rotation + 720,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                        duration: 2.5,
                        delay: c.delay,
                        ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                />
            ))}
        </AnimatePresence>
    )
    
    return { explode, ConfettiComponent }
}

// Spotlight Cursor Effect
function SpotlightCursor() {
    const isMobile = useIsMobile()
    const [position, setPosition] = useState({ x: -100, y: -100 })
    const [isVisible, setIsVisible] = useState(false)
    
    useEffect(() => {
        // Disable on mobile devices
        if (isMobile) return
        
        let rafId = null
        const handleMouseMove = (e) => {
            // Throttle updates with RAF
            if (rafId) return
            rafId = requestAnimationFrame(() => {
                setPosition({ x: e.clientX, y: e.clientY })
                setIsVisible(true)
                rafId = null
            })
        }
        const handleMouseLeave = () => setIsVisible(false)
        
        window.addEventListener('mousemove', handleMouseMove, { passive: true })
        document.body.addEventListener('mouseleave', handleMouseLeave)
        
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            document.body.removeEventListener('mouseleave', handleMouseLeave)
            if (rafId) cancelAnimationFrame(rafId)
        }
    }, [isMobile])
    
    // Don't render on mobile
    if (isMobile) return null
    
    return (
        <div
            className="fixed pointer-events-none z-50 mix-blend-soft-light will-change-transform"
            style={{
                transform: `translate(${position.x - 150}px, ${position.y - 150}px)`,
                opacity: isVisible ? 1 : 0,
                width: 300,
                height: 300,
                background: 'radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)',
                borderRadius: '50%',
                transition: 'opacity 0.2s ease',
            }}
        />
    )
}

// Liquid Blob Animation
function LiquidBlob({ className = '', color = 'cyan' }) {
    const isMobile = useIsMobile()
    const prefersReducedMotion = usePrefersReducedMotion()
    
    // FastGas brand colors
    const colors = {
        cyan: 'rgba(6,182,212,0.25)',
        yellow: 'rgba(247,198,0,0.25)',
        navy: 'rgba(13,33,55,0.4)',
        purple: 'rgba(139,92,246,0.25)',
        pink: 'rgba(236,72,153,0.25)',
    }
    
    // Static blob on mobile for better performance
    if (isMobile || prefersReducedMotion) {
        return (
            <div
                className={`absolute rounded-full blur-2xl ${className}`}
                style={{ backgroundColor: colors[color] }}
            />
        )
    }
    
    return (
        <motion.div
            className={`absolute rounded-full blur-3xl will-change-transform ${className}`}
            style={{ backgroundColor: colors[color] }}
            animate={{
                scale: [1, 1.05, 1],
            }}
            transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        />
    )
}

// Glitch Text Effect
function GlitchText({ text, className = '' }) {
    return (
        <div className={`relative ${className}`}>
            <span className="relative z-10">{text}</span>
            <motion.span
                className="absolute inset-0 text-cyan-400 z-0"
                animate={{
                    x: [-2, 2, -2],
                    opacity: [0, 1, 0],
                }}
                transition={{
                    duration: 0.15,
                    repeat: Infinity,
                    repeatDelay: 3,
                }}
                style={{ clipPath: 'inset(20% 0 30% 0)' }}
            >
                {text}
            </motion.span>
            <motion.span
                className="absolute inset-0 text-pink-400 z-0"
                animate={{
                    x: [2, -2, 2],
                    opacity: [0, 1, 0],
                }}
                transition={{
                    duration: 0.15,
                    repeat: Infinity,
                    repeatDelay: 3,
                    delay: 0.05,
                }}
                style={{ clipPath: 'inset(50% 0 20% 0)' }}
            >
                {text}
            </motion.span>
        </div>
    )
}

// Parallax Floating Elements
function ParallaxFloat({ children, offset = 50 }) {
    const ref = useRef(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    })
    const y = useTransform(scrollYProgress, [0, 1], [offset, -offset])
    
    return (
        <motion.div ref={ref} style={{ y }}>
            {children}
        </motion.div>
    )
}

// 3D Rotating Badge
function Rotating3DBadge({ icon: Icon, text, color = 'cyan' }) {
    return (
        <motion.div
            className="relative"
            animate={{ rotateY: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{ transformStyle: 'preserve-3d' }}
        >
            <div className={`bg-gradient-to-r from-${color}-500/20 to-${color}-500/10 backdrop-blur-md px-6 py-3 rounded-full border border-${color}-500/30 flex items-center gap-2`}>
                <Icon className={`w-5 h-5 text-${color}-400`} />
                <span className={`text-${color}-300 font-medium`}>{text}</span>
            </div>
        </motion.div>
    )
}

// Wave Divider
function WaveDivider({ flip = false }) {
    return (
        <div className={`absolute ${flip ? 'top-0 rotate-180' : 'bottom-0'} left-0 w-full overflow-hidden leading-none`}>
            <svg
                className="relative block w-full h-16"
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
            >
                <motion.path
                    d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                    className="fill-base-200"
                    animate={{
                        d: [
                            "M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z",
                            "M321.39,76.44c58-20.79,114.16-40.13,172-51.86,82.39-6.72,168.19-7.73,250.45-10.39C823.78,21,906.67,52,985.66,72.83c70.05,28.48,146.53,36.09,214.34,13V0H0V37.35A600.21,600.21,0,0,0,321.39,76.44Z",
                            "M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z",
                        ],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
            </svg>
        </div>
    )
}

// ============================================
// ORIGINAL COMPONENTS (ENHANCED)
// ============================================

// Pre-generate particle data - REDUCED count for performance
const PARTICLE_DATA = [...Array(15)].map((_, i) => ({
    id: i,
    left: `${(i * 37 + 13) % 100}%`,
    top: `${(i * 53 + 7) % 100}%`,
    xOffset: ((i * 17) % 20) - 10,
    duration: 4 + ((i * 23) % 40) / 10,
    delay: ((i * 31) % 50) / 10,
}))

// Floating Particle Component - OPTIMIZED
function FloatingParticles() {
    const isMobile = useIsMobile()
    const prefersReducedMotion = usePrefersReducedMotion()
    
    // Disable on mobile or reduced motion
    if (isMobile || prefersReducedMotion) {
        return null
    }
    
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {PARTICLE_DATA.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute w-1 h-1 bg-white rounded-full will-change-transform"
                    style={{
                        left: particle.left,
                        top: particle.top,
                    }}
                    animate={{
                        y: [0, -20, 0],
                        opacity: [0.2, 0.6, 0.2],
                    }}
                    transition={{
                        duration: particle.duration,
                        repeat: Infinity,
                        delay: particle.delay,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    )
}

// Animated Gradient Orb - OPTIMIZED
function GradientOrb({ className, delay = 0 }) {
    const isMobile = useIsMobile()
    
    // Use CSS animation on mobile
    if (isMobile) {
        return (
            <div className={`absolute rounded-full blur-2xl opacity-20 ${className}`} />
        )
    }
    
    return (
        <motion.div
            className={`absolute rounded-full blur-3xl opacity-25 will-change-transform ${className}`}
            animate={{
                scale: [1, 1.1, 1],
            }}
            transition={{
                duration: 10,
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

                {/* CTA Button - View Product Details */}
                <Link href={`/products/${cylinder.slug}`} className="block w-full">
                    <motion.div
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
                            View Details & Order
                            <motion.span
                                animate={{ x: [0, 5, 0] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </motion.span>
                        </span>
                    </motion.div>
                </Link>
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
    const isMobile = useIsMobile()
    const prefersReducedMotion = usePrefersReducedMotion()
    
    // Only use scroll transforms on desktop
    const { scrollYProgress } = useScroll()
    const scaleProgress = useTransform(scrollYProgress, [0, 0.5], [1, isMobile ? 1 : 0.95])
    const opacityProgress = useTransform(scrollYProgress, [0, 0.3], [1, isMobile ? 1 : 0.8])
    
    // Advanced features state
    const { explode, ConfettiComponent } = useConfetti()
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    useEffect(() => {
        // Disable mouse tracking on mobile
        if (isMobile) return
        
        let rafId = null
        const handleMouseMove = (e) => {
            // Throttle with RAF for better performance
            if (rafId) return
            rafId = requestAnimationFrame(() => {
                setMousePosition({ x: e.clientX, y: e.clientY })
                rafId = null
            })
        }
        window.addEventListener('mousemove', handleMouseMove, { passive: true })
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            if (rafId) cancelAnimationFrame(rafId)
        }
    }, [isMobile])

    // Testimonial data for marquee - Kenyan customers with Sheng vibes
    const testimonials = [
        { name: "Chef Wanjiku", role: "Sarova Stanley", text: "Hii N₂O ni safi sana! Purest we've ever used 💯", rating: 5 },
        { name: "Kamau's Bakery", role: "Westlands, Nairobi", text: "Desserts zetu zimekuwa noma since we switched!", rating: 5 },
        { name: "Ochieng Mixology", role: "Kilimani", text: "Cocktails zetu sasa ni different level. Customers wanashangaa!", rating: 5 },
        { name: "Njeri's Pastries", role: "Karen", text: "Delivery ni fast, quality iko juu. Hakuna complaints!", rating: 5 },
        { name: "Chef Otieno", role: "Carnivore Restaurant", text: "Best supplier in KE bila shaka. Wametushow mzuri!", rating: 5 },
        { name: "Akinyi Desserts", role: "Lavington", text: "Cream yetu sasa imebamba! Customers wote happy 🔥", rating: 5 },
        { name: "Mwangi Hotels", role: "Mombasa Road", text: "Supply yao ni rada. Never disappointed, always on time!", rating: 5 },
        { name: "Chef Kipchoge", role: "Norfolk Hotel", text: "Premium quality, pesa yako haipotei. Highly recommend!", rating: 5 },
        { name: "Mama Fua Cafe", role: "CBD, Nairobi", text: "Hawa watu ni legit! Service ni poa, product swafi 👌", rating: 5 },
        { name: "Barista Brian", role: "Java House", text: "Kazi safi! Our espumas are now chef's kiss 😙", rating: 5 },
    ]

    return (
        <div className="min-h-screen overflow-hidden">
            {/* Global Spotlight Cursor Effect */}
            <SpotlightCursor />
            
            {/* Confetti Container */}
            <ConfettiComponent />
            
            {/* Hero Section with Parallax */}
            <motion.section 
                style={{ scale: scaleProgress, opacity: opacityProgress }}
                className="relative min-h-screen flex items-center justify-center overflow-hidden"
            >
                {/* Aurora Background Effect */}
                <AuroraBackground />
                
                {/* 3D Scene Background - Creates depth and visual interest */}
                <div className="absolute inset-0 z-[1]">
                    <Hero3DScene />
                </div>
                
                {/* Static Gradient Background - FastGas Navy Blue */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628] via-[#0D2137] to-[#142d4c]" />

                {/* Liquid Blob Effects - Only on desktop */}
                {!isMobile && (
                    <>
                        <LiquidBlob className="w-[500px] h-[500px] -top-40 -left-40" color="cyan" />
                        <LiquidBlob className="w-[400px] h-[400px] top-1/2 -right-40" color="yellow" />
                        <LiquidBlob className="w-[350px] h-[350px] -bottom-40 left-1/3" color="cyan" />
                    </>
                )}

                {/* Floating Gradient Orbs - FastGas colors */}
                <GradientOrb className="w-96 h-96 bg-cyan-500 -top-20 -left-20" delay={0} />
                <GradientOrb className="w-80 h-80 bg-yellow-400 top-1/2 -right-20" delay={2} />
                <GradientOrb className="w-72 h-72 bg-cyan-400 -bottom-20 left-1/3" delay={4} />

                {/* Floating Particles */}
                <FloatingParticles />

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px',
                }} />

                {/* Mouse Follower Glow - Desktop only */}
                {!isMobile && (
                    <div
                        className="absolute w-96 h-96 rounded-full pointer-events-none will-change-transform"
                        style={{
                            background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
                            left: mousePosition.x - 192,
                            top: mousePosition.y - 192,
                            transform: 'translateZ(0)',
                        }}
                    />
                )}

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                        className="max-w-6xl mx-auto text-center text-white"
                    >
                        {/* Animated Badge with Scramble Effect */}
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
                                <Sparkles className="w-6 h-6 text-yellow-400" />
                            </motion.div>
                            <span className="font-medium text-lg">
                                <ScrambleText text="Premium Culinary Grade N₂O" className="bg-gradient-to-r from-yellow-300 to-cyan-300 bg-clip-text text-transparent" delay={500} />
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
                            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black mb-6 relative"
                        >
                            <GlitchText text="Fast" className="relative inline-block" />
                            <motion.span 
                                className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-cyan-400"
                                animate={{ 
                                    backgroundPosition: ['0%', '100%', '0%'],
                                }}
                                transition={{ duration: 5, repeat: Infinity }}
                                style={{ backgroundSize: '200%' }}
                            >
                                Gas
                            </motion.span>
                        </motion.h1>
                        
                        {/* Typewriter Subtitle */}
                        <motion.p 
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-3xl md:text-4xl mb-4 font-light"
                        >
                            <span className="bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">
                                Perfect for{' '}
                            </span>
                            <TypewriterText 
                                words={['Whipped Cream', 'Espumas', 'Cocktail Foams', 'Pastry Creations', 'Molecular Cuisine']}
                                className="text-yellow-300 font-semibold"
                            />
                        </motion.p>
                        
                        <motion.p 
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="text-xl mb-12 text-white/70 max-w-3xl mx-auto leading-relaxed"
                        >
                            Professional-grade 99.99% pure N₂O cylinders for culinary excellence. 
                            Trusted by top chefs and mixologists across Kenya.
                        </motion.p>
                        
                        {/* CTA Buttons with Magnetic Effect & Confetti */}
                        <motion.div 
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
                        >
                            <MagneticButton
                                href="#products"
                                onClick={explode}
                                className="btn btn-md sm:btn-lg px-6 sm:px-10 bg-gradient-to-r from-yellow-400 to-yellow-500 border-none text-[#0D2137] font-bold shadow-2xl shadow-yellow-500/30 hover:shadow-yellow-500/50 flex items-center"
                            >
                                <Package className="w-5 h-5 mr-2" />
                                Explore Products
                                <motion.span
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </motion.span>
                            </MagneticButton>
                            
                            <MagneticButton
                                href="/contact"
                                className="btn btn-md sm:btn-lg px-6 sm:px-10 bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20 flex items-center"
                            >
                                <Phone className="w-5 h-5 mr-2" />
                                Contact Us
                            </MagneticButton>
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
                                    <p className="text-4xl font-bold bg-gradient-to-r from-yellow-300 to-cyan-300 bg-clip-text text-transparent">
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
                {/* 3D Background for Products */}
                <div className="absolute inset-0 opacity-40">
                    <Product3DScene />
                </div>
                
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

                    {/* Mobile: Swipeable Carousel */}
                    <div className="md:hidden">
                        <MobileProductCarousel products={CYLINDER_DATA} />
                    </div>

                    {/* Desktop: Grid Layout */}
                    <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
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

            {/* Testimonials Infinite Marquee Section */}
            <section className="py-16 bg-gradient-to-r from-base-200 via-base-100 to-base-200 overflow-hidden relative">
                {/* Subtle 3D Stars Background */}
                <div className="absolute inset-0 opacity-30">
                    <Minimal3DBackground />
                </div>
                
                <WaveDivider flip />
                
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-10"
                >
                    <h3 className="text-3xl font-bold mb-2">
                        Trusted by <span className="text-primary">Professionals</span>
                    </h3>
                    <p className="text-base-content/60">What our customers say</p>
                </motion.div>
                
                {/* First Row - Left to Right */}
                <div className="mb-6">
                    <InfiniteMarquee
                        speed={40}
                        direction="left"
                        items={testimonials.map((t, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="flex items-center gap-4 bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 min-w-[350px]"
                            >
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl">
                                    {t.name[0]}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold">{t.name}</span>
                                        <span className="text-xs text-base-content/50">•</span>
                                        <span className="text-sm text-base-content/60">{t.role}</span>
                                    </div>
                                    <p className="text-base-content/80 text-sm">&quot;{t.text}&quot;</p>
                                    <div className="flex gap-0.5 mt-1">
                                        {[...Array(t.rating)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    />
                </div>
                
                {/* Second Row - Right to Left */}
                <InfiniteMarquee
                    speed={35}
                    direction="right"
                    items={[
                        <div key="brand1" className="flex items-center gap-2 px-6 py-3 bg-base-100 rounded-xl shadow border border-base-300">
                            <ChefHat className="w-6 h-6 text-primary" />
                            <span className="font-semibold">Top Chefs Choice</span>
                        </div>,
                        <div key="brand2" className="flex items-center gap-2 px-6 py-3 bg-base-100 rounded-xl shadow border border-base-300">
                            <Award className="w-6 h-6 text-secondary" />
                            <span className="font-semibold">99.99% Pure</span>
                        </div>,
                        <div key="brand3" className="flex items-center gap-2 px-6 py-3 bg-base-100 rounded-xl shadow border border-base-300">
                            <Shield className="w-6 h-6 text-success" />
                            <span className="font-semibold">EU Certified</span>
                        </div>,
                        <div key="brand4" className="flex items-center gap-2 px-6 py-3 bg-base-100 rounded-xl shadow border border-base-300">
                            <Truck className="w-6 h-6 text-warning" />
                            <span className="font-semibold">Same-Day Delivery</span>
                        </div>,
                        <div key="brand5" className="flex items-center gap-2 px-6 py-3 bg-base-100 rounded-xl shadow border border-base-300">
                            <Star className="w-6 h-6 text-yellow-500" />
                            <span className="font-semibold">5-Star Reviews</span>
                        </div>,
                    ]}
                />
                
                <WaveDivider />
            </section>

            {/* CTA Section with FastGas Brand Colors */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628] via-[#0D2137] to-[#142d4c]" />
                
                {/* Yellow accent glow */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl" />
                
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
                                    '0 0 20px rgba(247,198,0,0.3)',
                                    '0 0 40px rgba(247,198,0,0.5)',
                                    '0 0 20px rgba(247,198,0,0.3)',
                                ]
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            Ready to Elevate Your Creations?
                        </motion.h2>
                        <p className="text-xl sm:text-2xl mb-10 text-white/80">Order premium N₂O cylinders today!</p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4">
                            <motion.a 
                                href="tel:+254740595680" 
                                whileHover={{ scale: 1.05, y: -3 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn btn-md sm:btn-lg px-6 sm:px-10 bg-yellow-400 text-[#0D2137] hover:bg-yellow-300 border-none shadow-2xl shadow-yellow-400/30 font-bold w-full sm:w-auto"
                            >
                                <Phone className="w-5 h-5 mr-2" />
                                +254 740 595 680
                            </motion.a>
                            <motion.a 
                                href="https://wa.me/254740595680" 
                                whileHover={{ scale: 1.05, y: -3 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn btn-md sm:btn-lg px-6 sm:px-10 bg-green-500 text-white hover:bg-green-600 border-none shadow-2xl w-full sm:w-auto"
                            >
                                WhatsApp Us
                            </motion.a>
                        </div>

                        <motion.div 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 }}
                            className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-12 sm:mt-16 text-white/80 px-4"
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
            <section className="py-12 sm:py-16 bg-base-300">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-8 sm:mb-10"
                    >
                        <span className="badge badge-warning badge-lg mb-4">Demo Mode</span>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Quick Dashboard Access</h2>
                        <p className="text-base-content/60 text-sm sm:text-base">Preview all dashboards without signing in</p>
                    </motion.div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
                        {[
                            { href: '/dashboard/admin', label: 'Admin Dashboard', icon: <LayoutDashboard className="w-6 h-6 sm:w-8 sm:h-8" />, color: 'from-red-500 to-orange-500', desc: 'Full control panel' },
                            { href: '/dashboard/distributor', label: 'Distributor Dashboard', icon: <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8" />, color: 'from-blue-500 to-cyan-500', desc: 'Manage products & orders' },
                            { href: '/dashboard/reseller', label: 'Reseller Dashboard', icon: <Users className="w-6 h-6 sm:w-8 sm:h-8" />, color: 'from-purple-500 to-pink-500', desc: 'Wholesale operations' },
                            { href: '/dashboard/user', label: 'User Dashboard', icon: <Users className="w-6 h-6 sm:w-8 sm:h-8" />, color: 'from-green-500 to-emerald-500', desc: 'Customer account' },
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
                                    className="block bg-base-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center shadow-lg hover:shadow-xl transition-all border-2 border-base-200 hover:border-primary group h-full"
                                >
                                    <motion.div 
                                        className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${dashboard.color} text-white mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform`}
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
