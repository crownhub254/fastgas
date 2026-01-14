import { NextResponse } from 'next/server'
import { verifyToken } from './lib/auth'

export function middleware(request) {
    const { pathname } = request.nextUrl

    // Protected routes
    const protectedRoutes = ['/add-product']

    // Check if current route is protected
    const isProtectedRoute = protectedRoutes.some(route =>
        pathname.startsWith(route)
    )

    if (isProtectedRoute) {
        const token = request.cookies.get('auth_token')

        // If no token or invalid token, redirect to login
        if (!token || !verifyToken(token.value)) {
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('redirect', pathname)
            return NextResponse.redirect(loginUrl)
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
