import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

const courseCodeSchema = z.preprocess(
  (val) => (val === '' ? null : val),
  z.union([
    z.null(),
    z
      .string()
      .trim()
      .regex(/^[A-Za-z0-9-]{4,12}$/, 'Course code must be 4–12 letters, numbers, or hyphens')
      .transform((s) => s.toUpperCase()),
  ]).optional()
);

// Course validation schemas
export const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(5000, 'Description must be less than 5000 characters').optional(),
  price: z.number().min(0, 'Price must be non-negative').optional(),
  category: z.string().optional(),
  thumbnail: z.preprocess((val) => val === '' ? undefined : val, z.string().url('Invalid thumbnail URL').optional()),
  isPublished: z.boolean().optional(),
  locale: z.enum(['en', 'hi']).optional(),
  courseCode: courseCodeSchema,
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
const optionalChapterSchema = z.preprocess(
  (val) => (val === '' ? null : val),
  z.union([z.null(), objectIdSchema]).optional()
);

const optionalLessonSchema = z.preprocess(
  (val) => (val === '' ? null : val),
  z.union([z.null(), objectIdSchema]).optional()
);

export const createQuizSchema = z
  .object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  course: objectIdSchema,
  chapter: optionalChapterSchema,
  lesson: optionalLessonSchema,
  questions: z.array(z.object({
    question: z.string().min(1, 'Question is required').max(500, 'Question must be less than 500 characters'),
    options: z.array(z.string().min(1, 'Option cannot be empty')).min(2, 'At least 2 options required').max(6, 'Maximum 6 options allowed'),
    correctAnswer: z.number().int().min(0, 'Correct answer must be a valid option index'),
  })).min(1, 'At least 1 question is required'),
  timeLimit: z.number().int().min(1, 'Time limit must be at least 1 minute').max(180, 'Time limit must be at most 180 minutes').optional(),
  isPublished: z.boolean().optional(),
})
  .refine((data) => !(data.chapter && data.lesson), {
    message: 'Assign quiz to either a chapter or a lesson, not both',
    path: ['lesson'],
  });

export const updateQuizSchema = createQuizSchema.partial();

// Enrollment validation schemas
export const createEnrollmentSchema = z.object({
  courseId: objectIdSchema,
  courseCode: z.string().trim().min(1).max(12).optional(),
});

export const joinCourseByCodeSchema = z.object({
  courseCode: z.string().trim().min(1, 'Course code is required').max(12),
});

// Quiz attempt validation schemas
export const createQuizAttemptSchema = z.object({
  quizId: objectIdSchema,
  action: z.enum(['start', 'submit']),
  answers: z.array(z.object({
    questionId: objectIdSchema,
    selectedOption: z.number().int().min(-1),
  })).optional(),
  timeTaken: z.number().int().min(0).nullable().optional(),
});

// Favorite validation schemas
export const createFavoriteSchema = z.object({
  blogId: objectIdSchema,
});

const notificationCategorySchema = z.enum([
  'lessons',
  'quizzes',
  'assignments',
  'liveClasses',
  'announcements',
  'system',
]);

export const sendNotificationSchema = z.object({
  title: z.object({
    en: z.string().min(1, 'English title is required').max(200),
    hi: z.string().max(200).optional(),
  }),
  body: z.object({
    en: z.string().min(1, 'English message is required').max(1000),
    hi: z.string().max(1000).optional(),
  }),
  data: z.record(z.string(), z.string()).optional(),
  category: notificationCategorySchema,
  organizationId: objectIdSchema.optional(),
});

export const registerDeviceSchema = z.object({
  deviceToken: z.string().min(1, 'Device token is required'),
  platform: z.enum(['android', 'ios', 'web']),
});

export const unregisterDeviceSchema = z.object({
  deviceToken: z.string().min(1, 'Device token is required'),
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

// File manager validation schemas
export const createFolderSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  parentId: objectIdSchema.nullable().optional(),
});

// Chapter validation schemas
export const createChapterSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  summary: z.string().max(2000, 'Summary must be less than 2000 characters').optional(),
  parentChapter: objectIdSchema.nullable().optional(),
  order: z.number().int().min(0).optional(),
});

export const updateChapterSchema = createChapterSchema.partial();

export const reorderCurriculumSchema = z.object({
  chapters: z
    .array(
      z.object({
        id: objectIdSchema,
        order: z.number().int().min(0),
        parentChapter: objectIdSchema.nullable().optional(),
      })
    )
    .optional(),
  lessons: z
    .array(
      z.object({
        id: objectIdSchema,
        order: z.number().int().min(0),
        chapterId: objectIdSchema,
      })
    )
    .optional(),
});

// Lesson validation schemas
export const createLessonSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  content: z.string().optional(),
  videoUrl: z.string().url('Invalid video URL').optional().or(z.literal('')),
  youtubeVideoId: z.string().optional().or(z.literal('')),
  videoEmbedUrl: z.string().optional().or(z.literal('')),
  thumbnail: z.string().optional().or(z.literal('')),
  notesPdf: z.string().optional().or(z.literal('')),
  attachments: z.array(z.string()).optional(),
  isPreview: z.boolean().optional(),
  duration: z.number().min(0).optional(),
  isPublished: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

export const updateLessonSchema = createLessonSchema.partial().extend({
  chapter: objectIdSchema.optional(),
});

// Contact form validation schema
export const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address').max(100, 'Email must be less than 100 characters'),
  subject: z.string().min(1, 'Subject is required').max(150, 'Subject must be less than 150 characters'),
  message: z.string().min(1, 'Message is required').max(2000, 'Message must be less than 2000 characters'),
});

const passwordFieldSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters');

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').max(100),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordFieldSchema,
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordFieldSchema,
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });
