// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { authRateLimiter, generalRateLimiter, adminRateLimiter } from '@/lib/rateLimiter';

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
    let limitType;

    if (pathname.startsWith('/api/auth/')) {
      limiter = authRateLimiter;
      limitType = 'auth';
    } else if (pathname.startsWith('/api/admin/')) {
      limiter = adminRateLimiter;
      limitType = 'admin';
    } else {
      limiter = generalRateLimiter;
      limitType = 'general';
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

  // =========================
  // ✅ 2. BLOCK AUTHENTICATED USERS FROM LOGIN/REGISTER
  // =========================
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    if (token?.id) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // =========================
  // ✅ 3. PROTECT DASHBOARD
  // =========================
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // ❗ DO NOT redirect based on role here
    // Role-based redirect is handled in /dashboard/page.tsx
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/login',
    '/register',
  ],
};