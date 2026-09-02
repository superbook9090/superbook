export interface DailyTrendPoint {
  date: string;
  signups: number;
  enrollments: number;
  attempts: number;
}

export interface TopCourseItem {
  _id: string;
  title: string;
  isPublished: boolean;
  category: string;
  studentsCount: number;
}

export interface ActivityItem {
  type: 'enrollment' | 'quiz_attempt';
  user: string;
  item: string;
  score?: number;
  date: string;
}

export interface ActiveUsersStats {
  dau: number;
  wau: number;
  mau: number;
  inactive: number;
  stickinessRatio: number;
  recency: {
    within24Hours: number;
    within7Days: number;
    within30Days: number;
    olderOrNever: number;
  };
}

export interface PlatformStats {
  totalApp: number;
  totalWeb: number;
  android: number;
  ios: number;
  activeApp: number;
  activeWeb: number;
  appPercentage: number;
  webPercentage: number;
}

export interface AdminStats {
  users: {
    total: number;
    students: number;
    teachers: number;
    admins: number;
    newThisMonth: number;
  };
  activeUsers?: ActiveUsersStats;
  platformStats?: PlatformStats;
  courses: {
    total: number;
    published: number;
  };
  enrollments: {
    total: number;
    active: number;
    completed: number;
  };
  quizzes: {
    total: number;
    published: number;
    totalAttempts: number;
    averageScore: number;
    highestScore: number;
  };
  blogs?: {
    total: number;
    published: number;
  };
  trends?: DailyTrendPoint[];
  topCourses?: TopCourseItem[];
  recentActivity?: ActivityItem[];
}

export type AnalyticsTabKey = 'overview' | 'users' | 'courses' | 'quizzes' | 'activity';
