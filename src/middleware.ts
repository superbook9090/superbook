// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { ROUTES } from '@/constants/routes';
import { authRateLimiter, generalRateLimiter, adminRateLimiter, publicBlogRateLimiter } from '@/lib/rateLimiter';
import { isMobileAppUserAgent, APP_STORAGE_KEY } from '@/lib/mobile/mobileDetection';

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

  if (
    pathname === '/blogs' ||
    pathname.startsWith('/blogs/') ||
    pathname === '/blog' ||
    pathname.startsWith('/blog/')
  ) {
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

    const userAgent = request.headers.get('user-agent') || '';
    const isWebviewParam =
      request.nextUrl.searchParams.get('webview') === 'true' ||
      request.nextUrl.searchParams.get('app') === 'true' ||
      request.nextUrl.searchParams.get('isApp') === 'true';
    const isWebParam =
      request.nextUrl.searchParams.get('web') === 'true' ||
      request.nextUrl.searchParams.get('app') === 'false';

    const isNativeApp = !isWebParam && (isWebviewParam || isMobileAppUserAgent(userAgent));

    if (isNativeApp) {
      const response = NextResponse.next();
      response.cookies.set(APP_STORAGE_KEY, 'true', {
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
        sameSite: 'lax',
      });
      return response;
    }

    // Clean up stale quizdo_is_app cookie if the browser is NOT in the native app
    if (request.cookies.has(APP_STORAGE_KEY)) {
      const response = NextResponse.next();
      response.cookies.delete(APP_STORAGE_KEY);
      return response;
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
      const loginUrl = new URL(ROUTES.login, request.url);
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
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
      const loginUrl = new URL(ROUTES.login, request.url);
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
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
    '/blog/:path*',
    '/dashboard/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ],
};
