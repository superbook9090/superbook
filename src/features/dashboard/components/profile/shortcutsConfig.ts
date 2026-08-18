import React from 'react';
import {
  BookOpen,
  HelpCircle,
  FileText,
  Award,
  BarChart3,
  HardDrive,
  Newspaper,
  PlusCircle,
  Users,
  Settings,
  Bell,
  Building2,
  Video,
  Bookmark,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export interface ShortcutItem {
  title: string;
  desc: string;
  href: string;
  icon: React.ElementType;
  color: string;
}

export function getRoleShortcuts(
  role: string,
  superAdmin: boolean,
  adminUser: boolean,
  t: (key: string) => string
): ShortcutItem[] {
  if (adminUser) {
    return [
      {
        title: t('profile.manageUsers') || 'Manage Users',
        desc: t('profile.manageUsersDesc') || 'Inspect accounts, assign roles, and adjust teacher limits',
        href: ROUTES.admin.users,
        icon: Users,
        color: 'hover:border-[var(--primary)]/40',
      },
      {
        title: t('profile.manageSettings') || 'System Settings',
        desc: t('profile.manageSettingsDesc') || 'Toggle feature flags, limits, and maintenance mode',
        href: ROUTES.admin.settings,
        icon: Settings,
        color: 'hover:border-[var(--warning)]/40',
      },
      {
        title: t('profile.viewAnalytics') || 'System Analytics',
        desc: t('profile.viewAnalyticsDesc') || 'Platform metrics, user activity, and performance data',
        href: ROUTES.admin.analytics,
        icon: BarChart3,
        color: 'hover:border-[var(--primary)]/40',
      },
      ...(superAdmin
        ? [
            {
              title: t('profile.broadcastNotifications') || 'Push Notifications',
              desc: t('profile.broadcastNotificationsDesc') || 'Send instant alerts and push notifications to all users',
              href: ROUTES.admin.notifications,
              icon: Bell,
              color: 'hover:border-[var(--error)]/40',
            },
          ]
        : []),
      {
        title: t('profile.manageOrgs') || 'Organizations',
        desc: t('profile.manageOrgsDesc') || 'Manage registered educational institutions and invite codes',
        href: ROUTES.admin.organizations,
        icon: Building2,
        color: 'hover:border-[var(--info)]/40',
      },
      {
        title: 'Courses Hub',
        desc: 'Review and manage published courses',
        href: ROUTES.admin.courses,
        icon: BookOpen,
        color: 'hover:border-[var(--success)]/40',
      },
      {
        title: 'File Storage Hub',
        desc: 'Centrally browse uploaded storage assets',
        href: ROUTES.admin.files,
        icon: HardDrive,
        color: 'hover:border-[var(--teacher-primary)]/40',
      },
      {
        title: 'Video Lectures',
        desc: 'Review centrally hosted unlisted YouTube lectures',
        href: ROUTES.admin.videos,
        icon: Video,
        color: 'hover:border-[var(--error)]/40',
      },
    ];
  }

  if (role === 'teacher') {
    return [
      {
        title: t('profile.teacherShortcutsCourses') || 'My Courses',
        desc: t('profile.teacherShortcutsCoursesDesc') || 'Manage your created courses and curriculum',
        href: ROUTES.teacher.courses,
        icon: BookOpen,
        color: 'hover:border-[var(--primary)]/40',
      },
      {
        title: t('profile.teacherShortcutsCreateCourse') || 'Create New Course',
        desc: t('profile.teacherShortcutsCreateCourseDesc') || 'Author and publish a brand new course',
        href: ROUTES.teacher.courseCreate,
        icon: PlusCircle,
        color: 'hover:border-[var(--success)]/40',
      },
      {
        title: t('profile.teacherShortcutsQuizzes') || 'Quizzes Hub',
        desc: t('profile.teacherShortcutsQuizzesDesc') || 'Create quizzes and inspect student attempts',
        href: ROUTES.teacher.quizzes,
        icon: HelpCircle,
        color: 'hover:border-[var(--teacher-primary)]/40',
      },
      {
        title: t('profile.teacherShortcutsNotes') || 'Notes & Documents',
        desc: t('profile.teacherShortcutsNotesDesc') || 'Author study notes and educational materials',
        href: ROUTES.teacher.notes,
        icon: FileText,
        color: 'hover:border-[var(--warning)]/40',
      },
      {
        title: t('profile.teacherShortcutsBlogs') || 'Articles & Blogs',
        desc: t('profile.teacherShortcutsBlogsDesc') || 'Share educational insights and write articles',
        href: ROUTES.teacher.blogs,
        icon: Newspaper,
        color: 'hover:border-[var(--error)]/40',
      },
      {
        title: t('profile.teacherShortcutsAnalytics') || 'Teaching Analytics',
        desc: t('profile.teacherShortcutsAnalyticsDesc') || 'View student enrollment numbers and progress data',
        href: ROUTES.teacher.analytics,
        icon: BarChart3,
        color: 'hover:border-[var(--primary)]/40',
      },
    ];
  }

  return [
    {
      title: t('profile.studentShortcutsCourses') || 'My Enrolled Courses',
      desc: t('profile.studentShortcutsCoursesDesc') || 'Continue learning and resume active courses',
      href: ROUTES.student.courses,
      icon: BookOpen,
      color: 'hover:border-[var(--success)]/40',
    },
    {
      title: t('profile.studentShortcutsQuizzes') || 'Quizzes & Practice',
      desc: t('profile.studentShortcutsQuizzesDesc') || 'Test your knowledge with practice quizzes',
      href: ROUTES.student.quizzes,
      icon: HelpCircle,
      color: 'hover:border-[var(--student-primary)]/40',
    },
    {
      title: t('profile.studentShortcutsNotes') || 'Notes & Resources',
      desc: t('profile.studentShortcutsNotesDesc') || 'Browse study materials and personal notes',
      href: ROUTES.student.notes,
      icon: FileText,
      color: 'hover:border-[var(--info)]/40',
    },
    {
      title: t('profile.studentShortcutsProgress') || 'My Progress',
      desc: t('profile.studentShortcutsProgressDesc') || 'Track learning milestones and course completion',
      href: ROUTES.student.progress,
      icon: BarChart3,
      color: 'hover:border-[var(--primary)]/40',
    },
    {
      title: t('profile.studentShortcutsCertificates') || 'Certificates',
      desc: t('profile.studentShortcutsCertificatesDesc') || 'View and download earned certificates',
      href: ROUTES.student.certificates,
      icon: Award,
      color: 'hover:border-[var(--warning)]/40',
    },
    {
      title: t('profile.studentShortcutsFavorites') || 'Saved Favorites',
      desc: t('profile.studentShortcutsFavoritesDesc') || 'Quickly access bookmarked articles and blogs',
      href: ROUTES.student.favorites,
      icon: Bookmark,
      color: 'hover:border-[var(--error)]/40',
    },
    {
      title: t('profile.studentShortcutsFiles') || 'Study Files',
      desc: t('profile.studentShortcutsFilesDesc') || 'Access downloadable course attachments and files',
      href: ROUTES.student.files,
      icon: HardDrive,
      color: 'hover:border-[var(--info)]/40',
    },
    {
      title: 'Articles & Blogs',
      desc: 'Explore community posts and updates',
      href: ROUTES.student.blogs,
      icon: Newspaper,
      color: 'hover:border-[var(--warning)]/40',
    },
  ];
}
