'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/constants/routes';
import { Sparkles, Search, HelpCircle, BookOpen, ArrowRight, Trophy } from 'lucide-react';
import { useFeature } from '@/contexts/AppSettingsContext';

interface StudentHeroProps {
  userName?: string;
  enrolledCount: number;
}

export default function StudentHero({ userName, enrolledCount }: StudentHeroProps) {
  const { t } = useTranslation();
  const enableCourses = useFeature('enableCourses');
  const enableQuizzes = useFeature('enableQuizzes');
  const enableContests = useFeature('enableContests');

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
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-[var(--student-primary)]/20 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[var(--color-secondary)]/20 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-[var(--student-soft)] text-[var(--student-primary)] border border-[var(--student-border)]/50 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t('dashboard.studentDashboard')}</span>
          </motion.div>
          
          <div className="space-y-2">
            <motion.h2 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight"
            >
              {t('dashboard.welcomeBack')}{displayName ? `, ` : '!'}
              {displayName && <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--student-primary)] to-[var(--color-secondary)]">{displayName}!</span>}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm sm:text-lg text-[var(--color-muted-foreground)] font-medium max-w-xl"
            >
              {t('dashboard.continueLearning').replace('{count}', String(enrolledCount))}
            </motion.p>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center gap-3 pt-2 md:pt-0"
        >
          {enableCourses && (
            <Link
              href={ROUTES.student.browse}
              className="group/btn relative inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-[var(--card-solid)]/60 backdrop-blur-md text-[var(--color-foreground)] border border-[var(--border)] hover:border-[var(--student-primary)]/50 hover:bg-[var(--surface-muted)] hover:shadow-lg transition-all duration-300"
            >
              <Search className="w-4 h-4 text-[var(--student-primary)]" />
              <span>{t('dashboard.browseCatalog')}</span>
            </Link>
          )}

          {enableQuizzes && (
            <Link
              href={ROUTES.student.quizzes}
              className="group/btn relative inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-[var(--card-solid)]/60 backdrop-blur-md text-[var(--color-foreground)] border border-[var(--border)] hover:border-[var(--student-primary)]/50 hover:bg-[var(--surface-muted)] hover:shadow-lg transition-all duration-300"
            >
              <HelpCircle className="w-4 h-4 text-[var(--student-primary)]" />
              <span>{t('dashboard.takeQuiz')}</span>
            </Link>
          )}

          {enableContests && (
            <Link
              href={ROUTES.student.contests}
              className="group/btn relative inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-[var(--card-solid)]/60 backdrop-blur-md text-[var(--color-foreground)] border border-[var(--border)] hover:border-[var(--student-primary)]/50 hover:bg-[var(--surface-muted)] hover:shadow-lg transition-all duration-300"
            >
              <Trophy className="w-4 h-4 text-[var(--student-primary)]" />
              <span>{t('dashboard.contests') || 'Contests'}</span>
            </Link>
          )}

          {enableCourses && enrolledCount > 0 && (
            <Link
              href={ROUTES.student.courses}
              className="relative inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[var(--student-primary)] to-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <BookOpen className="w-4 h-4" />
              <span>{t('dashboard.resumeLearning')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
