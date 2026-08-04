import { NextRequest, NextResponse } from "next/server";

const locales = ["en", "es", "zh"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const hasLocale = locales.some(
    (locale) =>
      pathname === `/${locale}` ||
      pathname.startsWith(`/${locale}/`)
  );

  if (!hasLocale) {
    return NextResponse.redirect(
      new URL(`/en${pathname}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};