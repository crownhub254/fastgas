'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(undefined)

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([])
    const [wishlistItems, setWishlistItems] = useState([])
    const [mounted, setMounted] = useState(false)

    // Load cart and wishlist from localStorage on mount
    useEffect(() => {
        setMounted(true)
        const savedCart = localStorage.getItem('cart')
        const savedWishlist = localStorage.getItem('wishlist')

        if (savedCart) {
            setCartItems(JSON.parse(savedCart))
        }
        if (savedWishlist) {
            setWishlistItems(JSON.parse(savedWishlist))
        }
    }, [])

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (mounted) {
            localStorage.setItem('cart', JSON.stringify(cartItems))
        }
    }, [cartItems, mounted])

    // Save wishlist to localStorage whenever it changes
    useEffect(() => {
        if (mounted) {
            localStorage.setItem('wishlist', JSON.stringify(wishlistItems))
        }
    }, [wishlistItems, mounted])

    const addToCart = (product, quantity = 1) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id)

            if (existingItem) {
                return prevItems.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                )
            }

            return [
                ...prevItems,
                {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity,
                    category: product.category
                }
            ]
        })
    }

    const removeFromCart = (productId) => {
        setCartItems(prevItems =>
            prevItems.filter(item => item.id !== productId)
        )
    }

    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId)
            return
        }

        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === productId ? { ...item, quantity } : item
            )
        )
    }

    const clearCart = () => {
        setCartItems([])
    }

    const addToWishlist = (product) => {
        setWishlistItems(prevItems => {
            const exists = prevItems.find(item => item.id === product.id)
            if (exists) return prevItems

            return [
                ...prevItems,
                {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    category: product.category,
                    rating: product.rating
                }
            ]
        })
    }

    const removeFromWishlist = (productId) => {
        setWishlistItems(prevItems =>
            prevItems.filter(item => item.id !== productId)
        )
    }

    const isInWishlist = (productId) => {
        return wishlistItems.some(item => item.id === productId)
    }

    const getCartTotal = () => {
        return cartItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        )
    }

    return (
        <CartContext.Provider
            value={{
                cartItems,
                wishlistItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                addToWishlist,
                removeFromWishlist,
                isInWishlist,
                getCartTotal
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
