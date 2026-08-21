// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { ROUTES } from '@/constants/routes';
import { authRateLimiter, generalRateLimiter, adminRateLimiter, publicBlogRateLimiter } from '@/lib/rateLimiter';
import { isMobileAppUserAgent } from '@/lib/mobile/mobileDetection';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request });

  // =========================
  // ✅ 0. SKIP AUTH ROUTES (CRITICAL)
  // =========================
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // =========================
  // ✅ 1. API RATE LIMITING
  // =========================
  if (pathname.startsWith('/api/')) {
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const identifier = token?.id || ip;

    let limiter;

    if (pathname.startsWith('/api/blogs/public')) {
      limiter = publicBlogRateLimiter;
    } else if (pathname.startsWith('/api/auth/')) {
      limiter = authRateLimiter;
    } else if (pathname.startsWith('/api/admin/')) {
      limiter = adminRateLimiter;
    } else {
      limiter = generalRateLimiter;
    }

    const result = limiter.check(identifier);

    if (!result.allowed) {
      return NextResponse.json(
        { message: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const response = NextResponse.next();

    // Don't modify response headers to avoid interfering with Next.js compression
    // Rate limiting is still enforced above

    return response;
  }

  if (pathname === '/blogs' || pathname.startsWith('/blogs/')) {
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const result = publicBlogRateLimiter.check(ip);
    if (!result.allowed) {
      return new NextResponse('Too many requests. Please try again later.', { status: 429 });
    }

    return NextResponse.next();
  }

  // =========================
  // ✅ 2. REDIRECT AUTHENTICATED USERS & MOBILE APP WEBVIEW FROM HOME
  // =========================
  if (pathname === '/') {
    if (token?.id) {
      return NextResponse.redirect(new URL(ROUTES.dashboard, request.url));
    }

    const userAgent = request.headers.get('user-agent');
    const isWebviewParam =
      request.nextUrl.searchParams.get('webview') === 'true' ||
      request.nextUrl.searchParams.get('app') === 'true';

    if (isWebviewParam || isMobileAppUserAgent(userAgent)) {
      return NextResponse.redirect(new URL(ROUTES.login, request.url));
    }

    return NextResponse.next();
  }

  // =========================
  // ✅ 3. BLOCK AUTHENTICATED USERS FROM LOGIN/REGISTER
  // =========================
  if (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password')) {
    if (token?.id) {
      return NextResponse.redirect(new URL(ROUTES.dashboard, request.url));
    }
    return NextResponse.next();
  }

  // =========================
  // ✅ 3. PROTECT ADMIN ROUTES
  // =========================
  if (pathname.startsWith('/dashboard/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL(ROUTES.login, request.url));
    }

    // Only admin and superadmin can access admin routes
    if (token.role !== 'admin' && token.role !== 'superadmin') {
      return NextResponse.redirect(new URL(ROUTES.dashboard, request.url));
    }

    return NextResponse.next();
  }

  // =========================
  // ✅ 4. PROTECT DASHBOARD
  // =========================
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL(ROUTES.login, request.url));
    }

    // ❗ DO NOT redirect based on role here
    // Role-based redirect is handled in /dashboard/page.tsx
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/api/:path*',
    '/blogs/:path*',
    '/dashboard/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ],
};
