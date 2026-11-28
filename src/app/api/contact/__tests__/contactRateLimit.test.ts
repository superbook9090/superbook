// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const { mockCheckRedisRateLimit, mockSendContactEmail, mockSendUserAutoReply } = vi.hoisted(() => ({
  mockCheckRedisRateLimit: vi.fn(),
  mockSendContactEmail: vi.fn(),
  mockSendUserAutoReply: vi.fn(),
}));

vi.mock('@/lib/redis', () => ({
  checkRedisRateLimit: (...args: unknown[]) => mockCheckRedisRateLimit(...args),
}));
vi.mock('@/lib/email', () => ({
  sendContactEmail: (...args: unknown[]) => mockSendContactEmail(...args),
  sendUserAutoReply: (...args: unknown[]) => mockSendUserAutoReply(...args),
}));
vi.mock('@/lib/logger', () => ({
  logApiError: vi.fn(),
}));

import { POST } from '../route';

function makeContactRequest(ip: string, email: string) {
  return new NextRequest('http://localhost/api/contact', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-vercel-forwarded-for': ip,
    },
    body: JSON.stringify({
      name: 'Rajesh Sharma',
      email,
      subject: '[Organization Request] Springdale',
      message: 'We would like to set up an organization workspace for 300 students.',
    }),
  });
}

describe('POST /api/contact rate limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckRedisRateLimit.mockResolvedValue(null); // Exercise local fallback by default
    mockSendContactEmail.mockResolvedValue({ ticketId: 'TKT-123' });
    mockSendUserAutoReply.mockResolvedValue(undefined);
  });

  it('blocks the 4th request from the same IP within 10 minutes with 429 and Retry-After', async () => {
    const ip = '203.0.113.10';
    for (let i = 1; i <= 3; i++) {
      const res = await POST(makeContactRequest(ip, `user${i}@example.com`));
      expect(res.status).toBe(201);
    }

    const blocked = await POST(makeContactRequest(ip, 'user4@example.com'));
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get('Retry-After'))).toBeGreaterThan(0);
    expect(mockSendContactEmail).toHaveBeenCalledTimes(3);
  });

  it('blocks more than 3 requests per hour targeting the same email across different IPs', async () => {
    const targetEmail = 'victim@institute.edu';
    for (let i = 1; i <= 3; i++) {
      const res = await POST(makeContactRequest(`198.51.100.${i}`, targetEmail));
      expect(res.status).toBe(201);
    }

    const blocked = await POST(makeContactRequest('198.51.100.99', targetEmail));
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get('Retry-After'))).toBeGreaterThan(0);
    expect(mockSendContactEmail).toHaveBeenCalledTimes(3);
  });

  it('honors distributed Redis rate limit when Redis denies the request', async () => {
    mockCheckRedisRateLimit.mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 420,
    });

    const res = await POST(makeContactRequest('192.0.2.55', 'fresh@example.com'));
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('420');
    expect(mockSendContactEmail).not.toHaveBeenCalled();
  });
});
