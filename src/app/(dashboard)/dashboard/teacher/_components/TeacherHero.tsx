'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/constants/routes';
import { GraduationCap, Plus, AlertCircle, PenTool } from 'lucide-react';
import { useFeature } from '@/contexts/AppSettingsContext';

const MotionLink = motion(Link);

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
      transition={{ duration: 0.3 }}
      className="hero-banner relative overflow-hidden"
    >
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border border-[var(--teacher-border)]">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{t('dashboard.teacherDashboard')}</span>
          </div>
          <h1 className="heading-xl">
            {t('dashboard.welcomeBack')}{displayName ? `, ` : '!'}
            {displayName && <span className="gradient-text">{displayName}!</span>}
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)]">
            {t('dashboard.manageContent')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-2 md:pt-0">
          {enableBlogs && (
            isAtBlogLimit ? (
              <button
                type="button"
                onClick={() => onLimitReached('blogs', blogLimit)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)] border border-[var(--border)] cursor-not-allowed min-h-[44px]"
              >
                <PenTool className="w-4 h-4" />
                <span>{t('dashboard.createBlog')}</span>
              </button>
            ) : (
              <Link
                href={ROUTES.teacher.blogCreate}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[var(--card-solid)] text-[var(--color-foreground)] border border-[var(--border)] hover:border-[var(--teacher-border)] hover:bg-[var(--teacher-soft)] transition-all shadow-[var(--shadow-sm)] min-h-[44px]"
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
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)] border border-[var(--border)] cursor-not-allowed min-h-[44px]"
              >
                <AlertCircle className="w-4 h-4 text-[var(--warning)]" />
                <span>{t('dashboard.createCourse')}</span>
              </button>
            ) : (
              <MotionLink
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href={ROUTES.teacher.courseCreate}
                className="btn-premium inline-flex items-center gap-2 text-xs sm:text-sm min-h-[44px] !py-2.5 !px-5"
              >
                <Plus className="w-4 h-4" />
                <span>{t('dashboard.createCourse')}</span>
              </MotionLink>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
}
