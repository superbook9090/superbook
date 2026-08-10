// src/app/(dashboard)/dashboard/student/quizzes/take/page.tsx
'use client';

import { ROUTES } from '@/constants/routes';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { useQuiz } from '@/contexts/QuizContext';
import { useAlert } from '@/components/ui/AlertContainer';
import { useSubmitQuizAttempt, useStartQuizAttempt } from '@/lib/react-query/hooks';
import { getQuizAttemptByAttemptId } from '@/lib/api/quizAttempts';
import { ApiClientError } from '@/lib/api/http';
import { useQuizSecurity } from '@/hooks/useQuizSecurity';
import { LazyConfirmModal } from '@/lib/lazy';
import { useSessionStore } from '@/store/useSessionStore';
import { PageSkeleton } from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';

import { QuizTakeHeader } from './_components/QuizTakeHeader';
import { QuizQuestionCard } from './_components/QuizQuestionCard';
import { QuizNavigation } from './_components/QuizNavigation';
import type { Question, Attempt } from './_components/types';

import {
  computeQuizTimeRemainingSeconds,
  computeQuizTimeTakenSeconds,
} from '@/lib/quiz/attemptTime';

export default function TakeQuizPage() {
  const session = useSessionStore((s) => s.session);
  const status = useSessionStore((s) => s.status);
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get('attemptId');
  const { t } = useTranslation();
  const { theme } = useRoleTheme();
  const { addAlert } = useAlert();
  const submitQuizMutation = useSubmitQuizAttempt();
  const startQuizMutation = useStartQuizAttempt();

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);
  const [violationRetryCount, setViolationRetryCount] = useState(0);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const forceSubmitQuizRef = useRef<(() => Promise<void>) | null>(null);
  const { setQuizActive } = useQuiz();

  const getSecurityReasonMessage = useCallback(
    (reason: string) => {
      const keys: Record<string, string> = {
        fullscreen_exit: 'quiz.violationFullscreenExit',
        tab_switch: 'quiz.violationTabSwitch',
        window_blur: 'quiz.violationWindowBlur',
        page_exit: 'quiz.violationPageExit',
        duplicate_tab: 'quiz.violationDuplicateTab',
        dev_tools: 'quiz.violationDevTools',
      };
      const key = keys[reason];
      return key ? t(key) : t('quiz.violationGeneric');
    },
    [t]
  );

  // Quiz security hook - violation handler
  const handleViolation = useCallback(
    (reason: string) => {
      setSecurityWarning(getSecurityReasonMessage(reason));
      setShowViolationModal(true);
    },
    [getSecurityReasonMessage]
  );

  const quizSecurity = useQuizSecurity({
    onViolation: handleViolation,
    enabled: true,
  });

  const submitAttempt = useCallback(
    async (
      attemptData: Attempt,
      answerMap: Record<string, number>,
      options: { forceSubmit?: boolean; timeTakenOverride?: number } = {}
    ) => {
      if (isSubmittingRef.current) return;
      isSubmittingRef.current = true;
      setIsAutoSubmitting(true);

      const formattedAnswers = attemptData.questions.map((q) => ({
        questionId: q._id,
        selectedOption: answerMap[q._id] ?? -1,
      }));

      const timeTaken =
        options.timeTakenOverride ??
        computeQuizTimeTakenSeconds(attemptData.startedAt, attemptData.quiz.timeLimit);

      try {
        const data = await submitQuizMutation.mutateAsync({
          quizId: attemptData.quiz._id,
          action: 'submit',
          answers: formattedAnswers,
          timeTaken,
          forceSubmit: options.forceSubmit,
        });

        quizSecurity.stopQuiz();
        setQuizActive(false);
        router.replace(ROUTES.student.quizResult(data.attempt._id));
      } catch (err) {
        console.error('Error submitting quiz:', err);
        const errorMsg = options.forceSubmit
          ? t('errors.securityForceSubmitFailed')
          : t('errors.errorSubmittingQuiz');
        addAlert({ type: 'error', message: errorMsg, duration: 5000 });
        isSubmittingRef.current = false;
        setIsAutoSubmitting(false);
      }
    },
    [router, submitQuizMutation, quizSecurity, setQuizActive, t, addAlert]
  );

  // Force submit quiz on security violation
  const forceSubmitQuiz = useCallback(async () => {
    if (!attempt) return;
    const timeTaken = Math.max(0, attempt.quiz.timeLimit * 60 - timeRemaining);
    await submitAttempt(attempt, answers, { forceSubmit: true, timeTakenOverride: timeTaken });
  }, [attempt, answers, timeRemaining, submitAttempt]);

  // Update ref when forceSubmitQuiz changes
  useEffect(() => {
    forceSubmitQuizRef.current = forceSubmitQuiz;
  }, [forceSubmitQuiz]);

  // Handle violation modal continue - re-enter fullscreen
  const handleViolationContinue = useCallback(async () => {
    // Check if dev tools is still open
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    const isDevToolsOpen = widthDiff > 160 || heightDiff > 160;

    if (isDevToolsOpen) {
      setSecurityWarning(t('errors.closeDevTools'));
      // Keep modal open
      return;
    }

    setShowViolationModal(false);
    setSecurityWarning(null);

    // Reset dev tools detection so it doesn't trigger immediately
    quizSecurity.resetDevToolsDetection();

    if (violationRetryCount >= 2) {
      // After 3 retries (0, 1, 2), force submit
      await forceSubmitQuiz();
    } else {
      // Increment retry count and re-enter fullscreen
      setViolationRetryCount((prev) => prev + 1);
      await quizSecurity.startQuiz();
    }
  }, [violationRetryCount, forceSubmitQuiz, quizSecurity, t]);

  // Reset all state when attemptId changes (fresh attempt)
  useEffect(() => {
    setAttempt(null);
    setAnswers({});
    setCurrentQuestion(0);
    setTimeRemaining(0);
    setSecurityWarning(null);
    setViolationRetryCount(0);
    setShowViolationModal(false);
    setError('');
    setIsLoading(true);
    setIsAutoSubmitting(false);
    isSubmittingRef.current = false;
  }, [attemptId]);

  // Store stopQuiz in a ref to avoid dependency issues
  const stopQuizRef = useRef(quizSecurity.stopQuiz);
  stopQuizRef.current = quizSecurity.stopQuiz;

  // Cleanup on unmount - restore sidebar and exit fullscreen
  useEffect(() => {
    return () => {
      stopQuizRef.current();
      setQuizActive(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on unmount

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push(ROUTES.login);
      return;
    }
    if (!attemptId) {
      router.push(ROUTES.student.quizzes);
      return;
    }

    fetchAttempt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]);

  // Timer — only runs while time remains
  useEffect(() => {
    if (!attempt || attempt.status !== 'in_progress' || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [attempt, timeRemaining]);

  // Auto-submit when timer hits zero (including on load if already expired)
  useEffect(() => {
    if (!attempt || attempt.status !== 'in_progress' || timeRemaining > 0) return;
    if (isSubmittingRef.current) return;
    void submitAttempt(attempt, answers, { forceSubmit: true });
  }, [attempt, timeRemaining, answers, submitAttempt]);

  const fetchAttempt = async () => {
    if (!attemptId) {
      setError(t('errors.quizAttemptNotFound'));
      setIsLoading(false);
      return;
    }
    try {
      const data = await getQuizAttemptByAttemptId(attemptId);
      const foundAttempt = data.attempts?.[0] as Attempt | undefined;
      const extraQuestions = (data as { questions?: Question[] }).questions;
      if (foundAttempt && foundAttempt.status === 'in_progress') {
        const merged: Attempt = {
          ...foundAttempt,
          questions: extraQuestions?.length ? extraQuestions : (foundAttempt as { questions?: Question[] }).questions || [],
        };

        const remaining = computeQuizTimeRemainingSeconds(
          foundAttempt.startedAt,
          foundAttempt.quiz.timeLimit
        );
        setAttempt(merged);
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          setIsLoading(false);
          await submitAttempt(merged, {}, { forceSubmit: true });
          return;
        }

        await quizSecurity.startQuiz();
        setQuizActive(true);
      } else if (
        foundAttempt &&
        (foundAttempt.status === 'completed' || foundAttempt.status === 'force_submitted')
      ) {
        router.replace(ROUTES.student.quizResult(foundAttempt._id));
        return;
      } else {
        setError(t('errors.quizAttemptNotFound'));
      }
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : t('errors.errorLoadingQuiz')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!attempt) return;

    // Reset all state
    setAnswers({});
    setCurrentQuestion(0);
    setTimeRemaining(0);
    setSecurityWarning(null);
    setError('');
    setIsLoading(true);

    try {
      const data = await startQuizMutation.mutateAsync(attempt.quiz._id);
      router.push(ROUTES.student.quizTake(data.attempt._id));
    } catch {
      setError(t('errors.errorStartingNewAttempt'));
      setIsLoading(false);
    }
  };

  const handleAnswer = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = useCallback(
    async (autoSubmit = false) => {
      if (!attempt) return;

      if (!autoSubmit) {
        setShowSubmitModal(true);
        return;
      }

      const timeTaken = Math.max(0, attempt.quiz.timeLimit * 60 - timeRemaining);
      await submitAttempt(attempt, answers, { timeTakenOverride: timeTaken });
    },
    [attempt, answers, timeRemaining, submitAttempt]
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (status === 'loading' || isLoading || isAutoSubmitting) {
    return <PageSkeleton />;
  }

  if (error || !attempt) {
    return (
      <div className="text-center py-8">
        {error === 'quiz_completed' ? (
          <>
            <p className="text-[var(--color-muted-foreground)] mb-4">{t('quiz.takeAlreadyCompleted')}</p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={handleRetry}
                variant="primary"
              >
                {t('quiz.takeRetryQuiz')}
              </Button>
              <Button
                onClick={() => router.push(ROUTES.student.quizzes)}
                variant="secondary"
              >
                {t('quiz.takeBackToQuizzes')}
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-[var(--error)] mb-4">{error || t('quiz.takeQuizNotFound')}</p>
            <Button
              onClick={() => router.push(ROUTES.student.quizzes)}
              variant="primary"
            >
              {t('quiz.takeBackToQuizzes')}
            </Button>
          </>
        )}
      </div>
    );
  }

  const questions = attempt.questions || [];
  const currentQ = questions[currentQuestion];
  
  const questionIds = questions.map((q) => q._id);
  const answeredIds = new Set(questionIds.filter((id) => answers[id] !== undefined));

  return (
    <div className="max-w-4xl mx-auto pb-24 sm:pb-8">
      {/* Security Warning */}
      {securityWarning && (
        <div className="bg-[var(--error-light)] border-l-4 border-[var(--error)] p-4 mb-6 rounded-r-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-[var(--error)]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-[var(--error)]">{securityWarning}</p>
            </div>
          </div>
        </div>
      )}


      {/* Header */}
      <QuizTakeHeader
        attempt={attempt as unknown as Attempt}
        timeRemaining={timeRemaining}
        formatTime={formatTime}
        questions={questions as unknown as Question[]}
        currentQuestion={currentQuestion}
        answeredIds={answeredIds}
        questionIds={questionIds}
        setCurrentQuestion={setCurrentQuestion}
        t={t}
      />
      
      {/* Question */}
      <QuizQuestionCard
        currentQuestionIndex={currentQuestion}
        currentQ={currentQ as unknown as Question}
        answers={answers}
        handleAnswer={handleAnswer}
        theme={theme}
      />
      
      {/* Navigation */}
      <QuizNavigation
        currentQuestion={currentQuestion}
        totalQuestions={questions.length}
        setCurrentQuestion={setCurrentQuestion}
        handleSubmit={handleSubmit}
        isSubmitting={submitQuizMutation.isPending}
        t={t}
      />
      
      {/* Warning if time is low */}
      {timeRemaining < 300 && (
        <div className="mt-4 bg-[var(--error-light)] border-l-4 border-[var(--error)] p-4">
          <p className="text-sm text-[var(--error)]">
            {t('quiz.autoSubmitWarning')}
          </p>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      <LazyConfirmModal
        isOpen={showSubmitModal}
        title={t('quiz.confirmSubmit')}
        message={t('quiz.confirmSubmit')}
        onConfirm={() => {
          setShowSubmitModal(false);
          handleSubmit(true);
        }}
        onCancel={() => setShowSubmitModal(false)}
        confirmText={t('quiz.submit')}
        cancelText={t('common.cancel')}
        type="warning"
        isLoading={submitQuizMutation.isPending}
      />

      {/* Violation Warning Modal */}
      <LazyConfirmModal
        isOpen={showViolationModal}
        title={t('quiz.securityViolationTitle')}
        message={t('quiz.violationModalMessage', {
          warning: securityWarning || t('quiz.violationGeneric'),
          count: 3 - violationRetryCount - 1,
          retriesWord:
            3 - violationRetryCount - 1 === 1
              ? t('quiz.violationRetrySingular')
              : t('quiz.violationRetriesPlural'),
        })}
        onConfirm={handleViolationContinue}
        // onCancel={() => setShowViolationModal(false)}
        confirmText={t('quiz.violationContinue')}
        // cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
