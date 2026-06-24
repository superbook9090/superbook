'use client';
import { ROUTES } from '@/constants/routes';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Check, X, Minus } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDateTime } from '@/lib/dateUtils';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { useSessionStore } from '@/store/useSessionStore';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { getQuizAttemptReview } from '@/lib/api/quizAttempts';
import type { QuizComparison } from '@/lib/quiz/quizComparison';
import { resolveQuizComparison, safeNumber, DEFAULT_TIME_LIMIT_MINUTES } from '@/lib/quiz/resultDefaults';
import {
  LazyQuizComparisonTable,
  LazyQuizRankPredictor,
  LazyQuizResultOverview,
} from '@/lib/lazy';
import {
  QuizSolutionsFilter,
  type SolutionFilter,
} from '@/features/quizzes/components/QuizSolutionsFilter';
import { QuizSolutionAnalysis } from '@/features/quizzes/components/QuizSolutionAnalysis';
import { cn } from '@/lib/utils';

interface Question {
  _id: string;
  order?: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Answer {
  questionId: string;
  order: number;
  selectedOption: number;
  isCorrect: boolean;
}

interface Attempt {
  attempt: {
    _id: string;
    score: number;
    correctCount: number;
    totalQuestions: number;
    timeTaken: number;
    attemptNumber: number;
    submittedAt: string;
  };
  quiz: {
    _id: string;
    title: string;
    description: string;
    timeLimit: number;
    questions: Question[];
  };
  answers: Answer[];
  comparison?: Partial<QuizComparison> | null;
}

function getAnswerStatus(answer: Answer | undefined): 'correct' | 'incorrect' | 'unattempted' {
  if (!answer || answer.selectedOption === -1) return 'unattempted';
  return answer.isCorrect ? 'correct' : 'incorrect';
}

export default function QuizResultPage() {
  const session = useSessionStore((s) => s.session);
  const status = useSessionStore((s) => s.status);
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const attemptId = params.id as string;
  const { theme } = useRoleTheme();

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [solutionFilter, setSolutionFilter] = useState<SolutionFilter>('all');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push(ROUTES.login);
      return;
    }

