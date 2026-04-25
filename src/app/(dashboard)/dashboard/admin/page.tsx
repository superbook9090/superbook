// src/app/(dashboard)/dashboard/admin/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Users,
  BookOpen,
  BarChart3,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useSessionStore } from '@/store/useSessionStore';

export default function AdminDashboardPage() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const { t } = useTranslation();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-[var(--student-border)] border-t-[var(--student-primary)] rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  // Role-based redirect handled in /dashboard/page.tsx - no redirect here

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-3 bg-[var(--primary-soft)] rounded-xl">
          <SettingsIcon className="w-6 h-6 text-[var(--primary)]" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)]">{t('admin.adminDashboard')}</h1>
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] mt-1">{t('admin.adminDesc')}</p>
        </div>
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <a
          href="/dashboard/admin/users"
          className="bg-[var(--card-solid)] rounded-2xl shadow-sm p-4 sm:p-6 hover:shadow-lg transition-all group w-full"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-[var(--info-light)] text-[var(--info)] group-hover:bg-[var(--info-light)]/80 transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-[var(--color-muted-foreground)]">{t('admin.userManagement')}</p>
              <p className="text-lg font-semibold text-[var(--color-foreground)]">{t('admin.manageUsers')}</p>
            </div>
          </div>
        </a>

        <a
          href="/dashboard/admin/courses"
          className="bg-[var(--card-solid)] rounded-2xl shadow-sm p-4 sm:p-6 hover:shadow-lg transition-all group w-full"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-[var(--success-light)] text-[var(--success)] group-hover:bg-[var(--success-light)]/80 transition-colors">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-[var(--color-muted-foreground)]">{t('admin.allCourses')}</p>
              <p className="text-lg font-semibold text-[var(--color-foreground)]">{t('admin.manageCourses')}</p>
            </div>
          </div>
        </a>

        <a
          href="/dashboard/admin/analytics"
          className="bg-[var(--card-solid)] rounded-2xl shadow-sm p-4 sm:p-6 hover:shadow-lg transition-all group w-full"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-[var(--student-soft)] text-[var(--student-primary)] group-hover:bg-[var(--student-border)] transition-colors">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-[var(--color-muted-foreground)]">{t('admin.analytics')}</p>
              <p className="text-lg font-semibold text-[var(--color-foreground)]">{t('admin.systemStats')}</p>
            </div>
          </div>
        </a>

        <a
          href="/dashboard/admin/settings"
          className="bg-[var(--card-solid)] rounded-2xl shadow-sm p-4 sm:p-6 hover:shadow-lg transition-all group w-full"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-[var(--warning-light)] text-[var(--warning)] group-hover:bg-[var(--warning-light)]/80 transition-colors">
              <SettingsIcon className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-[var(--color-muted-foreground)]">{t('admin.settings')}</p>
              <p className="text-lg font-semibold text-[var(--color-foreground)]">{t('admin.manageSettings')}</p>
            </div>
          </div>
        </a>
      </motion.div>
    </div>
  );
}
