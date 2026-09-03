import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import {
  createCourseSchema,
  createQuizSchema,
  resetPasswordSchema
} from '../validation';

describe('validation', () => {
  const validObjectId = new mongoose.Types.ObjectId().toString();

  describe('createCourseSchema', () => {
    it('validates a correct course object', () => {
      const validCourse = {
        title: 'Learn TypeScript',
        description: 'A great course',
        price: 99.99,
        courseCode: 'TS-101',
      };
      const result = createCourseSchema.safeParse(validCourse);
      expect(result.success).toBe(true);
    });

    it('fails if title is missing', () => {
      const result = createCourseSchema.safeParse({ price: 10 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBeDefined();
      }
    });

    it('validates courseCode formatting', () => {
      const invalidCourse = {
        title: 'Test',
        courseCode: 'ab', // too short
      };
      const result = createCourseSchema.safeParse(invalidCourse);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBeDefined();
      }
    });
  });

  describe('createQuizSchema', () => {
    it('fails if both chapter and lesson are provided', () => {
      const invalidQuiz = {
        title: 'Quiz 1',
        course: validObjectId,
        chapter: validObjectId,
        lesson: validObjectId,
        questions: [
          { question: 'Q1', options: ['A', 'B'], correctAnswer: 0 }
        ]
      };
      const result = createQuizSchema.safeParse(invalidQuiz);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Assign quiz to either a chapter or a lesson, not both');
      }
    });

    it('validates a correct quiz with only chapter', () => {
      const validQuiz = {
        title: 'Quiz 1',
        course: validObjectId,
        chapter: validObjectId,
        questions: [
          { question: 'Q1', options: ['A', 'B'], correctAnswer: 0 }
        ]
      };
      const result = createQuizSchema.safeParse(validQuiz);
      expect(result.success).toBe(true);
    });
  });

  describe('resetPasswordSchema', () => {
    it('validates matching passwords', () => {
      const result = resetPasswordSchema.safeParse({
        token: 'token123',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      });
      expect(result.success).toBe(true);
    });

    it('fails if passwords do not match', () => {
      const result = resetPasswordSchema.safeParse({
        token: 'token123',
        password: 'Password123!',
        confirmPassword: 'Password456!'
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Passwords do not match');
      }
    });
  });
});
