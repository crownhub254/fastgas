import Link from 'next/link'
import React from 'react'
import Image from 'next/image'

// FastGas Official Logo URL
const FASTGAS_LOGO_URL = 'https://fast-gas.com/wp-content/themes/common/src/assets/images/fast-gas-logo.svg'

const Logo = ({ size = 'default', showText = true, className = '' }) => {
  // Size configurations
  const sizes = {
    small: { width: 80, height: 32 },
    default: { width: 120, height: 48 },
    large: { width: 160, height: 64 },
    xlarge: { width: 200, height: 80 }
  }
  
  const { width, height } = sizes[size] || sizes.default
  
  return (
    <div className={className}>
      <Link href="/" className="flex items-center gap-2 group">
        <div className="relative">
          {/* Glow effect on hover */}
          <div className="absolute inset-0 bg-cyan-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Image 
            src={FASTGAS_LOGO_URL}
            alt="FastGas Logo"
            width={width}
            height={height}
            className="relative z-10 group-hover:scale-105 transition-transform duration-300"
            priority
            unoptimized
          />
        </div>
      </Link>
    </div>
  )
}

// Standalone logo without link (for loading screens, etc.)
export const FastGasLogoStandalone = ({ size = 'default', className = '', animate = false }) => {
  const sizes = {
    small: { width: 80, height: 32 },
    default: { width: 120, height: 48 },
    large: { width: 160, height: 64 },
    xlarge: { width: 200, height: 80 },
    hero: { width: 280, height: 112 }
  }
  
  const { width, height } = sizes[size] || sizes.default
  
  return (
    <div className={`relative ${className}`}>
      {animate && (
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-lg blur-2xl opacity-50 animate-pulse"></div>
      )}
      <Image 
        src={FASTGAS_LOGO_URL}
        alt="FastGas"
        width={width}
        height={height}
        className={`relative z-10 ${animate ? 'animate-float' : ''}`}
        priority
        unoptimized
      />
    </div>
  )
}

// Inline SVG version for cases where external URL might not work
export const FastGasLogoInline = ({ className = '', width = 120, height = 48 }) => {
  return (
    <svg 
      className={className}
      width={width} 
      height={height} 
      viewBox="0 0 200 80" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* FastGas text-based fallback logo */}
      <defs>
        <linearGradient id="fastgas-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <text 
        x="10" 
        y="50" 
        fontFamily="Arial Black, sans-serif" 
        fontSize="36" 
        fontWeight="900"
        fill="url(#fastgas-gradient)"
      >
        Fast
      </text>
      <text 
        x="95" 
        y="50" 
        fontFamily="Arial Black, sans-serif" 
        fontSize="36" 
        fontWeight="900"
        fill="#06B6D4"
      >
        Gas
      </text>
    </svg>
  )
}

export default Logo
