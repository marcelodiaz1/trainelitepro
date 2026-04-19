// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 1. ADD 'zh' HERE!
let locales = ['en', 'es', 'zh'] 

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  if (pathnameIsMissingLocale) {
    const locale = 'en'
    return NextResponse.redirect(
      new URL(`/${locale}${pathname}`, request.url)
    )
  }
}

export const config = {
  matcher: [
    // Ensure this doesn't skip your zh route
    '/((?!_next|api|hero|favicon.ico).*)',
  ],
}