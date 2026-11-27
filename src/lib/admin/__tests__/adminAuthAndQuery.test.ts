// @vitest-environment node
import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import type { Session } from 'next-auth';
import { checkAdmin } from '../adminAuth';
import { buildAdminUsersQuery } from '../userQuery';

const makeSession = (overrides: Partial<Session['user']>): Session =>
  ({
    expires: '2099-01-01T00:00:00.000Z',
    user: {
      id: '65f000000000000000000010',
      email: 'user@example.com',
      name: 'Test User',
      role: 'student',
      organizationId: null,
      ...overrides,
    },
  }) as Session;

describe('adminAuth & admin user query scoping', () => {
  describe('checkAdmin', () => {
    it('denies null session', () => {
      expect(checkAdmin(null)).toEqual({ authorized: false, reason: 'No session' });
    });

    it('denies student, teacher, and unknown roles', () => {
      expect(checkAdmin(makeSession({ role: 'student' })).authorized).toBe(false);
      expect(checkAdmin(makeSession({ role: 'teacher' })).authorized).toBe(false);
      expect(checkAdmin(makeSession({ role: 'guest' })).authorized).toBe(false);
    });

    it('authorizes org admin with isSuperAdmin=false and organizationId', () => {
      const orgId = '65f000000000000000000001';
      const result = checkAdmin(makeSession({ role: 'admin', organizationId: orgId }));
      expect(result).toMatchObject({
        authorized: true,
        role: 'admin',
        organizationId: orgId,
        isSuperAdmin: false,
      });
    });

    it('authorizes superadmin with isSuperAdmin=true', () => {
      const result = checkAdmin(makeSession({ role: 'superadmin' }));
      expect(result).toMatchObject({
        authorized: true,
        role: 'superadmin',
        isSuperAdmin: true,
      });
    });
  });

  describe('buildAdminUsersQuery', () => {
    const orgId = '65f000000000000000000001';
    const otherOrgId = '65f000000000000000000002';

    it('locks org admin strictly to their own organization even if another organizationIdParam is supplied', () => {
      const auth = checkAdmin(makeSession({ role: 'admin', organizationId: orgId }));
      const { query, orgFilter } = buildAdminUsersQuery(auth, {
        organizationIdParam: otherOrgId,
        role: 'teacher',
      });

      expect(orgFilter).toEqual({ organizationId: new mongoose.Types.ObjectId(orgId) });
      expect(query).toEqual({
        $and: [{ organizationId: new mongoose.Types.ObjectId(orgId) }, { role: 'teacher' }],
      });
    });

    it('throws when org admin has missing or invalid organizationId (never falls back to null)', () => {
      const auth = checkAdmin(makeSession({ role: 'admin', organizationId: null }));
      expect(() =>
        buildAdminUsersQuery(auth, {
          organizationIdParam: otherOrgId,
        })
      ).toThrow(/valid organization/i);
    });

    it('allows superadmin to view all organizations by default', () => {
      const auth = checkAdmin(makeSession({ role: 'superadmin' }));
      const { query, orgFilter } = buildAdminUsersQuery(auth, { organizationIdParam: 'all' });
      expect(orgFilter).toEqual({});
      expect(query).toEqual({});
    });

    it('allows superadmin to filter by specific organization or unassigned users', () => {
      const auth = checkAdmin(makeSession({ role: 'superadmin' }));

      const byOrg = buildAdminUsersQuery(auth, { organizationIdParam: otherOrgId });
      expect(byOrg.orgFilter).toEqual({
        organizationId: new mongoose.Types.ObjectId(otherOrgId),
      });

      const unassigned = buildAdminUsersQuery(auth, { organizationIdParam: 'none' });
      expect(unassigned.orgFilter).toEqual({ organizationId: null });
    });

    it('combines status, platform, and role filters while preserving org isolation', () => {
      const auth = checkAdmin(makeSession({ role: 'admin', organizationId: orgId }));
      const { query } = buildAdminUsersQuery(auth, {
        role: 'student',
        status: 'suspended',
        platform: 'app',
      });

      expect(query).toEqual({
        $and: [
          { organizationId: new mongoose.Types.ObjectId(orgId) },
          { role: 'student' },
          { isSuspended: true },
          { lastPlatform: { $in: ['android', 'ios'] } },
        ],
      });
    });
  });
});
