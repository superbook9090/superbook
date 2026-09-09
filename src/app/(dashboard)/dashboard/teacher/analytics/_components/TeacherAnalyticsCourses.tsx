'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/constants/routes';
import type { CourseStat } from './types';

function scoreChipClass(score: number): string {
  if (score >= 70) return 'bg-[var(--success-light)] text-[var(--success)]';
  if (score >= 50) return 'bg-[var(--warning-light)] text-[var(--warning)]';
  return 'bg-[var(--error-light)] text-[var(--error)]';
}

function ScoreChip({ score }: { score: number }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tabular-nums ${scoreChipClass(score)}`}>
      {score}%
    </span>
  );
}

function VisibilityChip({
  isPublished,
  liveLabel,
  draftLabel,
}: {
  isPublished: boolean;
  liveLabel: string;
  draftLabel: string;
}) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
        isPublished
          ? 'bg-[var(--success-light)] text-[var(--success)]'
          : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]'
      }`}
    >
      {isPublished ? liveLabel : draftLabel}
    </span>
  );
}

interface TeacherAnalyticsCoursesProps {
  courses: CourseStat[];
}

export default function TeacherAnalyticsCourses({ courses }: TeacherAnalyticsCoursesProps) {
  const { t } = useTranslation();

  const courseCells: Array<{ key: keyof CourseStat; label: string }> = [
    { key: 'students', label: t('teacherAnalytics.tableEnrolled') },
    { key: 'quizzes', label: t('teacherAnalytics.tableQuizzes') },
    { key: 'attempts', label: t('teacherAnalytics.tableAttempts') },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card-surface antigravity-glass rounded-3xl border border-[var(--border)] shadow-xs overflow-hidden"
    >
      <div className="p-5 sm:p-6 border-b border-[var(--border)]">
        <h2 className="text-base sm:text-lg font-bold text-[var(--color-foreground)]">
          {t('teacherAnalytics.coursesTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] mt-0.5">
          {t('teacherAnalytics.coursesDescription')}
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center gap-3">
          <BookOpen className="w-12 h-12 text-[var(--color-muted-foreground)] opacity-30" />
          <p className="text-sm text-[var(--color-muted-foreground)]">{t('teacherAnalytics.noCoursesYet')}</p>
          <Link href={ROUTES.teacher.courseCreate} className="btn-premium inline-flex items-center min-h-[44px]">
            {t('teacherAnalytics.createCourse')}
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--border)]">
              <thead className="bg-[var(--color-surface-muted)]/70 text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5 text-left">{t('teacherAnalytics.tableCourse')}</th>
                  {courseCells.map((cell) => (
                    <th key={cell.key} className="px-6 py-3.5 text-center">{cell.label}</th>
                  ))}
                  <th className="px-6 py-3.5 text-center">{t('teacherAnalytics.tableAvgScore')}</th>
                  <th className="px-6 py-3.5 text-center">{t('teacherAnalytics.tableVisibility')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {courses.map((course) => (
                  <tr key={course._id} className="hover:bg-[var(--teacher-soft)]/20 transition-colors">
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-sm font-bold text-[var(--color-foreground)] truncate">{course.title}</p>
                    </td>
                    {courseCells.map((cell) => (
                      <td key={cell.key} className="px-6 py-4 text-center">
                        <p className="text-sm font-semibold text-[var(--color-foreground)] tabular-nums">{course[cell.key]}</p>
                      </td>
                    ))}
                    <td className="px-6 py-4 text-center">
                      <ScoreChip score={course.averageScore} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <VisibilityChip
                        isPublished={course.isPublished}
                        liveLabel={t('teacherAnalytics.live')}
                        draftLabel={t('teacherAnalytics.draft')}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Rows */}
          <ul className="md:hidden divide-y divide-[var(--border)]">
            {courses.map((course) => (
              <li key={course._id} className="p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-bold text-[var(--color-foreground)] min-w-0 break-words">{course.title}</p>
                  <VisibilityChip
                    isPublished={course.isPublished}
                    liveLabel={t('teacherAnalytics.live')}
                    draftLabel={t('teacherAnalytics.draft')}
                  />
                </div>
                <div className="flex items-end justify-between gap-3">
                  <div className="flex gap-4">
                    {courseCells.map((cell) => (
                      <div key={cell.key}>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">{cell.label}</p>
                        <p className="text-sm font-bold text-[var(--color-foreground)] tabular-nums mt-0.5">{course[cell.key]}</p>
                      </div>
                    ))}
                  </div>
                  <ScoreChip score={course.averageScore} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </motion.div>
  );
}
