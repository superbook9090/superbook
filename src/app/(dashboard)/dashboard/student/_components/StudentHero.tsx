'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Search, HelpCircle, BookOpen, ArrowRight, Trophy } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/constants/routes';
import { useFeature } from '@/contexts/AppSettingsContext';
import StreakBadge from '@/components/gamification/StreakBadge';
import { OrganizationBadge } from '@/components/organization/OrganizationBadge';
import { useSessionStore } from '@/store/useSessionStore';

interface StudentHeroProps {
  userName?: string;
  enrolledCount: number;
}

export default function StudentHero({ userName, enrolledCount }: StudentHeroProps) {
  const { t } = useTranslation();
  const sessionUser = useSessionStore((s) => s.session?.user);
  const enableCourses = useFeature('enableCourses');
  const enableQuizzes = useFeature('enableQuizzes');
  const enableContests = useFeature('enableContests');

  const displayName = userName
    ? userName.charAt(0).toUpperCase() + userName.slice(1)
    : '';

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="student-panel overflow-hidden p-5 sm:p-7"
    >
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: 'var(--student-gradient)' }}
        aria-hidden
      />
      <div
        className="absolute -top-28 -right-24 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: 'var(--student-gradient)' }}
        aria-hidden
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 sm:gap-6">
        <div className="space-y-3 max-w-2xl min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--student-soft)] text-[var(--student-primary)] border border-[var(--student-border)]">
              <Sparkles className="w-3.5 h-3.5" aria-hidden />
              <span>{t('dashboard.studentDashboard')}</span>
            </span>
            {sessionUser?.organizationName && (
              <OrganizationBadge
                name={sessionUser.organizationName}
                logo={sessionUser.organizationLogo}
                color={sessionUser.organizationColor}
                variant="pill"
              />
            )}
            <StreakBadge compact />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-[family-name:var(--font-display)] tracking-tight text-[var(--color-foreground)] leading-tight">
              {t('dashboard.welcomeBack')}
              {displayName ? ', ' : '!'}
              {displayName && (
                <span className="gradient-text">{displayName}!</span>
              )}
            </h2>
            <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] max-w-xl leading-relaxed">
              {t('dashboard.continueLearning').replace('{count}', String(enrolledCount))}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {enableCourses && enrolledCount > 0 && (
            <Link
              href={ROUTES.student.courses}
              className="student-cta-btn w-full sm:w-auto"
            >
              <BookOpen className="w-4 h-4" />
              <span>{t('dashboard.resumeLearning')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}

          {enableCourses && (
            <Link
              href={ROUTES.student.browse}
              className="student-pill-btn flex-1 sm:flex-initial"
            >
              <Search className="w-4 h-4 text-[var(--student-primary)]" />
              <span>{t('dashboard.browseCatalog')}</span>
            </Link>
          )}

          {enableQuizzes && (
            <Link
              href={ROUTES.student.quizzes}
              className="student-pill-btn flex-1 sm:flex-initial"
            >
              <HelpCircle className="w-4 h-4 text-[var(--student-primary)]" />
              <span>{t('dashboard.takeQuiz')}</span>
            </Link>
          )}

          {enableContests && (
            <Link
              href={ROUTES.student.contests}
              className="student-pill-btn flex-1 sm:flex-initial"
            >
              <Trophy className="w-4 h-4 text-[var(--student-primary)]" />
              <span>{t('common.contests')}</span>
            </Link>
          )}
        </div>
      </div>
    </motion.section>
  );
}
