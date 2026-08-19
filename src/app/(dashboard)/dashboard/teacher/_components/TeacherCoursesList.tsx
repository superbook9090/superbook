'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/constants/routes';
import { GraduationCap, Users, ArrowRight, BookPlus, Sparkles } from 'lucide-react';
import { ResponsiveGrid } from '@/components/layout';
import type { TeacherCourse } from './types';

interface TeacherCoursesListProps {
  courses: TeacherCourse[];
}

export default function TeacherCoursesList({ courses }: TeacherCoursesListProps) {
  const { t } = useTranslation();

  if (courses.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card-surface card-body p-6 sm:p-8 text-center rounded-2xl border border-[var(--border)]"
      >
        <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 rounded-2xl bg-[var(--teacher-soft)] flex items-center justify-center text-[var(--teacher-primary)]">
          <BookPlus className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-[var(--color-foreground)] mb-1">
          {t('dashboard.myCourses')}
        </h3>
        <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] max-w-md mx-auto mb-5">
          {t('dashboard.addNewContent')}
        </p>
        <Link
          href={ROUTES.teacher.courseCreate}
          className="btn-premium inline-flex items-center gap-2 text-xs sm:text-sm"
        >
          <Sparkles className="w-4 h-4" />
          <span>{t('dashboard.createCourse')}</span>
        </Link>
      </motion.div>
    );
  }

  const recentCourses = courses.slice(0, 3);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      aria-labelledby="recent-courses-heading"
      className="space-y-3 sm:space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 id="recent-courses-heading" className="text-lg sm:text-xl font-bold text-[var(--color-foreground)]">
            {t('dashboard.recentCourses')}
          </h2>
        </div>
        <Link
          href={ROUTES.teacher.courses}
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[var(--teacher-primary)] hover:text-[var(--teacher-hover)] transition-colors"
        >
          <span>{t('dashboard.viewAll')}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <ResponsiveGrid variant="cards">
        {recentCourses.map((course, idx) => (
          <motion.div
            key={course._id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + idx * 0.05 }}
            className="card-surface card-body flex flex-col justify-between rounded-2xl border border-[var(--border)] hover:border-[var(--teacher-border)] hover:shadow-[var(--shadow-md)] transition-all duration-300 group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-[var(--teacher-primary)] to-[var(--teacher-accent)] text-white shadow-sm">
                  <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span
                  className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                    course.isPublished
                      ? 'bg-[var(--success-light)] text-[var(--success)]'
                      : 'bg-[var(--warning-light)] text-[var(--warning)]'
                  }`}
                >
                  {course.isPublished ? t('dashboard.published') : t('admin.drafts')}
                </span>
              </div>

              <h3 className="font-bold text-sm sm:text-base text-[var(--color-foreground)] line-clamp-2 mb-2 group-hover:text-[var(--teacher-primary)] transition-colors">
                {course.title}
              </h3>

              <div className="flex items-center gap-2 text-xs text-[var(--color-muted-foreground)]">
                <Users className="w-3.5 h-3.5" />
                <span>
                  {t('dashboard.studentsEnrolled').replace('{count}', String(course.enrolledCount || 0))}
                </span>
              </div>
            </div>

            <div className="pt-3 mt-4 border-t border-[var(--border)]">
              <Link
                href={`${ROUTES.teacher.courses}/${course._id}`}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-[var(--teacher-soft)] text-[var(--teacher-primary)] hover:bg-[var(--teacher-primary)] hover:text-white transition-all min-h-[40px]"
              >
                <span>{t('dashboard.viewAndEdit')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        ))}
      </ResponsiveGrid>
    </motion.section>
  );
}
