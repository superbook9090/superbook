import type { NotificationCategory } from '@/lib/notifications/push/notificationPayload';
import type { BroadcastTargetAudience, AdminBroadcastLogItem, AdminNotificationStatsData } from '@/lib/api/notifications';
import {
  BookOpen,
  Award,
  FileCheck2,
  Radio,
  Megaphone,
  Settings2,
  LucideIcon,
} from 'lucide-react';

export type NotificationTabKey = 'compose' | 'templates' | 'history';
export type DevicePreviewMode = 'ios' | 'android' | 'inbox';
export type PreviewLang = 'en' | 'hi';
export type { BroadcastTargetAudience };

export interface NotificationTemplateItem {
  id: string;
  category: NotificationCategory;
  nameKey: string;
  titleEn: string;
  titleHi: string;
  bodyEn: string;
  bodyHi: string;
  defaultDeepLink?: string;
  defaultAudience?: BroadcastTargetAudience;
  icon: LucideIcon;
  badgeColor: string;
}

export interface CategoryMeta {
  key: NotificationCategory;
  labelKey: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  gradient: string;
}

export const NOTIFICATION_CATEGORIES: CategoryMeta[] = [
  {
    key: 'liveClasses',
    labelKey: 'notifications.categories.liveClasses',
    icon: Radio,
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-500/10 dark:bg-rose-500/20',
    borderColor: 'border-rose-500/30',
    gradient: 'from-rose-500 to-red-600',
  },
  {
    key: 'quizzes',
    labelKey: 'notifications.categories.quizzes',
    icon: Award,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-500/10 dark:bg-amber-500/20',
    borderColor: 'border-amber-500/30',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    key: 'assignments',
    labelKey: 'notifications.categories.assignments',
    icon: FileCheck2,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    borderColor: 'border-indigo-500/30',
    gradient: 'from-indigo-500 to-purple-600',
  },
  {
    key: 'lessons',
    labelKey: 'notifications.categories.lessons',
    icon: BookOpen,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    borderColor: 'border-emerald-500/30',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    key: 'announcements',
    labelKey: 'notifications.categories.announcements',
    icon: Megaphone,
    color: 'text-sky-600 dark:text-sky-400',
    bgColor: 'bg-sky-500/10 dark:bg-sky-500/20',
    borderColor: 'border-sky-500/30',
    gradient: 'from-sky-500 to-blue-600',
  },
  {
    key: 'system',
    labelKey: 'notifications.categories.system',
    icon: Settings2,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-500/10 dark:bg-purple-500/20',
    borderColor: 'border-purple-500/30',
    gradient: 'from-purple-500 to-violet-600',
  },
];

export type { AdminBroadcastLogItem, AdminNotificationStatsData };
