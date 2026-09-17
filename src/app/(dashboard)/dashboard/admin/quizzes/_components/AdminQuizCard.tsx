'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
import Button from '@/components/ui/Button';
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
  index,
  courseTitle,
  onTogglePublish,
  onDelete,
}: AdminQuizCardProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const questionCount = quiz.questions?.length ?? 0;
  const timeLimit = quiz.timeLimit ? `${quiz.timeLimit}m` : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.25 }}
      whileHover={{ y: -4 }}
      className="antigravity-glass antigravity-card rounded-3xl border border-[var(--border)] shadow-md hover:shadow-2xl hover:border-[var(--primary)]/40 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
    >
      <div className="p-5 sm:p-6 space-y-3.5">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-[var(--student-soft)] text-[var(--student-primary)] group-hover:scale-105 transition-transform duration-300 shadow-sm border border-[var(--student-border)]">
              <HelpCircle className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-bold text-[var(--color-muted-foreground)]">
              {questionCount} {t('common.questions') || 'questions'}
            </span>
          </div>

          <Badge variant={quiz.isPublished ? 'primary' : 'default'} size="sm">
            {quiz.isPublished ? t('common.published') : t('common.draft')}
          </Badge>
        </div>

        {/* Title and Description */}
        <div>
          <h3 className="font-bold text-base sm:text-lg text-[var(--color-foreground)] line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
            {quiz.title}
          </h3>
          <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] line-clamp-2 mt-1 leading-relaxed">
            {quiz.description || t('quizzes.noDescription') || 'No description provided.'}
          </p>
        </div>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border)] text-xs text-[var(--color-muted-foreground)]">
          {courseTitle && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[var(--surface-muted)] text-[var(--color-foreground)] font-semibold truncate max-w-[180px]">
              <BookOpen className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
              <span className="truncate">{courseTitle}</span>
            </span>
          )}

          {timeLimit && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[var(--surface-muted)] text-[var(--color-muted-foreground)] font-medium">
              <Clock className="w-3 h-3" />
              {timeLimit}
            </span>
          )}

          {quiz.passingScore !== undefined && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[var(--surface-muted)] text-[var(--color-muted-foreground)] font-medium">
              <Award className="w-3 h-3" />
              Pass: {quiz.passingScore}%
            </span>
          )}

          <span className="inline-flex items-center gap-1 ml-auto text-[11px] text-[var(--color-muted)]">
            <Calendar className="w-3 h-3" />
            {quiz.createdAt ? formatDate(quiz.createdAt) : '—'}
          </span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-5 py-3.5 bg-[var(--surface-muted)]/50 border-t border-[var(--border)]/60 flex items-center justify-between gap-2">
        <Tooltip label={quiz.isPublished ? t('common.unpublish') || 'Unpublish' : t('common.publish') || 'Publish'}>
          <button
            type="button"
            onClick={() => onTogglePublish(quiz._id, quiz.isPublished)}
            className={`p-2 rounded-xl transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center ${
              quiz.isPublished
                ? 'text-[var(--success)] hover:bg-[var(--success-light)]'
                : 'text-[var(--color-muted-foreground)] hover:bg-[var(--surface-muted)]'
            }`}
          >
            {quiz.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </Tooltip>

        <div className="flex items-center gap-1.5">
          <Tooltip label={t('quiz.leaderboard.title') || 'Leaderboard'}>
            <button
              type="button"
              onClick={() => router.push(`${ROUTES.admin.quizEdit(quiz._id)}?tab=leaderboard`)}
              className="p-2 rounded-xl text-[var(--color-muted-foreground)] hover:text-[var(--warning)] hover:bg-[var(--warning-light)] transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
            >
              <Trophy className="w-4 h-4" />
            </button>
          </Tooltip>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push(ROUTES.admin.quizEdit(quiz._id))}
            className="flex items-center gap-1.5 min-h-[38px] text-xs font-semibold px-3 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{t('common.edit')}</span>
          </Button>

          <Tooltip label={t('common.delete') || 'Delete'}>
            <button
              type="button"
              onClick={() => onDelete(quiz._id)}
              className="p-2 rounded-xl text-[var(--color-muted-foreground)] hover:text-[var(--error)] hover:bg-[var(--error-light)] transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>
    </motion.div>
  );
}
