'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { HelpCircle, Clock, BookOpen, Edit, Eye, EyeOff, Trash2, Trophy } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';
import { ROUTES } from '@/constants/routes';
import { toIdString } from '@/lib/id';
import type { Quiz } from '@/lib/react-query/hooks';

interface TeacherQuizCardProps {
  quiz: Quiz;
  courseTitle: string;
  onTogglePublish: (quiz: Quiz) => void;
  onEdit: (quizId: string) => void;
  onDelete: (quizId: string, title: string) => void;
}

export default function TeacherQuizCard({
  quiz,
  courseTitle,
  onTogglePublish,
  onEdit,
  onDelete,
}: TeacherQuizCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const quizId = toIdString(quiz._id);

  return (
    <article className="teacher-card p-4 sm:p-5 flex flex-col justify-between group h-full">
      <div className="space-y-3">
        {/* Top Badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border border-[var(--teacher-border)] min-w-0 max-w-[200px]">
            <BookOpen className="w-3 h-3 shrink-0" />
            <span className="truncate">{courseTitle}</span>
          </div>

          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
              quiz.isPublished
                ? 'bg-[var(--success-light)] text-[var(--success)] border border-[var(--success)]/20'
                : 'bg-[var(--surface-muted)] text-[var(--color-muted-foreground)] border border-[var(--border)]/70'
            }`}
          >
            {quiz.isPublished ? t('teacherQuizzes.published') : t('teacherQuizzes.draft')}
          </span>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-base font-bold text-[var(--color-foreground)] group-hover:text-[var(--teacher-primary)] transition-colors line-clamp-1">
            {quiz.title}
          </h3>
          <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] line-clamp-2 min-h-[2.25rem] mt-1 leading-relaxed">
            {quiz.description || '\u00A0'}
          </p>
        </div>

        {/* Meta Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[var(--color-muted-foreground)]">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--surface-muted)] text-[var(--color-foreground)]">
            <HelpCircle className="w-3.5 h-3.5 text-[var(--teacher-primary)]" />
            <span>
              {quiz.questionCount ?? 0} {t('teacherQuizzes.questions')}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--surface-muted)] text-[var(--color-foreground)]">
            <Clock className="w-3.5 h-3.5 text-[var(--teacher-primary)]" />
            <span>
              {quiz.timeLimit} {t('teacherQuizzes.min')}
            </span>
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 pt-3.5 mt-4 border-t border-[var(--border)]/70">
        <button
          type="button"
          onClick={() => onEdit(quizId)}
          className="teacher-cta-btn flex-1 text-xs sm:text-sm"
        >
          <Edit className="w-3.5 h-3.5" />
          <span>{t('teacherQuizzes.edit')}</span>
        </button>

        <Tooltip label={t('quiz.leaderboard.title')}>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`${ROUTES.teacher.quizEdit(quizId)}?tab=leaderboard`)}
            className="min-h-[44px] min-w-[44px] p-0 rounded-xl"
            aria-label={t('quiz.leaderboard.title')}
          >
            <Trophy className="w-4 h-4 text-[var(--warning)]" />
          </Button>
        </Tooltip>

        <Tooltip label={quiz.isPublished ? t('teacherQuizzes.unpublish') : t('teacherQuizzes.publish')}>
          <Button
            type="button"
            variant="outline"
            onClick={() => onTogglePublish(quiz)}
            className="min-h-[44px] min-w-[44px] p-0 rounded-xl"
            aria-label={quiz.isPublished ? t('teacherQuizzes.unpublish') : t('teacherQuizzes.publish')}
          >
            {quiz.isPublished ? (
              <EyeOff className="w-4 h-4 text-[var(--color-muted-foreground)]" />
            ) : (
              <Eye className="w-4 h-4 text-[var(--teacher-primary)]" />
            )}
          </Button>
        </Tooltip>

        <Tooltip label={t('teacherQuizzes.delete')}>
          <Button
            type="button"
            variant="danger"
            onClick={() => onDelete(quizId, quiz.title)}
            className="min-h-[44px] min-w-[44px] p-0 rounded-xl"
            aria-label={t('teacherQuizzes.delete')}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </Tooltip>
      </div>
    </article>
  );
}
