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

export interface AdminStats {
  users: {
    total: number;
    students: number;
    teachers: number;
    admins: number;
    newThisMonth: number;
  };
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
