import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

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
  const isProtectedRoute = pathname.match(/\/(dashboard|trees)(\/|$)/)
  const isPublicAuthPage = pathname.match(/\/(login|register)(\/|$)/)

  if (isProtectedRoute && !isPublicAuthPage) {
    const session = await auth.api.getSession({
      headers: request.headers,
    })
    
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  return response
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}



