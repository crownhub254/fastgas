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
            try {
                setCartItems(JSON.parse(savedCart))
            } catch (err) {
                console.error('Error loading cart:', err)
                setCartItems([])
            }
        }
        if (savedWishlist) {
            try {
                setWishlistItems(JSON.parse(savedWishlist))
            } catch (err) {
                console.error('Error loading wishlist:', err)
                setWishlistItems([])
            }
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

    // Helper function to get product ID (handles both MongoDB _id and custom id)
    const getProductId = (product) => {
        return product._id || product.id
    }

    const addToCart = (product, quantity = 1) => {
        const productId = getProductId(product)

        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item._id === productId)

            if (existingItem) {
                return prevItems.map(item =>
                    item._id === productId
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                )
            }

            return [
                ...prevItems,
                {
                    _id: productId,
                    id: product.id || productId, // Keep custom id if it exists
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
            prevItems.filter(item => item._id !== productId)
        )
    }

    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId)
            return
        }

        setCartItems(prevItems =>
            prevItems.map(item =>
                item._id === productId ? { ...item, quantity } : item
            )
        )
    }

    const clearCart = () => {
        setCartItems([])
    }

    const addToWishlist = (product) => {
        const productId = getProductId(product)

        setWishlistItems(prevItems => {
            const exists = prevItems.find(item => item._id === productId)
            if (exists) return prevItems

            return [
                ...prevItems,
                {
                    _id: productId,
                    id: product.id || productId,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    category: product.category,
                    rating: product.rating || 0
                }
            ]
        })
    }

    const removeFromWishlist = (productId) => {
        setWishlistItems(prevItems =>
            prevItems.filter(item => item._id !== productId)
        )
    }

    const isInWishlist = (productId) => {
        return wishlistItems.some(item => item._id === productId)
    }

    const getCartTotal = () => {
        return cartItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        )
    }

    const getWishlistTotal = () => {
        return wishlistItems.length
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
                getCartTotal,
                getWishlistTotal
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
