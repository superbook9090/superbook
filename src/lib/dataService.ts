// src/lib/dataService.ts
// Central data service layer with server-side caching to eliminate duplicate API calls

import { cache } from 'react';
import dbConnect from '@/lib/db';
import { AppSettings, Course, Blog, Quiz, Enrollment, QuizAttempt, User } from '@/models';
import type { IAppSettings } from '@/models/AppSettings';

// ============================================
// SETTINGS DATA (Cached)
// ============================================

export const getSettings = cache(async (): Promise<IAppSettings | null> => {
  await dbConnect();
  const settings = await AppSettings.findOne().lean() as IAppSettings | null;
  return settings;
});

export const getSettingsWithDefaults = cache(async (): Promise<IAppSettings> => {
  await dbConnect();
  const settings = await AppSettings.findOne().lean() as IAppSettings | null;
  
  if (settings) return settings;

  // Return default settings if none exist
  return {
    teacherLimits: {
      courses: 5,
      quizzes: 10,
      blogs: 2,
    },
    featureToggles: {
      enableBlogs: true,
      enableQuizzes: true,
      enableCourses: true,
      enableAnalytics: true,
    },
    platformConfig: {
      siteName: 'quiz-do',
      siteDescription: 'A comprehensive learning platform',
      maintenanceMode: false,
      allowRegistration: true,
      defaultLanguage: 'en',
    },
  } as unknown as IAppSettings;
});

// ============================================
// COURSES DATA (Cached)
// ============================================

