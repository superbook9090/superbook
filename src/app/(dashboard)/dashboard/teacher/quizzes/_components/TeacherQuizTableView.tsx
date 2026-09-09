'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Edit, Eye, EyeOff, Trash2 } from 'lucide-react';
import { toIdString } from '@/lib/id';
import type { Quiz } from '@/lib/react-query/hooks';

interface TeacherQuizTableViewProps {
  quizzes: Quiz[];
  getCourseTitle: (course: Quiz['course'] | string) => string;
  onEdit: (quizId: string) => void;
  onTogglePublish: (quiz: Quiz) => void;
  onDelete: (quizId: string, title: string) => void;
}

export default function TeacherQuizTableView({
  quizzes,
  getCourseTitle,
  onEdit,
  onTogglePublish,
  onDelete,
}: TeacherQuizTableViewProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-[var(--card-solid)] antigravity-glass shadow-sm rounded-3xl border border-[var(--border)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--border)] text-left">
          <thead className="bg-[var(--color-surface-muted)]/70">
            <tr>
              <th className="px-6 py-3.5 text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                {t('teacherQuizzes.tableQuiz')}
              </th>
              <th className="px-6 py-3.5 text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                {t('teacherQuizzes.tableCourse')}
              </th>
              <th className="px-6 py-3.5 text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider text-center">
                {t('teacherQuizzes.tableQuestions')}
              </th>
              <th className="px-6 py-3.5 text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider text-center">
                {t('teacherQuizzes.tableTime')}
              </th>
              <th className="px-6 py-3.5 text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider text-center">
                {t('teacherQuizzes.tableStatus')}
              </th>
              <th className="px-6 py-3.5 text-right text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider min-w-[200px]">
                {t('teacherQuizzes.tableActions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {quizzes.map((quiz) => {
              const quizId = toIdString(quiz._id);
              return (
                <tr
                  key={quizId}
                  className="hover:bg-[var(--teacher-soft)]/20 transition-colors duration-150"
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-[var(--color-foreground)]">{quiz.title}</div>
                    {quiz.description && (
                      <div className="text-xs text-[var(--color-muted-foreground)] truncate max-w-xs mt-0.5">
                        {quiz.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-[var(--color-muted-foreground)]">
                    <span className="px-2.5 py-1 rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-foreground)]">
                      {getCourseTitle(quiz.course)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[var(--color-foreground)] text-center tabular-nums">
                    {quiz.questionCount ?? 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--color-muted-foreground)] text-center tabular-nums">
                    {quiz.timeLimit} {t('teacherQuizzes.min')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        quiz.isPublished
                          ? 'bg-[var(--success-light)] text-[var(--success)]'
                          : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]'
                      }`}
                    >
                      {quiz.isPublished ? t('teacherQuizzes.published') : t('teacherQuizzes.draft')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold min-w-[200px]">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(quizId)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-[var(--teacher-primary)] hover:bg-[var(--teacher-soft)] transition-colors min-h-[36px]"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>{t('teacherQuizzes.edit')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onTogglePublish(quiz)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] transition-colors min-h-[36px]"
                      >
                        {quiz.isPublished ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-[var(--color-muted-foreground)]" />
                            <span>{t('teacherQuizzes.unpublish')}</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5 text-[var(--teacher-primary)]" />
                            <span>{t('teacherQuizzes.publish')}</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(quizId, quiz.title)}
                        className="p-1.5 rounded-xl text-[var(--error)] hover:bg-[var(--error-light)] transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                        title={t('teacherQuizzes.delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