    fetchAttempt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, attemptId]);

  const fetchAttempt = async () => {
    try {
      const data = (await getQuizAttemptReview(attemptId)) as Attempt;
      setAttempt(data);
    } catch {
      // Error handled silently - UI shows loading state
    } finally {
      setIsLoading(false);
    }
  };

  const solutionCounts = useMemo(() => {
    if (!attempt) return { all: 0, correct: 0, incorrect: 0, unattempted: 0 };
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;
    for (const question of attempt.quiz.questions ?? []) {
      const answerStatus = getAnswerStatus(
        (attempt.answers ?? []).find((a) => a.questionId === question._id)
      );
      if (answerStatus === 'correct') correct += 1;
      else if (answerStatus === 'incorrect') incorrect += 1;
      else unattempted += 1;
    }
    return {
      all: attempt.quiz.questions?.length ?? safeNumber(attempt.attempt.totalQuestions),
      correct,
      incorrect,
      unattempted,
    };
  }, [attempt]);

  const filteredQuestions = useMemo(() => {
    if (!attempt) return [];
    return (attempt.quiz.questions ?? []).filter((question) => {
      if (solutionFilter === 'all') return true;
      const answer = (attempt.answers ?? []).find((a) => a.questionId === question._id);
      return getAnswerStatus(answer) === solutionFilter;
    });
  }, [attempt, solutionFilter]);

  const comparison = useMemo(() => {
    if (!attempt) return null;
    return resolveQuizComparison({
      comparison: attempt.comparison,
      score: safeNumber(attempt.attempt.score),
      totalQuestions: safeNumber(
        attempt.attempt.totalQuestions,
        attempt.quiz.questions?.length ?? 0
      ),
      timeTaken: safeNumber(attempt.attempt.timeTaken),
      timeLimitMinutes: safeNumber(attempt.quiz.timeLimit, DEFAULT_TIME_LIMIT_MINUTES),
      answers: (attempt.answers ?? []).map((a) => ({
        questionId: a.questionId,
        selectedOption: safeNumber(a.selectedOption, -1),
        isCorrect: Boolean(a.isCorrect),
      })),
    });
  }, [attempt]);

  const getScoreMessage = (score: number) => {
    if (score >= 80) return t('quizResult.excellentWork');
    if (score >= 60) return t('quizResult.goodJob');
    if (score >= 40) return t('quizResult.keepPracticing');
    return t('quizResult.canDoBetter');
  };

  if (status === 'loading' || isLoading) {
    return <PageSkeleton />;
  }

  if (!attempt) {
    return (
      <div className="text-center py-8 px-4">
        <p className="text-[var(--error)] mb-4">{t('quizResult.resultNotFound')}</p>
        <button
          onClick={() => router.push(ROUTES.student.quizzes)}
          className={`inline-flex items-center justify-center min-h-[44px] px-4 py-3 sm:px-4 sm:py-2.5 sm:w-auto w-full bg-gradient-to-r ${theme.gradient} text-white rounded-xl transition-all`}
        >
          {t('quizResult.backToQuizzes')}
        </button>
      </div>
    );
  }

  const score = safeNumber(attempt.attempt.score);
  const quizTitle = attempt.quiz.title?.trim() || t('quizResult.quizCompleted');

  return (
    <div className="max-w-2xl lg:max-w-4xl mx-auto px-2 sm:px-4 pb-8">
      <div className="sticky top-0 z-10 -mx-2 sm:-mx-4 px-2 sm:px-4 py-3 mb-2 bg-[var(--color-background)]/95 backdrop-blur-sm border-b border-[var(--color-border)] lg:static lg:bg-transparent lg:backdrop-blur-none lg:border-b-0 lg:mb-4 lg:px-0 lg:py-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(ROUTES.student.quizzes)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--card-solid)] text-[var(--color-foreground)] shrink-0"
            aria-label={t('quizResult.backToQuizzes')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm sm:text-base lg:text-lg font-bold text-[var(--color-foreground)] line-clamp-2 flex-1 min-w-0">
            {quizTitle}
          </h1>
        </div>
      </div>

      {comparison && (
        <>
          <LazyQuizResultOverview
            metrics={comparison.you}
            rank={comparison.rank}
            totalParticipants={comparison.totalParticipants}
            percentile={comparison.percentile}
          />

          <p className="text-xs sm:text-sm text-center text-[var(--color-muted-foreground)] mb-4 px-1">
            {getScoreMessage(score)}
            {' · '}
            {t('quizResult.attempt')} #{Math.max(1, safeNumber(attempt.attempt.attemptNumber, 1))}
            {attempt.attempt.submittedAt && (
              <>
                {' · '}
                {formatDateTime(attempt.attempt.submittedAt)}
              </>
            )}
          </p>

          <LazyQuizRankPredictor
            rank={comparison.rank}
            totalParticipants={comparison.totalParticipants}
            scoreScale={comparison.scoreScale}
          />
          <LazyQuizComparisonTable
            you={comparison.you}
            topper={comparison.topper}
            average={comparison.average}
          />
        </>
      )}

      <div className="bg-[var(--card-solid)] rounded-2xl border border-[var(--color-border)] p-4 sm:p-5">
        <h2 className="text-base sm:text-lg font-semibold text-[var(--color-foreground)] mb-3">
          {t('quizResult.solutions')}
        </h2>

        <QuizSolutionsFilter
          value={solutionFilter}
          onChange={setSolutionFilter}
          counts={solutionCounts}
        />

        <div className="mt-4 space-y-3">
          {filteredQuestions.length === 0 ? (
            <p className="text-sm text-[var(--color-muted-foreground)] text-center py-6">
              {t('quizResult.noFilteredQuestions')}
            </p>
          ) : (
            filteredQuestions.map((question, index) => {
              const answer = (attempt.answers ?? []).find((a) => a.questionId === question._id);
              const answerStatus = getAnswerStatus(answer);
              const selectedOption = answer?.selectedOption ?? -1;

              return (
                <div
                  key={question._id}
                  className="rounded-xl border border-[var(--color-border)] overflow-hidden"
                >
                  <div className="flex items-center gap-2 p-3 bg-[var(--color-surface-muted)]/50 border-b border-[var(--color-border)]">
                    <span className="text-sm font-semibold text-[var(--color-foreground)] w-6 shrink-0">
                      {question.order ?? index + 1}
                    </span>
                    {answerStatus === 'correct' && (
                      <Check className="w-4 h-4 text-[var(--success)] shrink-0" />
                    )}
                    {answerStatus === 'incorrect' && (
                      <X className="w-4 h-4 text-[var(--error)] shrink-0" />
                    )}
                    {answerStatus === 'unattempted' && (
                      <Minus className="w-4 h-4 text-[var(--color-muted-foreground)] shrink-0" />
                    )}
                    <p className="text-sm font-medium text-[var(--color-foreground)] line-clamp-2 flex-1 min-w-0">
                      {question.question}
                    </p>
                  </div>

                  <div className="p-3 space-y-2">
                    {question.options?.map((option, optIndex) => {
                      const isSelected = selectedOption === optIndex;
                      const isCorrectOption = safeNumber(question.correctAnswer, -1) === optIndex;

                      return (
                        <div
                          key={optIndex}
                          className={cn(
                            'p-2 rounded-lg text-sm',
                            isCorrectOption
                              ? 'bg-[var(--success)]/15 text-[var(--success)]'
                              : isSelected
                                ? 'bg-[var(--error)]/15 text-[var(--error)]'
                                : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]'
                          )}
                        >
                          <span className="font-medium mr-2">{String.fromCharCode(65 + optIndex)}.</span>
                          {option}
                          {isCorrectOption && (
                            <span className="ml-2 font-medium">{t('quizResult.correctMark')}</span>
                          )}
                          {isSelected && !isCorrectOption && (
                            <span className="ml-2 font-medium">{t('quizResult.incorrectMark')}</span>
                          )}
                        </div>
                      );
                    })}
                    {answerStatus === 'unattempted' && (
                      <p className="text-xs text-[var(--color-muted-foreground)] italic">
                        {t('quizResult.unattempted')}
                      </p>
                    )}
                    <QuizSolutionAnalysis
                      attemptId={attempt.attempt._id}
                      questionId={question._id}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
