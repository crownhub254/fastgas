'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence, useMotionValue, useVelocity, useAnimationFrame } from 'framer-motion'
import { Sparkles, Truck, Shield, Phone, MapPin, Clock, ChevronRight, Star, Package, Coffee, GlassWater, Cake, ChefHat, Zap, CheckCircle, Award, Beaker, IceCream, ArrowDown, Play, LayoutDashboard, Users, ShoppingBag, Bike, Volume2, VolumeX } from 'lucide-react'
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

// Aurora/Northern Lights Background
function AuroraBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden">
            <motion.div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(180deg, transparent 0%, rgba(6,182,212,0.1) 50%, transparent 100%)',
                }}
                animate={{
                    y: ['-100%', '100%'],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-full h-64"
                    style={{
                        background: `linear-gradient(90deg, transparent, ${
                            ['rgba(6,182,212,0.2)', 'rgba(139,92,246,0.2)', 'rgba(236,72,153,0.2)', 'rgba(34,211,238,0.15)', 'rgba(167,139,250,0.15)'][i]
                        }, transparent)`,
                        top: `${i * 20}%`,
                        filter: 'blur(40px)',
                    }}
                    animate={{
                        x: ['-50%', '50%', '-50%'],
                        opacity: [0.3, 0.7, 0.3],
                        scaleY: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: 10 + i * 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.5,
                    }}
                />
            ))}
        </div>
    )
}

