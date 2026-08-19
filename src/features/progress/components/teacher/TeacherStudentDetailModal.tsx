'use client';

import React from 'react';
import { X, User, Award } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDate } from '@/lib/dateUtils';
import Button from '@/components/ui/Button';
import type { StudentCourseItem, StudentOverallStats } from '../../types';

interface TeacherStudentDetailModalProps {
  isOpen: boolean;
  studentName: string;
  courses: StudentCourseItem[];
  stats: StudentOverallStats | null;
  isLoading: boolean;
  onClose: () => void;
}

export function TeacherStudentDetailModal({
  isOpen,
  studentName,
  courses,
  stats,
  isLoading,
  onClose,
}: TeacherStudentDetailModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card-surface w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--teacher-soft)] text-[var(--teacher-primary)] flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--color-foreground)]">
                {studentName}
              </h3>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                {t('progress.studentDetails')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)] touch-target"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 border-3 border-[var(--teacher-primary)] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-[var(--color-muted-foreground)]">{t('common.loading')}</span>
            </div>
          ) : (
            <>
              {/* Quick Overall Summary */}
              {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[var(--color-surface-muted)] p-3 rounded-xl border border-[var(--border)] text-center">
                  <div>
                    <p className="text-xs text-[var(--color-muted-foreground)]">{t('progress.coursesEnrolled')}</p>
                    <p className="text-base font-bold text-[var(--color-foreground)]">{stats.totalCourses}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-muted-foreground)]">{t('progress.avgProgress')}</p>
                    <p className="text-base font-bold text-[var(--student-primary)]">{stats.averageProgress}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-muted-foreground)]">{t('progress.quizzesTaken')}</p>
                    <p className="text-base font-bold text-[var(--teacher-primary)]">{stats.totalQuizzesTaken}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-muted-foreground)]">{t('progress.avgScore')}</p>
                    <p className="text-base font-bold text-[var(--success)]">{stats.overallAverageScore}%</p>
                  </div>
                </div>
              )}

              {/* Course Progress Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                  {t('progress.courseProgress')}
                </h4>

                {courses.length === 0 ? (
                  <p className="text-xs text-[var(--color-muted-foreground)] italic">
                    {t('progress.noProgressData')}
                  </p>
                ) : (
                  courses.map((c) => (
                    <div
                      key={c.enrollment._id}
                      className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--card-solid)] space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-sm text-[var(--color-foreground)]">
                            {c.course.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-[var(--color-muted-foreground)] mt-0.5">
                            <span>{t('progress.enrolled')}: {formatDate(c.enrollment.enrolledAt)}</span>
                            {c.enrollment.completedAt && (
                              <span className="flex items-center gap-1 text-[var(--success)]">
                                <Award className="w-3.5 h-3.5" />
                                {t('progress.completed')}
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="text-sm font-extrabold text-[var(--teacher-primary)]">
                          {c.enrollment.progress}%
                        </span>
                      </div>

                      {/* Mini Progress Meter */}
                      <div className="w-full bg-[var(--color-surface-muted)] rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-[var(--teacher-primary)] transition-all"
                          style={{ width: `${c.enrollment.progress}%` }}
                        />
                      </div>

                      {/* Quiz Breakdown in this course */}
                      {c.attempts && c.attempts.length > 0 && (
                        <div className="pt-2 border-t border-[var(--border)] space-y-1.5">
                          <p className="text-[11px] font-semibold text-[var(--color-muted-foreground)]">
                            {t('progress.quizAttempts')}:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {c.attempts.map((att) => (
                              <div
                                key={att._id}
                                className="p-2 rounded-lg bg-[var(--color-surface-muted)] flex items-center justify-between text-xs"
                              >
                                <span className="truncate pr-2 font-medium">{att.quizTitle}</span>
                                <span
                                  className={`font-bold shrink-0 ${
                                    att.score >= 70 ? 'text-[var(--success)]' : 'text-[var(--warning)]'
                                  }`}
                                >
                                  {att.score}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-[var(--color-surface-muted)] border-t border-[var(--border)] flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t('progress.close')}
          </Button>
        </div>
      </div>
    </div>
  );
}
