'use client';
import { ROUTES } from '@/constants/routes';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, HelpCircle, Pencil, PlusCircle, Target, Trash2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { buildTeacherCreateQuizUrl, type QuizPlacementParam } from '@/lib/quiz/buildCreateQuizUrl';
import type { CurriculumQuiz } from '@/lib/curriculum/tree';
import { cn } from '@/lib/utils';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { RowIconButton } from './shared';

type Props = {
  courseId: string;
  quizzes: CurriculumQuiz[];
  placement: QuizPlacementParam;
  chapterId?: string;
  lessonId?: string;
  compact?: boolean;
  onDeleteQuiz?: (quizId: string) => void;
  isDeletePending?: boolean;
};

export function CurriculumQuizBlock({
  courseId,
  quizzes,
  placement,
  chapterId,
  lessonId,
  compact = false,
  onDeleteQuiz,
  isDeletePending = false,
}: Props) {
  const { t } = useTranslation();
  const [pendingDelete, setPendingDelete] = useState<CurriculumQuiz | null>(null);

  useEffect(() => {
    if (!isDeletePending && pendingDelete) {
      setPendingDelete(null);
    }
  }, [isDeletePending, pendingDelete]);

  const createHref = buildTeacherCreateQuizUrl({
    courseId,
    placement,
    chapterId,
    lessonId,
  });

  return (
    <div className={cn('space-y-2', compact ? 'pt-1' : 'pt-3 border-t border-dashed border-[var(--color-border)]')}>
      {!compact && (
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
          {t('curriculum.quizzes')}
        </p>
      )}
      {quizzes.map((quiz) => (
        <div
          key={quiz._id}
          className="flex items-center gap-2 p-2 sm:p-3 bg-violet-50/50 border border-violet-100 rounded-xl group"
        >
          <Target className="w-4 h-4 text-violet-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--color-foreground)] truncate">{quiz.title}</p>
            <p className="text-[10px] text-[var(--color-muted-foreground)] flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                {quiz.timeLimit} {t('quiz.min')}
              </span>
              {quiz.questionCount != null && (
                <span className="inline-flex items-center gap-0.5">
                  <HelpCircle className="w-2.5 h-2.5" />
                  {quiz.questionCount}
                </span>
              )}
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded font-medium',
                  quiz.isPublished
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                )}
              >
                {quiz.isPublished ? t('curriculum.quizPublished') : t('curriculum.quizDraft')}
              </span>
            </p>
          </div>
          <div className="flex items-center shrink-0">
            <Link
              href={ROUTES.teacher.quizEdit(quiz._id)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[var(--color-muted)] hover:text-[var(--color-primary)]"
              aria-label={t('curriculum.editQuiz')}
            >
              <Pencil className="w-4 h-4" />
            </Link>
            {onDeleteQuiz && (
              <RowIconButton
                onClick={() => setPendingDelete(quiz)}
                label={t('curriculum.deleteQuiz')}
                variant="danger"
              >
                <Trash2 className="w-4 h-4" />
              </RowIconButton>
            )}
          </div>
        </div>
      ))}
      <Link
        href={createHref}
        className="w-full flex items-center justify-center gap-2 p-3 min-h-[44px] border-2 border-dashed border-violet-200 rounded-xl text-violet-700 hover:bg-violet-50/80 transition-all text-sm font-medium"
      >
        <PlusCircle className="w-4 h-4" />
        {t('curriculum.addQuiz')}
      </Link>

      {onDeleteQuiz && (
        <ConfirmModal
          isOpen={!!pendingDelete}
          title={t('curriculum.deleteQuizTitle')}
          message={
            pendingDelete
              ? `${t('curriculum.deleteQuizMessage')} "${pendingDelete.title}"`
              : t('curriculum.deleteQuizMessage')
          }
          onConfirm={() => {
            if (pendingDelete) onDeleteQuiz(pendingDelete._id);
          }}
          onCancel={() => {
            if (!isDeletePending) setPendingDelete(null);
          }}
          confirmText={t('common.delete')}
          cancelText={t('common.cancel')}
          type="danger"
          isLoading={isDeletePending}
        />
      )}
    </div>
  );
}
