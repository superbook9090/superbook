// src/app/(dashboard)/dashboard/student/quizzes/take/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { useQuiz } from '@/contexts/QuizContext';
import { useSubmitQuizAttempt } from '@/lib/react-query/hooks';
import { useQuizSecurity } from '@/hooks/useQuizSecurity';
import Alert from '@/components/ui/Alert';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useSessionStore } from '@/store/useSessionStore';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Attempt {
  _id: string;
  quiz: {
    _id: string;
    title: string;
    timeLimit: number;
    questions: Question[];
  };
  status: string;
  startedAt: string;
  attemptNumber: number;
  violationCount: number;
}

export default function TakeQuizPage() {
  const session = useSessionStore((s) => s.session);
  const status = useSessionStore((s) => s.status);
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get('attemptId');
  const { t } = useTranslation();
  const { theme } = useRoleTheme();
  const submitQuizMutation = useSubmitQuizAttempt();

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [alertState, setAlertState] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);
  const [violationRetryCount, setViolationRetryCount] = useState(0);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const isSubmittingRef = useRef(false);
  const forceSubmitQuizRef = useRef<(() => Promise<void>) | null>(null);
  const { setQuizActive } = useQuiz();

  // Quiz security hook - violation handler
  const handleViolation = useCallback((reason: string) => {
    const reasonMap: Record<string, string> = {
      fullscreen_exit: 'You exited fullscreen mode',
      tab_switch: 'You switched tabs',
      window_blur: 'You switched windows',
      page_exit: 'You attempted to leave the page',
      duplicate_tab: 'Quiz is open in another tab',
      dev_tools: 'You opened developer tools',
    };
    setSecurityWarning(reasonMap[reason] || 'Security violation detected');
    setShowViolationModal(true);
  }, []);

  const quizSecurity = useQuizSecurity({
    onViolation: handleViolation,
    enabled: true,
  });

  // Force submit quiz on security violation
  const forceSubmitQuiz = useCallback(async () => {
    if (!attempt || isSubmittingRef.current) return;

    isSubmittingRef.current = true;

    try {
      // Format answers for API
      const formattedAnswers = Object.entries(answers).map(([questionIndex, selectedOption]) => ({
        questionIndex: parseInt(questionIndex),
        selectedOption,
      }));

      // Add unanswered questions as -1
      attempt.quiz.questions.forEach((_, index) => {
        if (!(index in answers)) {
          formattedAnswers.push({
            questionIndex: index,
            selectedOption: -1,
          });
        }
      });

      const timeTaken = attempt.quiz.timeLimit * 60 - timeRemaining;

      await submitQuizMutation.mutateAsync({
        quizId: attempt.quiz._id,
        action: 'submit',
        answers: formattedAnswers,
        timeTaken,
      });

      // Exit fullscreen, restore sidebar, and set quiz inactive after submission
      quizSecurity.stopQuiz();
      setQuizActive(false);

      router.push(`/dashboard/student/quizzes/${attempt._id}/result`);
    } catch (err) {
      console.error('Error force-submitting quiz:', err);
      setError('Failed to submit quiz due to security violation');
    }
  }, [attempt, answers, timeRemaining, router, submitQuizMutation, setQuizActive, quizSecurity]);

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
      setSecurityWarning('Please close developer tools before continuing');
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
  }, [violationRetryCount, forceSubmitQuiz, quizSecurity]);

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
      router.push('/login');
      return;
    }
    if (!attemptId) {
      router.push('/dashboard/student/quizzes');
      return;
    }

    fetchAttempt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]);

  // Timer
  useEffect(() => {
    if (timeRemaining <= 0 || !attempt) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Auto-submit when time runs out
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const fetchAttempt = async () => {
    try {
      const response = await fetch(`/api/quiz-attempts?attemptId=${attemptId}`);
      const data = await response.json();

      if (response.ok) {
        const foundAttempt = data.attempts?.[0];
        if (foundAttempt && foundAttempt.status === 'in_progress') {
          setAttempt(foundAttempt);

          // Calculate remaining time
          const elapsedSeconds = Math.floor(
            (Date.now() - new Date(foundAttempt.startedAt).getTime()) / 1000
          );
          const totalSeconds = foundAttempt.quiz.timeLimit * 60;
          const remaining = Math.max(0, totalSeconds - elapsedSeconds);
          setTimeRemaining(remaining);

          // Start fullscreen mode and set quiz active
          await quizSecurity.startQuiz();
          setQuizActive(true);
        } else if (foundAttempt && (foundAttempt.status === 'completed' || foundAttempt.status === 'force_submitted')) {
          // Attempt is completed, allow retry
          setAttempt(foundAttempt);
          setError('quiz_completed');
        } else {
          setError('Quiz attempt not found');
        }
      } else {
        setError(data.message || 'Failed to load quiz');
      }
    } catch {
      setError('Error loading quiz');
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
      // Call API to start new attempt
      const response = await fetch('/api/quiz-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: attempt.quiz._id,
          action: 'start',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Navigate to new attempt
        router.push(`/dashboard/student/quizzes/take?attemptId=${data.attempt._id}`);
      } else {
        setError(data.message || 'Failed to start new attempt');
        setIsLoading(false);
      }
    } catch {
      setError('Error starting new attempt');
      setIsLoading(false);
    }
  };

  const handleAnswer = (questionIndex: number, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (!attempt) return;

    if (!autoSubmit) {
      setShowSubmitModal(true);
      return;
    }

    // Format answers for API
    const formattedAnswers = Object.entries(answers).map(([questionIndex, selectedOption]) => ({
      questionIndex: parseInt(questionIndex),
      selectedOption,
    }));

    // Add unanswered questions as -1
    attempt.quiz.questions.forEach((_, index) => {
      if (!(index in answers)) {
        formattedAnswers.push({
          questionIndex: index,
          selectedOption: -1,
        });
      }
    });

    const timeTaken = attempt.quiz.timeLimit * 60 - timeRemaining;

    try {
      const data = await submitQuizMutation.mutateAsync({
        quizId: attempt.quiz._id,
        action: 'submit',
        answers: formattedAnswers,
        timeTaken,
      });

      // Exit fullscreen, restore sidebar, and set quiz inactive
      quizSecurity.stopQuiz();
      setQuizActive(false);

      router.push(`/dashboard/student/quizzes/${data.attempt._id}/result`);
    } catch {
      const errorMsg = 'Error submitting quiz';
      setError(errorMsg);
      setAlertState({ type: 'error', message: errorMsg });
    }
  }, [attempt, answers, timeRemaining, router, submitQuizMutation, quizSecurity, setQuizActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (status === 'loading' || isLoading) {
    return <div className="text-center py-8">Loading quiz...</div>;
  }

  if (error || !attempt) {
    return (
      <div className="text-center py-8">
        {alertState && (
          <Alert
            type={alertState.type}
            message={alertState.message}
            onClose={() => setAlertState(null)}
          />
        )}
        {error === 'quiz_completed' ? (
          <>
            <p className="text-[var(--color-muted-foreground)] mb-4">You have already completed this quiz.</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleRetry}
                className={`min-h-[44px] px-4 py-3 sm:px-4 sm:py-2 bg-gradient-to-r ${theme.gradient} text-white rounded-md`}
              >
                Retry Quiz
              </button>
              <button
                onClick={() => router.push('/dashboard/student/quizzes')}
                className="min-h-[44px] px-4 py-3 sm:px-4 sm:py-2 bg-[var(--color-muted)] text-[var(--color-foreground)] rounded-md hover:bg-[var(--color-muted)]/80"
              >
                Back to Quizzes
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-[var(--error)] mb-4">{error || 'Quiz not found'}</p>
            <button
              onClick={() => router.push('/dashboard/student/quizzes')}
              className={`min-h-[44px] px-4 py-3 sm:px-4 sm:py-2 bg-gradient-to-r ${theme.gradient} text-white rounded-md`}
            >
              Back to Quizzes
            </button>
          </>
        )}
      </div>
    );
  }

  const questions = attempt.quiz.questions || [];
  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-4xl mx-auto">
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
      <div className="bg-[var(--card-solid)] rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)]">{attempt.quiz.title}</h1>
            <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] mt-1">
              {t('quiz.question')} {currentQuestion + 1} {t('quiz.of')} {questions.length}
            </p>
          </div>
          <div className={`text-right ${timeRemaining < 60 ? 'text-[var(--error)]' : 'text-[var(--color-foreground)]'}`}>
            <p className="text-sm text-[var(--color-muted-foreground)]">{t('quiz.timeRemaining')}</p>
            <p className="text-2xl font-bold font-mono">{formatTime(timeRemaining)}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="w-full bg-[var(--color-muted)] rounded-full h-2">
            <div
              className={`bg-gradient-to-r ${theme.gradient} h-2 rounded-full transition-all`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-[var(--color-muted-foreground)] mt-1">
            <span>{answeredCount} {t('quiz.answered')}</span>
            <span>{questions.length - answeredCount} {t('quiz.remaining')}</span>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-[var(--card-solid)] rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-medium text-[var(--color-foreground)] mb-4">
          {questions[currentQuestion].question}
        </h3>

        <div className="space-y-3">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(currentQuestion, index)}
              className={`w-full text-left p-4 min-h-[44px] rounded-lg border-2 transition-all ${
                answers[currentQuestion] === index
                  ? 'border-[var(--student-primary)] bg-[var(--student-primary)]/10'
                  : 'border-[var(--border)] hover:border-[var(--student-primary)]/50'
              }`}
            >
              <div className="flex items-center">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-3 ${
                    answers[currentQuestion] === index
                      ? `bg-gradient-to-r ${theme.gradient} text-white`
                      : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)]'
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-[var(--color-foreground)]">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
          className="min-h-[44px] sm:min-h-0 px-4 py-3 sm:px-4 sm:py-2 border border-[var(--border)] rounded-md text-[var(--color-foreground)] hover:bg-[var(--color-muted)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('common.previous')}
        </button>

        {/* Question dots */}
        <div className="flex space-x-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-3 h-3 rounded-full ${
                index === currentQuestion
                  ? `bg-gradient-to-r ${theme.gradient}`
                  : answers[index] !== undefined
                  ? 'bg-[var(--success)]'
                  : 'bg-[var(--color-muted)]'
              }`}
            />
          ))}
        </div>

        {currentQuestion < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQuestion((prev) => Math.min(questions.length - 1, prev + 1))}
            className={`min-h-[44px] sm:min-h-0 px-4 py-3 sm:px-4 sm:py-2 bg-gradient-to-r ${theme.gradient} text-white rounded-md hover:opacity-90`}
          >
            {t('common.next')}
          </button>
        ) : (
          <button
            onClick={() => handleSubmit()}
            disabled={submitQuizMutation.isPending}
            className={`min-h-[44px] sm:min-h-0 px-6 py-3 sm:px-6 sm:py-2 bg-gradient-to-r ${theme.gradient} text-white rounded-md hover:opacity-90 disabled:opacity-50`}
          >
            {submitQuizMutation.isPending ? t('quiz.submitting') : t('quiz.submit')}
          </button>
        )}
      </div>

      {alertState && (
        <Alert
          type={alertState.type}
          message={alertState.message}
          onClose={() => setAlertState(null)}
        />
      )}

      {/* Warning if time is low */}
      {timeRemaining < 300 && (
        <div className="mt-4 bg-[var(--error-light)] border-l-4 border-[var(--error)] p-4">
          <p className="text-sm text-[var(--error)]">
            {t('quiz.autoSubmitWarning')}
          </p>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      <ConfirmModal
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
      <ConfirmModal
        isOpen={showViolationModal}
        title="Security Violation"
        message={`${securityWarning}. You have ${3 - violationRetryCount - 1} ${3 - violationRetryCount - 1 === 0 ? 'retry' : 'retries'} remaining. Click Continue to re-enter.`}
        onConfirm={handleViolationContinue}
        // onCancel={() => setShowViolationModal(false)}
        confirmText="Continue"
        // cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
