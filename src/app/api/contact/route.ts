import { NextRequest } from 'next/server';
import { contactFormSchema } from '@/lib/validation';
import { logApiError, type LogContext } from '@/lib/logger';
import { jsonSuccess, jsonApiError } from '@/lib/server/api-response';
import {
  contactRateLimiter,
  contactHourlyIpLimiter,
  contactEmailLimiter,
  getRequestIp,
} from '@/lib/rateLimiter';
import { checkRedisRateLimit } from '@/lib/redis';
import { sendContactEmail, sendUserAutoReply } from '@/lib/email';

const CONTACT_BURST_MAX = 3;
const CONTACT_BURST_WINDOW_SEC = 10 * 60; // 10 minutes
const CONTACT_HOURLY_IP_MAX = 10;
const CONTACT_HOURLY_EMAIL_MAX = 3;
const CONTACT_HOURLY_WINDOW_SEC = 60 * 60; // 1 hour

async function enforceLimit(
  redisKey: string,
  maxRequests: number,
  windowSeconds: number,
  fallbackLimiter: { check: (id: string) => { allowed: boolean; resetTime: number } },
  fallbackId: string
): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const redisResult = await checkRedisRateLimit(redisKey, maxRequests, windowSeconds);
  if (redisResult) {
    return {
      allowed: redisResult.allowed,
      retryAfterSeconds: redisResult.retryAfterSeconds,
    };
  }
  const local = fallbackLimiter.check(fallbackId);
  return {
    allowed: local.allowed,
    retryAfterSeconds: Math.max(1, Math.ceil((local.resetTime - Date.now()) / 1000)),
  };
}

function rateLimitResponse(message: string, retryAfterSeconds: number) {
  const res = jsonApiError('RATE_LIMIT', message, 429);
  res.headers.set('Retry-After', String(retryAfterSeconds));
  return res;
}

export async function POST(req: NextRequest) {
  const logContext: LogContext = { method: 'POST', path: '/api/contact' };

  try {
    // 1. Trusted IP extraction + distributed burst & hourly rate limiting
    const ip = getRequestIp(req);

    const burstCheck = await enforceLimit(
      `rl:contact:ip10m:${ip}`,
      CONTACT_BURST_MAX,
      CONTACT_BURST_WINDOW_SEC,
      contactRateLimiter,
      ip
    );
    if (!burstCheck.allowed) {
      return rateLimitResponse(
        'Too many contact requests from this address. Please wait a few minutes and try again.',
        burstCheck.retryAfterSeconds
      );
    }

    const hourlyIpCheck = await enforceLimit(
      `rl:contact:ip1h:${ip}`,
      CONTACT_HOURLY_IP_MAX,
      CONTACT_HOURLY_WINDOW_SEC,
      contactHourlyIpLimiter,
      ip
    );
    if (!hourlyIpCheck.allowed) {
      return rateLimitResponse(
        'Hourly contact request limit reached. Please try again later.',
        hourlyIpCheck.retryAfterSeconds
      );
    }

    const body = await req.json();

    // 2. Zod Validation
    const validationResult = contactFormSchema.safeParse(body);
    if (!validationResult.success) {
      return jsonApiError('VALIDATION', 'Invalid form data provided', 400);
    }

    const { name, email, subject, message } = validationResult.data;

    // 3. Input Sanitization (strip < and > to prevent basic HTML/XSS injections)
    const sanitizedName = name.replace(/[<>]/g, '').trim().substring(0, 100);
    const sanitizedEmail = email.trim().toLowerCase().substring(0, 100);
    const sanitizedSubject = subject.replace(/[<>]/g, '').trim().substring(0, 150);
    const sanitizedMessage = message.replace(/[<>]/g, '').trim().substring(0, 2000);

    // Double-check basic constraints after sanitization
    if (!sanitizedName || !sanitizedEmail || !sanitizedSubject || !sanitizedMessage) {
      return jsonApiError('VALIDATION', 'Sanitized form inputs cannot be empty', 400);
    }

    // 4. Per-email rate limit (prevents auto-reply mail bombing to a single recipient)
    const emailCheck = await enforceLimit(
      `rl:contact:email1h:${sanitizedEmail}`,
      CONTACT_HOURLY_EMAIL_MAX,
      CONTACT_HOURLY_WINDOW_SEC,
      contactEmailLimiter,
      sanitizedEmail
    );
    if (!emailCheck.allowed) {
      return rateLimitResponse(
        'Too many requests submitted for this email address. Please try again later.',
        emailCheck.retryAfterSeconds
      );
    }

    const timestamp =
      new Date().toLocaleString('en-US', {
        timeZone: 'UTC',
        dateStyle: 'medium',
        timeStyle: 'medium',
      }) + ' UTC';

    // 5. Send support ticket alert to Admin inbox
    const mailResult = await sendContactEmail({
      name: sanitizedName,
      email: sanitizedEmail,
      subject: sanitizedSubject,
      message: sanitizedMessage,
      ipAddress: ip,
      timestamp,
    });

    // 6. Send polite confirmation auto-reply to the user (non-blocking background task)
    sendUserAutoReply(
      {
        name: sanitizedName,
        email: sanitizedEmail,
        subject: sanitizedSubject,
        message: sanitizedMessage,
        ipAddress: ip,
        timestamp,
      },
      mailResult.ticketId
    ).catch((err) => {
      logApiError(err, 'sendUserAutoReply', '/api/contact', logContext);
    });

    // 7. Return Success Envelope with Ticket ID
    return jsonSuccess({ ticketId: mailResult.ticketId }, { status: 201 });
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/contact', logContext);
    return jsonApiError(
      'INTERNAL',
      'Failed to process contact inquiry. Please verify your internet and try again.',
      500
    );
  }
}
