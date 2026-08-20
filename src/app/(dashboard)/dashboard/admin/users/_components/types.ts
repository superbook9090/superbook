export interface UserLimits {
  courses?: number;
  quizzes?: number;
  blogs?: number;
  aiQuizGenerations?: number;
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
}
