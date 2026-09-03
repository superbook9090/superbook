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
  isCompleted: z.boolean().optional(),
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
  slug: z.string().trim().min(1).max(240).optional(),
  excerpt: z.string().trim().max(320).optional(),
  metaTitle: z.string().trim().max(70).optional(),
  metaDescription: z.string().trim().max(180).optional(),
  visibility: z.enum(['public', 'organization']).optional(),
  isFeatured: z.boolean().optional(),
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

export const targetAudienceSchema = z.enum(['all', 'students', 'teachers', 'course_enrolled']);

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
  targetAudience: targetAudienceSchema.optional().default('all'),
  targetCourseId: objectIdSchema.optional(),
});

export const registerDeviceSchema = z.object({
  deviceToken: z.string().min(1, 'Device token is required'),
  platform: z.enum(['android', 'ios', 'web']),
});

export const unregisterDeviceSchema = z.object({
  deviceToken: z.string().min(1, 'Device token is required'),
});

export const userActivitySchema = z.object({
  platform: z.enum(['android', 'ios', 'web']).optional(),
  path: z.string().max(300).optional(),
});

// Note validation schemas
export const createNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150, 'Title must be 150 characters or less'),
  content: z.string().min(1, 'Content is required'),
  color: z.enum(['blue', 'amber', 'emerald', 'rose', 'purple', 'slate']).optional(),
  isPinned: z.boolean().optional(),
  tags: z.array(z.string().max(30)).optional(),
});

export const updateNoteSchema = createNoteSchema.partial();

// Admin settings validation schemas
export const updateSettingsSchema = z.object({
  teacherLimits: z.object({
    courses: z.number().int().min(1, 'Courses limit must be at least 1'),
    quizzes: z.number().int().min(1, 'Quizzes limit must be at least 1'),
    blogs: z.number().int().min(1, 'Blogs limit must be at least 1'),
    aiQuizGenerations: z.number().int().min(1, 'AI Quiz Generations limit must be at least 1').optional(),
  }).optional(),
  notesLimits: z.object({
    maxPagesPerUser: z.number().int().min(1, 'Max pages limit must be at least 1'),
    maxWordsPerPage: z.number().int().min(50, 'Max words limit must be at least 50'),
  }).optional(),
  featureToggles: z.object({
    enableBlogs: z.boolean().optional(),
    enableQuizzes: z.boolean().optional(),
    enableCourses: z.boolean().optional(),
    enableAnalytics: z.boolean().optional(),
    enableClarity: z.boolean().optional(),
    enableQuizSolutionAnalysis: z.boolean().optional(),
    restrictPublicCourseCreation: z.boolean().optional(),
    enableEnrollmentManagement: z.boolean().optional(),
    enablePhoneAuth: z.boolean().optional(),
    enablePullToRefresh: z.boolean().optional(),
    enableGoogleAuthApp: z.boolean().optional(),
    enableGoogleAuthWeb: z.boolean().optional(),
    enableNotes: z.boolean().optional(),
    enableAiQuizGen: z.boolean().optional(),
    enableGoogleAdsense: z.boolean().optional(),
    enableCourseDoubts: z.boolean().optional(),
  }).optional(),
  platformConfig: z.object({
    siteName: z.string().max(100).optional(),
    siteDescription: z.string().max(500).optional(),
    maintenanceMode: z.boolean().optional(),
    allowRegistration: z.boolean().optional(),
    allowTeacherRegistration: z.boolean().optional(),
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

export const setPasswordSchema = z
  .object({
    password: passwordFieldSchema,
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Contest validation schemas
export const contestPrizeSchema = z.object({
  rank: z.union([z.number().int().min(1), z.string().min(1)]),
  title: z.string().min(1, 'Prize title is required').max(100),
  description: z.string().max(300).optional(),
  rewardType: z.enum(['trophy', 'certificate', 'cash', 'points', 'gift', 'badge', 'other']).optional(),
  value: z.string().max(100).optional(),
});

export const contestQuestionSchema = z.object({
  question: z.string().min(1, 'Question prompt is required').max(1000),
  options: z.array(z.string().min(1, 'Option text is required')).min(2, 'At least 2 options required').max(6),
  correctAnswer: z.number().int().min(0, 'Valid correct answer index required'),
  points: z.number().min(1).optional(),
});

export const contestQuizInputSchema = z.object({
  quizId: objectIdSchema.optional(),
  title: z.string().max(200).optional(),
  order: z.number().int().min(0).optional(),
  questions: z.array(contestQuestionSchema).optional(),
});

export const createContestSchema = z.object({
  title: z.string().min(1, 'Contest title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(5000).optional(),
  instructions: z.string().max(10000).optional(),
  startTime: z.string().or(z.date()),
  endTime: z.string().or(z.date()),
  duration: z.number().int().min(1, 'Duration must be at least 1 minute').max(1440, 'Duration cannot exceed 24 hours'),
  solutionsReleaseAt: z.string().or(z.date()).optional(),
  scheduleType: z.enum(['one_time', 'daily', 'weekly']).optional(),
  prizes: z.array(contestPrizeSchema).optional(),
  maxAttempts: z.number().int().min(1).max(10).optional(),
  maxParticipants: z.number().int().min(1).nullable().optional(),
  visibility: z.enum(['public', 'organization', 'unlisted']).optional(),
  leaderboardVisibility: z.enum(['live', 'after_end', 'hidden']).optional(),
  quizzes: z.array(contestQuizInputSchema).optional(),
  questions: z.array(contestQuestionSchema).optional(),
});

export const updateContestSchema = createContestSchema.partial().extend({
  status: z.enum(['draft', 'published', 'cancelled', 'completed']).optional(),
});

export const createContestAttemptSchema = z.object({
  action: z.enum(['start', 'submit']),
  answers: z.array(
    z.object({
      quizId: z.string().optional().nullable(),
      questionId: z.string().min(1, 'Question ID is required'),
      selectedOption: z.number().int().min(-1),
    })
  ).optional(),
  timeTaken: z.number().int().min(0).nullable().optional(),
  violationCount: z.number().int().min(0).optional(),
});

