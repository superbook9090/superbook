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

    if (pathname.startsWith('/api/auth/')) {
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
  // ✅ 3. PROTECT ADMIN ROUTES
  // =========================
  if (pathname.startsWith('/dashboard/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Only admin and superadmin can access admin routes
    if (token.role !== 'admin' && token.role !== 'superadmin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  }

  // =========================
  // ✅ 4. PROTECT DASHBOARD
  // =========================
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // ❗ DO NOT redirect based on role here
    // Role-based redirect is handled in /dashboard/page.tsx
    return NextResponse.next();
  }

  // =========================
  // ✅ 5. PROTECT PAID COURSE CONTENT
  // =========================
  const courseContentPaths = [
    '/api/lessons/',
    '/api/quizzes/',
    '/api/progress/',
    '/courses/learn/',
    '/api/courses/learn/'
  ];

  const isCourseContentPath = courseContentPaths.some(path => 
    pathname.includes(path)
  );

  if (isCourseContentPath && token) {
    // Extract course ID from URL
    const courseIdMatch = pathname.match(/\/courses\/learn\/([^\/]+)/);
    const apiCourseIdMatch = pathname.match(/(?:lessons|quizzes|progress).*courseId=([^&]+)/);
    
    const courseId = courseIdMatch?.[1] || apiCourseIdMatch?.[1];
    
    if (courseId) {
      try {
        // Verify enrollment by checking payment status
        const enrollmentResponse = await fetch(
          `${request.nextUrl.origin}/api/enrollments/verify/${courseId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!enrollmentResponse.ok) {
          // User is not enrolled
          if (pathname.startsWith('/api/')) {
            return NextResponse.json(
              { error: 'Course enrollment required' },
              { status: 403 }
            );
          }
          
          // Redirect to course page for purchase
          const courseUrl = new URL(`/courses/${courseId}`, request.url);
          return NextResponse.redirect(courseUrl);
        }
      } catch (error) {
        console.error('Enrollment verification error:', error);
        // Allow request to proceed if verification fails
        // The individual API routes will handle the verification
      }
    }
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