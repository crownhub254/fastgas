'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Database, UserCheck, AlertCircle } from 'lucide-react'

export default function PrivacyPolicyPage() {
    const sections = [
        {
            icon: Database,
            title: 'Information We Collect',
            content: `We collect information you provide directly to us, including:

      • Personal information (name, email, phone number, shipping address)
      • Payment information (processed securely through encrypted payment gateways)
      • Account credentials (username and encrypted password)
      • Order history and preferences
      • Communications with customer support
      • Device and browser information when you use our website`
        },
        {
            icon: Eye,
            title: 'How We Use Your Information',
            content: `We use the information we collect to:

      • Process and fulfill your orders
      • Communicate with you about orders, products, and services
      • Improve our website and customer experience
      • Send marketing communications (with your consent)
      • Detect and prevent fraud
      • Comply with legal obligations
      • Analyze website usage and trends`
        },
        {
            icon: Lock,
            title: 'Information Security',
            content: `We implement industry-standard security measures to protect your data:

      • SSL/TLS encryption for data transmission
      • Secure payment processing through certified providers
      • Regular security audits and updates
      • Limited employee access to personal data
      • Secure data storage with backup systems
      • Multi-factor authentication options

      However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.`
        },
        {
            icon: UserCheck,
            title: 'Your Rights',
            content: `You have the right to:

      • Access your personal information
      • Update or correct your data
      • Delete your account and data
      • Opt-out of marketing communications
      • Request a copy of your data
      • Withdraw consent for data processing
      • File a complaint with data protection authorities

      To exercise these rights, please contact us at privacy@FastGasHub.com`
        },
        {
            icon: Shield,
            title: 'Data Sharing',
            content: `We may share your information with:

      • Service providers (shipping, payment processing, email services)
      • Marketing partners (with your consent)
      • Legal authorities (when required by law)
      • Business partners for specific transactions

      We do not sell your personal information to third parties. All service providers are bound by confidentiality agreements.`
        },
        {
            icon: AlertCircle,
            title: 'Cookies and Tracking',
            content: `We use cookies and similar technologies to:

      • Remember your preferences and settings
      • Analyze website traffic and usage
      • Provide personalized content and ads
      • Improve website functionality

      You can manage cookie preferences through your browser settings. Note that disabling cookies may affect website functionality.`
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
            {/* Hero */}
            <section className="relative section-padding bg-linear-to-br from-primary/5 via-secondary/5 to-accent/5 overflow-hidden">
                <div className="absolute top-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>

                <div className="container-custom relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6">
                            🔒 Privacy Policy
                        </span>

                        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-base-content">
                            Your Privacy{' '}
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-secondary to-accent">
                                Matters
                            </span>
                        </h1>

                        <p className="text-xl text-base-content/70 mb-4">
                            We are committed to protecting your personal information and your right to privacy.
                        </p>
                        <p className="text-sm text-base-content/60">
                            Last Updated: January 14, 2026
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Introduction */}
            <section className="section-padding bg-base-200">
                <div className="container-custom max-w-4xl">
                    <motion.div {...fadeInUp} className="card bg-base-100">
                        <h2 className="text-3xl font-bold text-base-content mb-4">Introduction</h2>
                        <p className="text-base-content/70 leading-relaxed mb-4">
                            Welcome to FastGasHub. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase from us. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
                        </p>
                        <p className="text-base-content/70 leading-relaxed">
                            We reserve the right to make changes to this Privacy Policy at any time. We will alert you about any changes by updating the &quot;Last Updated&ldquo; date. You are encouraged to periodically review this Privacy Policy to stay informed of updates.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Policy Sections */}
            <section className="section-padding bg-base-100">
                <div className="container-custom max-w-4xl">
                    <div className="space-y-8">
                        {sections.map((section, idx) => (
                            <motion.div
                                key={idx}
                                {...fadeInUp}
                                transition={{ delay: idx * 0.1 }}
                                className="card bg-base-200"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-linear-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                                        <section.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-base-content mb-4">
                                            {section.title}
                                        </h3>
                                        <div className="text-base-content/70 leading-relaxed whitespace-pre-line">
                                            {section.content}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Children's Privacy */}
            <section className="section-padding bg-base-200">
                <div className="container-custom max-w-4xl">
                    <motion.div {...fadeInUp} className="card bg-base-100 border-2 border-warning/20">
                        <div className="flex items-start gap-4">
                            <div className="text-5xl">👶</div>
                            <div>
                                <h2 className="text-3xl font-bold text-base-content mb-4">Children&apos;s Privacy</h2>
                                <p className="text-base-content/70 leading-relaxed mb-4">
                                    Our services are not intended for individuals under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us immediately.
                                </p>
                                <p className="text-base-content/70 leading-relaxed">
                                    Upon verification, we will delete such information from our systems as quickly as possible.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Contact Information */}
            <section className="section-padding bg-base-100">
                <div className="container-custom max-w-4xl">
                    <motion.div {...fadeInUp} className="card bg-linear-to-br from-primary/10 to-secondary/10 border-2 border-primary/20">
                        <h2 className="text-3xl font-bold text-base-content mb-4">Contact Us</h2>
                        <p className="text-base-content/70 mb-6 leading-relaxed">
                            If you have questions or comments about this Privacy Policy, please contact us at:
                        </p>
                        <div className="space-y-3 text-base-content/70">
                            <div className="flex items-center gap-3">
                                <span className="font-semibold">Email:</span>
                                <a href="mailto:privacy@FastGasHub.com" className="text-primary hover:text-primary/80">
                                    privacy@FastGasHub.com
                                </a>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-semibold">Phone:</span>
                                <a href="tel:+15551234567" className="text-primary hover:text-primary/80">
                                    +1 (555) 123-4567
                                </a>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="font-semibold">Mail:</span>
                                <span>123 Main Street, City, Country</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="section-padding bg-linear-to-r from-primary via-secondary to-accent text-primary-content">
                <div className="container-custom text-center">
                    <motion.div {...fadeInUp}>
                        <div className="text-5xl mb-4">🔐</div>
                        <h2 className="text-4xl font-bold mb-4">Your Privacy is Our Priority</h2>
                        <p className="text-xl mb-8 text-primary-content/90 max-w-2xl mx-auto">
                            We&apos;re committed to transparency and protecting your personal information.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="/contact" className="btn bg-white text-primary hover:bg-base-100 border-0">
                                Contact Us
                            </a>
                            <a href="/terms" className="btn bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary">
                                Terms of Service
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}
