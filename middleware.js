import { NextResponse } from 'next/server'
// import { jwtVerify } from 'jose'   // Example if you use JWT

// ---- CONFIG ----
const PROTECTED_ROUTES = [
    '/add-product',
    '/dashboard',
    '/dashboard/admin',
    '/dashboard/seller',
    '/dashboard/user',
]

// ---- OPTIONAL TOKEN VERIFY (Edge-safe) ----
// ⚠️ You CANNOT use mongoose, firebase-admin, or node crypto here
// Use lightweight JWT verification only
async function verifyToken(token) {
    try {
        // Example JWT verification (uncomment if using JWT)
        /*
        const secret = new TextEncoder().encode(process.env.JWT_SECRET)
        await jwtVerify(token, secret)
        */
        return true
    } catch (error) {
        return false
    }
}

// ---- MIDDLEWARE ----
export async function middleware(request) {
    const { pathname } = request.nextUrl

    const isProtectedRoute = PROTECTED_ROUTES.some(route =>
        pathname.startsWith(route)
    )

    if (!isProtectedRoute) {
        return NextResponse.next()
    }

    const token = request.cookies.get('auth_token')?.value

    if (!token) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    const isValid = await verifyToken(token)

    if (!isValid) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
}

// ---- MATCHER ----
export const config = {
    matcher: [
        /*
         * Match all routes except:
         * - API routes
         * - Next.js internals
         * - Static files
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
