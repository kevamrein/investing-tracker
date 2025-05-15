import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define which paths are protected (all frontend paths except explicitly public ones)
  const isProtectedPath =
    path.startsWith('/') &&
    !path.startsWith('/_next') &&
    !path.startsWith('/api') &&
    !path.startsWith('/(payload)') &&
    !path.startsWith('/favicon.ico')

  // Public paths that should not require authentication
  const isPublicPath = path === '/login' || path === '/register'

  // If it's not a protected path, just proceed
  if (!isProtectedPath) {
    return NextResponse.next()
  }

  // Get the session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Redirect unauthenticated users to login
  if (!token && isProtectedPath && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from login/register pages
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Protected routes that need authentication
    '/',
    '/dashboard/:path*',

    // Public routes that should redirect when authenticated
    '/login',
    '/register',
  ],
}
