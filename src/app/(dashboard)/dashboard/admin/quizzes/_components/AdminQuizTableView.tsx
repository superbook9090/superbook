'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  HelpCircle,
  BookOpen,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import Tooltip from '@/components/ui/Tooltip';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDate } from '@/lib/dateUtils';
import type { Quiz, Course } from '@/types';

interface AdminQuizTableViewProps {
  quizzes: Quiz[];
  courses: Course[];
  onTogglePublish: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
}

export function AdminQuizTableView({
  quizzes,
  courses,
  onTogglePublish,
  onDelete,
}: AdminQuizTableViewProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const getCourseTitle = (courseId?: string) => {
    if (!courseId) return '—';
    const found = courses.find((c) => c._id === courseId);
    return found ? found.title : '—';
  };

  return (
    <div className="antigravity-glass border border-[var(--border)] rounded-3xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]/70 text-[var(--color-muted-foreground)] font-bold uppercase text-[11px] tracking-wider">
              <th className="py-4 px-5">{t('teacherQuizzes.tableQuiz') || 'Quiz Title'}</th>
              <th className="py-4 px-5">{t('teacherQuizzes.tableCourse') || 'Course'}</th>
              <th className="py-4 px-5 text-center">{t('common.questions') || 'Questions'}</th>
              <th className="py-4 px-5">{t('admin.status') || 'Status'}</th>
              <th className="py-4 px-5 text-center">{t('teacherQuizzes.passing') || 'Pass Score'}</th>
              <th className="py-4 px-5">{t('admin.created') || 'Created'}</th>
              <th className="py-4 px-5 text-right">{t('admin.actions') || 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/60">
            {quizzes.map((quiz) => (
              <tr
                key={quiz._id}
                className="hover:bg-[var(--surface-muted)]/60 transition-colors"
              >
                {/* Title */}
                <td className="py-3.5 px-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[var(--student-soft)] text-[var(--student-primary)] shrink-0">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[var(--color-foreground)] line-clamp-1 max-w-xs">
                        {quiz.title}
                      </p>
                      {quiz.description && (
                        <p className="text-[11px] text-[var(--color-muted-foreground)] line-clamp-1 mt-0.5">
                          {quiz.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Course */}
                <td className="py-3.5 px-5">
                  <div className="flex items-center gap-1.5 font-medium text-[var(--color-foreground)] max-w-xs truncate">
                    <BookOpen className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
                    <span className="truncate">{getCourseTitle(quiz.courseId)}</span>
                  </div>
                </td>

                {/* Question count */}
                <td className="py-3.5 px-5 text-center font-bold tabular-nums text-[var(--color-foreground)]">
                  {quiz.questions?.length ?? 0}
                </td>

                {/* Status */}
                <td className="py-3.5 px-5">
                  <Badge variant={quiz.isPublished ? 'primary' : 'default'} size="sm">
                    {quiz.isPublished ? t('common.published') : t('common.draft')}
                  </Badge>
                </td>

                {/* Passing Score */}
                <td className="py-3.5 px-5 text-center font-semibold tabular-nums text-[var(--color-foreground)]">
                  {quiz.passingScore !== undefined ? `${quiz.passingScore}%` : '—'}
                </td>

                {/* Created */}
                <td className="py-3.5 px-5 text-xs text-[var(--color-muted-foreground)]">
                  {quiz.createdAt ? formatDate(quiz.createdAt) : '—'}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Tooltip label={quiz.isPublished ? 'Unpublish' : 'Publish'}>
                      <button
                        type="button"
                        onClick={() => onTogglePublish(quiz._id, quiz.isPublished)}
                        className={`p-2 rounded-xl transition-colors cursor-pointer ${
                          quiz.isPublished
                            ? 'text-[var(--success)] hover:bg-[var(--success-light)]'
                            : 'text-[var(--color-muted-foreground)] hover:bg-[var(--surface-muted)]'
                        }`}
                      >
                        {quiz.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </Tooltip>

                    <Tooltip label={t('common.edit') || 'Edit'}>
                      <button
                        type="button"
                        onClick={() => router.push(ROUTES.admin.quizEdit(quiz._id))}
                        className="p-2 rounded-xl text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </Tooltip>

                    <Tooltip label={t('common.delete') || 'Delete'}>
                      <button
                        type="button"
                        onClick={() => onDelete(quiz._id)}
                        className="p-2 rounded-xl text-[var(--color-muted-foreground)] hover:text-[var(--error)] hover:bg-[var(--error-light)] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
