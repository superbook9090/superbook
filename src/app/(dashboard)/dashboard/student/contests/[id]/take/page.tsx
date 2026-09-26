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
import { LazyConfirmModal } from '@/lib/lazy';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Send,
  Flame,
  ShieldAlert,
  Maximize2,
} from 'lucide-react';
import { ApiClientError } from '@/lib/api/http';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { haptics } from '@/lib/native/haptics';
import { playOptionSelectSound, playSuccessChime, playViolationWarningSound } from '@/lib/native/soundEffects';
import { SpeechReadButton } from '@/components/ui/SpeechReadButton';
import {
  saveLocalAttemptAnswers,
  loadLocalAttemptAnswers,
  clearLocalAttemptAnswers,
} from '@/lib/native/offlineStorage';

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
  const violationCountRef = useRef(0);
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
      violationCountRef.current += 1;
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
        violationCount: violationCountRef.current,
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
  }, [id, questions, answers, router, addAlert, setQuizActive]);

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
        t('quiz.violationDevTools')
      );
      return;
    }

    setShowViolationModal(false);
    quizSecurity.resetDevToolsDetection();

    // If student accumulated 3 or more violations, force submit the contest attempt
    if (violationCountRef.current >= 3) {
      addAlert({
        type: 'error',
        message: 'Maximum anti-cheat violations reached. Submitting contest attempt now.',
      });
      await handleSubmit();
      return;
    }

    // Re-enter fullscreen and activate security
    await startQuizRef.current();
  }, [quizSecurity, handleSubmit, addAlert, t]);

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
    <div className="min-h-screen bg-[var(--background)] flex flex-col pb-16">
      {/* Top Fixed Sticky Header */}
      <header className="sticky top-0 z-40 bg-[var(--card-solid)]/95 backdrop-blur-md border-b border-[var(--border)] shadow-xs px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-[var(--error)] text-white animate-pulse">
              <Flame className="w-3 h-3" />
              LIVE
            </span>
            <h1 className="text-sm sm:text-base font-bold text-[var(--color-foreground)] truncate max-w-[200px] sm:max-w-md">
              {contest.title}
            </h1>
          </div>
          <span className="text-xs text-[var(--color-muted)] font-medium">
            {answeredCount} / {totalQ} {t('contest.answered')}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {endTime && (
            <ContestCountdown
              targetDate={endTime}
              compact
              urgent
              onExpire={handleSubmit}
            />
          )}

          {!quizSecurity.state.isFullscreen && (
            <button
              type="button"
              onClick={() => quizSecurity.startQuiz()}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-muted-strong)] text-[var(--color-foreground)] border border-[var(--border)] shadow-xs transition-colors shrink-0"
              title="Enter Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Fullscreen</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            disabled={isSubmitting}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--student-primary)] text-white shadow-xs hover:shadow-md transition-all shrink-0 ${
              isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? (t('common.loading')) : (t('contest.submitContest'))}</span>
          </button>
        </div>
      </header>

      {/* Main Examination View */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 pt-6 flex-1 flex flex-col gap-6">
        {/* Question Stepper / Palette */}
        <div className="p-3 rounded-2xl bg-[var(--card-solid)] border border-[var(--border)] shadow-xs flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {questions.map((q, idx) => {
            const isAnswered = answers[q._id] !== undefined;
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={q._id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`w-8 h-8 rounded-xl font-mono text-xs font-bold transition-all shrink-0 flex items-center justify-center ${
                  isCurrent
                    ? 'bg-[var(--primary)] text-white ring-2 ring-[var(--primary)]/40 shadow-xs'
                    : isAnswered
                    ? 'bg-[var(--success-light)] text-[var(--success)] border border-[var(--success)]/40'
                    : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-muted-strong)]'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Current Question Card */}
        {currentQ && (
          <div className="p-4 sm:p-6 md:p-8 rounded-3xl bg-[var(--card-solid)] border border-[var(--border)] shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                {currentQ.quizTitle ? `${currentQ.quizTitle} • ` : ''}
                {t('quiz.question')} {currentIndex + 1} of {totalQ}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-[var(--primary-light)] text-[var(--primary)]">
                  +{currentQ.points || 1}{' '}
                  {currentQ.points === 1
                    ? t('contest.point')
                    : t('contest.points')}
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
            </div>

            <div className="flex items-start justify-between gap-3">
              <h2 className="text-base sm:text-lg font-bold text-[var(--color-foreground)] leading-relaxed">
                {currentQ.question}
              </h2>
              <SpeechReadButton
                text={`${currentQ.question}. ${(currentQ.options || []).map((o, idx) => `Option ${String.fromCharCode(65 + idx)}: ${o}`).join('. ')}`}
              />
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {currentQ.options.map((optionText, optIndex) => {
                const isSelected = answers[currentQ._id] === optIndex;

                return (
                  <button
                    key={optIndex}
                    type="button"
                    onClick={() => handleSelectOption(currentQ._id, optIndex)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'bg-[var(--primary-light)]/60 border-[var(--primary)] text-[var(--color-foreground)] shadow-xs ring-1 ring-[var(--primary)]/30'
                        : 'bg-[var(--color-surface-muted)]/40 border-[var(--border)] text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)]'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[var(--primary)] text-white'
                          : 'bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-muted-foreground)]'
                      }`}
                    >
                      {String.fromCharCode(65 + optIndex)}
                    </span>
                    <span className="text-xs sm:text-sm font-medium flex-1">{optionText}</span>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-[var(--primary)] shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Bottom Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[var(--color-surface-muted)] text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted-strong)] disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t('common.previous')}</span>
              </button>

              {currentIndex < totalQ - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.min(totalQ - 1, prev + 1))}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-[var(--primary)] text-white hover:opacity-90 transition-opacity shadow-xs"
                >
                  <span>{t('common.next')}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(true)}
                  className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--student-primary)] text-white shadow-xs hover:shadow-md transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>{t('contest.finishAndSubmit')}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </main>

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
              {t('contest.violations')}: {violationCountRef.current} / 3
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
