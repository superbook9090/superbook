'use client';

import React, { useState, useEffect, useCallback, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/components/ui/AlertContainer';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useQuizSecurity } from '@/hooks/useQuizSecurity';
import { useQuiz } from '@/contexts/QuizContext';
import {
  startContestAttempt,
  submitContestAttempt,
  getContestById,
  type ContestQuestionItem,
  type ContestItem,
} from '@/lib/api/contests';
import { ContestCountdown } from '@/features/contests/components/ContestCountdown';
import { LazyConfirmModal, LazyQuizQuestionProgress } from '@/lib/lazy';
import {
  Flame,
  ShieldAlert,
} from 'lucide-react';
import { ApiClientError } from '@/lib/api/http';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { haptics } from '@/lib/native/haptics';
import { playOptionSelectSound, playSuccessChime, playViolationWarningSound } from '@/lib/native/soundEffects';
import {
  saveLocalAttemptAnswers,
  loadLocalAttemptAnswers,
  clearLocalAttemptAnswers,
} from '@/lib/native/offlineStorage';
import { QuizQuestionCard } from '../../../quizzes/take/_components/QuizQuestionCard';
import { QuizNavigation } from '../../../quizzes/take/_components/QuizNavigation';
import type { Question } from '../../../quizzes/take/_components/types';

export default function TakeContestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useTranslation();
  const router = useRouter();
  const { addAlert } = useAlert();
  const { setQuizActive } = useQuiz();

  const [contest, setContest] = useState<ContestItem | null>(null);
  const [questions, setQuestions] = useState<ContestQuestionItem[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [violationMessage, setViolationMessage] = useState('');
  const [violationRetryCount, setViolationRetryCount] = useState(0);
  const isSubmittingRef = useRef(false);
  const attemptStartedAtRef = useRef<number>(Date.now());

  useWakeLock(Boolean(contest && !isSubmitting && questions.length > 0));
  const { isOnline } = useNetworkStatus();

  // Map security reason to localized message
  const getSecurityReasonMessage = useCallback(
    (reason: string) => {
      switch (reason) {
        case 'fullscreen_exit':
          return t('quiz.violationFullscreenExit');
        case 'tab_switch':
          return t('quiz.violationTabSwitch');
        case 'window_blur':
          return t('quiz.violationWindowBlur');
        case 'page_exit':
          return t('quiz.violationPageExit');
        case 'dev_tools':
          return t('quiz.violationDevTools');
        case 'duplicate_tab':
          return t('quiz.violationDuplicateTab');
        default:
          return t('quiz.violationGeneric');
      }
    },
    [t]
  );

  // Security violation handler
  const handleViolation = useCallback(
    (reason: string) => {
      haptics.error();
      playViolationWarningSound();
      setViolationMessage(getSecurityReasonMessage(reason));
      setShowViolationModal(true);
    },
    [getSecurityReasonMessage]
  );

  const quizSecurity = useQuizSecurity({
    onViolation: handleViolation,
    enabled: true,
  });

  const startQuizRef = useRef(quizSecurity.startQuiz);
  startQuizRef.current = quizSecurity.startQuiz;

  const stopQuizRef = useRef(quizSecurity.stopQuiz);
  stopQuizRef.current = quizSecurity.stopQuiz;

  // Submit Attempt — the API identifies the attempt server-side by session + contest ID
  const handleSubmit = useCallback(async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    // Stop security monitoring immediately so that the fullscreen exit and
    // window-blur events triggered by the modal / submit flow don't count as violations.
    stopQuizRef.current();
    setQuizActive(false);

    try {
      const formattedAnswers = questions.map((q) => ({
        quizId: q.quizId,
        questionId: q._id,
        selectedOption: answers[q._id] !== undefined ? answers[q._id] : -1,
      }));

      const timeTakenSeconds = Math.floor((Date.now() - attemptStartedAtRef.current) / 1000);

      await submitContestAttempt(id, {
        answers: formattedAnswers,
        timeTaken: timeTakenSeconds,
        violationCount: violationRetryCount,
      });

      clearLocalAttemptAnswers(`contest_${id}`);
      haptics.celebration();
      playSuccessChime();

      addAlert({ type: 'success', message: 'Contest attempt submitted successfully!' });
      router.replace(`/dashboard/student/contests/${id}/result`);
    } catch (err) {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      addAlert({
        type: 'error',
        message: err instanceof ApiClientError ? err.message : 'Failed to submit contest',
      });
    }
  }, [id, questions, answers, router, addAlert, setQuizActive, violationRetryCount]);

  // Handle violation continue / re-enter fullscreen
  const handleViolationContinue = useCallback(async () => {
    // Don't process violation continuation if submission is already underway
    if (isSubmittingRef.current) {
      setShowViolationModal(false);
      return;
    }

    // Check if dev tools is still open via window size delta
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    const isDevToolsOpen = widthDiff > 160 || heightDiff > 160;

    if (isDevToolsOpen) {
      setViolationMessage(
        t('errors.closeDevTools')
      );
      return;
    }

    setShowViolationModal(false);
    setViolationMessage('');
    quizSecurity.resetDevToolsDetection();

    if (violationRetryCount >= 2) {
      // After 3 retries (0, 1, 2), force submit
      addAlert({
        type: 'error',
        message: 'Maximum anti-cheat violations reached. Submitting contest attempt now.',
      });
      await handleSubmit();
    } else {
      // Increment retry count and re-enter fullscreen
      setViolationRetryCount((prev) => prev + 1);
      await startQuizRef.current();
    }
  }, [violationRetryCount, quizSecurity, handleSubmit, addAlert, t]);

  // Cleanup on unmount - restore chrome and exit fullscreen
  useEffect(() => {
    return () => {
      stopQuizRef.current();
      setQuizActive(false);
    };
  }, [setQuizActive]);

  // Load contest & initiate / resume attempt
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        setIsLoading(true);
        const contestData = await getContestById(id);
        if (cancelled) return;
        setContest(contestData.contest);

        const res = await startContestAttempt(id);
        if (cancelled) return;

        setQuestions(res.questions);
        setEndTime(new Date(Date.now() + res.timeRemaining * 1000));
        attemptStartedAtRef.current = Date.now();

        const localAnswers = loadLocalAttemptAnswers(`contest_${id}`);
        if (localAnswers && Object.keys(localAnswers).length > 0) {
          setAnswers(localAnswers);
        }

        // Enter fullscreen mode and lock dev tools
        await startQuizRef.current();
        setQuizActive(true);
      } catch (err) {
        if (cancelled) return;
        
        if (err instanceof ApiClientError && err.message.includes('maximum allowed attempts')) {
          console.warn('[TakeContestPage] Attempts exhausted:', err.message);
          addAlert({ type: 'info', message: t('contest.attemptsExhausted') });
          router.replace(`/dashboard/student/contests/${id}/result`);
        } else {
          console.error('[TakeContestPage] Failed to initialize contest:', err);
          const msg = err instanceof ApiClientError ? err.message : 'Failed to start contest attempt';
          addAlert({ type: 'error', message: msg });
          router.push(`/dashboard/student/contests`);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Handle Answer Selection — clicking the same option again unselects it
  const handleSelectOption = (questionId: string, optionIndex: number) => {
    haptics.selection();
    playOptionSelectSound();
    setAnswers((prev) => {
      let next: Record<string, number>;
      if (prev[questionId] === optionIndex) {
        // Same option clicked → remove selection
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [questionId]: _removed, ...rest } = prev;
        next = rest;
      } else {
        next = { ...prev, [questionId]: optionIndex };
      }
      saveLocalAttemptAnswers(`contest_${id}`, next);
      return next;
    });
  };

  if (isLoading || !contest) {
    return <PageSkeleton />;
  }

  const currentQ = questions[currentIndex];
  const totalQ = questions.length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-4xl w-full mx-auto h-[100dvh] flex flex-col pt-1 sm:pt-6 px-2 sm:px-4 pb-[3.75rem] sm:pb-6">
      {/* Security Warning */}
      {violationMessage && !showViolationModal && (
        <div className="bg-[var(--error-light)] border-l-4 border-[var(--error)] p-4 mb-6 rounded-r-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShieldAlert className="h-5 w-5 text-[var(--error)]" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-[var(--error)]">{violationMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="antigravity-glass rounded-2xl sm:rounded-3xl p-2 sm:p-6 mb-2 sm:mb-6 shadow-md border border-[var(--border)]">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4 mb-1.5 sm:mb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-[var(--error)] text-white animate-pulse">
                <Flame className="w-3 h-3" />
                LIVE
              </span>
              <span className="text-xs text-[var(--color-muted)] font-medium">
                {answeredCount} / {totalQ} {t('contest.answered')}
              </span>
            </div>
            <h1 className="text-sm sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)] line-clamp-2 leading-tight">
              {contest.title}
            </h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">

            
            {endTime && (
              <ContestCountdown
                targetDate={endTime}
                compact
                urgent
                onExpire={handleSubmit}
              />
            )}
          </div>
        </div>

        <LazyQuizQuestionProgress
          total={totalQ}
          currentIndex={currentIndex}
          answeredIds={new Set(Object.keys(answers))}
          questionIds={questions.map((q) => q._id)}
          onSelect={setCurrentIndex}
        />
      </div>

      <main className="w-full flex-1 flex flex-col min-h-0 overflow-y-auto pb-2">

        {/* Current Question Card */}
        {currentQ && (
          <QuizQuestionCard
            currentQuestionIndex={currentIndex}
            currentQ={currentQ as unknown as Question}
            answers={answers}
            handleAnswer={handleSelectOption}
            headerSlot={
              <>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                  {t('quiz.question')} {currentIndex + 1} of {totalQ}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-[var(--primary-light)] text-[var(--primary)]">
                    +{currentQ.points || 1}{' '}
                    {currentQ.points === 1 ? t('contest.point') : t('contest.points')}
                  </span>
                  {(currentQ.negativePoints !== undefined
                    ? currentQ.negativePoints > 0
                    : Boolean(contest?.enableNegativeMarking)) && (
                    <span
                      className="px-2 py-0.5 rounded text-xs font-bold bg-[var(--error-light)] text-[var(--error)]"
                      title={t('contest.negativeMarksHint')}
                    >
                      -{currentQ.negativePoints ?? contest?.negativeMarks ?? 0.25}
                    </span>
                  )}
                </div>
              </>
            }
          />
        )}
      </main>

      {/* Navigation */}
      <QuizNavigation
        currentQuestion={currentIndex}
        totalQuestions={totalQ}
        setCurrentQuestion={setCurrentIndex}
        handleSubmit={() => setShowSubmitModal(true)}
        isSubmitting={isSubmitting}
        t={t}
      />

      {/* Submit Confirmation Modal */}
      <LazyConfirmModal
        isOpen={showSubmitModal}
        title={t('contest.confirmSubmitTitle')}
        message={
          t('contest.confirmSubmitDesc') ||
          `You have answered ${answeredCount} out of ${totalQ} questions. Are you sure you want to submit?`
        }
        confirmText={t('contest.submitNow')}
        cancelText={t('common.cancel')}
        onConfirm={() => {
          setShowSubmitModal(false);
          handleSubmit();
        }}
        onCancel={() => setShowSubmitModal(false)}
        type="info"
      />

      {/* Security Violation Modal */}
      {showViolationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="p-6 rounded-3xl bg-[var(--card-solid)] border border-[var(--warning)]/50 shadow-2xl max-w-sm w-full text-center flex flex-col items-center gap-3">
            <div className="p-3 rounded-full bg-[var(--warning-light)] text-[var(--warning)]">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-[var(--color-foreground)]">
              {t('quiz.securityViolationTitle')}
            </h3>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              {violationMessage}
            </p>
            <span className="text-[11px] text-[var(--warning-foreground)] font-semibold">
              {t('contest.violations')}: {violationRetryCount + 1} / 3
            </span>
            <button
              type="button"
              onClick={handleViolationContinue}
              className="mt-2 w-full py-2.5 rounded-xl bg-[var(--primary)] text-white font-bold text-xs shadow-xs hover:opacity-90 transition-opacity"
            >
              {t('quiz.violationContinue')}
            </button>
          </div>
        </div>
      )}

      {!isOnline && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-amber-500 text-white rounded-full shadow-lg text-xs font-bold flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          Offline mode: answers preserved locally
        </div>
      )}
    </div>
  );
}
