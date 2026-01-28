'use client'

import { useState, useEffect } from 'react'
import { auth } from '@/lib/firebase/config'

// Global state for theme (shared across all hook instances)
let globalTheme = 'light'
let globalListeners = []
let globalUser = null

// Notify all listeners when theme changes
const notifyListeners = (newTheme) => {
    globalTheme = newTheme
    globalListeners.forEach(listener => listener(newTheme))
}

// Initialize theme from localStorage
if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme') || 'light'
    globalTheme = savedTheme
    document.documentElement.setAttribute('data-theme', savedTheme)
}

// Listen for auth state changes (only once)
if (typeof window !== 'undefined') {
    auth.onAuthStateChanged(async (firebaseUser) => {
        globalUser = firebaseUser
        if (firebaseUser) {
            await loadThemeFromSettings(firebaseUser.uid)
        }
    })
}

// Load theme from backend settings
async function loadThemeFromSettings(userId) {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/settings/${userId}`
        )

        if (response.ok) {
            const data = await response.json()
            if (data.success && data.settings?.preferences?.theme) {
                const backendTheme = data.settings.preferences.theme

                // Only update if different from current
                if (backendTheme !== globalTheme) {
                    globalTheme = backendTheme
                    localStorage.setItem('theme', backendTheme)
                    document.documentElement.setAttribute('data-theme', backendTheme)
                    notifyListeners(backendTheme)
                    console.log('✅ Theme loaded from backend:', backendTheme)
                }
            }
        }
    } catch (error) {
        console.error('Failed to load theme from settings:', error)
    }
}

// Save theme to backend settings
async function saveThemeToSettings(newTheme) {
    if (!globalUser) return

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/settings/${globalUser.uid}/preferences/theme`,
            {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: newTheme })
            }
        )

        if (response.ok) {
            console.log('✅ Theme saved to backend:', newTheme)
        } else {
            console.warn('⚠️ Failed to save theme to backend')
        }
    } catch (error) {
        console.error('Failed to save theme to settings:', error)
    }
}

// Apply theme changes
function applyTheme(newTheme) {
    if (newTheme === 'auto') {
        // Handle auto theme
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        newTheme = prefersDark ? 'dark' : 'light'
    }

    globalTheme = newTheme
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    notifyListeners(newTheme)

    // Save to backend if user is logged in
    if (globalUser) {
        saveThemeToSettings(newTheme)
    }
}

// Main hook
export function useTheme() {
    const [theme, setTheme] = useState(globalTheme)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)

        // Sync with global theme
        setTheme(globalTheme)

        // Subscribe to theme changes
        const listener = (newTheme) => {
            setTheme(newTheme)
        }
        globalListeners.push(listener)

        // Cleanup
        return () => {
            globalListeners = globalListeners.filter(l => l !== listener)
        }
    }, [])

    const toggleTheme = () => {
        const newTheme = globalTheme === 'light' ? 'dark' : 'light'
        applyTheme(newTheme)
    }

    const setSpecificTheme = (newTheme) => {
        applyTheme(newTheme)
    }

    return {
        theme,
        toggleTheme,
        setTheme: setSpecificTheme,
        mounted
    }
}
