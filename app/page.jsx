'use client'

import { motion } from 'framer-motion'
import { ShoppingBag, Truck, Shield, Star, Award, CheckCircle, Users, Globe, Clock, Mail } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function HomePage() {
    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.5 }
    }

    return (
        <div className="min-h-screen">
            {/* Section 1: Hero */}
            <section className="relative min-h-screen flex items-center bg-linear-to-br from-primary via-secondary to-accent overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

                <div className="container-custom relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="inline-block mb-6"
                        >
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-2 rounded-full">
                                <span className="text-primary-content font-medium">✨ Premium Shopping Experience</span>
                            </div>
                        </motion.div>

                        <h1 className="text-5xl md:text-6xl lg:text-8xl font-bold mb-6 text-primary-content leading-tight">
                            Discover Amazing
                            <span className="block bg-linear-to-r from-white to-primary-content bg-clip-text text-transparent">
                                Products
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl mb-10 text-primary-content/90 max-w-2xl mx-auto leading-relaxed">
                            Explore our curated collection of premium items designed for modern living and exceptional experiences
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link href="/products" className="group relative inline-flex items-center gap-3 bg-base-100 text-base-content px-8 py-4 rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 hover:scale-105">
                                <ShoppingBag className="w-5 h-5" />
                                Browse Products
                                <span className="absolute inset-0 rounded-xl bg-linear-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                            </Link>
                            <a href="/login" className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-primary-content px-8 py-3.5 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300">
                                Get Started
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </a>
                        </div>
                    </motion.div>
                </div>

                <div className="absolute bottom-0 left-0 right-0">
                    <svg className="w-full h-24 fill-base-100" viewBox="0 0 1440 120" preserveAspectRatio="none">
                        <path d="M0,64 C360,120 1080,0 1440,64 L1440,120 L0,120 Z"></path>
                    </svg>
                </div>
            </section>

            {/* Section 2: Features */}
            <section className="section-padding bg-base-100">
                <div className="container-custom">
                    <motion.div {...fadeInUp} className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-base-content">Why Choose Us</h2>
                        <p className="text-base-content/70 text-lg max-w-2xl mx-auto">
                            Experience excellence in every aspect of your shopping journey
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Truck className="w-12 h-12" />,
                                title: 'Fast Delivery',
                                desc: 'Lightning-fast shipping with real-time tracking. Your products delivered within 24-48 hours.',
                                color: 'from-info to-info-content'
                            },
                            {
                                icon: <Award className="w-12 h-12" />,
                                title: 'Premium Quality',
                                desc: 'Hand-selected products with rigorous quality control. Only the finest materials and craftsmanship.',
                                color: 'from-success to-success-content'
                            },
                            {
                                icon: <Shield className="w-12 h-12" />,
                                title: 'Secure Payment',
                                desc: 'Bank-level encryption and security. Your transactions are completely safe and protected.',
                                color: 'from-warning to-warning-content'
                            },
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.15, duration: 0.5 }}
                                className="group"
                            >
                                <div className="card h-full hover:scale-105 transition-all duration-300 hover:shadow-xl">
                                    <div className={`inline-flex p-4 rounded-2xl bg-linear-to-br ${feature.color} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3 text-base-content">{feature.title}</h3>
                                    <p className="text-base-content/70 leading-relaxed">{feature.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 3: Product Highlights */}
            <section className="section-padding bg-base-200">
                <div className="container-custom">
                    <motion.div {...fadeInUp} className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-base-content">Featured Products</h2>
                        <p className="text-base-content/70 text-lg max-w-2xl mx-auto">
                            Handpicked selections curated by our experts just for you
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                name: 'Elegant Watch',
                                price: '$299',
                                badge: 'Bestseller',
                                image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop'
                            },
                            {
                                name: 'Premium Bag',
                                price: '$459',
                                badge: 'New Arrival',
                                image: 'https://images.unsplash.com/photo-1591561954555-607968c989ab?w=600&h=600&fit=crop'
                            },
                            {
                                name: 'Designer Shoes',
                                price: '$199',
                                badge: 'Limited',
                                image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop'
                            }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1, duration: 0.5 }}
                                className="group cursor-pointer"
                            >
                                <div className="card overflow-hidden h-full hover:shadow-2xl transition-all duration-500">
                                    <div className="relative h-64 rounded-xl mb-6 overflow-hidden bg-base-200">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent"></div>
                                        <div className="absolute top-4 right-4">
                                            <span className="bg-error text-error-content px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                                                {item.badge}
                                            </span>
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2 text-base-content group-hover:text-primary transition-colors">
                                        {item.name}
                                    </h3>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-3xl font-bold text-primary">{item.price}</span>
                                        <div className="flex text-warning">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="w-4 h-4 fill-current" />
                                            ))}
                                        </div>
                                    </div>
                                    <Link href="/products" className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all group">
                                        View Details
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 4: Statistics */}
            <section className="section-padding bg-linear-to-br from-primary via-secondary to-accent relative">
                <div className="container-custom">
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { icon: <Users className="w-8 h-8" />, number: '10K+', label: 'Happy Customers' },
                            { icon: <ShoppingBag className="w-8 h-8" />, number: '500+', label: 'Products' },
                            { icon: <Globe className="w-8 h-8" />, number: '50+', label: 'Countries' },
                            { icon: <Clock className="w-8 h-8" />, number: '24/7', label: 'Support' },
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1, duration: 0.5, type: "spring" }}
                                className="text-center group"
                            >
                                <div className="inline-flex p-4 bg-white/10 rounded-2xl mb-4 group-hover:bg-white/20 transition-colors">
                                    <div className="text-neutral-content">
                                        {stat.icon}
                                    </div>
                                </div>
                                <div className="text-5xl md:text-6xl font-bold mb-2 text-neutral-content">{stat.number}</div>
                                <div className="text-neutral-content/80 text-lg font-medium">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 5: Testimonials */}
            <section className="section-padding bg-base-100">
                <div className="container-custom">
                    <motion.div {...fadeInUp} className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-base-content">Customer Reviews</h2>
                        <p className="text-base-content/70 text-lg max-w-2xl mx-auto">
                            Don&apos;t just take our word for it - hear from our satisfied customers
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                name: 'Sarah Johnson',
                                role: 'Designer',
                                review: 'The quality exceeded my expectations. Fast delivery and excellent customer service. Will definitely shop here again!',
                                avatar: 'SJ'
                            },
                            {
                                name: 'Mike Chen',
                                role: 'Developer',
                                review: 'Best online shopping experience I\'ve ever had. The interface is smooth and the products are top-notch.',
                                avatar: 'MC'
                            },
                            {
                                name: 'Emma Wilson',
                                role: 'Entrepreneur',
                                review: 'Absolutely love the attention to detail. Every product I\'ve purchased has been perfect. Highly recommend!',
                                avatar: 'EW'
                            },
                        ].map((testimonial, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.15, duration: 0.5 }}
                                className="card hover:scale-105 transition-all duration-300"
                            >
                                <div className="flex text-warning mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-current" />
                                    ))}
                                </div>
                                <p className="text-base-content/80 leading-relaxed mb-6 italic">
                                    &quot;{testimonial.review}&ldquo;
                                </p>
                                <div className="flex items-center mt-auto pt-6 border-t border-base-300">
                                    <div className="w-12 h-12 bg-linear-to-br from-primary to-secondary rounded-full flex items-center justify-center text-primary-content font-bold mr-4">
                                        {testimonial.avatar}
                                    </div>
                                    <div>
                                        <div className="font-bold text-base-content">{testimonial.name}</div>
                                        <div className="text-sm text-base-content/60">{testimonial.role}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 6: Call to Action */}
            <section className="section-padding bg-linear-to-br from-primary via-secondary to-accent relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>

                <div className="container-custom relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <div className="inline-block mb-6">
                            <CheckCircle className="w-16 h-16 text-primary-content mx-auto mb-4" />
                        </div>
                        <h2 className="text-4xl md:text-6xl font-bold mb-6 text-primary-content">
                            Ready to Get Started?
                        </h2>
                        <p className="text-xl md:text-2xl mb-10 text-primary-content/90 leading-relaxed max-w-2xl mx-auto">
                            Join thousands of satisfied customers and transform your shopping experience today
                        </p>
                        <a href="/login" className="inline-flex items-center gap-3 bg-base-100 text-base-content px-10 py-5 rounded-xl font-bold text-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                            Create Account Now
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </a>
                        <p className="mt-6 text-primary-content/70">
                            No credit card required • Free trial available
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Section 7: Newsletter */}
            <section className="section-padding bg-base-300">
                <div className="container-custom">
                    <motion.div
                        {...fadeInUp}
                        className="max-w-3xl mx-auto"
                    >
                        <div className="card bg-linear-to-br from-primary/5 to-secondary/5">
                            <div className="text-center mb-8">
                                <div className="inline-flex p-4 bg-linear-to-br from-primary to-secondary rounded-2xl mb-6">
                                    <Mail className="w-8 h-8 text-primary-content" />
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-base-content">
                                    Stay in the Loop
                                </h2>
                                <p className="text-base-content/70 text-lg">
                                    Subscribe to our newsletter for exclusive deals, new arrivals, and insider updates
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    className="flex-1 px-6 py-4 rounded-xl bg-base-100 border-2 border-base-300 focus:border-primary focus:outline-none transition-colors text-base-content placeholder:text-base-content/50"
                                />
                                <button
                                    onClick={(e) => e.preventDefault()}
                                    className="btn-primary whitespace-nowrap px-8 py-4"
                                >
                                    Subscribe Now
                                </button>
                            </div>

                            <p className="text-center text-sm text-base-content/60 mt-6">
                                We respect your privacy. Unsubscribe at any time.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>
            {/* Section 7: Product Categories */}
            <section className="section-padding bg-base-100">
                <div className="container-custom">
                    <motion.div {...fadeInUp} className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-base-content">Shop by Category</h2>
                        <p className="text-base-content/70 text-lg max-w-2xl mx-auto">
                            Explore our diverse range of premium products across multiple categories
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { name: 'Electronics', icon: '💻', count: '150+ Items', color: 'from-blue-500 to-cyan-500' },
                            { name: 'Audio', icon: '🎧', count: '80+ Items', color: 'from-purple-500 to-pink-500' },
                            { name: 'Photography', icon: '📷', count: '60+ Items', color: 'from-orange-500 to-red-500' },
                            { name: 'Computers', icon: '🖥️', count: '120+ Items', color: 'from-green-500 to-teal-500' },
                            { name: 'Smart Home', icon: '🏠', count: '90+ Items', color: 'from-indigo-500 to-purple-500' },
                            { name: 'Fitness', icon: '⌚', count: '70+ Items', color: 'from-pink-500 to-rose-500' },
                            { name: 'Gaming', icon: '🎮', count: '100+ Items', color: 'from-yellow-500 to-orange-500' },
                            { name: 'Accessories', icon: '🎒', count: '200+ Items', color: 'from-cyan-500 to-blue-500' },
                        ].map((category, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.08, duration: 0.5 }}
                            >
                                <Link href={`/products?category=${category.name}`} className="group block">
                                    <div className="card h-full hover:scale-105 transition-all duration-300 hover:shadow-xl text-center">
                                        <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-300`}>
                                            {category.icon}
                                        </div>
                                        <h3 className="text-xl font-bold mb-2 text-base-content group-hover:text-primary transition-colors">
                                            {category.name}
                                        </h3>
                                        <p className="text-base-content/60">{category.count}</p>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 8: Trust Badges */}
            <section className="section-padding bg-base-200">
                <div className="container-custom">
                    <motion.div {...fadeInUp} className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-base-content">Trusted Worldwide</h2>
                        <p className="text-base-content/70 text-lg max-w-2xl mx-auto">
                            Your satisfaction and security are our top priorities
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: <Shield className="w-10 h-10" />,
                                title: '100% Secure',
                                description: 'SSL encrypted checkout with PCI DSS compliance',
                                color: 'from-green-500 to-emerald-500'
                            },
                            {
                                icon: <CheckCircle className="w-10 h-10" />,
                                title: 'Money Back Guarantee',
                                description: '30-day return policy on all products',
                                color: 'from-blue-500 to-cyan-500'
                            },
                            {
                                icon: <Award className="w-10 h-10" />,
                                title: 'Certified Products',
                                description: 'All items verified for authenticity',
                                color: 'from-purple-500 to-pink-500'
                            },
                            {
                                icon: <Users className="w-10 h-10" />,
                                title: 'Expert Support',
                                description: 'Dedicated team available 24/7',
                                color: 'from-orange-500 to-red-500'
                            }
                        ].map((badge, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1, duration: 0.5 }}
                                className="text-center"
                            >
                                <div className={`inline-flex p-5 rounded-2xl bg-gradient-to-br ${badge.color} text-white mb-4 shadow-lg`}>
                                    {badge.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-base-content">{badge.title}</h3>
                                <p className="text-base-content/70">{badge.description}</p>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        {...fadeInUp}
                        className="mt-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 border-2 border-primary/20"
                    >
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-center md:text-left">
                                <h3 className="text-2xl font-bold text-base-content mb-2">
                                    Still Have Questions?
                                </h3>
                                <p className="text-base-content/70">
                                    Our customer support team is here to help you
                                </p>
                            </div>
                            <Link
                                href="/contact"
                                className="btn-primary whitespace-nowrap px-8"
                            >
                                Contact Support
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Section 9: Brand Partners / Social Proof */}
            <section className="section-padding bg-base-100">
                <div className="container-custom">
                    <motion.div {...fadeInUp} className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-base-content">As Featured In</h2>
                        <p className="text-base-content/70 text-lg max-w-2xl mx-auto">
                            Recognized by leading publications and trusted by industry experts
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
                        {[
                            { name: 'TechCrunch', rating: '4.9/5' },
                            { name: 'Forbes', rating: 'Featured' },
                            { name: 'Wired', rating: 'Top Pick' },
                            { name: 'The Verge', rating: 'Editor\'s Choice' }
                        ].map((brand, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1, duration: 0.5 }}
                                className="card bg-base-200 hover:bg-base-300 transition-colors text-center"
                            >
                                <div className="text-2xl font-bold text-base-content mb-2">{brand.name}</div>
                                <div className="text-primary font-semibold">{brand.rating}</div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        {...fadeInUp}
                        className="grid md:grid-cols-3 gap-6"
                    >
                        {[
                            {
                                stat: '98%',
                                label: 'Customer Satisfaction',
                                icon: <Star className="w-6 h-6" />
                            },
                            {
                                stat: '50K+',
                                label: 'Orders Delivered',
                                icon: <ShoppingBag className="w-6 h-6" />
                            },
                            {
                                stat: '4.8★',
                                label: 'Average Rating',
                                icon: <Award className="w-6 h-6" />
                            }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.15, duration: 0.5 }}
                                className="card bg-gradient-to-br from-primary/5 to-secondary/5 text-center"
                            >
                                <div className="inline-flex p-3 bg-gradient-to-br from-primary to-secondary rounded-xl text-primary-content mb-4 mx-auto">
                                    {item.icon}
                                </div>
                                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                                    {item.stat}
                                </div>
                                <div className="text-base-content/70 font-medium">{item.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>
        </div>
    )
}
