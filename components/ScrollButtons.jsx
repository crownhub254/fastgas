'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown } from 'lucide-react'

export default function ScrollButtons() {
    const [showButtons, setShowButtons] = useState(false)
    const [isAtTop, setIsAtTop] = useState(true)
    const [isAtBottom, setIsAtBottom] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY
            const windowHeight = window.innerHeight
            const documentHeight = document.documentElement.scrollHeight

            // Show buttons after scrolling 200px
            setShowButtons(scrollY > 200)
            
            // Check if at top
            setIsAtTop(scrollY < 100)
            
            // Check if at bottom (within 100px of bottom)
            setIsAtBottom(scrollY + windowHeight >= documentHeight - 100)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll() // Initial check
        
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }

    const scrollToBottom = () => {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth'
        })
    }

    return (
        <AnimatePresence>
            {showButtons && (
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.3 }}
                    className="fixed right-4 bottom-24 z-50 flex flex-col gap-2"
                >
                    {/* Scroll to Top Button */}
                    <motion.button
                        onClick={scrollToTop}
                        disabled={isAtTop}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                            isAtTop 
                                ? 'bg-base-300/50 text-base-content/30 cursor-not-allowed' 
                                : 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white hover:shadow-cyan-500/30 hover:shadow-xl'
                        }`}
                        title="Scroll to top"
                    >
                        <ChevronUp className="w-6 h-6" />
                    </motion.button>

                    {/* Scroll to Bottom Button */}
                    <motion.button
                        onClick={scrollToBottom}
                        disabled={isAtBottom}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                            isAtBottom 
                                ? 'bg-base-300/50 text-base-content/30 cursor-not-allowed' 
                                : 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white hover:shadow-yellow-500/30 hover:shadow-xl'
                        }`}
                        title="Scroll to bottom"
                    >
                        <ChevronDown className="w-6 h-6" />
                    </motion.button>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
