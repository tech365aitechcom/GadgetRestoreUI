import { NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/orders', '/book', '/profile', '/notifications'];

export function middleware(req) {
  const token = req.cookies.get('customer_token')?.value;
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected && !token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect logged-in users away from auth screens
  if (token && (pathname === '/login' || pathname === '/verify-otp')) {
    return NextResponse.redirect(new URL('/home', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/orders/:path*',
    '/book/:path*',
    '/profile/:path*',
    '/notifications/:path*',
    '/login',
    '/verify-otp',
  ],
};
