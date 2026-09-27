'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/constants/routes';
import { GraduationCap, Plus, AlertCircle, PenTool } from 'lucide-react';
import { useFeature } from '@/contexts/AppSettingsContext';

interface TeacherHeroProps {
  userName?: string;
  isAtCourseLimit: boolean;
  isAtBlogLimit: boolean;
  courseLimit: number;
  blogLimit: number;
  onLimitReached: (type: 'courses' | 'blogs', limit: number) => void;
}

export default function TeacherHero({
  userName,
  isAtCourseLimit,
  isAtBlogLimit,
  courseLimit,
  blogLimit,
  onLimitReached,
}: TeacherHeroProps) {
  const { t } = useTranslation();
  const enableCourses = useFeature('enableCourses');
  const enableBlogs = useFeature('enableBlogs');

  const displayName = userName
    ? userName.charAt(0).toUpperCase() + userName.slice(1)
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-[2rem] bg-[var(--card-solid)]/30 backdrop-blur-2xl border border-[var(--border)]/50 p-6 sm:p-10 shadow-xl group"
    >
      {/* Decorative ambient gradients */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-[var(--teacher-primary)]/20 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border border-[var(--teacher-border)]/50 shadow-sm"
          >
            <GraduationCap className="w-4 h-4" />
            <span>{t('dashboard.teacherDashboard')}</span>
          </motion.div>
          
          <div className="space-y-2">
            <motion.h1 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight"
            >
              {t('dashboard.welcomeBack')}{displayName ? `, ` : '!'}
              {displayName && <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--teacher-primary)] to-purple-500">{displayName}!</span>}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm sm:text-lg text-[var(--color-muted-foreground)] font-medium max-w-xl"
            >
              {t('dashboard.manageContent')}
            </motion.p>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center gap-3 pt-2 md:pt-0"
        >
          {enableBlogs && (
            isAtBlogLimit ? (
              <button
                type="button"
                onClick={() => onLimitReached('blogs', blogLimit)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-[var(--surface-muted)] text-[var(--color-muted-foreground)] border border-[var(--border)] cursor-not-allowed min-h-[44px]"
              >
                <PenTool className="w-4 h-4" />
                <span>{t('dashboard.createBlog')}</span>
              </button>
            ) : (
              <Link
                href={ROUTES.teacher.blogCreate}
                className="group/btn relative inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-[var(--card-solid)]/60 backdrop-blur-md text-[var(--color-foreground)] border border-[var(--border)] hover:border-[var(--teacher-primary)]/50 hover:bg-[var(--surface-muted)] hover:shadow-lg transition-all duration-300 min-h-[44px]"
              >
                <PenTool className="w-4 h-4 text-[var(--teacher-primary)]" />
                <span>{t('dashboard.createBlog')}</span>
              </Link>
            )
          )}

          {enableCourses && (
            isAtCourseLimit ? (
              <button
                type="button"
                onClick={() => onLimitReached('courses', courseLimit)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-[var(--surface-muted)] text-[var(--color-muted-foreground)] border border-[var(--border)] cursor-not-allowed min-h-[44px]"
              >
                <AlertCircle className="w-4 h-4 text-[var(--warning)]" />
                <span>{t('dashboard.createCourse')}</span>
              </button>
            ) : (
              <Link
                href={ROUTES.teacher.courseCreate}
                className="relative inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[var(--teacher-primary)] to-purple-600 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                <span>{t('dashboard.createCourse')}</span>
              </Link>
            )
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