export const getCourses = cache(async (options?: {
  instructor?: string;
  isPublished?: unknown;
  available?: boolean | string;
  studentId?: string;
  limit?: number;
  skip?: number;
}) => {
  await dbConnect();
  
  const { instructor, available, studentId, limit = 20, skip = 0 } = options || {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = {};

  if (instructor) query.instructor = instructor;
  if (available === 'true' && studentId) {
    query.isPublished = true;
    // Exclude courses student is already enrolled in
    const enrollments = await Enrollment.find({ student: studentId }).select('course').lean();
    const enrolledCourseIds = enrollments.map(e => e.course.toString());
    if (enrolledCourseIds.length > 0) {
      query._id = { $nin: enrolledCourseIds };
    }
  }
  
  const courses = await Course.find(query)
    .populate('instructor', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  
  const total = await Course.countDocuments(query);
  
  return { courses, total };
});

export const getCourseById = cache(async (courseId: string) => {
  await dbConnect();
  const course = await Course.findById(courseId)
    .populate('instructor', 'name email')
    .lean();
  return course;
});

// ============================================
// BLOGS DATA (Cached)
// ============================================

export const getBlogs = cache(async (options?: {
  topic?: string;
  language?: string;
  limit?: number;
  skip?: number;
}) => {
  await dbConnect();
  
  const { topic, language, limit = 20, skip = 0 } = options || {};
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = { isPublished: true };
  
  if (topic) query.topic = topic;
  if (language && (language === 'en' || language === 'hi')) {
    query.language = language;
  }
  
  const blogs = await Blog.find(query)
    .populate('author', 'name')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();
  
  const total = await Blog.countDocuments(query);
  
  return { blogs, total };
});

export const getBlogById = cache(async (blogId: string) => {
  await dbConnect();
  const blog = await Blog.findById(blogId)
    .populate('author', 'name email')
    .lean();
  return blog;
});

export const getBlogsByAuthor = cache(async (authorId: string) => {
  await dbConnect();
  const blogs = await Blog.find({ author: authorId })
    .populate('author', 'name')
    .sort({ createdAt: -1 })
    .lean();
  return blogs;
});

// ============================================
// QUIZZES DATA (Cached)
// ============================================

export const getQuizzes = cache(async (options?: {
  course?: string;
  instructor?: string;
  isPublished?: boolean;
  limit?: number;
  skip?: number;
}) => {
  await dbConnect();
  
  const { course, instructor, isPublished, limit = 20, skip = 0 } = options || {};
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = {};
  
  if (course) query.course = course;
  if (instructor) query.instructor = instructor;
  if (isPublished !== undefined) query.isPublished = isPublished;
  
  const quizzes = await Quiz.find(query)
    .populate('course', 'title')
    .populate('instructor', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  
  const total = await Quiz.countDocuments(query);
  
  return { quizzes, total };
});

export const getQuizById = cache(async (quizId: string) => {
  await dbConnect();
  const quiz = await Quiz.findById(quizId)
    .populate('course', 'title')
    .populate('instructor', 'name email')
    .lean();
  return quiz;
});

export const getQuizzesByCourse = cache(async (courseId: string) => {
  await dbConnect();
  const quizzes = await Quiz.find({ course: courseId, isPublished: true })
    .populate('instructor', 'name')
    .lean();
  return quizzes;
});

// ============================================
// ENROLLMENTS DATA (Cached)
// ============================================

export const getEnrollments = cache(async (options?: {
  student?: string;
  course?: string;
  limit?: number;
  skip?: number;
}) => {
  await dbConnect();
  
  const { student, course, limit = 20, skip = 0 } = options || {};
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = {};
  
  if (student) query.student = student;
  if (course) query.course = course;
  
  const enrollments = await Enrollment.find(query)
    .populate('course', 'title description thumbnail category instructor price')
    .populate('completedLessons', 'title')
    .sort({ enrolledAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  
  const total = await Enrollment.countDocuments(query);
  
  return { enrollments, total };
});

// ============================================
// QUIZ ATTEMPTS DATA (Cached)
// ============================================

export const getQuizAttempts = cache(async (options?: {
  student?: string;
  quiz?: string;
  course?: string;
  status?: string;
  limit?: number;
  skip?: number;
}) => {
  await dbConnect();
  
  const { student, quiz, course, status, limit = 20, skip = 0 } = options || {};
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = {};
  
  if (student) query.student = student;
  if (quiz) query.quiz = quiz;
  if (course) query.course = course;
  if (status) query.status = status;
  
  const attempts = await QuizAttempt.find(query)
    .populate('quiz', 'title description timeLimit')
    .populate('course', 'title')
    .sort({ startedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  
  const total = await QuizAttempt.countDocuments(query);
  
  return { attempts, total };
});

// ============================================
// USER DATA (Cached)
// ============================================

export const getUserById = cache(async (userId: string) => {
  await dbConnect();
  const user = await User.findById(userId).select('-password').lean();
  return user;
});

export const getUsers = cache(async (options?: {
  role?: string;
  limit?: number;
  skip?: number;
}) => {
  await dbConnect();
  
  const { role, limit = 20, skip = 0 } = options || {};
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = {};
  
  if (role) query.role = role;
  
  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  
  const total = await User.countDocuments(query);
  
  return { users, total };
});

// ============================================
// ANALYTICS DATA (Cached)
// ============================================

export const getAdminStats = cache(async () => {
  await dbConnect();
  
  const totalUsers = await User.countDocuments();
  const students = await User.countDocuments({ role: 'student' });
  const teachers = await User.countDocuments({ role: 'teacher' });
  const admins = await User.countDocuments({ role: 'admin' });
  
  const totalCourses = await Course.countDocuments();
  const publishedCourses = await Course.countDocuments({ isPublished: true });
  
  const totalEnrollments = await Enrollment.countDocuments();
  const activeEnrollments = await Enrollment.countDocuments({ status: 'active' });
  const completedEnrollments = await Enrollment.countDocuments({ status: 'completed' });
  
  const totalQuizzes = await Quiz.countDocuments();
  const publishedQuizzes = await Quiz.countDocuments({ isPublished: true });
  
  const totalAttempts = await QuizAttempt.countDocuments({ status: 'completed' });
  
  return {
    users: { total: totalUsers, students, teachers, admins },
    courses: { total: totalCourses, published: publishedCourses },
    enrollments: { total: totalEnrollments, active: activeEnrollments, completed: completedEnrollments },
    quizzes: { total: totalQuizzes, published: publishedQuizzes, totalAttempts },
  };
});

export const getTeacherStats = cache(async (teacherId: string) => {
  await dbConnect();
  
  const courses = await Course.find({ instructor: teacherId }).lean();
  const quizzes = await Quiz.find({ instructor: teacherId }).lean();
  const blogs = await Blog.find({ author: teacherId }).lean();
  
  const courseIds = courses.map((c: unknown) => (c as { _id: { toString: () => string } })._id.toString());
  const enrollments = await Enrollment.find({ course: { $in: courseIds } }).lean();

  const allStudentIds = new Set<string>();
  enrollments.forEach((e: unknown) => {
    const enrollment = e as { enrolledStudents?: string[] };
    enrollment.enrolledStudents?.forEach((studentId: string) => allStudentIds.add(studentId));
  });

  return {
    totalCourses: courses.length,
    totalQuizzes: quizzes.length,
    totalBlogs: blogs.length,
    totalStudents: allStudentIds.size,
    publishedCourses: courses.filter((c: unknown) => (c as { isPublished?: boolean }).isPublished).length,
  };
});
