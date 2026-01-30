'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(undefined)

// Price tiers for different user types
const PRICE_TIERS = {
    retail: 'retailPrice',
    reseller: 'resellerPrice',
    wholesale: 'wholesalePrice'
}

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([])
    const [wishlistItems, setWishlistItems] = useState([])
    const [mounted, setMounted] = useState(false)
    const [userPriceTier, setUserPriceTier] = useState('retail') // Default to retail pricing

    // Load cart and wishlist from localStorage on mount
    useEffect(() => {
        setMounted(true)
        const savedCart = localStorage.getItem('cart')
        const savedWishlist = localStorage.getItem('wishlist')
        const savedPriceTier = localStorage.getItem('userPriceTier')

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
        if (savedPriceTier) {
            setUserPriceTier(savedPriceTier)
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

    // Save price tier to localStorage
    useEffect(() => {
        if (mounted) {
            localStorage.setItem('userPriceTier', userPriceTier)
        }
    }, [userPriceTier, mounted])

    // Helper function to get product ID (handles both MongoDB _id and custom id)
    const getProductId = (product) => {
        return product._id || product.id
    }

    // Helper function to get price based on user tier and variant
    const getPriceForTier = (product, variantSize = null) => {
        // If product has variants (FastGas cylinder)
        if (product.variants && variantSize) {
            const variant = product.variants.find(v => v.size === variantSize)
            if (variant) {
                const priceField = PRICE_TIERS[userPriceTier] || 'retailPrice'
                return variant[priceField] || variant.retailPrice
            }
        }
        // Fallback to standard price
        return product.price
    }

    // Update user's price tier (called when user logs in)
    const updateUserPriceTier = (tier) => {
        if (PRICE_TIERS[tier]) {
            setUserPriceTier(tier)
            // Recalculate cart prices with new tier
            setCartItems(prevItems => 
                prevItems.map(item => ({
                    ...item,
                    price: item.originalPrices ? 
                        item.originalPrices[PRICE_TIERS[tier]] || item.originalPrices.retailPrice :
                        item.price
                }))
            )
        }
    }

    const addToCart = (product, quantity = 1, variantSize = null) => {
        const productId = getProductId(product)
        const cartItemId = variantSize ? `${productId}-${variantSize}` : productId

        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item._id === cartItemId)

            if (existingItem) {
                return prevItems.map(item =>
                    item._id === cartItemId
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                )
            }

            // Get the appropriate price based on user tier
            const price = getPriceForTier(product, variantSize)
            
            // Get variant info if applicable
            const variant = product.variants?.find(v => v.size === variantSize)

            return [
                ...prevItems,
                {
                    _id: cartItemId,
                    productId: productId,
                    id: product.id || productId,
                    name: product.name,
                    price: price,
                    originalPrices: variant ? {
                        retailPrice: variant.retailPrice,
                        resellerPrice: variant.resellerPrice,
                        wholesalePrice: variant.wholesalePrice
                    } : null,
                    image: product.image,
                    quantity,
                    variantSize: variantSize,
                    sku: variant?.sku || null,
                    priceTier: userPriceTier,
                    // FastGas specific
                    productType: product.productType || 'general',
                    brand: product.brand || null
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
                userPriceTier,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                addToWishlist,
                removeFromWishlist,
                isInWishlist,
                getCartTotal,
                getWishlistTotal,
                updateUserPriceTier,
                getPriceForTier,
                getCartItemCount: () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
                getCartSummary: () => ({
                    itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
                    subtotal: getCartTotal(),
                    priceTier: userPriceTier
                })
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
