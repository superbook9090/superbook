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

export default function TakeContestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useTranslation();
  const router = useRouter();
  const { addAlert } = useAlert();
  const { setQuizActive } = useQuiz();

  const [contest, setContest] = useState<ContestItem | null>(null);
  const [questions, setQuestions] = useState<ContestQuestionItem[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
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

  // Map security reason to localized message
  const getSecurityReasonMessage = useCallback(
    (reason: string) => {
      switch (reason) {
        case 'fullscreen_exit':
          return t('quiz.violationFullscreenExit') || 'You exited fullscreen mode.';
        case 'tab_switch':
          return t('quiz.violationTabSwitch') || 'Switching tabs or minimizing the browser is not allowed.';
        case 'window_blur':
          return t('quiz.violationWindowBlur') || 'Leaving the contest window is not allowed.';
        case 'page_exit':
          return t('quiz.violationPageExit') || 'Attempting to leave or refresh the page.';
        case 'dev_tools':
          return t('quiz.violationDevTools') || 'Developer tools are strictly disabled during contests.';
        case 'duplicate_tab':
          return t('quiz.violationDuplicateTab') || 'Contest is open in another tab.';
        default:
          return t('quiz.violationGeneric') || 'Security violation detected.';
      }
    },
    [t]
  );

  // Security violation handler
  const handleViolation = useCallback(
    (reason: string) => {
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

  // Submit Attempt
  const handleSubmit = useCallback(async () => {
    if (isSubmittingRef.current || !attemptId) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const formattedAnswers = questions.map((q) => ({
        quizId: q.quizId,
        questionId: q._id,
        selectedOption: answers[q._id] !== undefined ? answers[q._id] : -1,
      }));

      await submitContestAttempt(id, {
        answers: formattedAnswers,
        violationCount: violationCountRef.current,
      });

      stopQuizRef.current();
      setQuizActive(false);

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
  }, [id, attemptId, questions, answers, router, addAlert, setQuizActive]);

  // Handle violation continue / re-enter fullscreen
  const handleViolationContinue = useCallback(async () => {
    // Check if dev tools is still open via window size delta
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    const isDevToolsOpen = widthDiff > 160 || heightDiff > 160;

    if (isDevToolsOpen) {
      setViolationMessage(
        t('quiz.violationDevTools') ||
          'Developer tools detected. Please close developer tools to continue.'
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

        setAttemptId(res.attempt._id);
        setQuestions(res.questions);
        setEndTime(new Date(Date.now() + res.timeRemaining * 1000));

        // Enter fullscreen mode and lock dev tools
        await startQuizRef.current();
        setQuizActive(true);
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof ApiClientError ? err.message : 'Failed to start contest attempt';
        addAlert({ type: 'error', message: msg });
        router.push(`/dashboard/student/contests/${id}/result`);
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

  // Handle Answer Selection
  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
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
            {answeredCount} / {totalQ} {t('contest.answered') || 'Answered'}
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
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--student-primary)] text-white shadow-xs hover:shadow-md transition-all shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Submitting...' : t('contest.submitContest') || 'Submit'}</span>
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
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--card-solid)] border border-[var(--border)] shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                {currentQ.quizTitle ? `${currentQ.quizTitle} • ` : ''}
                {t('quiz.question')} {currentIndex + 1} of {totalQ}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-[var(--primary-light)] text-[var(--primary)]">
                +{currentQ.points || 1}{' '}
                {currentQ.points === 1
                  ? t('contest.point') || 'Point'
                  : t('contest.points') || 'Points'}
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-[var(--color-foreground)] leading-relaxed">
              {currentQ.question}
            </h2>

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
                <span>{t('common.previous') || 'Previous'}</span>
              </button>

              {currentIndex < totalQ - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.min(totalQ - 1, prev + 1))}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-[var(--primary)] text-white hover:opacity-90 transition-opacity shadow-xs"
                >
                  <span>{t('common.next') || 'Next'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(true)}
                  className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--student-primary)] text-white shadow-xs hover:shadow-md transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>{t('contest.finishAndSubmit') || 'Finish & Submit'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Submit Confirmation Modal */}
      <LazyConfirmModal
        isOpen={showSubmitModal}
        title={t('contest.confirmSubmitTitle') || 'Submit Contest?'}
        message={
          t('contest.confirmSubmitDesc') ||
          `You have answered ${answeredCount} out of ${totalQ} questions. Are you sure you want to submit?`
        }
        confirmText={t('contest.submitNow') || 'Submit Contest'}
        cancelText={t('common.cancel') || 'Cancel'}
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
              {t('quiz.securityViolationTitle') || 'Security Violation'}
            </h3>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              {violationMessage}
            </p>
            <span className="text-[11px] text-[var(--warning-foreground)] font-semibold">
              {t('contest.violations') || 'Violations'}: {violationCountRef.current} / 3
            </span>
            <button
              type="button"
              onClick={handleViolationContinue}
              className="mt-2 w-full py-2.5 rounded-xl bg-[var(--primary)] text-white font-bold text-xs shadow-xs hover:opacity-90 transition-opacity"
            >
              {t('quiz.violationContinue') || 'Continue'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
