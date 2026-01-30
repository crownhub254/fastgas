'use client'

import { motion } from 'framer-motion'
import { FileText, AlertCircle, Scale, ShieldCheck, CreditCard, Ban } from 'lucide-react'
import Link from 'next/link'

export default function TermsOfServicePage() {
    const sections = [
        {
            icon: ShieldCheck,
            title: 'Acceptance of Terms',
            content: `By accessing and using FastGasHub, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.

      These terms apply to all visitors, users, and others who access or use the service. We reserve the right to update and change these Terms of Service without notice.`
        },
        {
            icon: FileText,
            title: 'Use License',
            content: `Permission is granted to temporarily access the materials on FastGasHub's website for personal, non-commercial use only. This is the grant of a license, not a transfer of title, and under this license you may not:

      • Modify or copy the materials
      • Use the materials for any commercial purpose
      • Attempt to decompile or reverse engineer any software
      • Remove any copyright or proprietary notations
      • Transfer the materials to another person

      This license shall automatically terminate if you violate any of these restrictions.`
        },
        {
            icon: CreditCard,
            title: 'Product Information & Pricing',
            content: `We strive to provide accurate product descriptions and pricing information. However:

      • We do not warrant that product descriptions are accurate, complete, or error-free
      • We reserve the right to correct any errors, inaccuracies, or omissions
      • We may change or update information without prior notice
      • Prices are subject to change without notice
      • All prices are in USD unless otherwise stated
      • We reserve the right to limit quantities purchased per customer

      If a product is listed at an incorrect price, we will contact you for instructions or cancel your order.`
        },
        {
            icon: Scale,
            title: 'User Accounts',
            content: `When you create an account with us, you must provide accurate, complete, and current information at all times. Failure to do so constitutes a breach of the Terms.

      You are responsible for:
      • Maintaining the confidentiality of your account and password
      • All activities that occur under your account
      • Notifying us immediately of any unauthorized use

      We reserve the right to refuse service, terminate accounts, or cancel orders at our discretion.`
        },
        {
            icon: AlertCircle,
            title: 'Intellectual Property',
            content: `The service and its original content, features, and functionality are owned by FastGasHub and are protected by international copyright, trademark, and other intellectual property laws.

      Our trademarks and trade dress may not be used without our prior written permission. All other trademarks not owned by us that appear on this site are the property of their respective owners.`
        },
        {
            icon: Ban,
            title: 'Prohibited Uses',
            content: `You may not use our site:

      • For any unlawful purpose or to solicit others to perform unlawful acts
      • To violate any international, federal, provincial, or state regulations
      • To infringe upon intellectual property rights
      • To harass, abuse, insult, or harm another person
      • To submit false or misleading information
      • To upload viruses or malicious code
      • To collect user data without consent
      • To engage in unauthorized framing or linking
      • To interfere with the security of the website

      Violation of any prohibited use may result in immediate termination of your account.`
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
                            📋 Terms of Service
                        </span>

                        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-base-content">
                            Terms of{' '}
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-secondary to-accent">
                                Service
                            </span>
                        </h1>

                        <p className="text-xl text-base-content/70 mb-4">
                            Please read these terms carefully before using our services.
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
                        <h2 className="text-3xl font-bold text-base-content mb-4">Agreement to Terms</h2>
                        <p className="text-base-content/70 leading-relaxed mb-4">
                            These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity (&quot;you&ldquo;) and FastGasHub (&quot;we&ldquo;, &quot;us&ldquo; or &quot;our&ldquo;), concerning your access to and use of the FastGasHub website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto.
                        </p>
                        <p className="text-base-content/70 leading-relaxed">
                            You agree that by accessing the Site, you have read, understood, and agree to be bound by all of these Terms of Service. IF YOU DO NOT AGREE WITH ALL OF THESE TERMS OF SERVICE, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SITE AND YOU MUST DISCONTINUE USE IMMEDIATELY.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Terms Sections */}
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

            {/* Disclaimer */}
            <section className="section-padding bg-base-200">
                <div className="container-custom max-w-4xl">
                    <motion.div {...fadeInUp} className="card bg-base-100 border-2 border-warning/20">
                        <div className="flex items-start gap-4">
                            <div className="text-5xl">⚠️</div>
                            <div>
                                <h2 className="text-3xl font-bold text-base-content mb-4">Disclaimer</h2>
                                <p className="text-base-content/70 leading-relaxed mb-4">
                                    THE SITE IS PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SITE AND OUR SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SITE AND YOUR USE THEREOF.
                                </p>
                                <p className="text-base-content/70 leading-relaxed">
                                    WE MAKE NO WARRANTIES OR REPRESENTATIONS ABOUT THE ACCURACY OR COMPLETENESS OF THE SITE&apos;S CONTENT OR THE CONTENT OF ANY WEBSITES LINKED TO THE SITE AND WE WILL ASSUME NO LIABILITY OR RESPONSIBILITY FOR ANY ERRORS, MISTAKES, OR INACCURACIES OF CONTENT.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Limitation of Liability */}
            <section className="section-padding bg-base-100">
                <div className="container-custom max-w-4xl">
                    <motion.div {...fadeInUp} className="card bg-base-200">
                        <h2 className="text-3xl font-bold text-base-content mb-4">Limitation of Liability</h2>
                        <p className="text-base-content/70 leading-relaxed mb-4">
                            IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SITE.
                        </p>
                        <p className="text-base-content/70 leading-relaxed">
                            Our aggregate liability for all claims relating to the services shall not exceed the amount you paid to us in the twelve (12) months prior to the event giving rise to the liability.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Governing Law */}
            <section className="section-padding bg-base-200">
                <div className="container-custom max-w-4xl">
                    <motion.div {...fadeInUp} className="card bg-base-100">
                        <h2 className="text-3xl font-bold text-base-content mb-4">Governing Law</h2>
                        <p className="text-base-content/70 leading-relaxed">
                            These Terms shall be governed by and defined following the laws of [Your Country/State]. FastGasHub and yourself irrevocably consent that the courts of [Your Country/State] shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Contact */}
            <section className="section-padding bg-base-100">
                <div className="container-custom max-w-4xl">
                    <motion.div {...fadeInUp} className="card bg-linear-to-br from-primary/10 to-secondary/10 border-2 border-primary/20">
                        <h2 className="text-3xl font-bold text-base-content mb-4">Questions About Terms?</h2>
                        <p className="text-base-content/70 mb-6 leading-relaxed">
                            If you have any questions or concerns about these Terms of Service, please contact us:
                        </p>
                        <div className="space-y-3 text-base-content/70">
                            <div className="flex items-center gap-3">
                                <span className="font-semibold">Email:</span>
                                <a href="mailto:legal@FastGasHub.com" className="text-primary hover:text-primary/80">
                                    legal@FastGasHub.com
                                </a>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-semibold">Phone:</span>
                                <a href="tel:+15551234567" className="text-primary hover:text-primary/80">
                                    +1 (555) 123-4567
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="section-padding bg-linear-to-r from-primary via-secondary to-accent text-primary-content">
                <div className="container-custom text-center">
                    <motion.div {...fadeInUp}>
                        <div className="text-5xl mb-4">📜</div>
                        <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
                        <p className="text-xl mb-8 text-primary-content/90 max-w-2xl mx-auto">
                            By using our services, you agree to these terms. Start shopping with confidence!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/products" className="btn bg-white text-primary hover:bg-base-100 border-0">
                                Browse Products
                            </Link>
                            <Link href="/privacy" className="btn bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary">
                                Privacy Policy
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}
