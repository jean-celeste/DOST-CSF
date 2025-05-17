import { NextResponse } from 'next/server';
// import { verifyToken } from './src/lib/auth/jwt';

// Define protected routes (API and admin panel)
const protectedApiRoutes = [
  '/api/admin',
];
const protectedAdminRoutes = [
  '/admin',
  '/admin/analytics',
  '/admin/ratings',
  '/admin/responses',
  '/admin/settings',
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Protect admin panel routes (redirect to login if not authenticated)
  if (protectedAdminRoutes.some(route => pathname.startsWith(route))) {
    // NextAuth session token cookie (name depends on environment)
    const sessionToken = request.cookies.get('next-auth.session-token')?.value
      || request.cookies.get('__Secure-next-auth.session-token')?.value;

    if (!sessionToken) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};
