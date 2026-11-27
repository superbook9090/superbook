// @vitest-environment node
import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import {
  getAccessFilter,
  validateContentAccess,
  canManageOrgContent,
  type AccessUser,
} from '../accessControl';

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

  describe('canManageOrgContent', () => {
    const orgId = orgAdmin.organizationId!;
    const otherOrgId = new mongoose.Types.ObjectId();
    const otherAuthorId = new mongoose.Types.ObjectId();

    it('allows superadmin to manage any content', () => {
      expect(canManageOrgContent(null, otherAuthorId, superadmin)).toBe(true);
      expect(canManageOrgContent(orgId, otherAuthorId, superadmin)).toBe(true);
      expect(canManageOrgContent(otherOrgId, otherAuthorId, superadmin)).toBe(true);
    });

    it('allows org admin to manage content belonging to their own organization', () => {
      expect(canManageOrgContent(orgId, otherAuthorId, orgAdmin)).toBe(true);
    });

    it('denies org admin from managing public/platform content authored by others', () => {
      expect(canManageOrgContent(null, otherAuthorId, orgAdmin)).toBe(false);
    });

    it('denies org admin from managing another organization content', () => {
      expect(canManageOrgContent(otherOrgId, otherAuthorId, orgAdmin)).toBe(false);
    });

    it('denies admin without an organization from managing public content authored by others', () => {
      expect(canManageOrgContent(null, otherAuthorId, sysAdmin)).toBe(false);
    });

    it('allows any user to manage content they authored themselves', () => {
      expect(canManageOrgContent(null, orgAdmin._id, orgAdmin)).toBe(true);
      expect(canManageOrgContent(null, publicStudent._id, publicStudent)).toBe(true);
    });

    it('denies teacher from managing same-org or public content authored by another user', () => {
      const orgTeacher: AccessUser = {
        _id: new mongoose.Types.ObjectId(),
        role: 'teacher',
        organizationId: orgId,
      };
      expect(canManageOrgContent(orgId, otherAuthorId, orgTeacher)).toBe(false);
      expect(canManageOrgContent(null, otherAuthorId, orgTeacher)).toBe(false);
      expect(canManageOrgContent(orgId, orgTeacher._id, orgTeacher)).toBe(true);
    });

    it('handles string IDs identically to ObjectIds', () => {
      expect(canManageOrgContent(orgId.toString(), otherAuthorId.toString(), orgAdmin)).toBe(true);
      expect(canManageOrgContent(otherOrgId.toString(), otherAuthorId.toString(), orgAdmin)).toBe(
        false
      );
      expect(canManageOrgContent(null, orgAdmin._id.toString(), orgAdmin)).toBe(true);
    });
  });
});
