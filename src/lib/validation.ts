import { z } from 'zod';

// Common validation schemas
export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

// Course validation schemas
export const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(5000, 'Description must be less than 5000 characters').optional(),
  price: z.number().min(0, 'Price must be non-negative').optional(),
  category: z.string().optional(),
  thumbnail: z.string().url('Invalid thumbnail URL').optional(),
  isPublished: z.boolean().optional(),
  language: z.enum(['en', 'hi']).optional(),
});

export const updateCourseSchema = createCourseSchema.partial();

// Blog validation schemas
export const createBlogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required'),
  topic: z.string().min(1, 'Topic is required'),
  language: z.enum(['en', 'hi']).optional(),
  isPublished: z.boolean().optional(),
});

export const updateBlogSchema = createBlogSchema.partial();

// Quiz validation schemas
export const createQuizSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  course: objectIdSchema,
  questions: z.array(z.object({
    question: z.string().min(1, 'Question is required').max(500, 'Question must be less than 500 characters'),
    options: z.array(z.string().min(1, 'Option cannot be empty')).min(2, 'At least 2 options required').max(6, 'Maximum 6 options allowed'),
    correctAnswer: z.number().int().min(0, 'Correct answer must be a valid option index'),
  })).min(1, 'At least 1 question is required'),
  timeLimit: z.number().int().min(1, 'Time limit must be at least 1 minute').max(180, 'Time limit must be at most 180 minutes').optional(),
  isPublished: z.boolean().optional(),
});

export const updateQuizSchema = createQuizSchema.partial();

// User validation schemas
export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  role: z.enum(['student', 'teacher', 'admin']).optional(),
  isSuspended: z.boolean().optional(),
  limits: z.object({
    courses: z.number().int().min(0).optional(),
    quizzes: z.number().int().min(0).optional(),
    blogs: z.number().int().min(0).optional(),
  }).optional(),
});

// Enrollment validation schemas
export const createEnrollmentSchema = z.object({
  courseId: objectIdSchema,
});

// Quiz attempt validation schemas
export const createQuizAttemptSchema = z.object({
  quizId: objectIdSchema,
  action: z.enum(['start', 'submit']),
  answers: z.array(z.object({
    questionIndex: z.number().int().min(0),
    selectedOption: z.number().int().min(-1), // -1 for unanswered
  })).optional(),
  timeTaken: z.number().int().min(0).optional(),
});

// Favorite validation schemas
export const createFavoriteSchema = z.object({
  blogId: objectIdSchema,
});

// Admin settings validation schemas
export const updateSettingsSchema = z.object({
  teacherLimits: z.object({
    courses: z.number().int().min(1, 'Courses limit must be at least 1'),
    quizzes: z.number().int().min(1, 'Quizzes limit must be at least 1'),
    blogs: z.number().int().min(1, 'Blogs limit must be at least 1'),
  }).optional(),
  featureToggles: z.object({
    enableBlogs: z.boolean(),
    enableQuizzes: z.boolean(),
    enableCourses: z.boolean(),
    enableAnalytics: z.boolean(),
  }).optional(),
  platformConfig: z.object({
    siteName: z.string().max(100).optional(),
    siteDescription: z.string().max(500).optional(),
    maintenanceMode: z.boolean().optional(),
    allowRegistration: z.boolean().optional(),
    defaultLanguage: z.enum(['en', 'hi']).optional(),
  }).optional(),
});

// Pagination validation
export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

// Search validation
export const searchSchema = z.object({
  search: z.string().max(100).optional(),
  topic: z.string().optional(),
  language: z.enum(['en', 'hi']).optional(),
  instructor: z.string().optional(),
  role: z.enum(['student', 'teacher', 'admin']).optional(),
});
