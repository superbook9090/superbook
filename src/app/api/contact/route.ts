import { NextRequest } from 'next/server';
import { contactFormSchema } from '@/lib/validation';
import { logApiError, type LogContext } from '@/lib/logger';
import { jsonSuccess, jsonApiError } from '@/lib/server/api-response';
import { contactRateLimiter } from '@/lib/rateLimiter';
import { sendContactEmail, sendUserAutoReply } from '@/lib/email';

export async function POST(req: NextRequest) {
  const logContext: LogContext = { method: 'POST', path: '/api/contact' };

  try {
    // 1. IP extraction and Rate Limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const rateLimitCheck = contactRateLimiter.check(ip);
    
    if (!rateLimitCheck.allowed) {
      return jsonApiError(
        'RATE_LIMIT',
        'Too many contact requests from this address. Please wait a minute and try again.',
        429
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

    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'UTC',
      dateStyle: 'medium',
      timeStyle: 'medium',
    }) + ' UTC';

    // 4. Send support ticket alert to Admin inbox
    const mailResult = await sendContactEmail({
      name: sanitizedName,
      email: sanitizedEmail,
      subject: sanitizedSubject,
      message: sanitizedMessage,
      ipAddress: ip,
      timestamp,
    });

    // 5. Send polite confirmation auto-reply to the user (non-blocking background task)
    sendUserAutoReply({
      name: sanitizedName,
      email: sanitizedEmail,
      subject: sanitizedSubject,
      message: sanitizedMessage,
      ipAddress: ip,
      timestamp,
    }, mailResult.ticketId).catch((err) => {
      logApiError(err, 'sendUserAutoReply', '/api/contact', logContext);
    });

    // 6. Return Success Envelope with Ticket ID
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
