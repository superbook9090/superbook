// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import mongoose from 'mongoose';

const { mockFindOne } = vi.hoisted(() => ({
  mockFindOne: vi.fn(),
}));

vi.mock('@/models/Organization', () => ({
  default: {
    findOne: mockFindOne,
  },
}));

import {
  sanitizeRegistrationRole,
  resolveOrganizationInvite,
} from '../resolveInvite';
import { sanitizeHtml } from '@/lib/sanitize';

describe('sanitizeRegistrationRole', () => {
  it('allows student, teacher, and empty default to student', () => {
    expect(sanitizeRegistrationRole(undefined)).toBe('student');
    expect(sanitizeRegistrationRole(null)).toBe('student');
    expect(sanitizeRegistrationRole('')).toBe('student');
    expect(sanitizeRegistrationRole('student')).toBe('student');
    expect(sanitizeRegistrationRole('teacher')).toBe('teacher');
  });

  it('rejects admin, superadmin, and arbitrary role injection payloads', () => {
    expect(sanitizeRegistrationRole('admin')).toBeNull();
    expect(sanitizeRegistrationRole('superadmin')).toBeNull();
    expect(sanitizeRegistrationRole('SUPERADMIN')).toBeNull();
    expect(sanitizeRegistrationRole({ $ne: 'student' })).toBeNull();
  });
});

describe('resolveOrganizationInvite', () => {
  const orgId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function mockOrgLookup(org: Record<string, unknown> | null) {
    mockFindOne.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue(org),
      }),
    });
  }

  it('rejects student invite code when registering as teacher', async () => {
    mockOrgLookup({
      _id: orgId,
      name: 'Springdale',
      inviteCode: 'STU12345',
      teacherInviteCode: 'TCH-99999999',
    });

    const result = await resolveOrganizationInvite('STU12345', 'teacher');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(403);
    }
  });

  it('allows teacher registration only with matching teacherInviteCode (case-insensitive)', async () => {
    mockOrgLookup({
      _id: orgId,
      name: 'Springdale',
      inviteCode: 'STU12345',
      teacherInviteCode: 'TCH-99999999',
    });

    const result = await resolveOrganizationInvite('tch-99999999', 'teacher');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.inviteRole).toBe('teacher');
      expect(result.data.organization._id).toEqual(orgId);
    }
  });

  it('allows student registration with student inviteCode and returns inviteRole student', async () => {
    mockOrgLookup({
      _id: orgId,
      name: 'Springdale',
      inviteCode: 'STU12345',
      teacherInviteCode: 'TCH-99999999',
    });

    const result = await resolveOrganizationInvite('stu12345', 'student');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.inviteRole).toBe('student');
    }
  });

  it('rejects invalid or inactive organization codes', async () => {
    mockOrgLookup(null);
    const result = await resolveOrganizationInvite('INVALID', 'student');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
    }
  });
});

describe('sanitizeHtml hardening', () => {
  it('blocks javascript:, vbscript:, data:, and entity-encoded XSS vectors in links and images', () => {
    const dirty = [
      '<a href="&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;:alert(1)">click</a>',
      '<a href="  javascript:alert(2)">click2</a>',
      '<a href="vbscript:msgbox(1)">vb</a>',
      '<img src="data:text/html,<script>alert(1)</script>" style="background:url(javascript:alert(1))" alt=\'x" onerror="alert(1)\' />',
    ].join('');

    const clean = sanitizeHtml(dirty);
    expect(clean.toLowerCase()).not.toContain('javascript:');
    expect(clean.toLowerCase()).not.toContain('vbscript:');
    expect(clean.toLowerCase()).not.toContain('data:text/html');
    expect(clean.toLowerCase()).not.toContain('" onerror=');
    expect(clean).toContain('alt="x&quot; onerror=&quot;alert(1)"');
    expect(clean.toLowerCase()).not.toContain('style=');
  });
});
