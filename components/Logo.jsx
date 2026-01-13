import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const Logo = () => {
  return (
    <div>
          <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                  <div className="absolute inset-0 bg-linear-to-br from-primary to-secondary rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative bg-linear-to-br from-primary to-secondary p-2.5 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <ShoppingBag className="w-5 h-5 text-primary-content" />
                  </div>
              </div>
              <span className="text-2xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                  ShopHub
              </span>
          </Link>
    </div>
  )
}

export default Logo
