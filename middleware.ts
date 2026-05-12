import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextResponse, type NextRequest } from 'next/server'

const i18nMiddleware = createMiddleware(routing)

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 1. Allow API, static files and core auth paths
  if (
    pathname.startsWith('/api') || 
    pathname.startsWith('/_next') || 
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // 2. Run i18n middleware first
  const response = i18nMiddleware(request)

  // 3. Protected routes check
  // We check if the path (with or without locale) contains dashboard or trees
  const isProtectedRoute = pathname.match(/\/(dashboard|trees)(\/|$)/)
  
  // Also check if it's a public page like login/register to avoid redirect loops
  const isPublicAuthPage = pathname.match(/\/(login|register)(\/|$)/)

  if (isProtectedRoute && !isPublicAuthPage) {
    try {
      const sessionResponse = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
        headers: {
          cookie: request.headers.get('cookie') || '',
        },
      })
      
      if (!sessionResponse.ok) {
        return NextResponse.redirect(new URL('/login', request.url))
      }

      const session = await sessionResponse.json()
      if (!session) {
        // Redirect to login - ideally we'd preserve the locale but next-intl usually handles /login -> /en/login
        return NextResponse.redirect(new URL('/login', request.url))
      }
    } catch (error) {
      console.error('Middleware auth check failed:', error)
      // On error, we might want to allow it or redirect depending on security posture
    }
  }
  
  return response
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}


