'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/constants/routes';
import { PlayCircle, ArrowRight, Compass } from 'lucide-react';
import { ResponsiveGrid } from '@/components/layout';
import type { Enrollment } from './types';

interface ContinueLearningProps {
  enrollments: Enrollment[];
}

export default function ContinueLearning({ enrollments }: ContinueLearningProps) {
  const { t } = useTranslation();

  if (enrollments.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="relative overflow-hidden p-6 sm:p-10 text-center rounded-[2rem] bg-[var(--card-solid)]/40 backdrop-blur-xl border border-[var(--border)]/50 shadow-xl group"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--surface-muted)]/20 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5 rounded-[1.5rem] bg-[var(--student-soft)]/50 border border-[var(--student-border)]/50 flex items-center justify-center text-[var(--student-primary)] shadow-[0_8px_16px_-6px_rgba(0,0,0,0.1)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
            <Compass className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-[var(--color-foreground)] mb-2">
            {t('dashboard.noEnrolledCourses')}
          </h3>
          <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] max-w-sm mx-auto mb-6 font-medium">
            {t('dashboard.noEnrolledDesc')}
          </p>
          <Link
            href={ROUTES.student.browse}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[var(--student-primary)] to-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <Compass className="w-4 h-4" />
            <span>{t('dashboard.exploreCourses')}</span>
          </Link>
        </div>
      </motion.div>
    );
  }

  const activeCourses = enrollments.slice(0, 3);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      aria-labelledby="continue-learning-heading"
      className="space-y-4 sm:space-y-6"
    >
      <div className="flex items-baseline justify-between">
        <div>
          <h2 id="continue-learning-heading" className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--color-foreground)]">
            {t('dashboard.inProgressCourses')}
          </h2>
        </div>
        <Link
          href={ROUTES.student.courses}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[var(--student-primary)] hover:text-blue-500 transition-colors group/link"
        >
          <span>{t('dashboard.viewAll')}</span>
          <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="perspective-1000">
        <ResponsiveGrid variant="cards">
          {activeCourses.map((item, idx) => {
            const courseId = item.course?._id;
            const courseTitle = item.course?.title || t('common.aCourse');
            const courseCategory = item.course?.category;
            const progress = Math.min(100, Math.max(0, item.progress || 0));

            return (
              <motion.div
                key={item._id || idx}
                initial={{ opacity: 0, y: 16, rotateX: 6 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.3 + idx * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex flex-col justify-between rounded-[2rem] bg-[var(--card-solid)]/40 backdrop-blur-xl border border-[var(--border)]/50 p-5 hover:border-[var(--student-primary)]/50 hover:shadow-2xl transition-all duration-300 group overflow-hidden"
              >
                {/* Glow effect on hover */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--student-primary)]/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-[var(--student-soft)] text-[var(--student-primary)] border border-[var(--student-border)]/60 truncate max-w-[150px]">
                      {courseCategory || t('common.course')}
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold tabular-nums text-[var(--student-primary)]">
                      {progress}%
                    </span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base md:text-lg text-[var(--color-foreground)] line-clamp-2 mb-3 group-hover:text-[var(--student-primary)] transition-colors">
                    {courseTitle}
                  </h3>

                  <div className="w-full bg-[var(--surface-muted-strong)] rounded-full h-1.5 mb-5 overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.5 + idx * 0.1 }}
                      className="h-full rounded-full"
                      style={{ background: 'var(--student-gradient)' }}
                    />
                  </div>
                </div>

                <Link
                  href={courseId ? `${ROUTES.student.courses}/${courseId}` : ROUTES.student.courses}
                  className="relative z-10 flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs sm:text-sm font-bold bg-[var(--surface-muted)] text-[var(--foreground)] hover:bg-[var(--student-primary)] hover:text-white hover:shadow-md transition-all duration-300 min-h-[44px]"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>{t('dashboard.resumeCourse')}</span>
                </Link>
              </motion.div>
            );
          })}
        </ResponsiveGrid>
      </div>
    </motion.section>
  );
}
