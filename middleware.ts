import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Matcher que excluye API routes, archivos estáticos y _next
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
