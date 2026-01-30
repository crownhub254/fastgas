'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Truck, Shield, Phone, MapPin, Clock, ChevronRight, Star, Package, Coffee, GlassWater, Cake, ChefHat, Zap, CheckCircle, Award, Beaker, IceCream } from 'lucide-react'
import Link from 'next/link'

// FastGas N₂O Cylinder Products - Official Products from fast-gas.com
const CYLINDER_DATA = [
    {
        size: '670g',
        name: 'FastGas Original',
        category: 'Cream Charger',
        idealFor: ['Cafés & bakeries', 'Cocktail bars', 'Restaurants', 'Professional kitchens'],
        features: [
            'Bestselling size worldwide',
            'M10X1 standard valve',
            'Carbon steel cylinder',
            '6 units per case'
        ],
        description: 'European quality nitrous oxide in a safe and disposable steel canister. Always at full capacity, this 670g canister is our bestselling size globally. Makes the fluffiest whipped creams, espumas, cocktail foams, and sauces.',
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
        size: '2000g',
        name: 'FastGas Max',
        category: 'Cream Charger',
        idealFor: ['Hotels', 'Large restaurants', 'Catering companies', 'High-volume bars'],
        features: [
            'Maximum capacity (2kg)',
            'Carrying strap included',
            'Best value for volume',
            'M10X1 standard valve'
        ],
        description: 'The largest FastGas cream charger at 2000g (2kg). European quality N₂O in a convenient large-format cylinder with carrying strap. Ideal for high-volume professional operations.',
        application: 'Equivalent to ~250 cream chargers',
        icon: ChefHat,
        color: 'from-amber-400 to-orange-400',
        specs: {
            dimensions: '12.3 × 12.3 × 35.5 cm',
            capacity: '2000 grams',
            gas: 'Nitrous Oxide (N₂O)',
            casing: 'Disposable Carbon Steel',
            valve: 'M10X1',
            unitsPerCase: 1
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
        description: 'Essential pressure regulator for connecting FastGas cylinders to cream syphons and dispensers. Ensures consistent flow and optimal results for all culinary applications.',
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
        description: 'The FastGas Creamer is a professional all-in-one cream dispenser with integrated stand and cylinder mount. Creates perfect whipped cream, espumas, cocktail foams, and culinary sauces with precision.',
        application: 'Creates perfect creams & foams',
        icon: IceCream,
        color: 'from-pink-400 to-rose-400'
    }
]

// Cylinder Card Component
function CylinderInfoCard({ cylinder }) {
    const IconComponent = cylinder.icon
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`bg-base-100 rounded-2xl shadow-lg border-2 overflow-hidden hover:shadow-xl transition-all ${cylinder.popular ? 'border-primary ring-2 ring-primary/20' : 'border-base-200'}`}
        >
            {cylinder.popular && (
                <div className="bg-primary text-primary-content text-center py-2 text-sm font-medium">
                    ⭐ Best Seller
                </div>
            )}
            
            {/* Cylinder Visual */}
            <div className={`relative h-56 bg-gradient-to-br ${cylinder.color} flex items-center justify-center overflow-hidden`}>
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-8xl drop-shadow-lg"
                    >
                        {cylinder.category === 'Chargers' ? '🧁' : cylinder.category === 'Tank' ? '🍽️' : '☁️'}
                    </motion.div>
                </div>
                <div className="absolute top-4 right-4 bg-white text-gray-800 px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                    {cylinder.size}
                </div>
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                    {cylinder.category}
                </div>
                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full">
                    <IconComponent className="w-5 h-5 text-gray-700" />
                    <span className="text-sm font-medium text-gray-700">{cylinder.name}</span>
                </div>
            </div>
            
            <div className="p-6">
                {/* Description */}
                <p className="text-base-content/70 text-sm mb-4">
                    {cylinder.description}
                </p>

                {/* Ideal For */}
                <div className="mb-4">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success" />
                        Ideal For:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {cylinder.idealFor.map((item, i) => (
                            <span key={i} className="badge badge-ghost badge-sm">{item}</span>
                        ))}
                    </div>
                </div>

                {/* Features */}
                <div className="mb-4">
                    <h4 className="font-semibold text-sm mb-2">Key Features:</h4>
                    <ul className="space-y-1">
                        {cylinder.features.map((feature, i) => (
                            <li key={i} className="text-sm text-base-content/70 flex items-center gap-2">
                                <Sparkles className="w-3 h-3 text-cyan-500 flex-shrink-0" />
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Application */}
                <div className="bg-base-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                        <Beaker className="w-4 h-4 text-primary" />
                        <span className="font-medium">{cylinder.application}</span>
                    </div>
                </div>

                {/* CTA */}
                <Link href={`/products?size=${cylinder.size}`} className="btn btn-primary w-full">
                    Learn More & Order
                    <ChevronRight className="w-4 h-4" />
                </Link>
            </div>
        </motion.div>
    )
}

export default function FastGasHomePage({ user = null }) {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute text-white/10 text-7xl"
                            initial={{ x: -100, y: Math.random() * 600 }}
                            animate={{ x: 1500 }}
                            transition={{ 
                                duration: 12 + i * 2, 
                                repeat: Infinity, 
                                delay: i * 2,
                                ease: "linear"
                            }}
                        >
                            ☁️
                        </motion.div>
                    ))}
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-5xl mx-auto text-center text-white"
                    >
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-8"
                        >
                            <Sparkles className="w-6 h-6" />
                            <span className="font-medium text-lg">Premium Culinary Grade N₂O</span>
                        </motion.div>
                        
                        <motion.h1 
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="text-6xl md:text-8xl font-bold mb-6"
                        >
                            Fast<span className="text-cyan-200">Gas</span>
                        </motion.h1>
                        
                        <p className="text-2xl md:text-3xl mb-4 text-white/95 font-light">
                            99.99% Pure Nitrous Oxide
                        </p>
                        
                        <p className="text-lg md:text-xl mb-10 text-white/80 max-w-2xl mx-auto">
                            Professional-grade N₂O cylinders for culinary excellence. 
                            Create perfect whipped cream, silky foams, espumas, and craft cocktail infusions.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="#products" className="btn btn-lg bg-white text-blue-600 hover:bg-gray-100 border-none shadow-lg">
                                <Package className="w-5 h-5 mr-2" />
                                Explore Products
                            </Link>
                            <Link href="/track" className="btn btn-lg btn-outline border-white text-white hover:bg-white hover:text-blue-600">
                                <Truck className="w-5 h-5 mr-2" />
                                Track Your Order
                            </Link>
                        </div>

                        {/* Trust Indicators */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto">
                            <motion.div 
                                whileHover={{ scale: 1.05 }}
                                className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
                            >
                                <p className="text-4xl font-bold">99.99%</p>
                                <p className="text-sm text-white/70">Purity Grade</p>
                            </motion.div>
                            <motion.div 
                                whileHover={{ scale: 1.05 }}
                                className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
                            >
                                <p className="text-4xl font-bold">5K+</p>
                                <p className="text-sm text-white/70">Restaurants</p>
                            </motion.div>
                            <motion.div 
                                whileHover={{ scale: 1.05 }}
                                className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
                            >
                                <p className="text-4xl font-bold">EU</p>
                                <p className="text-sm text-white/70">Certified</p>
                            </motion.div>
                            <motion.div 
                                whileHover={{ scale: 1.05 }}
                                className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
                            >
                                <p className="text-4xl font-bold">4.9★</p>
                                <p className="text-sm text-white/70">Customer Rating</p>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
                
                {/* Wave SVG */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" className="w-full h-24 fill-base-100">
                        <path d="M0,64 C360,120 1080,0 1440,64 L1440,120 L0,120 Z"></path>
                    </svg>
                </div>
            </section>

            {/* What is N₂O Section */}
            <section className="py-20 bg-base-100">
                <div className="container mx-auto px-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold mb-4">What is Culinary N₂O?</h2>
                            <p className="text-base-content/70 text-lg">
                                Food-grade nitrous oxide for professional kitchens and mixology
                            </p>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <div>
                                <div className="bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl p-8 text-center">
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        className="text-9xl mb-4"
                                    >
                                        ☁️
                                    </motion.div>
                                    <p className="text-sm text-base-content/60">99.99% Pure N₂O</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-pink-100 text-pink-600">
                                        <IceCream className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">Whipped Cream & Foams</h4>
                                        <p className="text-base-content/70 text-sm">Create light, airy whipped cream and culinary foams instantly. N₂O dissolves into fats to create stable, silky textures.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                                        <GlassWater className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">Cocktail Infusions</h4>
                                        <p className="text-base-content/70 text-sm">Mixologists use N₂O for rapid flavor infusions, creating complex cocktails with smooth textures in minutes instead of hours.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-amber-100 text-amber-600">
                                        <ChefHat className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">Molecular Gastronomy</h4>
                                        <p className="text-base-content/70 text-sm">Create espumas, savory foams, and aerated sauces. Essential for modern culinary techniques used by top chefs worldwide.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-green-100 text-green-600">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">Preserves Freshness</h4>
                                        <p className="text-base-content/70 text-sm">Unlike air, N₂O inhibits the oxidation of butterfat, helping cream products stay fresh longer after dispensing.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Products Section */}
            <section id="products" className="py-20 bg-base-200">
                <div className="container mx-auto px-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl font-bold mb-4">Our Product Range</h2>
                        <p className="text-base-content/70 max-w-2xl mx-auto text-lg">
                            From 8g cream chargers for home use to 2.2kg commercial tanks for restaurants. 
                            All products are 99.99% pure food-grade N₂O.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {CYLINDER_DATA.map((cylinder) => (
                            <CylinderInfoCard key={cylinder.size} cylinder={cylinder} />
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-base-100">
                <div className="container mx-auto px-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl font-bold mb-4">Culinary Applications</h2>
                        <p className="text-base-content/70">Professional techniques made simple</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {[
                            { 
                                icon: '🍰', 
                                title: 'Whipped Cream', 
                                desc: 'Create perfect, stable whipped cream in seconds. Fill dispenser with cold cream, charge with N₂O, shake, and dispense. Lasts longer than traditionally whipped cream.',
                                steps: ['Fill dispenser with cold cream', 'Insert charger and charge', 'Shake vigorously', 'Dispense and serve']
                            },
                            { 
                                icon: '🍸', 
                                title: 'Cocktail Infusions', 
                                desc: 'Rapid infusion technique for craft cocktails. Infuse spirits with herbs, fruits, or spices in minutes instead of days. Creates smooth, complex flavor profiles.',
                                steps: ['Add spirit and ingredients', 'Charge and let sit 30 seconds', 'Release pressure slowly', 'Strain and serve']
                            },
                            { 
                                icon: '🥄', 
                                title: 'Espumas & Foams', 
                                desc: 'Create light, airy culinary foams and espumas. Perfect for molecular gastronomy. Works with both sweet and savory preparations for fine dining presentations.',
                                steps: ['Prepare liquid base', 'Add gelling agents', 'Charge with N₂O', 'Rest and dispense']
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-base-200 rounded-xl p-6"
                            >
                                <div className="text-5xl mb-4">{item.icon}</div>
                                <h3 className="font-bold text-xl mb-3">{item.title}</h3>
                                <p className="text-base-content/70 text-sm mb-4">{item.desc}</p>
                                <div className="space-y-2">
                                    {item.steps.map((step, j) => (
                                        <div key={j} className="flex items-center gap-2 text-sm">
                                            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">{j+1}</span>
                                            <span className="text-base-content/80">{step}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Safety & Quality Section */}
            <section className="py-20 bg-base-200">
                <div className="container mx-auto px-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl font-bold mb-4">Quality & Safety</h2>
                        <p className="text-base-content/70">Professional-grade products for culinary professionals</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {[
                            { icon: <Award className="w-10 h-10" />, title: '99.99% Pure', desc: 'Highest purity food-grade nitrous oxide. No residual oils or impurities that could affect taste or food safety.' },
                            { icon: <Shield className="w-10 h-10" />, title: 'EU Certified', desc: 'All products meet strict European food safety standards. Manufactured in certified facilities with full traceability.' },
                            { icon: <Beaker className="w-10 h-10" />, title: 'Lab Tested', desc: 'Every batch is tested for purity and consistency. Certificate of analysis available for commercial customers.' }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-base-100 rounded-xl p-8 text-center shadow-sm"
                            >
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-base-content/70">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why FastGas Section */}
            <section className="py-20 bg-base-100">
                <div className="container mx-auto px-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl font-bold mb-4">Why Choose FastGas?</h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: <Truck className="w-10 h-10" />, title: 'Fast Delivery', desc: 'Same-day delivery in Nairobi. Next-day shipping nationwide. Track your order in real-time.' },
                            { icon: <Award className="w-10 h-10" />, title: 'Premium Quality', desc: '99.99% pure food-grade N₂O. European manufactured with full certification and batch testing.' },
                            { icon: <Phone className="w-10 h-10" />, title: 'Expert Support', desc: 'Culinary support for professionals. Technical guidance on equipment, techniques, and troubleshooting.' }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-base-200 rounded-xl p-8 text-center"
                            >
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-base-content/70">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Reseller CTA */}
            <section className="py-20 bg-base-200">
                <div className="container mx-auto px-4">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl p-12 text-center text-white max-w-4xl mx-auto"
                    >
                        <h3 className="text-3xl font-bold mb-4">Become a FastGas Distributor</h3>
                        <p className="mb-8 text-white/90 max-w-xl mx-auto text-lg">
                            Supply cafés, restaurants, and bars in your area. 
                            Get wholesale pricing, marketing support, and dedicated account management.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/register?role=reseller" className="btn btn-lg bg-white text-blue-600 hover:bg-gray-100 border-none">
                                Apply for Wholesale Account
                                <ChevronRight className="w-5 h-5" />
                            </Link>
                            <Link href="/dashboard/reseller" className="btn btn-lg btn-outline border-white text-white hover:bg-white hover:text-blue-600">
                                Reseller Dashboard
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Contact/CTA Section */}
            <section className="py-20 bg-gradient-to-r from-cyan-500 to-purple-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-4">Ready to Elevate Your Culinary Creations?</h2>
                    <p className="text-xl mb-8 text-white/90">Order premium N₂O cylinders today!</p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <a href="tel:+254700000000" className="btn btn-lg bg-white text-blue-600 hover:bg-gray-100 border-none">
                            <Phone className="w-5 h-5 mr-2" />
                            +254 700 000 000
                        </a>
                        <a href="https://wa.me/254700000000" className="btn btn-lg btn-outline border-white text-white hover:bg-white hover:text-blue-600">
                            WhatsApp Us
                        </a>
                    </div>

                    <div className="flex flex-wrap justify-center gap-8 mt-12 text-sm">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>Nairobi, Kenya</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>Same-Day Delivery</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            <span>99.99% Pure N₂O</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
