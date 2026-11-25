'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { GraduationCap, Plus, AlertCircle, PenTool } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/constants/routes';
import { useFeature } from '@/contexts/AppSettingsContext';
import { useSessionStore } from '@/store/useSessionStore';
import { OrganizationBadge } from '@/components/organization/OrganizationBadge';

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
  const sessionUser = useSessionStore((s) => s.session?.user);
  const enableCourses = useFeature('enableCourses');
  const enableBlogs = useFeature('enableBlogs');

  const displayName = userName
    ? userName.charAt(0).toUpperCase() + userName.slice(1)
    : '';

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="teacher-panel overflow-hidden p-5 sm:p-7"
    >
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: 'var(--teacher-gradient)' }}
        aria-hidden
      />
      <div
        className="absolute -top-28 -right-24 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: 'var(--teacher-gradient)' }}
        aria-hidden
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 sm:gap-6">
        <div className="space-y-3 max-w-2xl min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border border-[var(--teacher-border)]">
              <GraduationCap className="w-3.5 h-3.5" aria-hidden />
              <span>{t('dashboard.teacherDashboard')}</span>
            </span>
            {sessionUser?.organizationName && (
              <OrganizationBadge
                name={sessionUser.organizationName}
                logo={sessionUser.organizationLogo}
                color={sessionUser.organizationColor}
                variant="pill"
              />
            )}
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-[family-name:var(--font-display)] tracking-tight text-[var(--color-foreground)] leading-tight">
              {t('dashboard.welcomeBack')}
              {displayName ? ', ' : '!'}
              {displayName && <span className="gradient-text">{displayName}!</span>}
            </h1>
            <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] max-w-xl leading-relaxed">
              {t('dashboard.manageContent')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {enableBlogs && (
            isAtBlogLimit ? (
              <button
                type="button"
                onClick={() => onLimitReached('blogs', blogLimit)}
                className="teacher-pill-btn opacity-65 cursor-not-allowed flex-1 sm:flex-initial"
              >
                <PenTool className="w-4 h-4" />
                <span>{t('dashboard.createBlog')}</span>
              </button>
            ) : (
              <Link
                href={ROUTES.teacher.blogCreate}
                className="teacher-pill-btn flex-1 sm:flex-initial"
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
                className="teacher-pill-btn opacity-65 cursor-not-allowed flex-1 sm:flex-initial"
              >
                <AlertCircle className="w-4 h-4 text-[var(--warning)]" />
                <span>{t('dashboard.createCourse')}</span>
              </button>
            ) : (
              <Link
                href={ROUTES.teacher.courseCreate}
                className="teacher-cta-btn w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span>{t('dashboard.createCourse')}</span>
              </Link>
            )
          )}
        </div>
      </div>
    </motion.section>
  );
}
