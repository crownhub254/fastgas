import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from '@/contexts/CartContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'FastGasHub',
    description: 'Premium N₂O Cream Chargers & Culinary Equipment - FastGas Official Distributor',
    icons: {
        icon: '/icon.png',
    }
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <CartProvider>
                    <main className="">
                        {children}
                    </main>
                </CartProvider>
                <Toaster position="top-right" />
            </body>
        </html>
    )
}
