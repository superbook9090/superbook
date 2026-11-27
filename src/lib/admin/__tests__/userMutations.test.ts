// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { validateUserUpdate, validateUserDeletion } from '../userMutations';
import type { AdminAuthResult } from '../adminAuth';
import type { OrganizationPolicy } from '../orgPolicy';

describe('userMutations permission & access controls', () => {
  const orgId = '65f000000000000000000001';
  const otherOrgId = '65f000000000000000000002';

  const superAdminAuth: AdminAuthResult = {
    authorized: true,
    role: 'superadmin',
    userId: 'super-1',
    isSuperAdmin: true,
  };

  const orgAdminAuth: AdminAuthResult = {
    authorized: true,
    role: 'admin',
    userId: 'admin-1',
    organizationId: orgId,
    isSuperAdmin: false,
  };

  const unassignedAdminAuth: AdminAuthResult = {
    authorized: true,
    role: 'admin',
    userId: 'admin-no-org',
    organizationId: null,
    isSuperAdmin: false,
  };

  const teacherInOrg = {
    _id: 'teacher-1',
    role: 'teacher',
    organizationId: orgId,
    limits: { courses: 5, blogs: 8 },
  };

  const studentInOrg = {
    _id: 'student-1',
    role: 'student',
    organizationId: orgId,
  };

  const adminInOrg = {
    _id: 'admin-2',
    role: 'admin',
    organizationId: orgId,
  };

  const superAdminTarget = {
    _id: 'super-2',
    role: 'superadmin',
    organizationId: null,
  };

  const orgPolicyWithVideoAndCourseCap: OrganizationPolicy = {
    permissions: {
      canUploadVideos: true,
      canCreatePublicCourses: false,
      canCreateContests: false,
      canGenerateAiQuizzes: false,
    },
    teacherLimits: {
      courses: 20,
      quizzes: 30,
      aiQuizGenerations: 15,
      aiQuizMaxQuestions: 20,
    },
  };

  describe('validateUserUpdate', () => {
    it('allows superadmin to toggle any feature and set any valid limit without org policy', () => {
      const res = validateUserUpdate(
        teacherInOrg,
        {
          canUploadVideos: true,
          canCreatePublicCourses: true,
          canCreateContests: true,
          canGenerateAiQuizzes: true,
          limits: {
            courses: 100,
            quizzes: 200,
            blogs: 50,
            aiQuizGenerations: 50,
            aiQuizMaxQuestions: 50,
          },
        },
        'super-1',
        superAdminAuth,
        null
      );
      expect(res.error).toBeUndefined();
    });

    it('blocks org admin from updating users in another organization or without an organization', () => {
      const crossOrg = validateUserUpdate(
        { ...teacherInOrg, organizationId: otherOrgId },
        { canUploadVideos: true },
        'admin-1',
        orgAdminAuth,
        orgPolicyWithVideoAndCourseCap
      );
      expect(crossOrg.status).toBe(403);

      const publicUser = validateUserUpdate(
        { ...teacherInOrg, organizationId: null },
        { canUploadVideos: true },
        'admin-1',
        orgAdminAuth,
        orgPolicyWithVideoAndCourseCap
      );
      expect(publicUser.status).toBe(403);

      const noOrgAdmin = validateUserUpdate(
        { ...teacherInOrg, organizationId: null },
        { role: 'student' },
        'admin-no-org',
        unassignedAdminAuth,
        null
      );
      expect(noOrgAdmin.status).toBe(403);
    });

    it('prevents self-demotion and self-suspension', () => {
      const selfDemote = validateUserUpdate(
        { _id: 'admin-1', role: 'admin', organizationId: orgId },
        { role: 'teacher' },
        'admin-1',
        orgAdminAuth,
        orgPolicyWithVideoAndCourseCap
      );
      expect(selfDemote.status).toBe(400);

      const selfSuspend = validateUserUpdate(
        { _id: 'admin-1', role: 'admin', organizationId: orgId },
        { isSuspended: true },
        'admin-1',
        orgAdminAuth,
        orgPolicyWithVideoAndCourseCap
      );
      expect(selfSuspend.status).toBe(400);
    });

    it('prevents org admin from promoting to superadmin or modifying any admin/superadmin account', () => {
      const promoteSuper = validateUserUpdate(
        teacherInOrg,
        { role: 'superadmin' },
        'admin-1',
        orgAdminAuth,
        orgPolicyWithVideoAndCourseCap
      );
      expect(promoteSuper.status).toBe(403);

      const suspendAdmin = validateUserUpdate(
        adminInOrg,
        { isSuspended: true },
        'admin-1',
        orgAdminAuth,
        orgPolicyWithVideoAndCourseCap
      );
      expect(suspendAdmin.status).toBe(403);

      const demoteAdmin = validateUserUpdate(
        adminInOrg,
        { role: 'student' },
        'admin-1',
        orgAdminAuth,
        orgPolicyWithVideoAndCourseCap
      );
      expect(demoteAdmin.status).toBe(403);

      const modifySuper = validateUserUpdate(
        { ...superAdminTarget, organizationId: orgId },
        { canUploadVideos: false },
        'admin-1',
        orgAdminAuth,
        orgPolicyWithVideoAndCourseCap
      );
      expect(modifySuper.status).toBe(403);
    });

    it('rejects mass assignment of disallowed fields and operator/dot keys with 400', () => {
      expect(
        validateUserUpdate(
          teacherInOrg,
          { password: 'hacked', email: 'evil@example.com' },
          'super-1',
          superAdminAuth,
          null
        ).status
      ).toBe(400);

      expect(
        validateUserUpdate(
          teacherInOrg,
          { '$set': { role: 'superadmin' } },
          'admin-1',
          orgAdminAuth,
          orgPolicyWithVideoAndCourseCap
        ).status
      ).toBe(400);

      expect(
        validateUserUpdate(
          teacherInOrg,
          { 'limits.courses': 999 },
          'admin-1',
          orgAdminAuth,
          orgPolicyWithVideoAndCourseCap
        ).status
      ).toBe(400);

      expect(
        validateUserUpdate(
          teacherInOrg,
          { organizationId: otherOrgId },
          'admin-1',
          orgAdminAuth,
          orgPolicyWithVideoAndCourseCap
        ).status
      ).toBe(400);

      expect(
        validateUserUpdate(
          teacherInOrg,
          { name: 'Renamed By Org Admin' },
          'admin-1',
          orgAdminAuth,
          orgPolicyWithVideoAndCourseCap
        ).status
      ).toBe(400);

      const superUpdate = validateUserUpdate(
        teacherInOrg,
        { name: 'Valid Name', organizationId: otherOrgId },
        'super-1',
        superAdminAuth,
        null
      );
      expect(superUpdate.error).toBeUndefined();
      expect(superUpdate.sanitizedUpdates).toEqual({
        name: 'Valid Name',
        organizationId: otherOrgId,
      });
    });

    it('allows superadmin to suspend another admin', () => {
      const res = validateUserUpdate(
        adminInOrg,
        { isSuspended: true },
        'super-1',
        superAdminAuth,
        null
      );
      expect(res.error).toBeUndefined();
    });

    it('allows org admin to toggle video upload on/off when superadmin granted it to the org', () => {
      expect(
        validateUserUpdate(
          teacherInOrg,
          { canUploadVideos: true },
          'admin-1',
          orgAdminAuth,
          orgPolicyWithVideoAndCourseCap
        ).error
      ).toBeUndefined();

      expect(
        validateUserUpdate(
          teacherInOrg,
          { canUploadVideos: false },
          'admin-1',
          orgAdminAuth,
          orgPolicyWithVideoAndCourseCap
        ).error
      ).toBeUndefined();
    });

    it('blocks org admin from toggling permissions not granted to their org', () => {
      for (const key of ['canCreatePublicCourses', 'canCreateContests', 'canGenerateAiQuizzes'] as const) {
        const res = validateUserUpdate(
          teacherInOrg,
          { [key]: true },
          'admin-1',
          orgAdminAuth,
          orgPolicyWithVideoAndCourseCap
        );
        expect(res.status).toBe(403);
        expect(res.error).toMatch(/Super admin has not enabled/);
      }
    });

    it('blocks org admin from toggling video upload when org has no permissions granted', () => {
      const res = validateUserUpdate(
        teacherInOrg,
        { canUploadVideos: true },
        'admin-1',
        orgAdminAuth,
        { permissions: {}, teacherLimits: {} }
      );
      expect(res.status).toBe(403);
    });

    it('rejects non-boolean feature toggle payloads', () => {
      const res = validateUserUpdate(
        teacherInOrg,
        { canUploadVideos: 'yes' },
        'super-1',
        superAdminAuth,
        null
      );
      expect(res.status).toBe(400);
    });

    it('allows org admin to assign teacher limits within superadmin-granted org quota', () => {
      const res = validateUserUpdate(
        teacherInOrg,
        { limits: { courses: 20, quizzes: 25, aiQuizGenerations: 15, aiQuizMaxQuestions: 20 } },
        'admin-1',
        orgAdminAuth,
        orgPolicyWithVideoAndCourseCap
      );
      expect(res.error).toBeUndefined();
    });

    it('blocks org admin from exceeding the superadmin-granted org quota ceiling on any field', () => {
      const overCourses = validateUserUpdate(
        teacherInOrg,
        { limits: { courses: 21 } },
        'admin-1',
        orgAdminAuth,
        orgPolicyWithVideoAndCourseCap
      );
      expect(overCourses.status).toBe(400);
      expect(overCourses.error).toMatch(/cannot exceed your organization quota \(20\)/);

      const overAiRuns = validateUserUpdate(
        teacherInOrg,
        { limits: { aiQuizGenerations: 16 } },
        'admin-1',
        orgAdminAuth,
        orgPolicyWithVideoAndCourseCap
      );
      expect(overAiRuns.status).toBe(400);
      expect(overAiRuns.error).toMatch(/cannot exceed your organization quota \(15\)/);

      const overMaxQ = validateUserUpdate(
        teacherInOrg,
        { limits: { aiQuizMaxQuestions: 21 } },
        'admin-1',
        orgAdminAuth,
        orgPolicyWithVideoAndCourseCap
      );
      expect(overMaxQ.status).toBe(400);
      expect(overMaxQ.error).toMatch(/cannot exceed your organization quota \(20\)/);
    });

    it('blocks org admin from setting custom limits on fields not granted to the org', () => {
      const res = validateUserUpdate(
        teacherInOrg,
        { limits: { blogs: 10 } },
        'admin-1',
        orgAdminAuth,
        orgPolicyWithVideoAndCourseCap
      );
      expect(res.status).toBe(403);
      expect(res.error).toMatch(/Super admin has not granted/);
    });

    it('allows org admin to save granted limits while preserving an unchanged superadmin-assigned ungranted limit', () => {
      const res = validateUserUpdate(
        teacherInOrg,
        { limits: { courses: 15, blogs: 8 } },
        'admin-1',
        orgAdminAuth,
        orgPolicyWithVideoAndCourseCap
      );
      expect(res.error).toBeUndefined();
    });

    it('rejects malformed or out-of-range limit values even for superadmin', () => {
      expect(
        validateUserUpdate(teacherInOrg, { limits: null }, 'super-1', superAdminAuth).status
      ).toBe(400);
      expect(
        validateUserUpdate(teacherInOrg, { limits: { courses: 0 } }, 'super-1', superAdminAuth)
          .status
      ).toBe(400);
      expect(
        validateUserUpdate(teacherInOrg, { limits: { quizzes: -3 } }, 'super-1', superAdminAuth)
          .status
      ).toBe(400);
      expect(
        validateUserUpdate(teacherInOrg, { limits: { blogs: 2.5 } }, 'super-1', superAdminAuth)
          .status
      ).toBe(400);
      expect(
        validateUserUpdate(
          teacherInOrg,
          { limits: { aiQuizMaxQuestions: 51 } },
          'super-1',
          superAdminAuth
        ).status
      ).toBe(400);
    });
  });

  describe('validateUserDeletion', () => {
    it('prevents self-deletion', () => {
      const res = validateUserDeletion(
        { _id: 'admin-1', role: 'admin', organizationId: orgId },
        'admin-1',
        orgAdminAuth
      );
      expect(res.status).toBe(400);
    });

    it('prevents deleting superadmin accounts even by another superadmin', () => {
      const res = validateUserDeletion(superAdminTarget, 'super-1', superAdminAuth);
      expect(res.status).toBe(403);
    });

    it('prevents org admin from deleting another admin or cross-org users', () => {
      expect(validateUserDeletion(adminInOrg, 'admin-1', orgAdminAuth).status).toBe(403);
      expect(
        validateUserDeletion({ ...studentInOrg, organizationId: otherOrgId }, 'admin-1', orgAdminAuth)
          .status
      ).toBe(403);
    });

    it('allows org admin to delete a student or teacher in their own organization', () => {
      expect(validateUserDeletion(studentInOrg, 'admin-1', orgAdminAuth).error).toBeUndefined();
      expect(validateUserDeletion(teacherInOrg, 'admin-1', orgAdminAuth).error).toBeUndefined();
    });

    it('allows superadmin to delete any non-superadmin user across organizations', () => {
      expect(validateUserDeletion(adminInOrg, 'super-1', superAdminAuth).error).toBeUndefined();
      expect(
        validateUserDeletion({ ...teacherInOrg, organizationId: otherOrgId }, 'super-1', superAdminAuth)
          .error
      ).toBeUndefined();
    });
  });
});
