'use client'

import { motion } from 'framer-motion'
import {
    Target, Users, Award, Heart, TrendingUp, Shield,
    Clock, Globe, Star, CheckCircle, Zap, Package,
    Truck, CreditCard, Headphones, MapPin, Calendar,
    ThumbsUp, Gift, Lock
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function AboutPage() {
    const stats = [
        { icon: Users, number: '10K+', label: 'Happy Customers', color: 'from-blue-500 to-blue-600' },
        { icon: Package, number: '500+', label: 'Products', color: 'from-green-500 to-green-600' },
        { icon: Globe, number: '50+', label: 'Countries', color: 'from-purple-500 to-purple-600' },
        { icon: Star, number: '4.9', label: 'Average Rating', color: 'from-orange-500 to-orange-600' },
        { icon: Truck, number: '24/7', label: 'Fast Delivery', color: 'from-pink-500 to-pink-600' },
        { icon: Award, number: '15+', label: 'Awards Won', color: 'from-indigo-500 to-indigo-600' },
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

    const features = [
        {
            icon: Truck,
            title: 'Fast Shipping',
            description: 'Get your orders delivered quickly with our express shipping options.'
        },
        {
            icon: CreditCard,
            title: 'Secure Payment',
            description: 'Shop with confidence using our secure payment gateway.'
        },
        {
            icon: Headphones,
            title: '24/7 Support',
            description: 'Our dedicated support team is always here to help you.'
        },
        {
            icon: Gift,
            title: 'Special Offers',
            description: 'Enjoy exclusive deals and discounts for our valued customers.'
        },
        {
            icon: Lock,
            title: 'Data Protection',
            description: 'Your personal information is safe with our advanced security.'
        },
        {
            icon: ThumbsUp,
            title: 'Quality Guarantee',
            description: 'We stand behind every product we sell with our quality guarantee.'
        },
    ]

    const team = [
        {
            name: 'Sarah Johnson',
            role: 'CEO & Founder',
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
            bio: 'Leading FastGasHub with 15+ years of e-commerce experience.'
        },
        {
            name: 'Michael Chen',
            role: 'CTO',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
            bio: 'Tech visionary ensuring seamless shopping experience.'
        },
        {
            name: 'Emily Davis',
            role: 'Head of Design',
            image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
            bio: 'Creating beautiful and intuitive user experiences.'
        },
        {
            name: 'David Wilson',
            role: 'Operations Manager',
            image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
            bio: 'Ensuring smooth operations and timely deliveries.'
        },
        {
            name: 'Jessica Martinez',
            role: 'Marketing Director',
            image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
            bio: 'Connecting customers with products they love.'
        },
        {
            name: 'Robert Taylor',
            role: 'Customer Success Lead',
            image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
            bio: 'Dedicated to making every customer experience exceptional.'
        },
    ]

    const milestones = [
        {
            year: '2020',
            title: 'Founded',
            description: 'FastGasHub was born with a vision to revolutionize online shopping.',
            icon: Calendar
        },
        {
            year: '2021',
            title: 'Expansion',
            description: 'Reached 25 countries and 100+ products in our catalog.',
            icon: Globe
        },
        {
            year: '2022',
            title: 'Recognition',
            description: 'Won "Best E-commerce Platform" award.',
            icon: Award
        },
        {
            year: '2023',
            title: 'Growth',
            description: 'Surpassed 5,000 happy customers and 300+ products.',
            icon: TrendingUp
        },
        {
            year: '2024',
            title: 'Innovation',
            description: 'Launched AI-powered product recommendations.',
            icon: Zap
        },
        {
            year: '2025',
            title: 'Excellence',
            description: '10K+ customers, 50+ countries, 500+ premium products.',
            icon: Star
        },
    ]

    const testimonials = [
        {
            name: 'John Smith',
            role: 'Verified Buyer',
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
            text: 'FastGasHub has the best customer service I\'ve ever experienced. Fast shipping and quality products!',
            rating: 5
        },
        {
            name: 'Emma Wilson',
            role: 'Regular Customer',
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
            text: 'I love the variety of products and the seamless shopping experience. Highly recommended!',
            rating: 5
        },
        {
            name: 'Mike Johnson',
            role: 'Premium Member',
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
            text: 'The quality of products exceeds my expectations every time. Worth every penny!',
            rating: 5
        },
    ]

    const partners = [
        { name: 'TechCorp', logo: '🏢' },
        { name: 'GlobalShip', logo: '🚚' },
        { name: 'PaySecure', logo: '💳' },
        { name: 'EcoPackage', logo: '♻️' },
        { name: 'QuickDeliver', logo: '⚡' },
        { name: 'SafeStore', logo: '🔒' },
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
            {/* Section 1: Hero Section */}
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
                                FastGasHub
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-base-content/70 leading-relaxed mb-8">
                            Your trusted destination for premium products and exceptional shopping experiences since 2020.
                        </p>

                        <div className="flex flex-wrap justify-center gap-4">
                            <Link href="/products" className="btn btn-primary btn-lg gap-2">
                                <Package className="w-5 h-5" />
                                Shop Now
                            </Link>
                            <Link href="/contact" className="btn btn-outline btn-lg gap-2">
                                <Headphones className="w-5 h-5" />
                                Contact Us
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Section 2: Stats Section */}
            <section className="section-padding bg-base-200">
                <div className="container-custom">
                    <motion.div {...fadeInUp} className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4 text-base-content">Our Impact in Numbers</h2>
                        <p className="text-base-content/70 text-lg">Growing together with our community</p>
                    </motion.div>
                    <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {stats.map((stat, idx) => {
                            const Icon = stat.icon
                            return (
                                <motion.div
                                    key={idx}
                                    {...fadeInUp}
                                    transition={{ delay: idx * 0.1 }}
                                    className="card bg-base-100 text-center hover:shadow-xl transition-all group"
                                >
                                    <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${stat.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                                    <div className="text-base-content/70 font-medium">{stat.label}</div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Section 3: Story Section */}
            <section className="section-padding bg-base-100">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div {...fadeInUp}>
                            <span className="badge badge-primary badge-lg mb-4">Our Journey</span>
                            <h2 className="text-4xl font-bold text-base-content mb-6">
                                The FastGasHub Story
                            </h2>
                            <div className="space-y-4 text-base-content/70 text-lg leading-relaxed">
                                <p>
                                    FastGasHub was founded in 2020 with a simple mission: to make premium products accessible to everyone. What started as a small online store has grown into a trusted marketplace serving customers worldwide.
                                </p>
                                <p>
                                    We believe that shopping should be more than just a transaction. It should be an experience that brings joy, convenience, and value to your life. That&apos;s why we carefully curate every product in our catalog and work tirelessly to ensure your satisfaction.
                                </p>
                                <p>
                                    Today, we&apos;re proud to serve over 10,000 happy customers across 50+ countries, offering 500+ premium products and maintaining a 4.9-star average rating. But we&apos;re just getting started.
                                </p>
                                <div className="flex gap-4 pt-4">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-success" />
                                        <span className="font-semibold">Quality Assured</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-success" />
                                        <span className="font-semibold">Customer First</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            {...fadeInUp}
                            transition={{ delay: 0.2 }}
                            className="relative"
                        >
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[500px]">
                                <Image
                                    src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop"
                                    alt="Our Store"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-6 -right-6 card bg-base-100 p-6 shadow-2xl max-w-xs border-2 border-primary/20">
                                <p className="text-sm text-base-content/70 italic mb-2">
                                    &ldquo;Quality products, exceptional service, delivered with care.&rdquo;
                                </p>
                                <p className="text-xs text-primary font-semibold">- Our Promise</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Section 4: Values Section */}
            <section className="section-padding bg-base-200">
                <div className="container-custom">
                    <motion.div {...fadeInUp} className="text-center mb-16">
                        <span className="badge badge-primary badge-lg mb-4">What We Stand For</span>
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
                                className="card bg-base-100 group hover:shadow-2xl hover:scale-105 transition-all"
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

            {/* Section 5: Features Section */}
            <section className="section-padding bg-base-100">
                <div className="container-custom">
                    <motion.div {...fadeInUp} className="text-center mb-16">
                        <span className="badge badge-secondary badge-lg mb-4">Why Choose Us</span>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-base-content">
                            What Makes Us Different
                        </h2>
                        <p className="text-base-content/70 text-lg max-w-2xl mx-auto">
                            Experience the FastGasHub advantage with our premium features
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                {...fadeInUp}
                                transition={{ delay: idx * 0.1 }}
                                className="flex gap-4 p-6 bg-base-200 rounded-2xl hover:bg-base-300 transition-all group"
                            >
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 rounded-xl bg-linear-to-br from-accent/20 to-warning/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <feature.icon className="w-6 h-6 text-accent" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-base-content mb-2">{feature.title}</h3>
                                    <p className="text-base-content/70 text-sm">{feature.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 6: Timeline/Milestones */}
            <section className="section-padding bg-base-200">
                <div className="container-custom">
                    <motion.div {...fadeInUp} className="text-center mb-16">
                        <span className="badge badge-accent badge-lg mb-4">Our Journey</span>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-base-content">
                            Key Milestones
                        </h2>
                        <p className="text-base-content/70 text-lg max-w-2xl mx-auto">
                            A timeline of our growth and achievements
                        </p>
                    </motion.div>

                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-linear-to-b from-primary via-secondary to-accent hidden lg:block"></div>

                        <div className="space-y-12">
                            {milestones.map((milestone, idx) => {
                                const Icon = milestone.icon
                                const isEven = idx % 2 === 0
                                return (
                                    <motion.div
                                        key={idx}
                                        {...fadeInUp}
                                        transition={{ delay: idx * 0.1 }}
                                        className={`flex items-center gap-8 ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
                                    >
                                        <div className={`flex-1 ${isEven ? 'lg:text-right' : 'lg:text-left'}`}>
                                            <div className="card bg-base-100 hover:shadow-xl transition-all inline-block w-full lg:w-auto">
                                                <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold mb-3">
                                                    {milestone.year}
                                                </div>
                                                <h3 className="text-2xl font-bold text-base-content mb-2">{milestone.title}</h3>
                                                <p className="text-base-content/70">{milestone.description}</p>
                                            </div>
                                        </div>

                                        {/* Timeline Icon */}
                                        <div className="flex-shrink-0 hidden lg:block">
                                            <div className="w-16 h-16 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                                                <Icon className="w-8 h-8 text-white" />
                                            </div>
                                        </div>

                                        <div className="flex-1"></div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 7: Team Section */}
            <section className="section-padding bg-base-100">
                <div className="container-custom">
                    <motion.div {...fadeInUp} className="text-center mb-16">
                        <span className="badge badge-primary badge-lg mb-4">Meet the Team</span>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-base-content">
                            The Minds Behind FastGasHub
                        </h2>
                        <p className="text-base-content/70 text-lg max-w-2xl mx-auto">
                            Passionate people dedicated to your shopping experience
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {team.map((member, idx) => (
                            <motion.div
                                key={idx}
                                {...fadeInUp}
                                transition={{ delay: idx * 0.1 }}
                                className="group"
                            >
                                <div className="card bg-base-200 hover:shadow-2xl transition-all overflow-hidden">
                                    <div className="relative w-full aspect-square group-hover:scale-105 transition-transform duration-300">
                                        <Image
                                            src={member.image}
                                            alt={member.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-base-content mb-1">
                                            {member.name}
                                        </h3>
                                        <p className="text-primary font-semibold mb-3">{member.role}</p>
                                        <p className="text-base-content/70 text-sm">{member.bio}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 8: Testimonials */}
            <section className="section-padding bg-base-200">
                <div className="container-custom">
                    <motion.div {...fadeInUp} className="text-center mb-16">
                        <span className="badge badge-secondary badge-lg mb-4">Customer Love</span>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-base-content">
                            What Our Customers Say
                        </h2>
                        <p className="text-base-content/70 text-lg max-w-2xl mx-auto">
                            Real experiences from real people
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, idx) => (
                            <motion.div
                                key={idx}
                                {...fadeInUp}
                                transition={{ delay: idx * 0.1 }}
                                className="card bg-base-100 hover:shadow-xl transition-all"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="avatar">
                                        <div className="w-16 h-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                            <Image src={testimonial.image} alt={testimonial.name} width={64} height={64} />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-base-content">{testimonial.name}</h4>
                                        <p className="text-sm text-base-content/60">{testimonial.role}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-warning text-warning" />
                                    ))}
                                </div>
                                <p className="text-base-content/70 italic">&ldquo;{testimonial.text}&rdquo;</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 9: Partners Section */}
            <section className="section-padding bg-base-100">
                <div className="container-custom">
                    <motion.div {...fadeInUp} className="text-center mb-16">
                        <span className="badge badge-accent badge-lg mb-4">Trusted By</span>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-base-content">
                            Our Trusted Partners
                        </h2>
                        <p className="text-base-content/70 text-lg max-w-2xl mx-auto">
                            Working with industry leaders to serve you better
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                        {partners.map((partner, idx) => (
                            <motion.div
                                key={idx}
                                {...fadeInUp}
                                transition={{ delay: idx * 0.1 }}
                                className="card bg-base-200 hover:bg-base-300 transition-all flex items-center justify-center text-center group cursor-pointer"
                            >
                                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">{partner.logo}</div>
                                <p className="font-semibold text-base-content/70">{partner.name}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 10: Mission & Vision */}
            <section className="section-padding bg-base-200">
                <div className="container-custom">
                    <div className="grid md:grid-cols-2 gap-12">
                        <motion.div {...fadeInUp} className="card bg-linear-to-br from-primary/10 to-secondary/10 border-2 border-primary/20">
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <Target className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-3xl font-bold text-base-content">Our Mission</h3>
                            </div>
                            <p className="text-base-content/80 text-lg leading-relaxed text-center">
                                To provide exceptional shopping experiences by offering premium products, outstanding customer service, and innovative solutions that exceed expectations.
                            </p>
                        </motion.div>

                        <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="card bg-linear-to-br from-accent/10 to-warning/10 border-2 border-accent/20">
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 rounded-full bg-linear-to-br from-accent to-warning flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <TrendingUp className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-3xl font-bold text-base-content">Our Vision</h3>
                            </div>
                            <p className="text-base-content/80 text-lg leading-relaxed text-center">
                                To become the world&apos;s most trusted and innovative e-commerce platform, setting new standards for quality, sustainability, and customer satisfaction.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

        </div>
    )
}
