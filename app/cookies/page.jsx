'use client'

import { motion } from 'framer-motion'
import { Cookie, Settings, Shield, Eye, Bell, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function CookiesPolicyPage() {
    const sections = [
        {
            icon: Cookie,
            title: 'What Are Cookies?',
            content: `Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners.

Cookies allow websites to recognize your device and store some information about your preferences or past actions. This helps provide you with a personalized experience and makes your next visit easier and the site more useful to you.

There are different types of cookies, including session cookies (temporary) and persistent cookies (stored on your device for a set period). Some cookies are essential for the website to function, while others enhance your experience or help us understand how you use our site.`
        },
        {
            icon: Settings,
            title: 'Types of Cookies We Use',
            content: `Essential Cookies
These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility. You cannot opt-out of these cookies as the website would not work without them.

Performance Cookies
These cookies collect information about how you use our website, such as which pages you visit most often and if you receive error messages. These cookies help us improve how our website works and enhance your experience.

Functionality Cookies
These cookies allow our website to remember choices you make (such as your username, language, or region) and provide enhanced, personalized features. They may also be used to provide services you have requested, such as watching a video or commenting on a blog.

Targeting/Advertising Cookies
These cookies are used to deliver advertisements that are relevant to you and your interests. They are also used to limit the number of times you see an advertisement and help measure the effectiveness of advertising campaigns.`
        },
        {
            icon: Shield,
            title: 'How We Use Cookies',
            content: `At ProductHub, we use cookies for various purposes to enhance your browsing experience and improve our services:

Authentication & Security
• To verify your identity when you log in to your account
• To protect your account from unauthorized access
• To enable security features and prevent fraudulent activity

User Preferences & Settings
• To remember your language and region preferences
• To save your shopping cart items between sessions
• To maintain your display settings and layout preferences

Analytics & Performance
• To understand how visitors interact with our website
• To identify areas for improvement and optimize user experience
• To track website performance and troubleshoot technical issues

Personalization
• To provide personalized product recommendations
• To show relevant content based on your browsing history
• To customize your homepage and search results

Marketing & Advertising
• To deliver targeted advertisements based on your interests
• To measure the effectiveness of our marketing campaigns
• To prevent showing you the same ads repeatedly`
        },
        {
            icon: Eye,
            title: 'Third-Party Cookies',
            content: `In addition to our own cookies, we may also use various third-party cookies to report usage statistics, deliver advertisements, and provide enhanced functionality.

Analytics Services
We use Google Analytics and similar services to help us understand how users engage with our website. These services use cookies to collect information about your visits, including pages viewed, time spent, and links clicked.

Social Media Integration
We use social media cookies from platforms like Facebook, Twitter, and Instagram to enable you to share content and interact with our social media presence. These platforms may use cookies to track your browsing activity.

Advertising Partners
We work with advertising partners who use cookies to show you relevant ads on other websites. These partners may combine information collected from our website with other information they have collected about you.

Payment Processors
Our payment processors may use cookies to facilitate secure transactions and prevent fraud. These cookies are essential for processing your payments safely.

Please note that we do not control third-party cookies, and their use is subject to the respective third party's privacy policy. We encourage you to review the privacy policies of these third parties for more information.`
        },
        {
            icon: Bell,
            title: 'Managing Your Cookie Preferences',
            content: `You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences in several ways:

Browser Settings
Most web browsers allow you to control cookies through their settings. You can set your browser to:
• Block all cookies
• Accept only first-party cookies
• Delete cookies when you close your browser
• Be notified when a website attempts to place a cookie

Cookie Consent Tool
When you first visit our website, you'll see a cookie consent banner where you can:
• Accept all cookies
• Reject non-essential cookies
• Customize your cookie preferences by category
• Access our cookie policy for more information

Opt-Out Options
For advertising cookies, you can opt out through:
• Digital Advertising Alliance (DAA): www.aboutads.info/choices
• Network Advertising Initiative (NAI): www.networkadvertising.org/choices
• Your Online Choices (Europe): www.youronlinechoices.eu

Important Note
Please be aware that if you choose to disable or reject cookies, some features of our website may not function properly, and your user experience may be limited. Essential cookies cannot be disabled as they are necessary for the website to operate.`
        },
        {
            icon: Trash2,
            title: 'Deleting Cookies',
            content: `If you want to delete cookies that have already been stored on your device, you can do so through your browser settings. Here's how to delete cookies in popular browsers:

Google Chrome
1. Click the three-dot menu in the top right corner
2. Go to Settings > Privacy and security > Clear browsing data
3. Select "Cookies and other site data"
4. Choose your time range and click "Clear data"

Mozilla Firefox
1. Click the menu button and select Settings
2. Go to Privacy & Security panel
3. Under Cookies and Site Data, click "Clear Data"
4. Select "Cookies and Site Data" and click "Clear"

Safari
1. Go to Preferences > Privacy
2. Click "Manage Website Data"
3. Select "Remove All" or choose specific websites
4. Click "Remove Now" to confirm

Microsoft Edge
1. Click the three-dot menu and select Settings
2. Go to Privacy, search, and services
3. Under Clear browsing data, click "Choose what to clear"
4. Select "Cookies and other site data" and click "Clear now"

Note that deleting cookies will log you out of websites and may remove your saved preferences. You'll need to set your preferences again the next time you visit.`
        },
    ]

    const cookieTypes = [
        {
            name: 'Essential Cookies',
            description: 'Required for basic site functionality',
            examples: 'Authentication, security, load balancing',
            canDisable: false,
            color: 'from-error to-error/80'
        },
        {
            name: 'Performance Cookies',
            description: 'Help us improve website performance',
            examples: 'Analytics, error reporting, page load times',
            canDisable: true,
            color: 'from-warning to-warning/80'
        },
        {
            name: 'Functionality Cookies',
            description: 'Remember your preferences and settings',
            examples: 'Language, region, display preferences',
            canDisable: true,
            color: 'from-info to-info/80'
        },
        {
            name: 'Marketing Cookies',
            description: 'Deliver personalized advertisements',
            examples: 'Ad targeting, campaign tracking, retargeting',
            canDisable: true,
            color: 'from-success to-success/80'
        },
    ]

    const fadeInUp = {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    }

    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="relative section-padding bg-linear-to-br from-primary/5 via-secondary/5 to-accent/5 overflow-hidden">
                <div className="absolute top-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>

                <div className="container-custom relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6">
                            🍪 Cookie Policy
                        </span>

                        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-base-content">
                            Cookie{' '}
                            <span className="bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                                Policy
                            </span>
                        </h1>

                        <p className="text-xl text-base-content/70 mb-4">
                            Learn how we use cookies to enhance your experience on ProductHub.
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
                    <motion.div {...fadeInUp} className="card">
                        <h2 className="text-3xl font-bold text-base-content mb-4">Understanding Our Cookie Usage</h2>
                        <p className="text-base-content/70 leading-relaxed mb-4">
                            This Cookie Policy explains what cookies are, how we use them on the ProductHub website, and how you can manage your cookie preferences. By using our website, you agree to the use of cookies as described in this policy.
                        </p>
                        <p className="text-base-content/70 leading-relaxed">
                            We are committed to being transparent about how we collect and use data. This policy provides detailed information about the types of cookies we use, their purpose, and your choices regarding cookies.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Cookie Types Overview */}
            <section className="section-padding">
                <div className="container-custom">
                    <motion.div {...fadeInUp} className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-base-content mb-4">Cookie Categories</h2>
                        <p className="text-xl text-base-content/70 max-w-3xl mx-auto">
                            We use different types of cookies to provide and improve our services
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                        {cookieTypes.map((type, idx) => (
                            <motion.div
                                key={idx}
                                {...fadeInUp}
                                transition={{ delay: idx * 0.1 }}
                                className="card bg-base-200"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-lg bg-linear-to-br ${type.color} flex items-center justify-center shrink-0`}>
                                        <Cookie className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-base-content mb-2">
                                            {type.name}
                                        </h3>
                                        <p className="text-base-content/70 mb-3">
                                            {type.description}
                                        </p>
                                        <div className="text-sm text-base-content/60 mb-3">
                                            <span className="font-semibold">Examples:</span> {type.examples}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {type.canDisable ? (
                                                <span className="px-3 py-1 bg-success/10 text-success text-xs font-semibold rounded-full">
                                                    Can be disabled
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 bg-error/10 text-error text-xs font-semibold rounded-full">
                                                    Always active
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Detailed Sections */}
            <section className="section-padding bg-base-200">
                <div className="container-custom max-w-4xl">
                    <div className="space-y-8">
                        {sections.map((section, idx) => (
                            <motion.div
                                key={idx}
                                {...fadeInUp}
                                transition={{ delay: idx * 0.1 }}
                                className="card"
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

            {/* Cookie Table */}
            <section className="section-padding">
                <div className="container-custom max-w-6xl">
                    <motion.div {...fadeInUp} className="card bg-base-200">
                        <h2 className="text-3xl font-bold text-base-content mb-6">Specific Cookies We Use</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-base-300">
                                        <th className="text-left py-3 px-4 font-semibold text-base-content">Cookie Name</th>
                                        <th className="text-left py-3 px-4 font-semibold text-base-content">Purpose</th>
                                        <th className="text-left py-3 px-4 font-semibold text-base-content">Duration</th>
                                        <th className="text-left py-3 px-4 font-semibold text-base-content">Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { name: '_session_id', purpose: 'Maintains your login session', duration: 'Session', type: 'Essential' },
                                        { name: '_csrf_token', purpose: 'Security protection against CSRF attacks', duration: 'Session', type: 'Essential' },
                                        { name: 'cart_items', purpose: 'Stores your shopping cart contents', duration: '7 days', type: 'Functionality' },
                                        { name: 'user_preferences', purpose: 'Remembers your site preferences', duration: '1 year', type: 'Functionality' },
                                        { name: '_ga', purpose: 'Google Analytics - tracks user behavior', duration: '2 years', type: 'Performance' },
                                        { name: '_fbp', purpose: 'Facebook Pixel - tracks conversions', duration: '3 months', type: 'Marketing' },
                                    ].map((cookie, idx) => (
                                        <tr key={idx} className="border-b border-base-300/50 hover:bg-base-300/30 transition-colors">
                                            <td className="py-3 px-4 text-base-content font-mono text-sm">{cookie.name}</td>
                                            <td className="py-3 px-4 text-base-content/70">{cookie.purpose}</td>
                                            <td className="py-3 px-4 text-base-content/70">{cookie.duration}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${cookie.type === 'Essential' ? 'bg-error/10 text-error' :
                                                        cookie.type === 'Functionality' ? 'bg-info/10 text-info' :
                                                            cookie.type === 'Performance' ? 'bg-warning/10 text-warning' :
                                                                'bg-success/10 text-success'
                                                    }`}>
                                                    {cookie.type}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Updates Notice */}
            <section className="section-padding bg-base-200">
                <div className="container-custom max-w-4xl">
                    <motion.div {...fadeInUp} className="card border-2 border-warning/20">
                        <div className="flex items-start gap-4">
                            <div className="text-5xl">🔔</div>
                            <div>
                                <h2 className="text-3xl font-bold text-base-content mb-4">Updates to This Policy</h2>
                                <p className="text-base-content/70 leading-relaxed mb-4">
                                    We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. When we make changes, we will update the &quot;Last Updated&ldquo; date at the top of this policy.
                                </p>
                                <p className="text-base-content/70 leading-relaxed">
                                    We encourage you to review this Cookie Policy periodically to stay informed about how we use cookies. Your continued use of our website after any changes indicates your acceptance of the updated policy.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Contact */}
            <section className="section-padding">
                <div className="container-custom max-w-4xl">
                    <motion.div {...fadeInUp} className="card bg-linear-to-br from-primary/10 to-secondary/10 border-2 border-primary/20">
                        <h2 className="text-3xl font-bold text-base-content mb-4">Questions About Cookies?</h2>
                        <p className="text-base-content/70 mb-6 leading-relaxed">
                            If you have any questions about our use of cookies or this Cookie Policy, please don&apos;t hesitate to contact us:
                        </p>
                        <div className="space-y-3 text-base-content/70">
                            <div className="flex items-center gap-3">
                                <span className="font-semibold">Email:</span>
                                <a href="mailto:privacy@producthub.com" className="text-primary hover:text-primary/80 transition-colors">
                                    privacy@producthub.com
                                </a>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-semibold">Phone:</span>
                                <a href="tel:+15551234567" className="text-primary hover:text-primary/80 transition-colors">
                                    +1 (555) 123-4567
                                </a>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-semibold">Address:</span>
                                <span>123 E-Commerce St, Digital City, DC 12345</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="section-padding bg-linear-to-r from-primary via-secondary to-accent text-primary-content">
                <div className="container-custom text-center">
                    <motion.div {...fadeInUp}>
                        <div className="text-5xl mb-4">🍪</div>
                        <h2 className="text-4xl font-bold mb-4">Ready to Continue?</h2>
                        <p className="text-xl mb-8 text-primary-content/90 max-w-2xl mx-auto">
                            Now that you understand our cookie usage, continue exploring our products with confidence!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/products" className="bg-white text-primary hover:bg-base-100 px-6 py-3 rounded-lg font-semibold transition-all duration-300 border-0">
                                Browse Products
                            </Link>
                            <Link href="/privacy" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary px-6 py-3 rounded-lg font-semibold transition-all duration-300">
                                Privacy Policy
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}
