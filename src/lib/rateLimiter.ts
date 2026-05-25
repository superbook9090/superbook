// Rate limiter utility for API requests
interface RateLimitStore {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitStore> = new Map();

  constructor(private windowMs: number, private maxRequests: number) {}

  // Check if request should be rate limited
  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const record = this.store.get(identifier);

    if (!record || now > record.resetTime) {
      // Create new record or reset expired one
      const resetTime = now + this.windowMs;
      this.store.set(identifier, {
        count: 1,
        resetTime,
      });
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime,
      };
    }

    // Increment count
    record.count++;
    this.store.set(identifier, record);

    const remaining = Math.max(0, this.maxRequests - record.count);

    if (record.count > this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
      };
    }

    return {
      allowed: true,
      remaining,
      resetTime: record.resetTime,
    };
  }

  // Clean up expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (now > value.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

// Create rate limiters for different route types
export const authRateLimiter = new RateLimiter(60 * 1000, 5); // 5 requests per minute
export const generalRateLimiter = new RateLimiter(60 * 1000, 60); // 60 requests per minute
export const adminRateLimiter = new RateLimiter(60 * 1000, 30); // 30 requests per minute
export const contactRateLimiter = new RateLimiter(60 * 1000, 3); // 3 requests per minute

/** Forgot-password: 3 requests per 15 minutes per IP */
export const forgotPasswordIpLimiter = new RateLimiter(15 * 60 * 1000, 3);

/** Forgot-password: 3 requests per hour per email address */
export const forgotPasswordEmailLimiter = new RateLimiter(60 * 60 * 1000, 3);

/** Reset-password (token submit): 10 attempts per 15 minutes per IP */
export const resetPasswordIpLimiter = new RateLimiter(15 * 60 * 1000, 10);

/** Change-password while logged in: 5 attempts per hour per user */
export const changePasswordLimiter = new RateLimiter(60 * 60 * 1000, 5);

/** Course-code enrollment attempts: 10 per 15 minutes per user/IP */
export const courseCodeAttemptLimiter = new RateLimiter(15 * 60 * 1000, 10);

// Cleanup expired entries every minute
setInterval(() => {
  authRateLimiter.cleanup();
  generalRateLimiter.cleanup();
  adminRateLimiter.cleanup();
  contactRateLimiter.cleanup();
  forgotPasswordIpLimiter.cleanup();
  forgotPasswordEmailLimiter.cleanup();
  resetPasswordIpLimiter.cleanup();
  changePasswordLimiter.cleanup();
  courseCodeAttemptLimiter.cleanup();
}, 60 * 1000);

export function getRequestIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }
  return req.headers.get('x-real-ip') || 'unknown';
}

export function rateLimitExceededMessage(): string {
  return 'Too many requests. Please try again later.';
}
