'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { ChallengeIntroCard } from './ChallengeIntroCard';
import { ChallengeQuestionView } from './ChallengeQuestionView';
import { ChallengeResultView } from './ChallengeResultView';
import type { PublicChallengeData, ChallengeSubmissionResult } from '../types';

interface ChallengeArenaClientProps {
  challenge: PublicChallengeData;
  initialResult?: ChallengeSubmissionResult | null;
  initialGuestName?: string;
}

export function ChallengeArenaClient({
  challenge,
  initialResult,
  initialGuestName,
}: ChallengeArenaClientProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const session = useSessionStore((s) => s.session);

  const [step, setStep] = useState<'intro' | 'playing' | 'submitting' | 'result'>(
    initialResult ? 'result' : 'intro'
  );
  const [guestName, setGuestName] = useState(initialGuestName || '');
  const [guestSessionId, setGuestSessionId] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [submissionResult, setSubmissionResult] = useState<ChallengeSubmissionResult | null>(
    initialResult || null
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize guest session ID and prefill stored name
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('quizdo_guest_name') || '';
      if (storedName && !guestName) setGuestName(storedName);

      let sid = sessionStorage.getItem('quizdo_guest_sid');
      if (!sid) {
        sid = `gs_${Math.random().toString(36).substring(2, 10)}`;
        sessionStorage.setItem('quizdo_guest_sid', sid);
      }
      setGuestSessionId(sid);
    }
  }, [guestName]);

  // Timer runner
  useEffect(() => {
    if (step === 'playing') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  const handleStart = async () => {
    if (session?.user) {
      setIsStarting(true);
      setStartError(null);
      try {
        const res = await fetch(`/api/challenges/${encodeURIComponent(challenge.slug)}/start`, {
          method: 'POST',
        });
        const data = await res.json();
        if (data.success && data.attemptId) {
          router.push(
            `/dashboard/student/quizzes/take?attemptId=${encodeURIComponent(data.attemptId)}&challengeSlug=${encodeURIComponent(challenge.slug)}`
          );
          return;
        } else {
          setStartError(data.message || t('challenge.failedToStart') || 'Failed to start challenge');
          setIsStarting(false);
        }
      } catch {
        setStartError(t('challenge.networkError'));
        setIsStarting(false);
      }
      return;
    }

    const finalName = guestName.trim() || 'Challenger Guest';
    if (typeof window !== 'undefined') {
      localStorage.setItem('quizdo_guest_name', finalName);
    }
    setStep('playing');
  };

  const handleSelectOption = (optionIndex: number) => {
    const currentQ = challenge.questions[currentIndex];
    if (!currentQ) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: optionIndex }));
  };

  const handleSubmit = async () => {
    setStep('submitting');
    setSubmitError(null);

    const submissionPayload = {
      guestName: guestName.trim() || 'Challenger Guest',
      guestSessionId: guestSessionId || `gs_${Math.random().toString(36).substring(2, 10)}`,
      timeTaken: elapsedSeconds,
      answers: challenge.questions.map((q, idx) => ({
        questionId: q.id,
        order: idx,
        selectedOption: answers[q.id] ?? -1,
      })),
    };

    try {
      const res = await fetch(`/api/challenges/${challenge.slug}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionPayload),
      });
      const data = await res.json();

      if (data.success && data.result) {
        setSubmissionResult(data.result);
        setStep('result');
      } else {
        setSubmitError(data.message || t('challenge.failedToSubmit'));
        setStep('playing');
      }
    } catch {
      setSubmitError(t('challenge.networkError'));
      setStep('playing');
    }
  };

  const currentQ = challenge.questions[currentIndex];
  const isLastQuestion = currentIndex === challenge.questions.length - 1;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 flex flex-col justify-center items-center">
      {step === 'intro' && (
        <ChallengeIntroCard
          challenge={challenge}
          guestName={guestName}
          setGuestName={setGuestName}
          onAccept={handleStart}
          isStarting={isStarting}
          startError={startError}
        />
      )}

      {step === 'playing' && currentQ && (
        <>
          {submitError && (
            <div className="w-full max-w-2xl mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}
          <ChallengeQuestionView
            question={currentQ}
            currentIndex={currentIndex}
            totalQuestions={challenge.questions.length}
            selectedOption={answers[currentQ.id] ?? -1}
            onSelectOption={handleSelectOption}
            onNext={() => (isLastQuestion ? handleSubmit() : setCurrentIndex((i) => i + 1))}
            onPrev={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            elapsedSeconds={elapsedSeconds}
            isLastQuestion={isLastQuestion}
          />
        </>
      )}

      {step === 'submitting' && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
          <h3 className="font-bold text-base text-[var(--color-foreground)]">
            {t('challenge.gradingResults')}
          </h3>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            {t('challenge.comparingAnswers', { name: challenge.challenger.name })}
          </p>
        </div>
      )}

      {step === 'result' && submissionResult && (
        <ChallengeResultView
          challenge={challenge}
          result={submissionResult}
          guestName={guestName || t('challenge.youGuest')}
        />
      )}
    </div>
  );
}
