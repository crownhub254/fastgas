'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react'

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1500))

        toast.success('Message sent successfully! We\'ll get back to you soon. 📧')
        setFormData({ name: '', email: '', subject: '', message: '' })
        setIsSubmitting(false)
    }

    const contactInfo = [
        {
            icon: Mail,
            title: 'Email Us',
            details: 'support@FastGasHub.com',
            link: 'mailto:support@FastGasHub.com',
            color: 'from-primary to-secondary'
        },
        {
            icon: Phone,
            title: 'Call Us',
            details: '+1 (555) 123-4567',
            link: 'tel:+15551234567',
            color: 'from-secondary to-accent'
        },
        {
            icon: MapPin,
            title: 'Visit Us',
            details: '123 Main St, City, Country',
            link: '#',
            color: 'from-accent to-primary'
        },
        {
            icon: Clock,
            title: 'Working Hours',
            details: 'Mon-Fri: 9AM - 6PM',
            link: '#',
            color: 'from-primary to-accent'
        },
    ]

    const faqs = [
        {
            question: 'How long does shipping take?',
            answer: 'Standard shipping takes 3-5 business days. Express shipping is available for 1-2 day delivery.'
        },
        {
            question: 'What is your return policy?',
            answer: 'We offer a 30-day return policy for all products. Items must be unused and in original packaging.'
        },
        {
            question: 'Do you ship internationally?',
            answer: 'Yes! We ship to over 50 countries worldwide. Shipping costs and times vary by location.'
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
                            💬 Get in Touch
                        </span>

                        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-base-content">
                            We&apos;d Love to{' '}
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-secondary to-accent">
                                Hear From You
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-base-content/70 leading-relaxed">
                            Have a question or feedback? Our team is here to help you 24/7.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Contact Info Cards */}
            <section className="section-padding bg-base-200">
                <div className="container-custom">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {contactInfo.map((info, idx) => (
                            <motion.a
                                key={idx}
                                href={info.link}
                                {...fadeInUp}
                                transition={{ delay: idx * 0.1 }}
                                className="card bg-base-100 group hover:shadow-xl transition-all text-center"
                            >
                                <div className={`w-14 h-14 rounded-xl bg-linear-to-br ${info.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                                    <info.icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-base-content mb-2">
                                    {info.title}
                                </h3>
                                <p className="text-base-content/70">{info.details}</p>
                            </motion.a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form & Map */}
            <section className="section-padding bg-base-100">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <motion.div {...fadeInUp}>
                            <div className="card bg-base-200">
                                <div className="mb-6">
                                    <h2 className="text-3xl font-bold text-base-content mb-2">
                                        Send Us a Message
                                    </h2>
                                    <p className="text-base-content/70">
                                        Fill out the form below and we&apos;ll get back to you within 24 hours.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Name */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-semibold text-base-content mb-2">
                                            Your Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-lg bg-base-100 border-2 border-base-300 focus:border-primary outline-none transition-all text-base-content"
                                            placeholder="John Doe"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-semibold text-base-content mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-lg bg-base-100 border-2 border-base-300 focus:border-primary outline-none transition-all text-base-content"
                                            placeholder="john@example.com"
                                        />
                                    </div>

                                    {/* Subject */}
                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-semibold text-base-content mb-2">
                                            Subject
                                        </label>
                                        <select
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-lg bg-base-100 border-2 border-base-300 focus:border-primary outline-none transition-all text-base-content"
                                        >
                                            <option value="">Select a subject</option>
                                            <option value="general">General Inquiry</option>
                                            <option value="support">Customer Support</option>
                                            <option value="order">Order Status</option>
                                            <option value="product">Product Question</option>
                                            <option value="feedback">Feedback</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label htmlFor="message" className="block text-sm font-semibold text-base-content mb-2">
                                            Message
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows="5"
                                            className="w-full px-4 py-3 rounded-lg bg-base-100 border-2 border-base-300 focus:border-primary outline-none transition-all resize-none text-base-content"
                                            placeholder="Tell us how we can help..."
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="btn-primary w-full flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="loading loading-spinner loading-sm"></span>
                                                <span>Sending...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                <span>Send Message</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </motion.div>

                        {/* FAQs & Additional Info */}
                        <motion.div
                            {...fadeInUp}
                            transition={{ delay: 0.2 }}
                            className="space-y-6"
                        >
                            {/* Quick FAQs */}
                            <div className="card bg-base-200">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-primary to-secondary flex items-center justify-center">
                                        <MessageSquare className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-base-content">
                                        Quick FAQs
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    {faqs.map((faq, idx) => (
                                        <div key={idx} className="bg-base-100 rounded-lg p-4">
                                            <h4 className="font-semibold text-base-content mb-2">
                                                {faq.question}
                                            </h4>
                                            <p className="text-base-content/70 text-sm">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <a
                                    href="/help"
                                    className="btn-secondary w-full mt-4"
                                >
                                    View All FAQs
                                </a>
                            </div>

                            {/* Office Hours */}
                            <div className="card bg-linear-to-br from-primary/10 to-secondary/10 border-2 border-primary/20">
                                <h3 className="text-xl font-bold text-base-content mb-4">
                                    📅 Office Hours
                                </h3>
                                <div className="space-y-2 text-base-content/70">
                                    <div className="flex justify-between">
                                        <span>Monday - Friday:</span>
                                        <span className="font-semibold">9:00 AM - 6:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Saturday:</span>
                                        <span className="font-semibold">10:00 AM - 4:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Sunday:</span>
                                        <span className="font-semibold">Closed</span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-primary/20">
                                    <p className="text-sm text-base-content/60">
                                        💡 Email support is available 24/7. We typically respond within 2-4 hours.
                                    </p>
                                </div>
                            </div>

                            {/* Emergency Contact */}
                            <div className="card bg-error/10 border-2 border-error/20">
                                <h3 className="text-xl font-bold text-error mb-2">
                                    🚨 Emergency Support
                                </h3>
                                <p className="text-base-content/70 text-sm mb-3">
                                    For urgent order issues or account problems:
                                </p>
                                <a
                                    href="tel:+15551234567"
                                    className="text-error font-bold text-lg"
                                >
                                    +1 (555) 123-4567
                                </a>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Location Map Placeholder */}
            <section className="section-padding bg-base-200">
                <div className="container-custom">
                    <motion.div {...fadeInUp} className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-base-content mb-4">
                            Visit Our Office
                        </h2>
                        <p className="text-base-content/70 text-lg">
                            Come say hello! We&apos;d love to meet you in person.
                        </p>
                    </motion.div>

                    <motion.div
                        {...fadeInUp}
                        transition={{ delay: 0.2 }}
                        className="card bg-linear-to-br from-primary/20 via-secondary/20 to-accent/20 h-96 flex items-center justify-center"
                    >
                        <div className="text-center">
                            <div className="text-7xl mb-4">📍</div>
                            <p className="text-2xl font-bold text-base-content">123 Main Street</p>
                            <p className="text-lg text-base-content/70">City, Country</p>
                            <p className="text-sm text-base-content/60 mt-4">Map integration available</p>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}
