// middleware.js
import { NextResponse } from 'next/server'

export function middleware(request) {
    // Get the pathname
    const { pathname } = request.nextUrl

    // DEMO MODE: Auto-login for dashboard routes
    // Check if accessing any dashboard route
    const isDashboardRoute = pathname.startsWith('/dashboard')
    
    if (isDashboardRoute) {
        // Extract role from URL path
        let demoRole = 'user' // default
        if (pathname.startsWith('/dashboard/admin')) {
            demoRole = 'admin'
        } else if (pathname.startsWith('/dashboard/reseller')) {
            demoRole = 'reseller'
        } else if (pathname.startsWith('/dashboard/rider')) {
            demoRole = 'rider'
        } else if (pathname.startsWith('/dashboard/seller')) {
            demoRole = 'seller'
        } else if (pathname.startsWith('/dashboard/user')) {
            demoRole = 'user'
        }

        // Check if already has demo auth
        const authToken = request.cookies.get('auth-token')?.value
        const userRole = request.cookies.get('user-role')?.value

        // If not authenticated or role doesn't match, set demo cookies
        if (!authToken || userRole !== demoRole) {
            const response = NextResponse.next()
            
            // Set demo authentication cookies
            response.cookies.set('auth-token', `demo-${demoRole}-token`, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 7 days
                sameSite: 'lax'
            })
            response.cookies.set('user-role', demoRole, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7,
                sameSite: 'lax'
            })
            response.cookies.set('demo-mode', 'true', {
                path: '/',
                maxAge: 60 * 60 * 24 * 7,
                sameSite: 'lax'
            })
            
            return response
        }
        
        // Already authenticated with correct role, proceed
        return NextResponse.next()
    }

    // Define protected routes that require authentication (non-dashboard)
    const protectedRoutes = [
        '/profile',
        '/orders',
        '/settings',
        '/cart',
        '/wishlist',
        '/checkout',
        '/add-product'
    ]

    // Define auth routes (login, register) - redirect to home if already logged in
    const authRoutes = ['/login', '/register']

    // Check if current path is protected
    const isProtectedRoute = protectedRoutes.some(route =>
        pathname.startsWith(route)
    )

    // Check if current path is an auth route
    const isAuthRoute = authRoutes.some(route =>
        pathname.startsWith(route)
    )

    // Get auth token from cookies (this will be set by your auth system)
    const authToken = request.cookies.get('auth-token')?.value
    const firebaseToken = request.cookies.get('firebase-token')?.value

    // User is authenticated if either token exists
    const isAuthenticated = !!(authToken || firebaseToken)

    // Redirect unauthenticated users away from protected routes
    if (isProtectedRoute && !isAuthenticated) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Redirect authenticated users away from auth routes
    if (isAuthRoute && isAuthenticated) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // Allow the request to proceed
    return NextResponse.next()
}

// Configure which routes use this middleware
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
    ],
}
