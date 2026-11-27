export interface UserLimits {
  courses?: number;
  quizzes?: number;
  blogs?: number;
  aiQuizGenerations?: number;
  aiQuizMaxQuestions?: number;
}

export interface UserActivityStats {
  coursesCount?: number;
  publishedCoursesCount?: number;
  quizzesCount?: number;
  publishedQuizzesCount?: number;
  blogsCount?: number;
  contestsCount?: number;
  courseEnrollmentsCount?: number;
  enrolledCoursesCount?: number;
  completedCoursesCount?: number;
  quizAttemptsCount?: number;
  completedQuizAttemptsCount?: number;
  contestAttemptsCount?: number;
  certificatesCount?: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'student' | 'teacher' | 'admin' | 'superadmin' | string;
  avatar?: string;
  isVerified?: boolean;
  isSuspended?: boolean;
  suspendedReason?: string;
  provider?: 'credentials' | 'google' | 'phone' | string;
  organizationId?: string | null;
  organization?: {
    _id: string;
    name: string;
  } | null;
  limits?: UserLimits;
  canUploadVideos?: boolean;
  canCreatePublicCourses?: boolean;
  lastActiveAt?: string;
  lastPlatform?: 'android' | 'ios' | 'web';
  lastUserAgent?: string;
  canCreateContests?: boolean;
  canGenerateAiQuizzes?: boolean;
  aiQuizGenerationsCount?: number;
  activityStats?: UserActivityStats;
  createdAt: string;
  updatedAt?: string;
}

export interface UserStats {
  total: number;
  students: number;
  teachers: number;
  admins: number;
  superadmins: number;
  suspended: number;
  appUsers?: number;
  webUsers?: number;
  activeToday?: number;
  activeMonthly?: number;
}
