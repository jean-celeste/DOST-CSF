import { NextResponse } from 'next/server';
import { verifyToken } from './src/lib/auth/jwt';

// Define protected routes (API and admin panel)
const protectedApiRoutes = [
  '/api/admin',
  '/api/forms/submit',
  '/api/services',
  '/api/questions',
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

  // Protect API routes
  if (protectedApiRoutes.some(route => pathname.startsWith(route))) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
      verifyToken(authHeader.replace('Bearer ', ''));
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  }

  // Protect admin panel routes (redirect to login if not authenticated)
  if (protectedAdminRoutes.some(route => pathname.startsWith(route))) {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    try {
      verifyToken(token);
    } catch {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/admin/:path*',
  ],
};
