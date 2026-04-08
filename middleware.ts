import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
let locales = ['en', 'es', 'zh'] // Añade 'zh' aquí

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) return

  // Redirigir si no hay prefijo
  const locale = 'es' // Aquí puedes usar una librería como '@formatjs/intl-localematcher'
  request.nextUrl.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|dictionaries|favicon.ico|.*\\..*).*)'],
}
