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
        className="card-surface card-body p-4 sm:p-6 md:p-8 text-center rounded-3xl border border-[var(--border)] antigravity-glass shadow-lg"
      >
        <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[var(--student-soft)] to-[var(--student-primary)]/15 border border-[var(--student-border)] flex items-center justify-center text-[var(--student-primary)] shadow-sm">
          <Compass className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-[var(--color-foreground)] mb-1">
          {t('dashboard.noEnrolledCourses')}
        </h3>
        <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] max-w-md mx-auto mb-5">
          {t('dashboard.noEnrolledDesc')}
        </p>
        <Link
          href={ROUTES.student.browse}
          className="btn-premium inline-flex items-center gap-2 text-xs sm:text-sm hover:shadow-lg hover:scale-102 transition-all duration-300"
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
      <div className="flex items-baseline justify-between">
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
                transition={{ delay: 0.3 + idx * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="card-surface card-body flex flex-col justify-between rounded-3xl border border-[var(--border)] hover:border-[var(--student-primary)]/40 hover:shadow-xl transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--student-soft)] text-[var(--student-primary)] border border-[var(--student-border)]/60 truncate max-w-[150px]">
                      {courseCategory || t('common.course')}
                    </span>
                    <span className="text-xs font-bold tabular-nums text-[var(--color-muted-foreground)]">
                      {progress}%
                    </span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-[var(--color-foreground)] line-clamp-2 mb-2 group-hover:text-[var(--student-primary)] transition-colors">
                    {courseTitle}
                  </h3>

                  <div className="w-full bg-[var(--surface-muted-strong)] rounded-full h-2 mb-4 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-500 shadow-sm"
                      style={{
                        width: `${progress}%`,
                        background: 'var(--student-gradient)',
                      }}
                    />
                  </div>
                </div>

                <div className="pt-2.5 border-t border-[var(--border)]/60">
                  <Link
                    href={courseId ? `${ROUTES.student.courses}/${courseId}` : ROUTES.student.courses}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-[var(--student-soft)] text-[var(--student-primary)] hover:bg-[var(--student-primary)] hover:text-white hover:shadow-md transition-all min-h-[44px]"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>{t('dashboard.resumeCourse')}</span>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </ResponsiveGrid>
      </div>
    </motion.section>
  );
}
