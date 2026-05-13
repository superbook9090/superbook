// src/app/(dashboard)/dashboard/student/quizzes/[id]/result/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDateTime, formatDuration } from '@/lib/dateUtils';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { useSessionStore } from '@/store/useSessionStore';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { getQuizAttemptReview } from '@/lib/api/quizAttempts';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Answer {
  questionIndex: number;
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
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[var(--success)]';
    if (score >= 60) return 'text-[var(--warning)]';
    return 'text-[var(--error)]';
  };

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
          onClick={() => router.push('/dashboard/student/quizzes')}
          className={`inline-flex items-center justify-center min-h-[44px] px-4 py-3 sm:px-4 sm:py-2.5 sm:w-auto w-full bg-gradient-to-r ${theme.gradient} text-white rounded-xl transition-all`}
        >
          {t('quizResult.backToQuizzes')}
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Result Card */}
        <div className="bg-[var(--card-solid)] rounded-lg shadow-md p-8 mb-6">
          <div className="text-center mb-6">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)] mb-2">{t('quizResult.quizCompleted')}</h1>
            <p className="text-base sm:text-lg text-[var(--color-muted-foreground)]">{attempt.quiz.title}</p>
          </div>

          {/* Score Circle */}
          <div className="flex justify-center mb-6">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="var(--border)"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke={attempt.attempt.score >= 60 ? 'var(--success)' : attempt.attempt.score >= 40 ? 'var(--warning)' : 'var(--error)'}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${attempt.attempt.score * 4.4} 440`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${getScoreColor(attempt.attempt.score)}`}>
                  {attempt.attempt.score}%
                </span>
                <span className="text-sm text-[var(--color-muted-foreground)] mt-1">
                  {attempt.attempt.correctCount}/{attempt.attempt.totalQuestions}
                </span>
              </div>
            </div>
          </div>

          <p className={`text-center text-lg font-medium mb-6 ${getScoreColor(attempt.attempt.score)}`}>
          {getScoreMessage(attempt.attempt.score)}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[var(--color-muted)] rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-[var(--color-foreground)]">{attempt.attempt.correctCount}</p>
            <p className="text-sm text-[var(--color-muted-foreground)]">{t('quizResult.correct')}</p>
          </div>
          <div className="bg-[var(--color-muted)] rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-[var(--color-foreground)]">
              {attempt.attempt.totalQuestions - attempt.attempt.correctCount}
            </p>
            <p className="text-sm text-[var(--color-muted-foreground)]">{t('quizResult.incorrect')}</p>
          </div>
          <div className="bg-[var(--color-muted)] rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-[var(--color-foreground)]">{formatDuration(attempt.attempt.timeTaken)}</p>
            <p className="text-sm text-[var(--color-muted-foreground)]">{t('quizResult.timeTaken')}</p>
          </div>
        </div>

        <div className="text-center text-sm text-[var(--color-muted-foreground)] mb-6">
          {t('quizResult.attempt')} #{attempt.attempt.attemptNumber}
          {attempt.attempt.submittedAt && (
            <>
              {' '}{'•'} {t('quizResult.submittedOn')}{' '}
              {formatDateTime(attempt.attempt.submittedAt)}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => setShowAnswers(!showAnswers)}
            className={`min-h-[44px] sm:min-h-0 px-4 py-3 sm:px-4 sm:py-2 bg-gradient-to-r ${theme.gradient} text-white rounded-md hover:opacity-90`}
          >
            {showAnswers ? t('quizResult.hideAnswers') : t('quizResult.showAnswers')}
          </button>
          <button
            onClick={() => router.push('/dashboard/student/quizzes')}
            className="min-h-[44px] sm:min-h-0 px-4 py-3 sm:px-4 sm:py-2 border border-[var(--border)] text-[var(--color-foreground)] rounded-md hover:bg-[var(--color-muted)]"
          >
            {t('quizResult.backToQuizzes')}
          </button>
        </div>
      </div>

      {/* Detailed Answers */}
      {showAnswers && (
        <div className="bg-[var(--card-solid)] rounded-lg shadow-md p-6">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--color-foreground)] mb-4">{t('quizResult.answerReview')}</h2>
            <div className="space-y-4">
              {attempt.quiz.questions.map((question, index) => {
                const answer = attempt.answers.find((a) => a.questionIndex === index);
                const isCorrect = answer?.isCorrect || false;
                const selectedOption = answer?.selectedOption ?? -1;

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      isCorrect ? 'bg-[var(--success-light)] border-[var(--success)]' : 'bg-[var(--error-light)] border-[var(--error)]'
                    }`}
                  >
                    <p className="font-medium text-[var(--color-foreground)] mb-3">
                      {index + 1}. {question.question}
                    </p>
                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => {
                        const isSelected = selectedOption === optIndex;
                        const isCorrectOption = question.correctAnswer === optIndex;

                        return (
                          <div
                            key={optIndex}
                            className={`p-2 rounded text-sm ${
                              isCorrectOption
                                ? 'bg-[var(--success)]/20 text-[var(--success)]'
                                : isSelected
                                ? 'bg-[var(--error)]/20 text-[var(--error)]'
                                : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)]'
                            }`}
                          >
                            <span className="font-medium mr-2">{String.fromCharCode(65 + optIndex)}.</span>
                            {option}
                            {isCorrectOption && (
                              <span className="ml-2 text-[var(--success)] font-medium">{t('quizResult.correctMark')}</span>
                            )}
                            {isSelected && !isCorrect && (
                              <span className="ml-2 text-[var(--error)] font-medium">{t('quizResult.incorrectMark')}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
