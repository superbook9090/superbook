'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Swords, Sparkles, User, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';
import { ChallengeQuestionView } from './ChallengeQuestionView';
import { ChallengeResultView } from './ChallengeResultView';
import type { PublicChallengeData, ChallengeSubmissionResult } from '../types';

interface ChallengeArenaClientProps {
  challenge: PublicChallengeData;
}

export function ChallengeArenaClient({ challenge }: ChallengeArenaClientProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<'intro' | 'playing' | 'submitting' | 'result'>('intro');
  const [guestName, setGuestName] = useState('');
  const [guestSessionId, setGuestSessionId] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [submissionResult, setSubmissionResult] = useState<ChallengeSubmissionResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize guest session ID and prefill stored name
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('quizdo_guest_name') || '';
      if (storedName) setGuestName(storedName);

      let sid = sessionStorage.getItem('quizdo_guest_sid');
      if (!sid) {
        sid = `gs_${Math.random().toString(36).substring(2, 10)}`;
        sessionStorage.setItem('quizdo_guest_sid', sid);
      }
      setGuestSessionId(sid);
    }
  }, []);

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

  const handleStart = () => {
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
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg card-surface rounded-3xl border border-[var(--color-border)] shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center"
        >
          {/* Arena Badge */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-xl shadow-orange-500/25 mb-4">
            <Swords className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('challenge.title')}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-[var(--color-foreground)] leading-tight">
            {t('challenge.canYouBeat', { name: challenge.challenger.name || 'Quizdo Scholar' })}
          </h1>

          <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] mt-2">
            {t('challenge.theyScored', {
              score: String(challenge.targetScore),
              correct: String(challenge.correctCount),
              total: String(challenge.totalQuestions),
            })}
          </p>

          <div className="w-full my-4 p-3.5 rounded-2xl bg-[var(--color-muted)]/15 border border-[var(--color-border)] text-center">
            <span className="text-sm sm:text-base font-bold text-[var(--color-foreground)] line-clamp-2">
              {challenge.quiz.title}
            </span>
          </div>

          {/* Name Input */}
          <div className="w-full flex flex-col gap-1.5 text-left mb-5">
            <label className="text-xs font-semibold text-[var(--color-foreground)] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[var(--color-muted-foreground)]" />
              {t('challenge.yourNickname')}
            </label>
            <input
              type="text"
              placeholder={t('challenge.nicknamePlaceholder')}
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              maxLength={40}
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-sm text-[var(--color-foreground)] focus:border-indigo-500 outline-none transition-colors"
            />
          </div>

          <Button
            variant="primary"
            onClick={handleStart}
            className="w-full py-3.5 px-6 text-sm font-bold rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white border-0 shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
          >
            <span>{t('challenge.acceptChallenge')}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-4 text-[11px] text-[var(--color-muted-foreground)] mt-4">
            <span>{t('challenge.noSignupRequired')}</span>
            <span>·</span>
            <span>{t('challenge.questionsCount', { count: String(challenge.totalQuestions) })}</span>
          </div>
        </motion.div>
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
