'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  HelpCircle,
  Clock,
  Award,
  BookOpen,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Trophy,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import Tooltip from '@/components/ui/Tooltip';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDate } from '@/lib/dateUtils';
import type { Quiz } from '@/types';

interface AdminQuizCardProps {
  quiz: Quiz;
  index: number;
  courseTitle?: string;
  onTogglePublish: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
}

export function AdminQuizCard({
  quiz,
  courseTitle,
  onTogglePublish,
  onDelete,
}: AdminQuizCardProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const questionCount = quiz.questionCount ?? quiz.questions?.length ?? 0;
  const timeLimit = quiz.timeLimit ? `${quiz.timeLimit}m` : null;

  return (
    <div className="teacher-card flex flex-col justify-between overflow-hidden group">
      <div className="p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border border-[var(--teacher-border)]">
              <HelpCircle className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-[var(--color-muted-foreground)] tabular-nums">
              {questionCount} {t('common.questions')}
            </span>
          </div>

          <Badge variant={quiz.isPublished ? 'primary' : 'default'} size="sm">
            {quiz.isPublished ? t('common.published') : t('common.draft')}
          </Badge>
        </div>

        <div>
          <h3 className="font-bold text-base text-[var(--color-foreground)] line-clamp-1 group-hover:text-[var(--teacher-primary)] transition-colors">
            {quiz.title}
          </h3>
          <p className="text-xs text-[var(--color-muted-foreground)] line-clamp-2 min-h-[2.25rem] mt-1 leading-relaxed">
            {quiz.description || t('quizzes.noDescription')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-[var(--border)]/70 text-xs text-[var(--color-muted-foreground)]">
          {courseTitle && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[8px] bg-[var(--surface-muted)] text-[var(--color-foreground)] font-semibold truncate max-w-[180px]">
              <BookOpen className="w-3 h-3 text-[var(--teacher-primary)] shrink-0" />
              <span className="truncate">{courseTitle}</span>
            </span>
          )}

          {timeLimit && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[8px] bg-[var(--surface-muted)] font-medium tabular-nums">
              <Clock className="w-3 h-3" />
              {timeLimit}
            </span>
          )}

          {quiz.passingScore !== undefined && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[8px] bg-[var(--surface-muted)] font-medium tabular-nums">
              <Award className="w-3 h-3" />
              Pass: {quiz.passingScore}%
            </span>
          )}

          <span className="inline-flex items-center gap-1 ml-auto text-[11px]">
            <Calendar className="w-3 h-3" />
            {quiz.createdAt ? formatDate(quiz.createdAt) : '—'}
          </span>
        </div>
      </div>

      <div className="px-4 sm:px-5 py-3 bg-[var(--surface-muted)]/50 border-t border-[var(--border)]/70 flex items-center justify-between gap-2">
        <Tooltip label={quiz.isPublished ? t('common.unpublish') : t('common.publish')}>
          <button
            type="button"
            onClick={() => onTogglePublish(quiz._id, quiz.isPublished)}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--card-solid)] transition-colors cursor-pointer ${
              quiz.isPublished
                ? 'text-[var(--success)] hover:bg-[var(--success-light)]'
                : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
            }`}
          >
            {quiz.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </Tooltip>

        <div className="flex items-center gap-1.5">
          <Tooltip label={t('quiz.leaderboard.title')}>
            <button
              type="button"
              onClick={() => router.push(`${ROUTES.admin.quizEdit(quiz._id)}?tab=leaderboard`)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:text-[var(--warning)] hover:bg-[var(--warning-light)] transition-colors cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
            </button>
          </Tooltip>

          <button
            type="button"
            onClick={() => router.push(ROUTES.admin.quizEdit(quiz._id))}
            className="teacher-pill-btn min-h-[40px] px-3 text-xs font-semibold cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{t('common.edit')}</span>
          </button>

          <Tooltip label={t('common.delete')}>
            <button
              type="button"
              onClick={() => onDelete(quiz._id)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:text-[var(--error)] hover:bg-[var(--error-light)] transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
