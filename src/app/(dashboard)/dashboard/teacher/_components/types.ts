import type { TeacherDashboardData } from '@/lib/react-query/hooks';

export interface TeacherCourse {
  _id: string;
  title: string;
  enrolledCount?: number;
  isPublished: boolean;
  category?: string;
  price?: number;
  lessonCount?: number;
}

export interface TeacherQuiz {
  _id: string;
  title: string;
  isPublished: boolean;
  course: { _id: string; title?: string } | string;
  questionCount?: number;
}

export interface TeacherBlog {
  _id: string;
  title: string;
  topic: string;
  content?: string;
  language: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  author?: { _id: string; name: string };
}

export type TeacherStatsData = TeacherDashboardData['stats'];
export type TeacherLimitsData = TeacherDashboardData['limits'];
