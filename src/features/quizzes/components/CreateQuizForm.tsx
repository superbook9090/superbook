'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/store/useSessionStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { QuizBasicInfoForm } from './QuizBasicInfoForm';
import { QuizImportTool } from './QuizImportTool';
import { QuizQuestionsEditor } from './QuizQuestionsEditor';
import { Trophy } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useCreateQuizForm } from './create-quiz-form/useCreateQuizForm';

type Props = {
  /** When set, form loads this quiz and PATCHes on submit (teacher edit). */
  quizId?: string;
  onViewLeaderboard?: () => void;
};

export default function CreateQuizForm({ quizId, onViewLeaderboard }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const session = useSessionStore((s) => s.session);
  const { theme } = useRoleTheme();

  const {
    isLoading,
    isFetching,
    courses,
    formData,
    chapterOptions,
    lessonOptions,
    chaptersLoading,
    questions,
    setQuestions,
    handleChange,
    handleQuestionChange,
    addQuestion,
    removeQuestion,
    addOption,
    removeOption,
    handleSubmit,
  } = useCreateQuizForm(quizId);

  if (isFetching) {
    return (
      <div className="text-center py-8 text-[var(--color-muted-foreground)]">
        {t('createQuizForm.loadingCourses')}
      </div>
    );
  }

  const isAdminUser = session?.user?.role === 'admin' || session?.user?.role === 'superadmin';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
        <div>
          {quizId && onViewLeaderboard && (
            <button
              type="button"
              onClick={onViewLeaderboard}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-[var(--color-border)] rounded-md shadow-xs text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-card)] hover:bg-[var(--color-accent)] focus:outline-none transition-colors cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-[var(--warning)]" />
              <span>{t('quiz.leaderboard.title')}</span>
            </button>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => router.push(isAdminUser ? ROUTES.admin.quizzes : ROUTES.teacher.quizzes)}
            className="px-4 py-2 border border-[var(--color-border)] rounded-md shadow-sm text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-card)] hover:bg-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] cursor-pointer"
          >
            {t('createQuizForm.cancel')}
          </button>
          <button
            type="submit"
            disabled={isLoading || (!quizId && courses.length === 0)}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
          >
            {isLoading
              ? quizId
                ? t('createQuizForm.saving')
                : t('createQuizForm.creating')
              : quizId
                ? t('createQuizForm.saveChanges')
                : t('createQuizForm.createQuiz')}
          </button>
        </div>
      </div>

      <QuizBasicInfoForm
        formData={formData}
        handleChange={handleChange}
        courses={courses}
        quizId={quizId}
        chaptersLoading={chaptersLoading}
        chapterOptions={chapterOptions}
        lessonOptions={lessonOptions}
      />

      <div className="border-t border-[var(--color-border)] pt-6">
        <QuizImportTool
          theme={theme}
          onImport={(imported) => setQuestions(imported)}
        />

        <QuizQuestionsEditor
          questions={questions}
          onQuestionChange={handleQuestionChange}
          onRemoveQuestion={removeQuestion}
          onAddOption={addOption}
          onRemoveOption={removeOption}
          onAddQuestion={addQuestion}
        />
      </div>

      <div className="flex items-center pt-4">
        <input
          type="checkbox"
          name="isPublished"
          id="isPublished"
          checked={formData.isPublished}
          onChange={handleChange}
          className="h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-[var(--color-border)] rounded"
        />
        <label htmlFor="isPublished" className="ml-2 block text-sm text-[var(--color-foreground)]">
          {t('createQuizForm.publishImmediately')}
        </label>
      </div>
    </form>
  );
}