// Infinite Marquee Component
function InfiniteMarquee({ items, speed = 50, direction = 'left' }) {
    const marqueeRef = useRef(null)
    const [contentWidth, setContentWidth] = useState(0)
    
    useEffect(() => {
        if (marqueeRef.current) {
            setContentWidth(marqueeRef.current.scrollWidth / 2)
        }
    }, [])
    
    return (
        <div className="overflow-hidden whitespace-nowrap">
            <motion.div
                ref={marqueeRef}
                className="inline-flex"
                animate={{
                    x: direction === 'left' ? [0, -contentWidth] : [-contentWidth, 0],
                }}
                transition={{
                    x: {
                        duration: speed,
                        repeat: Infinity,
                        ease: "linear",
                    },
                }}
            >
                {[...items, ...items].map((item, i) => (
                    <div key={i} className="inline-flex items-center mx-8">
                        {item}
                    </div>
                ))}
            </motion.div>
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
    const [position, setPosition] = useState({ x: -100, y: -100 })
    const [isVisible, setIsVisible] = useState(false)
    
    useEffect(() => {
        const handleMouseMove = (e) => {
            setPosition({ x: e.clientX, y: e.clientY })
            setIsVisible(true)
        }
        const handleMouseLeave = () => setIsVisible(false)
        
        window.addEventListener('mousemove', handleMouseMove)
        document.body.addEventListener('mouseleave', handleMouseLeave)
        
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            document.body.removeEventListener('mouseleave', handleMouseLeave)
        }
    }, [])
    
    return (
        <motion.div
            className="fixed pointer-events-none z-50 mix-blend-soft-light"
            animate={{
                x: position.x - 150,
                y: position.y - 150,
                opacity: isVisible ? 1 : 0,
            }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
            style={{
                width: 300,
                height: 300,
                background: 'radial-gradient(circle, rgba(6,182,212,0.4) 0%, transparent 70%)',
                borderRadius: '50%',
            }}
        />
    )
}

// Liquid Blob Animation
function LiquidBlob({ className = '', color = 'cyan' }) {
    const colors = {
        cyan: 'rgba(6,182,212,0.3)',
        purple: 'rgba(139,92,246,0.3)',
        pink: 'rgba(236,72,153,0.3)',
    }
    
    return (
        <motion.div
            className={`absolute rounded-full blur-3xl ${className}`}
            style={{ backgroundColor: colors[color] }}
            animate={{
                borderRadius: [
                    '60% 40% 30% 70% / 60% 30% 70% 40%',
                    '30% 60% 70% 40% / 50% 60% 30% 60%',
                    '60% 40% 30% 70% / 60% 30% 70% 40%',
                ],
                scale: [1, 1.1, 1],
            }}
            transition={{
                duration: 8,
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

// Pre-generate particle data to avoid impure function calls during render
const PARTICLE_DATA = [...Array(50)].map((_, i) => ({
    id: i,
    left: `${(i * 37 + 13) % 100}%`,
    top: `${(i * 53 + 7) % 100}%`,
    xOffset: ((i * 17) % 20) - 10,
    duration: 3 + ((i * 23) % 40) / 10,
    delay: ((i * 31) % 50) / 10,
}))

// Floating Particle Component
function FloatingParticles() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {PARTICLE_DATA.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute w-1 h-1 bg-white rounded-full"
                    style={{
                        left: particle.left,
                        top: particle.top,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        x: [0, particle.xOffset, 0],
                        opacity: [0.2, 0.8, 0.2],
                        scale: [1, 1.5, 1],
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

                {/* CTA Button with Shine Effect - WhatsApp Order */}
                <motion.a
                    href={`https://wa.me/254740595680?text=Hi! I'm interested in ordering ${cylinder.name} (${cylinder.size}). Please share pricing and availability.`}
                    target="_blank"
                    rel="noopener noreferrer"
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
                        Order via WhatsApp
                        <motion.span
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </motion.span>
                    </span>
                </motion.a>
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
    
    // Advanced features state
    const { explode, ConfettiComponent } = useConfetti()
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY })
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    // Testimonial data for marquee
    const testimonials = [
        { name: "Chef Marcus", role: "Executive Chef", text: "The purest N₂O we've ever used!", rating: 5 },
        { name: "Bella Kitchen", role: "Pastry Shop", text: "Perfect for our desserts every time", rating: 5 },
        { name: "Mixology Bar", role: "Cocktail Lounge", text: "Game-changer for our foam cocktails", rating: 5 },
        { name: "Sweet Delights", role: "Bakery", text: "Consistent quality, fast delivery", rating: 5 },
        { name: "Chef Antonio", role: "Restaurant Owner", text: "Best culinary gas supplier in Kenya", rating: 5 },
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

                {/* Liquid Blob Effects */}
                <LiquidBlob className="w-[500px] h-[500px] -top-40 -left-40" color="cyan" />
                <LiquidBlob className="w-[400px] h-[400px] top-1/2 -right-40" color="purple" />
                <LiquidBlob className="w-[350px] h-[350px] -bottom-40 left-1/3" color="pink" />

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
                                <Sparkles className="w-6 h-6 text-cyan-300" />
                            </motion.div>
                            <span className="font-medium text-lg">
                                <ScrambleText text="Premium Culinary Grade N₂O" className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent" delay={500} />
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
                            <GlitchText text="Fast" className="relative inline-block" />
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
                        
                        {/* Typewriter Subtitle */}
                        <motion.p 
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-3xl md:text-4xl mb-4 font-light"
                        >
                            <span className="bg-gradient-to-r from-cyan-200 to-white bg-clip-text text-transparent">
                                Perfect for{' '}
                            </span>
                            <TypewriterText 
                                words={['Whipped Cream', 'Espumas', 'Cocktail Foams', 'Pastry Creations', 'Molecular Cuisine']}
                                className="text-cyan-300 font-semibold"
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
                                className="btn btn-lg px-10 bg-gradient-to-r from-cyan-500 to-blue-500 border-none text-white shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 flex items-center"
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
                                className="btn btn-lg px-10 bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20 flex items-center"
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

            {/* Testimonials Infinite Marquee Section */}
            <section className="py-16 bg-gradient-to-r from-base-200 via-base-100 to-base-200 overflow-hidden">
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
                                href="tel:+254740595680" 
                                whileHover={{ scale: 1.05, y: -3 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn btn-lg px-10 bg-white text-blue-600 hover:bg-gray-100 border-none shadow-2xl"
                            >
                                <Phone className="w-5 h-5 mr-2" />
                                +254 740 595 680
                            </motion.a>
                            <motion.a 
                                href="https://wa.me/254740595680" 
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
