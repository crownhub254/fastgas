import { Inter, Poppins, DM_Sans } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from '@/contexts/CartContext'

// Font 1: Core UI & Body Text - Trust, readability, compliance
const inter = Inter({ 
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
})

// Font 2: Headlines & Value Propositions - Speed, confidence, brand personality
const poppins = Poppins({ 
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800'],
    variable: '--font-poppins',
    display: 'swap',
})

// Font 3 (Optional): Accent - Warmth, friendliness for promotions/testimonials
const dmSans = DM_Sans({ 
    subsets: ['latin'],
    weight: ['400', '500', '600'],
    variable: '--font-accent',
    display: 'swap',
})

export const metadata = {
    title: 'FastGasHub',
    description: 'Premium N₂O Cream Chargers & Culinary Equipment - FastGas Official Distributor',
    icons: {
        icon: '/icon.png',
    }
}

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={`${inter.variable} ${poppins.variable} ${dmSans.variable}`}>
            <body className={`${inter.className} font-body antialiased`}>
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
