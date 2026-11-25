'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { GraduationCap, Users, ArrowRight, BookPlus, Sparkles } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/constants/routes';
import type { TeacherCourse } from './types';

interface TeacherCoursesListProps {
  courses: TeacherCourse[];
}

export default function TeacherCoursesList({ courses }: TeacherCoursesListProps) {
  const { t } = useTranslation();

  if (courses.length === 0) {
    return (
      <section className="teacher-panel p-6 sm:p-10 text-center border-dashed">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[var(--teacher-soft)] border border-[var(--teacher-border)] flex items-center justify-center text-[var(--teacher-primary)]">
          <BookPlus className="w-7 h-7" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-[var(--color-foreground)] mb-1.5">
          {t('dashboard.myCourses')}
        </h3>
        <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] max-w-sm mx-auto mb-5">
          {t('dashboard.addNewContent')}
        </p>
        <Link href={ROUTES.teacher.courseCreate} className="teacher-cta-btn">
          <Sparkles className="w-4 h-4" />
          <span>{t('dashboard.createCourse')}</span>
        </Link>
      </section>
    );
  }

  const recentCourses = courses.slice(0, 3);

  return (
    <section aria-labelledby="recent-courses-heading" className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2
          id="recent-courses-heading"
          className="text-base sm:text-lg font-bold font-[family-name:var(--font-display)] tracking-tight text-[var(--color-foreground)]"
        >
          {t('dashboard.recentCourses')}
        </h2>
        <Link
          href={ROUTES.teacher.courses}
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[var(--teacher-primary)] hover:opacity-80 transition-opacity group"
        >
          <span>{t('dashboard.viewAll')}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {recentCourses.map((course, idx) => (
          <motion.div
            key={course._id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * idx, duration: 0.25 }}
            className="teacher-card p-4 sm:p-5 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3.5">
                <div className="w-10 h-10 rounded-xl gradient-bg text-white flex items-center justify-center shrink-0 shadow-xs">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span
                  className={`px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-full ${
                    course.isPublished
                      ? 'bg-[var(--success-light)] text-[var(--success)] border border-[var(--success)]/20'
                      : 'bg-[var(--warning-light)] text-[var(--warning)] border border-[var(--warning)]/20'
                  }`}
                >
                  {course.isPublished ? t('dashboard.published') : t('admin.drafts')}
                </span>
              </div>

              <h3 className="font-bold text-sm sm:text-base text-[var(--color-foreground)] line-clamp-2 mb-2.5 group-hover:text-[var(--teacher-primary)] transition-colors">
                {course.title}
              </h3>

              <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-muted-foreground)]">
                <Users className="w-3.5 h-3.5 text-[var(--teacher-primary)] shrink-0" />
                <span>
                  {t('dashboard.studentsEnrolled').replace('{count}', String(course.enrolledCount || 0))}
                </span>
              </div>
            </div>

            <Link
              href={ROUTES.teacher.courseEdit(course._id)}
              className="mt-5 flex items-center justify-center gap-2 w-full min-h-[44px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-[var(--surface-muted)] text-[var(--color-foreground)] hover:bg-[var(--teacher-primary)] hover:text-white transition-colors focus-ring"
            >
              <span>{t('dashboard.viewAndEdit')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
