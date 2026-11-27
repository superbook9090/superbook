// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  sanitizeOrganizationPermissions,
  sanitizeOrganizationTeacherLimits,
  normalizeOrganizationPolicy,
} from '../orgPolicy';

describe('orgPolicy', () => {
  describe('sanitizeOrganizationPermissions', () => {
    it('returns empty result when input is undefined', () => {
      expect(sanitizeOrganizationPermissions(undefined)).toEqual({});
    });

    it('accepts valid boolean permissions and ignores unknown keys', () => {
      const res = sanitizeOrganizationPermissions({
        canUploadVideos: true,
        canCreatePublicCourses: false,
        canCreateContests: true,
        canGenerateAiQuizzes: false,
        unknownFlag: true,
      });
      expect(res.error).toBeUndefined();
      expect(res.value).toEqual({
        canUploadVideos: true,
        canCreatePublicCourses: false,
        canCreateContests: true,
        canGenerateAiQuizzes: false,
      });
    });

    it('rejects null, arrays, and primitive values', () => {
      expect(sanitizeOrganizationPermissions(null).error).toMatch(/must be an object/);
      expect(sanitizeOrganizationPermissions([]).error).toMatch(/must be an object/);
      expect(sanitizeOrganizationPermissions('true').error).toMatch(/must be an object/);
    });

    it('rejects non-boolean values for any permission key', () => {
      expect(sanitizeOrganizationPermissions({ canUploadVideos: 'true' }).error).toMatch(
        /canUploadVideos must be a boolean/
      );
      expect(sanitizeOrganizationPermissions({ canCreateContests: 1 }).error).toMatch(
        /canCreateContests must be a boolean/
      );
      expect(sanitizeOrganizationPermissions({ canGenerateAiQuizzes: null }).error).toMatch(
        /canGenerateAiQuizzes must be a boolean/
      );
    });
  });

  describe('sanitizeOrganizationTeacherLimits', () => {
    it('returns empty result when input is undefined', () => {
      expect(sanitizeOrganizationTeacherLimits(undefined)).toEqual({});
    });

    it('accepts positive integers (number or numeric string) and clears empty/null fields', () => {
      const res = sanitizeOrganizationTeacherLimits({
        courses: 20,
        quizzes: '30',
        blogs: '',
        aiQuizGenerations: null,
        aiQuizMaxQuestions: 50,
      });
      expect(res.error).toBeUndefined();
      expect(res.value).toEqual({
        courses: 20,
        quizzes: 30,
        blogs: undefined,
        aiQuizGenerations: undefined,
        aiQuizMaxQuestions: 50,
      });
    });

    it('rejects zero, negative numbers, floats, and non-numeric strings', () => {
      expect(sanitizeOrganizationTeacherLimits({ courses: 0 }).error).toMatch(/positive integer/);
      expect(sanitizeOrganizationTeacherLimits({ quizzes: -5 }).error).toMatch(/positive integer/);
      expect(sanitizeOrganizationTeacherLimits({ blogs: 2.5 }).error).toMatch(/positive integer/);
      expect(sanitizeOrganizationTeacherLimits({ courses: 'abc' }).error).toMatch(
        /positive integer/
      );
    });

    it('rejects aiQuizMaxQuestions above 50', () => {
      expect(sanitizeOrganizationTeacherLimits({ aiQuizMaxQuestions: 51 }).error).toMatch(
        /cannot exceed 50/
      );
    });

    it('rejects non-object inputs', () => {
      expect(sanitizeOrganizationTeacherLimits(null).error).toMatch(/must be an object/);
      expect(sanitizeOrganizationTeacherLimits([]).error).toMatch(/must be an object/);
    });
  });

  describe('normalizeOrganizationPolicy', () => {
    it('defaults all permissions to false and empty limits when null or undefined', () => {
      expect(normalizeOrganizationPolicy(null)).toEqual({
        permissions: {
          canUploadVideos: false,
          canCreatePublicCourses: false,
          canCreateContests: false,
          canGenerateAiQuizzes: false,
        },
        teacherLimits: {},
      });
    });

    it('preserves valid flags and positive limits while ignoring invalid limit numbers', () => {
      expect(
        normalizeOrganizationPolicy({
          permissions: { canUploadVideos: true, canGenerateAiQuizzes: true },
          teacherLimits: { courses: 15, quizzes: 0, blogs: -2, aiQuizMaxQuestions: 25 },
        })
      ).toEqual({
        permissions: {
          canUploadVideos: true,
          canCreatePublicCourses: false,
          canCreateContests: false,
          canGenerateAiQuizzes: true,
        },
        teacherLimits: {
          courses: 15,
          aiQuizMaxQuestions: 25,
        },
      });
    });
  });
});
