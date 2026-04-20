// Reusable API middleware system
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { authRateLimiter, generalRateLimiter, adminRateLimiter } from '@/lib/rateLimiter';
import { logFailedRequest, type LogContext } from '@/lib/logger';

// Middleware context type
export interface MiddlewareContext {
  request: NextRequest;
  requestId: string;
  userId?: string;
  userRole?: string;
  ip?: string;
}

// Middleware handler type
export type MiddlewareHandler = (
  context: MiddlewareContext,
  next: () => Promise<NextResponse>
) => Promise<NextResponse | void>;

// Rate limit types
export type RateLimitType = 'auth' | 'general' | 'admin';

/**
 * Rate limiting middleware
 * Limits requests based on IP or user ID
 */
export function withRateLimit(limitType: RateLimitType = 'general') {
  return async function rateLimitMiddleware(
    context: MiddlewareContext,
    next: () => Promise<NextResponse>
  ): Promise<NextResponse | void> {
    const { request, requestId, userId, ip } = context;

    const identifier = userId || ip || 'unknown';
    const limiter =
      limitType === 'auth'
        ? authRateLimiter
        : limitType === 'admin'
        ? adminRateLimiter
        : generalRateLimiter;

    const result = limiter.check(identifier);

    if (!result.allowed) {
      const logContext: LogContext = {
        requestId,
        userId,
        ip,
        method: request.method,
        path: request.nextUrl.pathname,
      };

      return NextResponse.json(
        { message: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limitType === 'auth' ? '5' : limitType === 'admin' ? '30' : '60',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
            'X-Request-ID': requestId,
          },
        }
      );
    }

    // Add rate limit headers to response with try/catch to ensure headers are always applied
    try {
      const response = await next();
      response.headers.set('X-RateLimit-Limit', limitType === 'auth' ? '5' : limitType === 'admin' ? '30' : '60');
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
      return response;
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      return NextResponse.json(
        { message: 'Internal Server Error' },
        { status: 500, headers: { 'X-Request-ID': requestId } }
      );
    }
  };
}

/**
 * Authentication middleware
 * Requires user to be authenticated
 * Uses JWT token extraction for better performance
 */
export function withAuth() {
  return async function authMiddleware(
    context: MiddlewareContext,
    next: () => Promise<NextResponse>
  ): Promise<NextResponse | void> {
    const { requestId, request } = context;

    try {
      // Use JWT token extraction for better performance
      const token = await getToken({ req: request });

      if (!token?.id || !token?.role) {
        const logContext: LogContext = {
          requestId,
          method: request.method,
          path: request.nextUrl.pathname,
          ip: context.ip,
        };
        logFailedRequest(401, request.method, request.nextUrl.pathname, logContext);

        return NextResponse.json(
          { message: 'Unauthorized' },
          {
            status: 401,
            headers: { 'X-Request-ID': requestId },
          }
        );
      }

      // Safely mutate context with user info
      context.userId = token.id;
      context.userRole = token.role;
      return next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      const logContext: LogContext = {
        requestId,
        method: request.method,
        path: request.nextUrl.pathname,
        ip: context.ip,
      };
      logFailedRequest(500, request.method, request.nextUrl.pathname, logContext);

      return NextResponse.json(
        { message: 'Internal Server Error' },
        {
          status: 500,
          headers: { 'X-Request-ID': requestId },
        }
      );
    }
  };
}

/**
 * Error handling middleware
 * Catches and handles errors globally
 */
export function withErrorHandler() {
  return async function errorHandlerMiddleware(
    context: MiddlewareContext,
    next: () => Promise<NextResponse>
  ): Promise<NextResponse | void> {
    try {
      return await next();
    } catch (error) {
      console.error('API Error:', error);
      const { requestId } = context;

      return NextResponse.json(
        { message: 'Internal Server Error' },
        { status: 500, headers: { 'X-Request-ID': requestId } }
      );
    }
  };
}

/**
 * Role-based authorization middleware
 * Requires user to have specific role(s)
 */
