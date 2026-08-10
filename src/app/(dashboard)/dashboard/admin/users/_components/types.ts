export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
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
  canUploadVideos?: boolean;
  canCreatePublicCourses?: boolean;
}
