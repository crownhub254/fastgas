'use client'

import { motion } from 'framer-motion'
import { Target, Users, Award, Heart, TrendingUp, Shield } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function AboutPage() {
    const stats = [
        { icon: '👥', number: '10K+', label: 'Happy Customers' },
        { icon: '📦', number: '500+', label: 'Products' },
        { icon: '🌍', number: '50+', label: 'Countries' },
        { icon: '⭐', number: '4.9', label: 'Average Rating' },
    ]

    const values = [
        {
            icon: Target,
            title: 'Quality First',
            description: 'We never compromise on quality. Every product is carefully selected and tested to meet our high standards.'
        },
        {
            icon: Users,
            title: 'Customer Focus',
            description: 'Our customers are at the heart of everything we do. We strive to provide exceptional service and support.'
        },
        {
            icon: Award,
            title: 'Innovation',
            description: 'We continuously seek innovative products and solutions to enhance your shopping experience.'
        },
        {
            icon: Heart,
            title: 'Sustainability',
            description: 'We are committed to sustainable practices and environmentally responsible sourcing.'
        },
        {
            icon: TrendingUp,
            title: 'Growth',
            description: 'We believe in continuous improvement and growing together with our customers and partners.'
        },
        {
            icon: Shield,
            title: 'Trust',
            description: 'We build lasting relationships based on transparency, integrity, and reliable service.'
        },
    ]

    const team = [
        {
            name: 'Sarah Johnson',
            role: 'CEO & Founder',
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'
        },
        {
            name: 'Michael Chen',
            role: 'CTO',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
        },
        {
            name: 'Emily Davis',
            role: 'Head of Design',
            image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop'
        },
        {
            name: 'David Wilson',
            role: 'Operations Manager',
            image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop'
        },
    ]

    const fadeInUp = {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    }

    return (
        <div className="min-h-screen bg-base-100">
            {/* Hero Section */}
            <section className="relative section-padding bg-linear-to-br from-primary/5 via-secondary/5 to-accent/5 overflow-hidden">
                <div className="absolute top-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>

                <div className="container-custom relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6">
                            🎯 About Us
                        </span>

                        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-base-content">
                            Welcome to{' '}
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-secondary to-accent">
                                ProductHub
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-base-content/70 leading-relaxed mb-8">
                            Your trusted destination for premium products and exceptional shopping experiences since 2020.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="section-padding bg-base-200">
                <div className="container-custom">
                    <div className="grid md:grid-cols-4 gap-8">
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={idx}
                                {...fadeInUp}
                                transition={{ delay: idx * 0.1 }}
                                className="card bg-base-100 text-center hover:shadow-xl transition-all"
                            >
                                <div className="text-5xl mb-3">{stat.icon}</div>
                                <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                                <div className="text-base-content/70">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="section-padding bg-base-100">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div {...fadeInUp}>
                            <h2 className="text-4xl font-bold text-base-content mb-6">
                                Our Story
                            </h2>
                            <div className="space-y-4 text-base-content/70 text-lg leading-relaxed">
                                <p>
                                    ProductHub was founded in 2020 with a simple mission: to make premium products accessible to everyone. What started as a small online store has grown into a trusted marketplace serving customers worldwide.
                                </p>
                                <p>
                                    We believe that shopping should be more than just a transaction. It should be an experience that brings joy, convenience, and value to your life. That&apos;s why we carefully curate every product in our catalog and work tirelessly to ensure your satisfaction.
                                </p>
                                <p>
                                    Today, w&apos;re proud to serve over 10,000 happy customers across 50+ countries, offering 500+ premium products and maintaining a 4.9-star average rating. But we&apos;re just getting started.
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            {...fadeInUp}
                            transition={{ delay: 0.2 }}
                            className="relative"
                        >
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl h-100">
                                <Image
                                    src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop"
                                    alt="Our Store"
                                    fill
                                    className="object-cover rounded-xl"
                                />
                            </div>
                            <div className="absolute -bottom-6 -right-6 card bg-base-100 p-6 shadow-2xl max-w-xs">
                                <p className="text-sm text-base-content/70 italic">
                                    .&ldquo;Quality products, exceptional service, delivered with care.&quot;
                                </p>
                                <p className="text-xs text-primary font-semibold mt-2">- Our Promise</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="section-padding bg-base-200">
                <div className="container-custom">
                    <motion.div {...fadeInUp} className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-base-content">
                            Our Core Values
                        </h2>
                        <p className="text-base-content/70 text-lg max-w-2xl mx-auto">
                            The principles that guide everything we do
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {values.map((value, idx) => (
                            <motion.div
                                key={idx}
                                {...fadeInUp}
                                transition={{ delay: idx * 0.1 }}
                                className="card bg-base-100 group hover:shadow-xl transition-all"
                            >
                                <div className="w-14 h-14 rounded-xl bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <value.icon className="w-7 h-7 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-base-content mb-3">
                                    {value.title}
                                </h3>
                                <p className="text-base-content/70 leading-relaxed">
                                    {value.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="section-padding bg-base-100">
                <div className="container-custom">
                    <motion.div {...fadeInUp} className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-base-content">
                            Meet Our Team
                        </h2>
                        <p className="text-base-content/70 text-lg max-w-2xl mx-auto">
                            The passionate people behind ProductHub
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {team.map((member, idx) => (
                            <motion.div
                                key={idx}
                                {...fadeInUp}
                                transition={{ delay: idx * 0.1 }}
                                className="text-center group"
                            >
                                <div className="card bg-base-200 hover:shadow-xl transition-all mb-4 overflow-hidden">
                                    <div className="relative w-full aspect-square group-hover:scale-105 transition-transform duration-300">
                                        <Image
                                            src={member.image}
                                            alt={member.name}
                                            fill
                                            className="object-cover rounded-xl"
                                        />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-base-content mb-1">
                                    {member.name}
                                </h3>
                                <p className="text-base-content/70">{member.role}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section-padding bg-linear-to-r from-primary via-secondary to-accent text-primary-content">
                <div className="container-custom text-center">
                    <motion.div {...fadeInUp}>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            Join Our Journey
                        </h2>
                        <p className="text-xl mb-8 text-primary-content/90 max-w-2xl mx-auto">
                            Be part of our growing community and experience the difference that quality and care can make.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/products" className="btn bg-white text-primary hover:bg-base-100 border-0">
                                Shop Now
                            </Link>
                            <Link href="/contact" className="btn bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary">
                                Contact Us
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}
