'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { HelpCircle, Clock, BookOpen, Edit, Eye, EyeOff, Trash2, Trophy } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import Button from '@/components/ui/Button';
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="card-surface antigravity-glass p-5 sm:p-6 rounded-3xl border border-[var(--border)] hover:border-[var(--teacher-primary)]/40 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
    >
      <div className="space-y-3">
        {/* Top Badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border border-[var(--teacher-border)] line-clamp-1 max-w-[200px]">
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{courseTitle}</span>
          </div>

          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${
              quiz.isPublished
                ? 'bg-[var(--success-light)] text-[var(--success)]'
                : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]'
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
          {quiz.description && (
            <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] line-clamp-2 mt-1 leading-relaxed">
              {quiz.description}
            </p>
          )}
        </div>

        {/* Meta Chips */}
        <div className="flex items-center gap-3 text-xs font-medium text-[var(--color-muted-foreground)] pt-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-foreground)]">
            <HelpCircle className="w-3.5 h-3.5 text-[var(--teacher-primary)]" />
            {quiz.questionCount ?? 0} {t('teacherQuizzes.questions')}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-foreground)]">
            <Clock className="w-3.5 h-3.5 text-[var(--teacher-primary)]" />
            {quiz.timeLimit} {t('teacherQuizzes.min')}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-4 mt-4 border-t border-[var(--border)]">
        <Button
          type="button"
          variant="secondary"
          onClick={() => onEdit(quizId)}
          className="flex-1 min-h-[44px] text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm transition-all"
        >
          <Edit className="w-3.5 h-3.5 mr-1.5" />
          <span>{t('teacherQuizzes.edit')}</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`${ROUTES.teacher.quizEdit(quizId)}?tab=leaderboard`)}
          className="min-h-[44px] px-3.5 text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm transition-all"
          title={t('quiz.leaderboard.title')}
        >
          <Trophy className="w-4 h-4 text-[var(--warning)]" />
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => onTogglePublish(quiz)}
          className="min-h-[44px] px-3.5 text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm transition-all"
          title={quiz.isPublished ? t('teacherQuizzes.unpublish') : t('teacherQuizzes.publish')}
        >
          {quiz.isPublished ? (
            <EyeOff className="w-4 h-4 text-[var(--color-muted-foreground)]" />
          ) : (
            <Eye className="w-4 h-4 text-[var(--teacher-primary)]" />
          )}
        </Button>

        <Button
          type="button"
          variant="danger"
          onClick={() => onDelete(quizId, quiz.title)}
          className="min-h-[44px] px-3.5 shadow-xs hover:shadow-sm transition-all"
          title={t('teacherQuizzes.delete')}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
