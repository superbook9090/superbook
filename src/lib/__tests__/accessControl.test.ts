import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import { getAccessFilter, validateContentAccess, type AccessUser } from '../accessControl';

describe('accessControl', () => {
  const superadmin: AccessUser = {
    _id: new mongoose.Types.ObjectId(),
    role: 'superadmin',
  };

  const orgAdmin: AccessUser = {
    _id: new mongoose.Types.ObjectId(),
    role: 'admin',
    organizationId: new mongoose.Types.ObjectId(),
  };

  const sysAdmin: AccessUser = {
    _id: new mongoose.Types.ObjectId(),
    role: 'admin',
    organizationId: null,
  };

  const orgStudent: AccessUser = {
    _id: new mongoose.Types.ObjectId(),
    role: 'student',
    organizationId: orgAdmin.organizationId,
  };

  const publicStudent: AccessUser = {
    _id: new mongoose.Types.ObjectId(),
    role: 'student',
    organizationId: null,
  };

  describe('getAccessFilter', () => {
    it('returns empty filter for superadmin', () => {
      expect(getAccessFilter(superadmin)).toEqual({});
    });

    it('returns org filter for org admin', () => {
      expect(getAccessFilter(orgAdmin)).toEqual({
        organizationId: orgAdmin.organizationId,
      });
    });

    it('returns null org filter for sys admin', () => {
      const filter = getAccessFilter(sysAdmin);
      expect(filter).toHaveProperty('$or');
      expect((filter as { $or: unknown[] }).$or).toHaveLength(2);
    });

    it('returns org or public filter for org student', () => {
      const filter = getAccessFilter(orgStudent);
      expect(filter).toHaveProperty('$or');
      expect((filter as { $or: unknown[] }).$or).toContainEqual({ organizationId: orgStudent.organizationId });
    });

    it('returns public filter for public student', () => {
      const filter = getAccessFilter(publicStudent);
      expect(filter).toHaveProperty('$or');
      expect((filter as { $or: unknown[] }).$or[0]).toEqual({ organizationId: null });
    });
  });

  describe('validateContentAccess', () => {
    const orgId = orgAdmin.organizationId!;
    const otherOrgId = new mongoose.Types.ObjectId();

    it('allows superadmin to access anything', () => {
      expect(() => validateContentAccess(orgId, superadmin)).not.toThrow();
      expect(() => validateContentAccess(null, superadmin)).not.toThrow();
    });

    it('allows access to public content (no org ID)', () => {
      expect(() => validateContentAccess(null, orgStudent)).not.toThrow();
      expect(() => validateContentAccess(null, publicStudent)).not.toThrow();
    });

    it('allows access if user org matches content org', () => {
      expect(() => validateContentAccess(orgId, orgStudent)).not.toThrow();
      expect(() => validateContentAccess(orgId, orgAdmin)).not.toThrow();
    });

    it('denies access if user org differs from content org', () => {
      expect(() => validateContentAccess(otherOrgId, orgStudent)).toThrow(/permission to access/);
    });

    it('denies access to org content for public users', () => {
      expect(() => validateContentAccess(orgId, publicStudent)).toThrow(/permission to access/);
    });
  });
});
