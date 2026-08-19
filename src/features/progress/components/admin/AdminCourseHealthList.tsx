'use client';

import React from 'react';
import { Activity, BookOpen } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { AdminCourseHealth } from '../../types';

interface AdminCourseHealthListProps {
  courseHealth: AdminCourseHealth[];
}

export function AdminCourseHealthList({ courseHealth }: AdminCourseHealthListProps) {
  const { t } = useTranslation();

  if (courseHealth.length === 0) return null;

  return (
    <div className="card-surface rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-bold text-[var(--color-foreground)] flex items-center gap-2">
          <Activity className="w-4 h-4 text-[var(--teacher-primary)]" />
          <span>{t('progress.courseHealth')}</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {courseHealth.map((course) => {
          const isHigh = course.completionRate >= 60;
          const isLow = course.completionRate < 30;

          return (
            <div
              key={course._id}
              className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--color-surface-muted)] flex flex-col justify-between space-y-2.5"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                    {course.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isHigh
                        ? 'bg-[var(--success-light)] text-[var(--success)]'
                        : isLow
                        ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                        : 'bg-[var(--warning-light)] text-[var(--warning)]'
                    }`}
                  >
                    {isHigh ? t('progress.highVelocity') : `${course.completionRate}%`}
                  </span>
                </div>

                <p className="font-bold text-sm text-[var(--color-foreground)] line-clamp-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[var(--color-muted-foreground)] shrink-0" />
                  <span>{course.title}</span>
                </p>
              </div>

              {/* Progress and Completion */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--color-muted-foreground)]">
                    {course.completedCount}/{course.totalEnrolled} {t('progress.completed')}
                  </span>
                  <span className="font-bold text-[var(--color-foreground)]">
                    {course.completionRate}%
                  </span>
                </div>

                <div className="w-full bg-[var(--card-solid)] rounded-full h-2 overflow-hidden border border-[var(--border)]">
                  <div
                    className={`h-2 rounded-full ${
                      isHigh
                        ? 'bg-[var(--success)]'
                        : isLow
                        ? 'bg-red-500'
                        : 'bg-[var(--teacher-primary)]'
                    }`}
                    style={{ width: `${course.completionRate}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
