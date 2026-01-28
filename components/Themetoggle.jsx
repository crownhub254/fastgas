'use client'

import { useTheme } from '@/lib/hooks/useTheme'
import { Moon, Sun, Monitor } from 'lucide-react'

export default function ThemeToggle({ className = '' }) {
    const { theme, toggleTheme, mounted } = useTheme()

    // Prevent hydration mismatch
    if (!mounted) {
        return (
            <div className={`w-10 h-10 rounded-lg bg-base-200 animate-pulse ${className}`} />
        )
    }

    return (
        <button
            onClick={toggleTheme}
            className={`btn btn-ghost  btn-square ${className}`}
            aria-label="Toggle theme"
        >
            {theme === 'light' && <Sun className="w-5 h-5" />}
            {theme === 'dark' && <Moon className="w-5 h-5" />}
        </button>
    )
}

// Advanced Theme Toggle with Dropdown (Light/Dark/Auto)
export function ThemeToggleDropdown({ className = '' }) {
    const { theme, setTheme, mounted } = useTheme()

    if (!mounted) {
        return (
            <div className={`w-10 h-10 rounded-lg bg-base-200 animate-pulse ${className}`} />
        )
    }

    const themes = [
        { value: 'light', label: 'Light', icon: Sun },
        { value: 'dark', label: 'Dark', icon: Moon },
        { value: 'auto', label: 'Auto', icon: Monitor }
    ]

    const currentTheme = themes.find(t => t.value === theme)
    const CurrentIcon = currentTheme?.icon || Sun

    return (
        <div className={`dropdown dropdown-end ${className}`}>
            <div tabIndex={0} role="button" className="btn btn-ghost  btn-square">
                <CurrentIcon className="w-5 h-5" />
            </div>
            <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-200 rounded-box w-40 mt-2 border border-base-300"
            >
                {themes.map((t) => {
                    const Icon = t.icon
                    return (
                        <li key={t.value}>
                            <button
                                onClick={() => setTheme(t.value)}
                                className={`flex items-center gap-2 ${theme === t.value ? 'active bg-primary text-primary-content' : ''}`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{t.label}</span>
                                {theme === t.value && (
                                    <span className="ml-auto">✓</span>
                                )}
                            </button>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

// Animated Theme Toggle with Smooth Transition
export function AnimatedThemeToggle({ className = '' }) {
    const { theme, toggleTheme, mounted } = useTheme()

    if (!mounted) {
        return (
            <div className={`w-10 h-10 rounded-lg bg-base-200 animate-pulse ${className}`} />
        )
    }

    return (
        <button
            onClick={toggleTheme}
            className={`btn btn-ghost  btn-square relative overflow-hidden ${className}`}
            aria-label="Toggle theme"
        >
            <div className="relative w-5 h-5">
                {/* Sun Icon */}
                <Sun
                    className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${theme === 'light'
                            ? 'rotate-0 opacity-100 scale-100'
                            : 'rotate-90 opacity-0 scale-50'
                        }`}
                />

                {/* Moon Icon */}
                <Moon
                    className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${theme === 'dark'
                            ? 'rotate-0 opacity-100 scale-100'
                            : '-rotate-90 opacity-0 scale-50'
                        }`}
                />
            </div>
        </button>
    )
}

// Compact Theme Toggle for Small Spaces
export function CompactThemeToggle({ className = '' }) {
    const { theme, toggleTheme, mounted } = useTheme()

    if (!mounted) {
        return <div className={`w-8 h-8 rounded-lg bg-base-200 animate-pulse ${className}`} />
    }

    return (
        <button
            onClick={toggleTheme}
            className={`btn btn-ghost  btn-square ${className}`}
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <Sun className="w-4 h-4" />
            ) : (
                <Moon className="w-4 h-4" />
            )}
        </button>
    )
}

// Theme Toggle with Text Label
export function ThemeToggleWithLabel({ className = '' }) {
    const { theme, toggleTheme, mounted } = useTheme()

    if (!mounted) {
        return (
            <div className={`px-4 py-2 rounded-lg bg-base-200 animate-pulse ${className}`}>
                <div className="w-20 h-4 bg-base-300 rounded" />
            </div>
        )
    }

    return (
        <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 px-4 py-2 hover:bg-base-200 transition-all btn btn-ghost  ${className}`}
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <>
                    <Sun className="w-5 h-5" />
                    <span className="text-sm font-medium">Light</span>
                </>
            ) : (
                <>
                    <Moon className="w-5 h-5" />
                    <span className="text-sm font-medium">Dark</span>
                </>
            )}
        </button>
    )
}

// Theme Toggle Card (for Settings Page)
export function ThemeToggleCard({ className = '' }) {
    const { theme, setTheme, mounted } = useTheme()

    if (!mounted) {
        return (
            <div className={`card bg-base-200 animate-pulse ${className}`}>
                <div className="card-body">
                    <div className="h-6 w-32 bg-base-300 rounded mb-4" />
                    <div className="grid grid-cols-3 gap-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-base-300 rounded-lg" />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    const themes = [
        {
            value: 'light',
            label: 'Light',
            icon: Sun,
            description: 'Bright and clear'
        },
        {
            value: 'dark',
            label: 'Dark',
            icon: Moon,
            description: 'Easy on the eyes'
        },
        {
            value: 'auto',
            label: 'Auto',
            icon: Monitor,
            description: 'Follows system'
        }
    ]

    return (
        <div className={`card bg-base-200 ${className}`}>
            <div className="card-body">
                <h3 className="card-title text-lg">Theme Preference</h3>
                <div className="grid grid-cols-3 gap-3 mt-4">
                    {themes.map((t) => {
                        const Icon = t.icon
                        const isActive = theme === t.value

                        return (
                            <button
                                key={t.value}
                                onClick={() => setTheme(t.value)}
                                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all hover:scale-105 ${isActive
                                        ? 'border-primary bg-primary/10 shadow-lg'
                                        : 'border-base-300 hover:border-primary/50'
                                    }`}
                            >
                                <Icon className={`w-6 h-6 ${isActive ? 'text-primary' : ''}`} />
                                <div className="text-center">
                                    <p className={`text-sm font-semibold ${isActive ? 'text-primary' : ''}`}>
                                        {t.label}
                                    </p>
                                    <p className="text-xs text-base-content/60">
                                        {t.description}
                                    </p>
                                </div>
                                {isActive && (
                                    <div className="absolute top-2 right-2">
                                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                            <span className="text-xs text-primary-content">✓</span>
                                        </div>
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
