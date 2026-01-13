import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'Product Showcase - Next.js Assignment',
    description: 'A modern product showcase application built with Next.js',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Navbar />
                <main className="min-h-screen bg-base-100 my-15">
                    {children}
                </main>
                <Footer />
                <Toaster position="top-right" />
            </body>
        </html>
    )
}
