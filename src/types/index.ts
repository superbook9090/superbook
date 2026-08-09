// Centralized type definitions for the LMS application

// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin' | 'superadmin';
  createdAt: string;
  organizationId?: string | null;
  organization?: {
    _id: string;
    name: string;
  } | null;
  limits?: {
    courses: number;
    quizzes: number;
    blogs: number;
  };
}

// Course types
export interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  category?: string;
  locale?: string;
  thumbnail?: string;
  thumbnailUrl?: string;
  isPublished: boolean;
  enrolledCount?: number;
  instructorId?: string;
  instructor?: {
    _id?: string;
    name: string;
    email: string;
  };
  courseCode?: string | null;
  isPrivate?: boolean;
  slug?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Quiz types
export interface Quiz {
  _id: string;
  title: string;
  description: string;
  courseId: string;
  course?: Course;
  timeLimit: number;
  questions: QuizQuestion[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface QuizAttempt {
  _id: string;
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  startedAt: string;
  completedAt: string;
  quiz?: Quiz;
}

// Blog types
export interface Blog {
  _id: string;
  title: string;
  content: string;
  excerpt?: string;
  thumbnailUrl?: string;
  authorId: string;
  author?: {
    _id: string;
    name: string;
    email: string;
  };
  language: 'en' | 'hi';
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// Favorite types
export interface Favorite {
  _id: string;
  user: string;
  blog: Blog;
  createdAt: string;
}

// Enrollment types
export interface Enrollment {
  _id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  completedAt?: string;
  progress?: number;
  user?: User;
  course?: Course;
}

// Dashboard types
export interface DashboardData {
  role: string;
  enrollments?: Enrollment[];
  quizAttempts?: QuizAttempt[];
  courses?: Course[];
  quizzes?: Quiz[];
  blogs?: Blog[];
  stats: {
    enrolledCount: number;
    completedQuizzes: number;
    averageScore: number;
    totalCourses: number;
    totalStudents: number;
    totalQuizzes: number;
    totalBlogs: number;
    publishedCourses: number;
  };
  limits?: {
    courses: number;
    quizzes: number;
    blogs: number;
  };
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status?: number;
  code?: string;
}

/** Standard JSON error payload for App Router `NextResponse.json` handlers. */
export interface ApiJsonErrorBody {
  ok: false;
  message: string;
  code?: string;
  errors?: unknown;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface CreateCourseForm {
  title: string;
  description: string;
  price: number;
  category: string;
  locale: string;
  thumbnailUrl?: string;
  publishImmediately: boolean;
}

export interface CreateQuizForm {
  title: string;
  description: string;
  courseId: string;
  timeLimit: number;
  questions: QuizQuestion[];
  publishImmediately: boolean;
}

export interface CreateBlogForm {
  title: string;
  content: string;
  excerpt?: string;
  thumbnailUrl?: string;
  language: 'en' | 'hi';
  publishImmediately: boolean;
}

// Settings types
export interface AppSettings {
  teacherLimits: {
    courses: number;
    quizzes: number;
    blogs: number;
  };
  features: {
    blogs: boolean;
    quizzes: boolean;
    courses: boolean;
    analytics: boolean;
  };
  platform: {
    maintenanceMode: boolean;
    allowRegistration: boolean;
  };
}

// Organization types
export interface Organization {
  _id: string;
  name: string;
  description?: string;
  inviteCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
    courses: number;
    blogs: number;
    quizzes: number;
  };
}

// Chart data types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ScoreTrendData {
  date: string;
  score: number;
  quizTitle: string;
}

export interface AverageScoreData {
  date: string;
  averageScore: number;
  movingAverage: number;
  attemptCount: number;
}

export interface QuizStatusData {
  name: string;
  value: number;
  color?: string;
  icon?: React.ReactNode;
}

// Common UI types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface ModalState {
  isOpen: boolean;
  data?: unknown;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Navigation types
export interface NavItem {
  name: string;
  href: string;
  icon: string;
  badge?: number;
}

export interface NavigationConfig {
  student: NavItem[];
  teacher: NavItem[];
  admin: NavItem[];
  superadmin: NavItem[];
}

// Theme types
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface RoleTheme {
  name: string;
  colors: ThemeColors;
  gradient: string;
}

// Search and filter types
export interface SearchFilters {
  query?: string;
  category?: string;
  language?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterOptions {
  categories: string[];
  languages: string[];
  statuses: string[];
  sortOptions: string[];
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export interface SessionUser {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  role?: string;
  phone?: string;
  organizationId?: string;
  canUploadVideos?: boolean;
}

export interface Session {
  user: SessionUser;
  expires: string;
}


export interface AppStoreState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;

  // Settings state
  settings: AppSettings | null;
  setSettings: (settings: AppSettings | null) => void;
  invalidateSettings: () => void;

  // Courses state
  courses: Course[];
  setCourses: (courses: Course[]) => void;
  addCourse: (course: Course) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  removeCourse: (id: string) => void;

  // Blogs state
  blogs: Blog[];
  setBlogs: (blogs: Blog[]) => void;
  addBlog: (blog: Blog) => void;
  updateBlog: (id: string, updates: Partial<Blog>) => void;
  removeBlog: (id: string) => void;

  // Quizzes state
  quizzes: Quiz[];
  setQuizzes: (quizzes: Quiz[]) => void;
  addQuiz: (quiz: Quiz) => void;
  updateQuiz: (id: string, updates: Partial<Quiz>) => void;
  removeQuiz: (id: string) => void;

  // Enrollments state
  enrollments: Enrollment[];
  setEnrollments: (enrollments: Enrollment[]) => void;
  addEnrollment: (enrollment: Enrollment) => void;
  updateEnrollment: (id: string, updates: Partial<Enrollment>) => void;

  // Quiz attempts state
  quizAttempts: QuizAttempt[];
  setQuizAttempts: (attempts: QuizAttempt[]) => void;
  addQuizAttempt: (attempt: QuizAttempt) => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Error state
  error: string | null;
  setError: (error: string | null) => void;

  // Clear all data
  clearAll: () => void;
}

export interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ScoreTrendData;
    value: number;
  }>;
  label?: string;
}

export interface ScoreTrendChartProps {
  data: ScoreTrendData[];
  title?: string;
  height?: number;
}

export interface ProcessedQuizStatusData extends QuizStatusData {
  color: string;
  icon: React.ReactNode;
}

export interface QuizStatusChartProps {
  data: QuizStatusData[];
  title?: string;
  height?: number;
}

export interface QuizStatusCustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ProcessedQuizStatusData;
    value: number;
  }>;
}

export interface CustomLabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}
