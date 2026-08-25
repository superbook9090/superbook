'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/constants/routes';
import { Sparkles, Search, HelpCircle, BookOpen } from 'lucide-react';
import { useFeature } from '@/contexts/AppSettingsContext';

interface StudentHeroProps {
  userName?: string;
  enrolledCount: number;
}

export default function StudentHero({ userName, enrolledCount }: StudentHeroProps) {
  const { t } = useTranslation();
  const enableCourses = useFeature('enableCourses');
  const enableQuizzes = useFeature('enableQuizzes');

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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--student-soft)] text-[var(--student-primary)] border border-[var(--student-border)]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('dashboard.studentDashboard')}</span>
          </div>
          <h2 className="heading-xl">
            {t('dashboard.welcomeBack')}{displayName ? `, ` : '!'}
            {displayName && <span className="gradient-text">{displayName}!</span>}
          </h2>
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)]">
            {t('dashboard.continueLearning').replace('{count}', String(enrolledCount))}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-2 md:pt-0">
          {enableCourses && (
            <Link
              href={ROUTES.student.browse}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[var(--card-solid)] text-[var(--color-foreground)] border border-[var(--border)] hover:border-[var(--student-border)] hover:bg-[var(--student-soft)] transition-all shadow-[var(--shadow-sm)]"
            >
              <Search className="w-4 h-4 text-[var(--student-primary)]" />
              <span>{t('dashboard.browseCatalog')}</span>
            </Link>
          )}

          {enableQuizzes && (
            <Link
              href={ROUTES.student.quizzes}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[var(--card-solid)] text-[var(--color-foreground)] border border-[var(--border)] hover:border-[var(--student-border)] hover:bg-[var(--student-soft)] transition-all shadow-[var(--shadow-sm)]"
            >
              <HelpCircle className="w-4 h-4 text-[var(--student-primary)]" />
              <span>{t('dashboard.takeQuiz')}</span>
            </Link>
          )}

          {enableCourses && enrolledCount > 0 && (
            <Link
              href={ROUTES.student.courses}
              className="btn-premium inline-flex items-center gap-2 text-xs sm:text-sm !py-2.5 !px-4"
            >
              <BookOpen className="w-4 h-4" />
              <span>{t('dashboard.resumeLearning')}</span>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
