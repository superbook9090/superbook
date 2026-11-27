// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  normalizeRole,
  isStaffRole,
  isAdmin,
  isSuperAdmin,
  getDashboardHomePath,
  withDashboardHome
} from '../roles';
import { ADMIN_NAV, filterAdminNav, filterNavByFeatures } from '@/constants/navigation';

describe('roles', () => {
  describe('normalizeRole', () => {
    it('returns student for null, undefined, or empty', () => {
      expect(normalizeRole(null)).toBe('student');
      expect(normalizeRole(undefined)).toBe('student');
      expect(normalizeRole('')).toBe('student');
    });

    it('normalizes valid roles to lowercase', () => {
      expect(normalizeRole('TEACHER')).toBe('teacher');
      expect(normalizeRole('Admin')).toBe('admin');
      expect(normalizeRole('SuperAdmin')).toBe('superadmin');
    });

    it('defaults unknown roles to student', () => {
      expect(normalizeRole('unknown_role')).toBe('student');
    });
  });

  describe('isAdmin', () => {
    it('returns true for admin and superadmin', () => {
      expect(isAdmin('admin')).toBe(true);
      expect(isAdmin('superadmin')).toBe(true);
    });

    it('returns false for student and teacher', () => {
      expect(isAdmin('student')).toBe(false);
      expect(isAdmin('teacher')).toBe(false);
      expect(isAdmin(null)).toBe(false);
    });
  });

  describe('isStaffRole', () => {
    it('returns true for teacher, admin, and superadmin', () => {
      expect(isStaffRole('teacher')).toBe(true);
      expect(isStaffRole('admin')).toBe(true);
      expect(isStaffRole('superadmin')).toBe(true);
    });

    it('returns false for student', () => {
      expect(isStaffRole('student')).toBe(false);
    });
  });

  describe('getDashboardHomePath', () => {
    it('returns teacher path for teacher role', () => {
      expect(getDashboardHomePath('teacher')).toBe('/dashboard/teacher');
    });

    it('returns admin path for admin and superadmin', () => {
      expect(getDashboardHomePath('admin')).toBe('/dashboard/admin');
      expect(getDashboardHomePath('superadmin')).toBe('/dashboard/admin');
    });

    it('returns student path for student role', () => {
      expect(getDashboardHomePath('student')).toBe('/dashboard/student');
      expect(getDashboardHomePath(null)).toBe('/dashboard/student');
    });
  });

  describe('withDashboardHome', () => {
    it('updates dashboard href based on role', () => {
      const items = [
        { nameKey: 'common.dashboard', href: '#' },
        { nameKey: 'other.page', href: '/other' }
      ];

      const result = withDashboardHome(items, 'teacher');
      
      expect(result[0].href).toBe('/dashboard/teacher');
      expect(result[1].href).toBe('/other'); // unchanged
    });
  });

  describe('isSuperAdmin', () => {
    it('returns true only for superadmin role (case-insensitive)', () => {
      expect(isSuperAdmin('superadmin')).toBe(true);
      expect(isSuperAdmin('SuperAdmin')).toBe(true);
    });

    it('returns false for admin, teacher, student, null, and undefined', () => {
      expect(isSuperAdmin('admin')).toBe(false);
      expect(isSuperAdmin('teacher')).toBe(false);
      expect(isSuperAdmin('student')).toBe(false);
      expect(isSuperAdmin(null)).toBe(false);
      expect(isSuperAdmin(undefined)).toBe(false);
    });
  });

  describe('navigation role & feature gating', () => {
    it('hides superadmin-only admin nav entries from organization admins', () => {
      const orgAdminNav = filterAdminNav(ADMIN_NAV, false);
      const superAdminNav = filterAdminNav(ADMIN_NAV, true);

      const superOnlyKeys = [
        'common.organizations',
        'common.contests',
        'admin.challenges',
        'common.files',
        'common.notifications',
        'common.settings',
      ];

      for (const key of superOnlyKeys) {
        expect(orgAdminNav.some((item) => item.nameKey === key)).toBe(false);
        expect(superAdminNav.some((item) => item.nameKey === key)).toBe(true);
      }
    });

    it('filters nav items by enabled feature toggles', () => {
      const filtered = filterNavByFeatures(ADMIN_NAV, {
        enableBlogs: false,
        enableQuizzes: true,
        enableCourses: true,
        enableAnalytics: false,
        enableNotes: false,
        enableContests: false,
        enableQuizChallenges: false,
      });

      expect(filtered.some((item) => item.nameKey === 'common.allBlogs')).toBe(false);
      expect(filtered.some((item) => item.nameKey === 'common.analytics')).toBe(false);
      expect(filtered.some((item) => item.nameKey === 'common.allCourses')).toBe(true);
      expect(filtered.some((item) => item.nameKey === 'common.users')).toBe(true);
    });
  });
});
