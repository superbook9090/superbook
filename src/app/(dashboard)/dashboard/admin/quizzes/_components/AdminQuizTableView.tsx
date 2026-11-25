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
  Trophy,
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

  const getCourseTitle = (quiz: Quiz) => {
    const cid = quiz.course?._id ?? quiz.courseId;
    if (quiz.course?.title) return quiz.course.title;
    if (!cid) return '—';
    const found = courses.find((c) => c._id === cid);
    return found ? found.title : '—';
  };

  return (
    <div className="teacher-panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]/75 text-[var(--color-muted-foreground)] font-bold uppercase text-[11px] tracking-wider">
              <th className="py-3.5 px-4">{t('teacherQuizzes.tableQuiz')}</th>
              <th className="py-3.5 px-4">{t('teacherQuizzes.tableCourse')}</th>
              <th className="py-3.5 px-4 text-center">{t('common.questions')}</th>
              <th className="py-3.5 px-4">{t('admin.status')}</th>
              <th className="py-3.5 px-4 text-center">{t('teacherQuizzes.passing')}</th>
              <th className="py-3.5 px-4">{t('admin.created')}</th>
              <th className="py-3.5 px-4 text-right">{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/70">
            {quizzes.map((quiz) => (
              <tr
                key={quiz._id}
                className="hover:bg-[var(--surface-muted)]/45 transition-colors"
              >
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] bg-[var(--teacher-soft)] text-[var(--teacher-primary)] shrink-0">
                      <HelpCircle className="w-4 h-4" />
                    </span>
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

                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5 font-medium text-[var(--color-foreground)] max-w-xs truncate">
                    <BookOpen className="w-3.5 h-3.5 text-[var(--teacher-primary)] shrink-0" />
                    <span className="truncate">{getCourseTitle(quiz)}</span>
                  </div>
                </td>

                <td className="py-3.5 px-4 text-center font-bold tabular-nums text-[var(--color-foreground)]">
                  {quiz.questionCount ?? quiz.questions?.length ?? 0}
                </td>

                <td className="py-3.5 px-4">
                  <Badge variant={quiz.isPublished ? 'primary' : 'default'} size="sm">
                    {quiz.isPublished ? t('common.published') : t('common.draft')}
                  </Badge>
                </td>

                <td className="py-3.5 px-4 text-center font-semibold tabular-nums text-[var(--color-foreground)]">
                  {quiz.passingScore !== undefined ? `${quiz.passingScore}%` : '—'}
                </td>

                <td className="py-3.5 px-4 text-xs text-[var(--color-muted-foreground)]">
                  {quiz.createdAt ? formatDate(quiz.createdAt) : '—'}
                </td>

                <td className="py-3.5 px-4 text-right">
                  <div className="inline-flex items-center justify-end gap-1">
                    <Tooltip label={quiz.isPublished ? 'Unpublish' : 'Publish'}>
                      <button
                        type="button"
                        onClick={() => onTogglePublish(quiz._id, quiz.isPublished)}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-[var(--border)] bg-[var(--card-solid)] transition-colors cursor-pointer ${
                          quiz.isPublished
                            ? 'text-[var(--success)] hover:bg-[var(--success-light)]'
                            : 'text-[var(--color-muted-foreground)] hover:bg-[var(--surface-muted)]'
                        }`}
                      >
                        {quiz.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </Tooltip>

                    <Tooltip label={t('quiz.leaderboard.title')}>
                      <button
                        type="button"
                        onClick={() => router.push(`${ROUTES.admin.quizEdit(quiz._id)}?tab=leaderboard`)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-[var(--border)] bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:text-[var(--warning)] hover:bg-[var(--warning-light)] transition-colors cursor-pointer"
                      >
                        <Trophy className="w-3.5 h-3.5" />
                      </button>
                    </Tooltip>

                    <Tooltip label={t('common.edit')}>
                      <button
                        type="button"
                        onClick={() => router.push(ROUTES.admin.quizEdit(quiz._id))}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-[var(--border)] bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:text-[var(--teacher-primary)] hover:bg-[var(--teacher-soft)] transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </Tooltip>

                    <Tooltip label={t('common.delete')}>
                      <button
                        type="button"
                        onClick={() => onDelete(quiz._id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-[var(--border)] bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:text-[var(--error)] hover:bg-[var(--error-light)] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
