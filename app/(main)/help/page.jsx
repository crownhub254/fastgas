'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Package, CreditCard, Truck, RotateCcw, HelpCircle, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export default function HelpCenterPage() {
    const [searchQuery, setSearchQuery] = useState('')

    const categories = [
        {
            icon: Package,
            title: 'Orders & Tracking',
            description: 'Track your order, modify delivery details',
            color: 'from-primary to-secondary',
            articles: 5
        },
        {
            icon: CreditCard,
            title: 'Payment & Billing',
            description: 'Payment methods, invoices, refunds',
            color: 'from-secondary to-accent',
            articles: 4
        },
        {
            icon: Truck,
            title: 'Shipping & Delivery',
            description: 'Shipping costs, delivery times, locations',
            color: 'from-accent to-primary',
            articles: 6
        },
        {
            icon: RotateCcw,
            title: 'Returns & Exchanges',
            description: 'Return policy, exchange process',
            color: 'from-primary to-accent',
            articles: 4
        },
    ]

    const faqs = [
        {
            category: 'Orders',
            question: 'How do I track my order?',
            answer: 'You can track your order by logging into your account and visiting the "Orders" section. You\'ll receive a tracking number via email once your order ships.'
        },
        {
            category: 'Shipping',
            question: 'What are the shipping costs?',
            answer: 'Shipping costs vary based on your location and selected shipping method. Standard shipping is free for orders over $50. Express shipping is available for an additional fee.'
        },
        {
            category: 'Returns',
            question: 'What is your return policy?',
            answer: 'We offer a 30-day return policy for all products. Items must be unused, in original packaging, and accompanied by proof of purchase. Return shipping is free for defective items.'
        },
        {
            category: 'Payment',
            question: 'What payment methods do you accept?',
            answer: 'We accept all major credit cards (Visa, Mastercard, Amex), PayPal, Apple Pay, and Google Pay. All transactions are secured with industry-standard encryption.'
        },
        {
            category: 'Shipping',
            question: 'Do you ship internationally?',
            answer: 'Yes! We ship to over 50 countries worldwide. International shipping times and costs vary by destination. Customs duties and taxes may apply.'
        },
        {
            category: 'Orders',
            question: 'Can I modify or cancel my order?',
            answer: 'You can modify or cancel your order within 1 hour of placement. After that, orders are processed and cannot be changed. Contact support for assistance.'
        },
        {
            category: 'Account',
            question: 'How do I reset my password?',
            answer: 'Click "Forgot Password" on the login page. Enter your email address and we\'ll send you a password reset link. Follow the instructions in the email to create a new password.'
        },
        {
            category: 'Products',
            question: 'Are products covered by warranty?',
            answer: 'Most products come with manufacturer warranties ranging from 1-3 years. Warranty details are listed on individual product pages. We also offer extended warranty options.'
        },
    ]

    const filteredFaqs = searchQuery
        ? faqs.filter(
            faq =>
                faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : faqs

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
                            ❓ Help Center
                        </span>

                        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-base-content">
                            How Can We{' '}
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-secondary to-accent">
                                Help You?
                            </span>
                        </h1>

                        <p className="text-xl text-base-content/70 mb-8">
                            Find answers to common questions or get in touch with our support team.
                        </p>

                        {/* Search Bar */}
                        <div className="relative max-w-2xl mx-auto">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="w-6 h-6 text-base-content/40" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for help articles..."
                                className="w-full pl-14 pr-4 py-4 rounded-xl bg-base-100 border-2 border-base-300 focus:border-primary outline-none transition-all text-base-content text-lg shadow-lg"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Categories */}
            <section className="section-padding bg-base-200">
                <div className="container-custom">
                    <motion.div {...fadeInUp} className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-base-content mb-4">
                            Browse by Category
                        </h2>
                        <p className="text-base-content/70">
                            Choose a category to find the help you need
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categories.map((category, idx) => (
                            <motion.div
                                key={idx}
                                {...fadeInUp}
                                transition={{ delay: idx * 0.1 }}
                                className="card bg-base-100 group hover:shadow-xl transition-all cursor-pointer"
                            >
                                <div className={`w-14 h-14 rounded-xl bg-linear-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <category.icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-base-content mb-2">
                                    {category.title}
                                </h3>
                                <p className="text-base-content/70 text-sm mb-4">
                                    {category.description}
                                </p>
                                <div className="text-primary text-sm font-semibold">
                                    {category.articles} articles →
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQs */}
            <section className="section-padding bg-base-100">
                <div className="container-custom max-w-4xl">
                    <motion.div {...fadeInUp} className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-base-content mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-base-content/70">
                            Quick answers to common questions
                        </p>
                    </motion.div>

                    <div className="space-y-4">
                        {filteredFaqs.map((faq, idx) => (
                            <motion.details
                                key={idx}
                                {...fadeInUp}
                                transition={{ delay: idx * 0.05 }}
                                className="card bg-base-200 group cursor-pointer"
                            >
                                <summary className="font-semibold text-lg text-base-content list-none flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                                            {faq.category}
                                        </span>
                                        <span>{faq.question}</span>
                                    </div>
                                    <HelpCircle className="w-5 h-5 text-primary group-open:rotate-180 transition-transform" />
                                </summary>
                                <div className="mt-4 pt-4 border-t border-base-content/10">
                                    <p className="text-base-content/70 leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            </motion.details>
                        ))}
                    </div>

                    {filteredFaqs.length === 0 && (
                        <motion.div {...fadeInUp} className="text-center py-12">
                            <div className="text-6xl mb-4">🔍</div>
                            <p className="text-xl text-base-content/70">
                                No results found for &quot;{searchQuery}&ldquo;
                            </p>
                            <button
                                onClick={() => setSearchQuery('')}
                                className="btn-secondary mt-4"
                            >
                                Clear Search
                            </button>
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Contact Support */}
            <section className="section-padding bg-base-200">
                <div className="container-custom">
                    <motion.div
                        {...fadeInUp}
                        className="card bg-linear-to-br from-primary via-secondary to-accent text-primary-content text-center max-w-3xl mx-auto"
                    >
                        <div className="text-5xl mb-4">💬</div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Still Need Help?
                        </h2>
                        <p className="text-xl mb-8 text-primary-content/90">
                            Our support team is here to assist you with any questions or concerns.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/contact"
                                className="btn bg-white text-primary hover:bg-base-100 border-0"
                            >
                                <MessageCircle className="w-5 h-5 mr-2" />
                                Contact Support
                            </Link>
                            <a
                                href="mailto:support@FastGasHub.com"
                                className="btn bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary"
                            >
                                Email Us
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Popular Articles */}
            <section className="section-padding bg-base-100">
                <div className="container-custom">
                    <motion.div {...fadeInUp} className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-base-content mb-4">
                            Popular Articles
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {[
                            { title: 'How to track your order', views: '1.2K', icon: '📦' },
                            { title: 'Shipping & delivery info', views: '980', icon: '🚚' },
                            { title: 'Return & exchange policy', views: '856', icon: '↩️' },
                        ].map((article, idx) => (
                            <motion.div
                                key={idx}
                                {...fadeInUp}
                                transition={{ delay: idx * 0.1 }}
                                className="card bg-base-200 hover:shadow-xl transition-all group cursor-pointer"
                            >
                                <div className="text-4xl mb-3">{article.icon}</div>
                                <h3 className="text-lg font-bold text-base-content mb-2 group-hover:text-primary transition-colors">
                                    {article.title}
                                </h3>
                                <p className="text-base-content/60 text-sm">
                                    {article.views} views
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
