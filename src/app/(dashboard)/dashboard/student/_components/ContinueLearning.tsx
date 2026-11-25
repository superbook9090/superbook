'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { PlayCircle, ArrowRight, Compass } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/constants/routes';
import type { Enrollment } from './types';

interface ContinueLearningProps {
  enrollments: Enrollment[];
}

export default function ContinueLearning({ enrollments }: ContinueLearningProps) {
  const { t } = useTranslation();

  if (enrollments.length === 0) {
    return (
      <section className="student-panel p-6 sm:p-10 text-center border-dashed">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[var(--student-soft)] border border-[var(--student-border)] flex items-center justify-center text-[var(--student-primary)]">
          <Compass className="w-7 h-7" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-[var(--color-foreground)] mb-1.5">
          {t('dashboard.noEnrolledCourses')}
        </h3>
        <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] max-w-sm mx-auto mb-5">
          {t('dashboard.noEnrolledDesc')}
        </p>
        <Link href={ROUTES.student.browse} className="student-cta-btn">
          <Compass className="w-4 h-4" />
          <span>{t('dashboard.exploreCourses')}</span>
        </Link>
      </section>
    );
  }

  const activeCourses = enrollments.slice(0, 3);

  return (
    <section aria-labelledby="continue-learning-heading" className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2
          id="continue-learning-heading"
          className="text-base sm:text-lg font-bold font-[family-name:var(--font-display)] tracking-tight text-[var(--color-foreground)]"
        >
          {t('dashboard.inProgressCourses')}
        </h2>
        <Link
          href={ROUTES.student.courses}
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[var(--student-primary)] hover:opacity-80 transition-opacity group"
        >
          <span>{t('dashboard.viewAll')}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {activeCourses.map((item, idx) => {
          const courseId = item.course?._id;
          const courseTitle = item.course?.title || t('common.aCourse');
          const courseCategory = item.course?.category;
          const progress = Math.min(100, Math.max(0, item.progress || 0));

          return (
            <motion.div
              key={item._id || idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * idx, duration: 0.3 }}
              className="student-card p-4 sm:p-5 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[var(--student-soft)] text-[var(--student-primary)] border border-[var(--student-border)] truncate max-w-[160px]">
                    {courseCategory || t('common.course')}
                  </span>
                  <span className="text-xs font-extrabold tabular-nums text-[var(--student-primary)]">
                    {progress}%
                  </span>
                </div>

                <h3 className="font-bold text-sm sm:text-base text-[var(--color-foreground)] line-clamp-2 mb-3 group-hover:text-[var(--student-primary)] transition-colors">
                  {courseTitle}
                </h3>

                <div className="w-full bg-[var(--surface-muted-strong)] rounded-full h-1.5 mb-4 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: 'var(--student-gradient)' }}
                  />
                </div>
              </div>

              <Link
                href={courseId ? `${ROUTES.student.courses}/${courseId}` : ROUTES.student.courses}
                className="flex items-center justify-center gap-2 w-full min-h-[44px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-[var(--surface-muted)] text-[var(--color-foreground)] hover:bg-[var(--student-primary)] hover:text-white transition-colors focus-ring"
              >
                <PlayCircle className="w-4 h-4" />
                <span>{t('dashboard.resumeCourse')}</span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
