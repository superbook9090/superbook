import type { AdminStats } from '../analytics/_components/types';

export type { AdminStats };

export interface AdminQuickLink {
  href: string;
  icon: React.ElementType;
  labelKey: string;
  titleKey: string;
  descriptionKey?: string;
  iconBg: string;
  iconColor: string;
  feature?: 'enableCourses' | 'enableQuizzes' | 'enableBlogs' | 'enableAnalytics' | 'enableNotes';
  superadminOnly?: boolean;
}
