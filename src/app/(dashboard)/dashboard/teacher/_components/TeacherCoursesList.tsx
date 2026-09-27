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
        className="relative overflow-hidden p-6 sm:p-10 text-center rounded-[2rem] bg-[var(--card-solid)]/40 backdrop-blur-xl border border-[var(--border)]/50 shadow-xl group"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--surface-muted)]/20 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5 rounded-[1.5rem] bg-[var(--teacher-soft)]/50 border border-[var(--teacher-border)]/50 flex items-center justify-center text-[var(--teacher-primary)] shadow-[0_8px_16px_-6px_rgba(0,0,0,0.1)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
            <BookPlus className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-[var(--color-foreground)] mb-2">
            {t('dashboard.myCourses')}
          </h3>
          <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] max-w-sm mx-auto mb-6 font-medium">
            {t('dashboard.addNewContent')}
          </p>
          <Link
            href={ROUTES.teacher.courseCreate}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[var(--teacher-primary)] to-purple-600 shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t('dashboard.createCourse')}</span>
          </Link>
        </div>
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
      className="space-y-4 sm:space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 id="recent-courses-heading" className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--color-foreground)]">
            {t('dashboard.recentCourses')}
          </h2>
        </div>
        <Link
          href={ROUTES.teacher.courses}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[var(--teacher-primary)] hover:text-purple-500 transition-colors group/link"
        >
          <span>{t('dashboard.viewAll')}</span>
          <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="perspective-1000">
        <ResponsiveGrid variant="cards">
          {recentCourses.map((course, idx) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 16, rotateX: 6 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: 0.35 + idx * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex flex-col justify-between rounded-[2rem] bg-[var(--card-solid)]/40 backdrop-blur-xl border border-[var(--border)]/50 p-5 hover:border-[var(--teacher-primary)]/50 hover:shadow-2xl transition-all duration-300 group overflow-hidden"
            >
              {/* Glow effect on hover */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--teacher-primary)]/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-[var(--teacher-primary)] to-purple-600 text-white shadow-md">
                    <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span
                    className={`px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full ${
                      course.isPublished
                        ? 'bg-[var(--success-light)] text-[var(--success)] border border-[var(--success)]/20'
                        : 'bg-[var(--warning-light)] text-[var(--warning)] border border-[var(--warning)]/20'
                    }`}
                  >
                    {course.isPublished ? t('dashboard.published') : t('admin.drafts')}
                  </span>
                </div>

                <h3 className="font-bold text-sm sm:text-base md:text-lg text-[var(--color-foreground)] line-clamp-2 mb-3 group-hover:text-[var(--teacher-primary)] transition-colors">
                  {course.title}
                </h3>

                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[var(--color-muted-foreground)]">
                  <Users className="w-4 h-4 text-[var(--color-muted)]" />
                  <span>
                    {t('dashboard.studentsEnrolled').replace('{count}', String(course.enrolledCount || 0))}
                  </span>
                </div>
              </div>

              <Link
                href={ROUTES.teacher.courseEdit(course._id)}
                className="relative z-10 mt-6 flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs sm:text-sm font-bold bg-[var(--surface-muted)] text-[var(--foreground)] hover:bg-[var(--teacher-primary)] hover:text-white hover:shadow-md transition-all duration-300 min-h-[44px]"
              >
                <span>{t('dashboard.viewAndEdit')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </ResponsiveGrid>
      </div>
    </motion.section>
  );
}
