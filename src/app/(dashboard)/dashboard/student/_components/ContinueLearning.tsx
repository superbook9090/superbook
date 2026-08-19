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
        className="card-surface card-body p-6 sm:p-8 text-center rounded-2xl border border-[var(--border)]"
      >
        <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 rounded-2xl bg-[var(--student-soft)] flex items-center justify-center text-[var(--student-primary)]">
          <Compass className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-[var(--color-foreground)] mb-1">
          {t('dashboard.noEnrolledCourses')}
        </h3>
        <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] max-w-md mx-auto mb-5">
          {t('dashboard.noEnrolledDesc')}
        </p>
        <Link
          href={ROUTES.student.browse}
          className="btn-premium inline-flex items-center gap-2 text-xs sm:text-sm"
        >
          <Compass className="w-4 h-4" />
          <span>{t('dashboard.exploreCourses')}</span>
        </Link>
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
      className="space-y-3 sm:space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 id="continue-learning-heading" className="text-lg sm:text-xl font-bold text-[var(--color-foreground)]">
            {t('dashboard.inProgressCourses')}
          </h2>
        </div>
        <Link
          href={ROUTES.student.courses}
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[var(--student-primary)] hover:text-[var(--student-hover)] transition-colors"
        >
          <span>{t('dashboard.viewAll')}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <ResponsiveGrid variant="cards">
        {activeCourses.map((item, idx) => {
          const courseId = item.course?._id;
          const courseTitle = item.course?.title || t('common.aCourse');
          const courseCategory = item.course?.category;
          const progress = Math.min(100, Math.max(0, item.progress || 0));

          return (
            <motion.div
              key={item._id || idx}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.05 }}
              className="card-surface card-body flex flex-col justify-between rounded-2xl border border-[var(--border)] hover:border-[var(--student-border)] hover:shadow-[var(--shadow-md)] transition-all duration-300 group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[var(--student-soft)] text-[var(--student-primary)] truncate max-w-[150px]">
                    {courseCategory || t('common.course')}
                  </span>
                  <span className="text-xs font-bold tabular-nums text-[var(--color-muted-foreground)]">
                    {progress}%
                  </span>
                </div>

                <h3 className="font-bold text-sm sm:text-base text-[var(--color-foreground)] line-clamp-2 mb-2 group-hover:text-[var(--student-primary)] transition-colors">
                  {courseTitle}
                </h3>

                <div className="w-full bg-[var(--color-surface-muted-strong)] rounded-full h-2 mb-4 overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      background: 'var(--student-gradient)',
                    }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--border)]">
                <Link
                  href={courseId ? `${ROUTES.student.courses}/${courseId}` : ROUTES.student.courses}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-[var(--student-soft)] text-[var(--student-primary)] hover:bg-[var(--student-primary)] hover:text-white transition-all min-h-[44px]"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>{t('dashboard.resumeCourse')}</span>
                </Link>
              </div>
            </motion.div>
          );
        })}
      </ResponsiveGrid>
    </motion.section>
  );
}
