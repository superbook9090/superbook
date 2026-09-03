import { describe, it, expect, vi } from 'vitest';
import {
  isPrivateCourse,
  normalizeCourseCode,
  publicCourseFilter,
  canViewCourseCode,
  sanitizeCourseResponse,
  validateCourseCodeMatch,
  resolveCourseCodeForSave
} from '../courseAccess';

describe('courseAccess', () => {
  describe('isPrivateCourse', () => {
    it('returns true if courseCode is a non-empty string', () => {
      expect(isPrivateCourse({ courseCode: 'CODE' })).toBe(true);
      expect(isPrivateCourse({ courseCode: ' CODE ' })).toBe(true);
    });

    it('returns false if courseCode is empty, null, or undefined', () => {
      expect(isPrivateCourse({ courseCode: '' })).toBe(false);
      expect(isPrivateCourse({ courseCode: '   ' })).toBe(false);
      expect(isPrivateCourse({ courseCode: null })).toBe(false);
      expect(isPrivateCourse({})).toBe(false);
    });
  });

  describe('normalizeCourseCode', () => {
    it('trims, uppercases, and removes whitespace', () => {
      expect(normalizeCourseCode(' my code ')).toBe('MYCODE');
      expect(normalizeCourseCode('  test-code  ')).toBe('TEST-CODE');
    });
  });

  describe('publicCourseFilter', () => {
    it('returns mongo filter for public courses', () => {
      const filter = publicCourseFilter();
      expect(filter).toHaveProperty('$or');
      expect(filter.$or).toHaveLength(3);
      expect(filter.$or).toContainEqual({ courseCode: { $exists: false } });
      expect(filter.$or).toContainEqual({ courseCode: null });
      expect(filter.$or).toContainEqual({ courseCode: '' });
    });
  });

  describe('canViewCourseCode', () => {
    it('allows admin, superadmin, and owners', () => {
      expect(canViewCourseCode('admin')).toBe(true);
      expect(canViewCourseCode('superadmin')).toBe(true);
      expect(canViewCourseCode('student', true)).toBe(true);
    });

    it('denies others', () => {
      expect(canViewCourseCode('student')).toBe(false);
      expect(canViewCourseCode('teacher')).toBe(false);
      expect(canViewCourseCode(undefined)).toBe(false);
    });
  });

  describe('sanitizeCourseResponse', () => {
    const course = { id: 1, title: 'Course 1', courseCode: 'SECRET' };

    it('strips courseCode if includeCourseCode is false', () => {
      const result = sanitizeCourseResponse(course, { includeCourseCode: false });
      expect(result).not.toHaveProperty('courseCode');
      expect(result).toHaveProperty('isPrivate', true);
      expect(result).toHaveProperty('title', 'Course 1');
    });

    it('keeps courseCode if includeCourseCode is true', () => {
      const result = sanitizeCourseResponse(course, { includeCourseCode: true });
      expect(result).toHaveProperty('courseCode', 'SECRET');
      expect(result).toHaveProperty('isPrivate', true);
    });
  });

  describe('validateCourseCodeMatch', () => {
    const privateCourse = { courseCode: 'SECRET' };
    const publicCourse = { courseCode: '' };

    it('returns true for public courses regardless of input', () => {
      expect(validateCourseCodeMatch(publicCourse)).toBe(true);
      expect(validateCourseCodeMatch(publicCourse, 'WRONG')).toBe(true);
    });

    it('returns false if code is missing for private course', () => {
      expect(validateCourseCodeMatch(privateCourse)).toBe(false);
      expect(validateCourseCodeMatch(privateCourse, '   ')).toBe(false);
    });

    it('matches normalized codes correctly', () => {
      expect(validateCourseCodeMatch(privateCourse, 'secret')).toBe(true);
      expect(validateCourseCodeMatch(privateCourse, ' SECRET ')).toBe(true);
      expect(validateCourseCodeMatch(privateCourse, 'WRONG')).toBe(false);
    });
  });

  describe('resolveCourseCodeForSave', () => {
    it('returns undefined if explicitly null or empty', () => {
      expect(resolveCourseCodeForSave(null)).toBeUndefined();
      expect(resolveCourseCodeForSave('')).toBeUndefined();
    });

    it('returns existing code if undefined', () => {
      expect(resolveCourseCodeForSave(undefined, 'OLD')).toBe('OLD');
      expect(resolveCourseCodeForSave(undefined, null)).toBeUndefined();
    });

    it('returns normalized code if valid', () => {
      expect(resolveCourseCodeForSave(' new code ')).toBe('NEWCODE');
    });
  });
});
