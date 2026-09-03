import { describe, it, expect, vi } from 'vitest';
import {
  normalizeRole,
  isStaffRole,
  isAdmin,
  isSuperAdmin,
  getDashboardHomePath,
  withDashboardHome,
  type UserRole
} from '../roles';

// Mock ROUTES constant
vi.mock('@/constants/routes', () => ({
  ROUTES: {
    student: { root: '/dashboard/student' },
    teacher: { root: '/dashboard/teacher' },
    admin: { root: '/dashboard/admin' },
  }
}));

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
});