export function withRole(allowedRoles: string[]) {
  return async function roleMiddleware(
    context: MiddlewareContext,
    next: () => Promise<NextResponse>
  ): Promise<NextResponse | void> {
    const { requestId, request, userRole } = context;

    if (!userRole || !allowedRoles.includes(userRole)) {
      const logContext: LogContext = {
        requestId,
        userId: context.userId,
        method: request.method,
        path: request.nextUrl.pathname,
        ip: context.ip,
      };
      logFailedRequest(403, request.method, request.nextUrl.pathname, logContext);

      return NextResponse.json(
        { message: 'Forbidden' },
        {
          status: 403,
          headers: { 'X-Request-ID': requestId },
        }
      );
    }

    return next();
  };
}

/**
 * Caching middleware
 * Adds cache headers to responses
 * Prevents caching for non-GET requests
 */
export function withCache(maxAge: number = 300, staleWhileRevalidate: number = 600) {
  return async function cacheMiddleware(
    context: MiddlewareContext,
    next: () => Promise<NextResponse>
  ): Promise<NextResponse | void> {
    // Prevent caching for non-GET requests
    if (context.request.method !== 'GET') {
      const response = await next();
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      return response;
    }

    const response = await next();
    response.headers.set(
      'Cache-Control',
      `public, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`
    );
    return response;
  };
}

/**
 * Method guard middleware
 * Prevents invalid HTTP methods
 */
export function withMethods(methods: string[]) {
  return async function methodGuardMiddleware(
    context: MiddlewareContext,
    next: () => Promise<NextResponse>
  ): Promise<NextResponse | void> {
    if (!methods.includes(context.request.method)) {
      const { requestId } = context;

      return NextResponse.json(
        { message: 'Method Not Allowed' },
        { status: 405, headers: { 'X-Request-ID': requestId } }
      );
    }

    return next();
  };
}

/**
 * Private caching middleware (for authenticated content)
 */
export function withPrivateCache(maxAge: number = 60, staleWhileRevalidate: number = 120) {
  return async function privateCacheMiddleware(
    context: MiddlewareContext,
    next: () => Promise<NextResponse>
  ): Promise<NextResponse | void> {
    const response = await next();
    response.headers.set(
      'Cache-Control',
      `private, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`
    );
    return response;
  };
}

/**
 * Security headers middleware
 * Adds security headers to prevent XSS, clickjacking, etc.
 */
export function withSecurityHeaders() {
  return async function securityHeadersMiddleware(
    context: MiddlewareContext,
    next: () => Promise<NextResponse>
  ): Promise<NextResponse | void> {
    const response = await next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    return response;
  };
}

/**
 * Compose multiple middleware functions
 * Executes middleware in order (left to right)
 * Ensures each middleware runs exactly once
 */
export function composeMiddleware(...middlewares: MiddlewareHandler[]) {
  return async function composedMiddleware(
    context: MiddlewareContext,
    handler: () => Promise<NextResponse>
  ): Promise<NextResponse> {
    let index = 0;
    let hasExecuted = false;

    async function dispatch(): Promise<NextResponse> {
      if (hasExecuted) {
        throw new Error('Middleware chain already executed - cannot call dispatch() multiple times');
      }

      if (index >= middlewares.length) {
        hasExecuted = true;
        return handler();
      }

      const middleware = middlewares[index++];
      const result = await middleware(context, dispatch);

      if (result instanceof NextResponse) {
        hasExecuted = true;
        return result;
      }

      return dispatch();
    }

    return dispatch();
  };
}

/**
 * Helper to create middleware context from request
 */
export function createMiddlewareContext(request: NextRequest): MiddlewareContext {
  const requestId = request.headers.get('X-Request-ID') || generateUUID();
  const ip =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';

  return {
    request,
    requestId,
    ip,
  };
}

/**
 * Generate UUID (edge runtime compatible)
 * Uses crypto.randomUUID() when available, falls back to custom implementation
 */
function generateUUID(): string {
  // Use crypto.randomUUID() if available (Node.js 15.6.0+, modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Apply middleware to an API route handler
 */
export function withMiddleware(
  handler: (context: MiddlewareContext) => Promise<NextResponse>,
  ...middlewares: MiddlewareHandler[]
) {
  return async function middlewareHandler(request: NextRequest): Promise<NextResponse> {
    const context = createMiddlewareContext(request);

    const composed = composeMiddleware(...middlewares);
    const wrappedHandler = () => handler(context);

    return composed(context, wrappedHandler);
  };
}
