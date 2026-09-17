'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CreateQuizForm from '@/features/quizzes/components/CreateQuizForm';
import { LazyQuizLeaderboard } from '@/lib/lazy';
import { useTranslation } from '@/hooks/useTranslation';
import { Edit2, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CreateQuizPageContent({ quizId }: { quizId?: string }) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const isEdit = Boolean(quizId);
  const initialTab = searchParams.get('tab') === 'leaderboard' ? 'leaderboard' : 'edit';
  const [activeTab, setActiveTab] = useState<'edit' | 'leaderboard'>(initialTab);

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)]">
            {isEdit
              ? activeTab === 'leaderboard'
                ? t('quiz.leaderboard.title')
                : t('createQuizPage.editTitle')
              : t('createQuizPage.title')}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[var(--color-muted-foreground)]">
            {isEdit
              ? activeTab === 'leaderboard'
                ? t('quiz.firstAttemptResults')
                : t('createQuizPage.editDescription')
              : t('createQuizPage.description')}
          </p>
        </div>

        {isEdit && (
          <div className="flex gap-1 bg-[var(--color-surface-muted)] p-1 rounded-2xl w-fit border border-[var(--color-border)] shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer',
                activeTab === 'edit'
                  ? 'bg-[var(--card-solid)] text-[var(--color-foreground)] shadow-xs'
                  : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
              )}
            >
              <Edit2 className="w-4 h-4" />
              <span>{t('createQuizPage.editTitle') || 'Edit Quiz'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('leaderboard')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer',
                activeTab === 'leaderboard'
                  ? 'bg-[var(--card-solid)] text-[var(--student-primary)] shadow-xs'
                  : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
              )}
            >
              <Trophy className="w-4 h-4 text-[var(--warning)]" />
              <span>{t('quiz.leaderboard.title')}</span>
            </button>
          </div>
        )}
      </div>

      {isEdit && activeTab === 'leaderboard' ? (
        <LazyQuizLeaderboard quizId={quizId!} />
      ) : (
        <div className="bg-[var(--card-solid)] shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <CreateQuizForm
              quizId={quizId}
              onViewLeaderboard={isEdit ? () => setActiveTab('leaderboard') : undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
}
