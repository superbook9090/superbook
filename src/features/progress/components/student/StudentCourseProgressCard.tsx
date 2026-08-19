'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Award, ArrowRight, History } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDate } from '@/lib/dateUtils';
import { ROUTES } from '@/constants/routes';
import Button from '@/components/ui/Button';
import type { StudentCourseItem } from '../../types';

interface StudentCourseProgressCardProps {
  item: StudentCourseItem;
  onViewQuizHistory: (item: StudentCourseItem) => void;
}

export function StudentCourseProgressCard({
  item,
  onViewQuizHistory,
}: StudentCourseProgressCardProps) {
  const { t } = useTranslation();
  const isCompleted = item.enrollment.status === 'completed' || item.enrollment.progress >= 100;

  return (
    <div className="card-surface rounded-2xl border border-[var(--border)] overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="p-4 sm:p-5">
        {/* Top Header: Thumbnail + Title + Status */}
        <div className="flex items-start gap-3.5">
          {item.course.thumbnail ? (
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-[var(--border)]">
              <Image
                src={item.course.thumbnail}
                alt={item.course.title}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-[var(--student-primary)] to-[var(--student-accent)] shrink-0 flex items-center justify-center text-white">
              <BookOpen className="w-7 h-7" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
              {item.course.category && (
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--student-soft)] text-[var(--student-primary)]">
                  {item.course.category}
                </span>
              )}
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                  isCompleted
                    ? 'bg-[var(--success-light)] text-[var(--success)]'
                    : 'bg-[var(--warning-light)] text-[var(--warning)]'
                }`}
              >
                {isCompleted ? t('progress.completed') : t('progress.inProgress')}
              </span>
            </div>

            <h3 className="text-base font-bold text-[var(--color-foreground)] line-clamp-1">
              {item.course.title}
            </h3>
            {item.course.description && (
              <p className="text-xs text-[var(--color-muted-foreground)] line-clamp-1 mt-0.5">
                {item.course.description}
              </p>
            )}
            <p className="text-[11px] text-[var(--color-muted-foreground)] mt-1">
              {t('progress.enrolled')}: {formatDate(item.enrollment.enrolledAt)}
            </p>
          </div>
        </div>

        {/* Progress Bar & Metric */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-[var(--color-muted-foreground)]">{t('progress.courseProgress')}</span>
            <span className="text-[var(--student-primary)] text-sm">{item.enrollment.progress}%</span>
          </div>
          <div className="w-full bg-[var(--color-surface-muted)] rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                isCompleted
                  ? 'bg-[var(--success)]'
                  : 'bg-gradient-to-r from-[var(--student-primary)] to-[var(--student-accent)]'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, item.enrollment.progress))}%` }}
            />
          </div>
        </div>

        {/* Quiz Metrics Strip */}
        <div className="mt-4 grid grid-cols-4 gap-2 bg-[var(--color-surface-muted)] p-2.5 rounded-xl text-center">
          <div>
            <p className="text-xs sm:text-sm font-bold text-[var(--color-foreground)]">{item.quizStats.total}</p>
            <p className="text-[10px] text-[var(--color-muted-foreground)] truncate">{t('progress.totalQuizzes')}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-[var(--color-foreground)]">{item.quizStats.completed}</p>
            <p className="text-[10px] text-[var(--color-muted-foreground)] truncate">{t('progress.completed')}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-[var(--student-primary)]">{item.quizStats.averageScore}%</p>
            <p className="text-[10px] text-[var(--color-muted-foreground)] truncate">{t('progress.avgScore')}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-[var(--success)]">{item.quizStats.highestScore}%</p>
            <p className="text-[10px] text-[var(--color-muted-foreground)] truncate">{t('progress.bestScore')}</p>
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="p-3 sm:p-4 bg-[var(--color-surface-muted)] border-t border-[var(--border)] flex items-center justify-between gap-2 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewQuizHistory(item)}
          className="text-xs text-[var(--color-muted-foreground)] hover:text-[var(--student-primary)]"
        >
          <History className="w-3.5 h-3.5 mr-1" />
          <span>{t('progress.viewQuizHistory')} ({item.attempts?.length || 0})</span>
        </Button>

        <div className="flex items-center gap-2">
          {isCompleted && (
            <Link
              href={ROUTES.student.certificates}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--success-light)] text-[var(--success)] hover:opacity-90 transition-opacity"
            >
              <Award className="w-3.5 h-3.5" />
              <span>{t('progress.viewCertificate')}</span>
            </Link>
          )}
          <Link
            href={ROUTES.student.course(item.course._id)}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[var(--student-primary)] text-white hover:bg-[var(--student-hover)] transition-colors"
          >
            <span>{t('progress.continueCourse')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
