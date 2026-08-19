'use client';

import React from 'react';
import { Eye, User, BookOpen } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import Button from '@/components/ui/Button';
import type { TeacherStudentRow } from '../../types';

interface TeacherStudentRosterTableProps {
  students: TeacherStudentRow[];
  onInspect: (studentId: string, studentName: string) => void;
}

export function TeacherStudentRosterTable({
  students,
  onInspect,
}: TeacherStudentRosterTableProps) {
  const { t } = useTranslation();

  if (students.length === 0) {
    return (
      <div className="card-surface p-8 rounded-2xl text-center border border-[var(--border)]">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          {t('progress.noStudentsFound')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Desktop / Tablet Table */}
      <div className="hidden md:block card-surface rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)] text-[11px] font-bold uppercase tracking-wider border-b border-[var(--border)]">
            <tr>
              <th className="py-3 px-4">{t('progress.student')}</th>
              <th className="py-3 px-4">{t('progress.course')}</th>
              <th className="py-3 px-4">{t('progress.status')}</th>
              <th className="py-3 px-4">{t('progress.courseProgress')}</th>
              <th className="py-3 px-4 text-center">{t('progress.lessonsCompleted')}</th>
              <th className="py-3 px-4 text-right">{t('progress.action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {students.map((row) => {
              const isCompleted = row.progress >= 100 || row.status === 'completed';
              const isStruggling = row.progress < 25;

              return (
                <tr key={row.enrollmentId} className="hover:bg-[var(--color-surface-muted)]/50 transition-colors">
                  {/* Student */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[var(--teacher-soft)] text-[var(--teacher-primary)] flex items-center justify-center font-bold text-xs shrink-0">
                        {row.student.name ? row.student.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--color-foreground)] truncate">{row.student.name}</p>
                        <p className="text-[11px] text-[var(--color-muted-foreground)] truncate">{row.student.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Course */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2 max-w-xs">
                      <BookOpen className="w-4 h-4 text-[var(--color-muted-foreground)] shrink-0" />
                      <span className="font-medium text-[var(--color-foreground)] truncate">{row.course.title}</span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        isCompleted
                          ? 'bg-[var(--success-light)] text-[var(--success)]'
                          : isStruggling
                          ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                          : 'bg-[var(--warning-light)] text-[var(--warning)]'
                      }`}
                    >
                      {isCompleted ? t('progress.completed') : isStruggling ? t('progress.struggling') : t('progress.inProgress')}
                    </span>
                  </td>

                  {/* Progress Bar */}
                  <td className="py-3.5 px-4">
                    <div className="w-32 space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className={isStruggling ? 'text-red-500' : 'text-[var(--teacher-primary)]'}>{row.progress}%</span>
                      </div>
                      <div className="w-full bg-[var(--color-surface-muted)] rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${
                            isCompleted ? 'bg-[var(--success)]' : isStruggling ? 'bg-red-500' : 'bg-[var(--teacher-primary)]'
                          }`}
                          style={{ width: `${row.progress}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Lessons */}
                  <td className="py-3.5 px-4 text-center font-semibold text-[var(--color-foreground)]">
                    {row.lessonCompletedCount}
                  </td>

                  {/* Action Button */}
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onInspect(row.student._id, row.student.name)}
                      className="text-xs text-[var(--teacher-primary)] hover:bg-[var(--teacher-soft)] touch-target"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      <span>{t('progress.inspect')}</span>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-2.5">
        {students.map((row) => (
          <div key={row.enrollmentId} className="card-surface p-3.5 rounded-xl border border-[var(--border)] space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-sm text-[var(--color-foreground)]">{row.student.name}</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">{row.student.email}</p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--teacher-soft)] text-[var(--teacher-primary)]">
                {row.progress}%
              </span>
            </div>

            <p className="text-xs font-medium text-[var(--color-foreground)] line-clamp-1">
              {row.course.title}
            </p>

            <div className="w-full bg-[var(--color-surface-muted)] rounded-full h-2">
              <div
                className="h-2 rounded-full bg-[var(--teacher-primary)]"
                style={{ width: `${row.progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-[var(--color-muted-foreground)]">
                {row.lessonCompletedCount} {t('progress.lessonsCompleted')}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onInspect(row.student._id, row.student.name)}
                className="text-xs text-[var(--teacher-primary)]"
              >
                <Eye className="w-3.5 h-3.5 mr-1" />
                <span>{t('progress.inspect')}</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
