'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { CheckCircle2, XCircle, Share2, Sparkles, UserPlus } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useSessionStore } from '@/store/useSessionStore';
import { useTranslation } from '@/hooks/useTranslation';
import { ScorecardCanvasModal } from '@/features/quizzes/components/ScorecardCanvasModal';
import type { ChallengeSubmissionResult, PublicChallengeData } from '../types';

interface ChallengeResultViewProps {
  challenge: PublicChallengeData;
  result: ChallengeSubmissionResult;
  guestName: string;
}

export function ChallengeResultView({ challenge, result, guestName }: ChallengeResultViewProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const session = useSessionStore((s) => s.session);
  const [isScorecardOpen, setIsScorecardOpen] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const challengerName = challenge.challenger.name || 'Quizdo Scholar';
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const handleClaimAccount = (provider?: 'google') => {
    if (typeof window !== 'undefined') localStorage.setItem('quizdo_claim_token', result.claimToken);
    if (provider === 'google') signIn('google', { callbackUrl: '/dashboard/student' });
    else router.push(`/register?claimToken=${result.claimToken}`);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto pb-12">
      {/* 1. Hero Outcome Banner */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 text-center border shadow-xl ${
          result.isWon
            ? 'border-emerald-500/30 bg-gradient-to-b from-emerald-950/40 via-[var(--color-surface)] to-[var(--color-surface)]'
            : result.isDraw
            ? 'border-amber-500/30 bg-gradient-to-b from-amber-950/40 via-[var(--color-surface)] to-[var(--color-surface)]'
            : 'border-rose-500/30 bg-gradient-to-b from-rose-950/40 via-[var(--color-surface)] to-[var(--color-surface)]'
        }`}
      >
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center text-3xl shadow-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
          {result.isWon ? '🏆' : result.isDraw ? '🤝' : '⚔️'}
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-[var(--color-foreground)]">
          {result.isWon
            ? t('challenge.victory', { name: challengerName })
            : result.isDraw
            ? t('challenge.draw')
            : t('challenge.defeat', { name: challengerName })}
        </h1>

        <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] mt-1.5 max-w-md mx-auto">
          {result.isWon
            ? t('challenge.victoryDesc', { score: String(result.score), targetScore: String(result.targetScore) })
            : result.isDraw
            ? t('challenge.drawDesc', { score: String(result.score) })
            : t('challenge.defeatDesc', { score: String(result.score), name: challengerName, targetScore: String(result.targetScore) })}
        </p>
      </div>

      {/* 2. Head-to-Head Comparison Card */}
      <div className="card-surface p-5 sm:p-6 rounded-2xl border border-[var(--color-border)] shadow-md">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] mb-4 text-center">
          {t('challenge.headToHead')}
        </h3>

        <div className="grid grid-cols-2 gap-4 divide-x divide-[var(--color-border)]">
          {/* You */}
          <div className="flex flex-col items-center text-center pr-2">
            <span className="text-xs font-semibold text-[var(--color-primary)]">
              {guestName || t('challenge.youGuest')}
            </span>
            <span className="text-3xl sm:text-4xl font-black text-[var(--color-foreground)] mt-1">
              {result.score}%
            </span>
            <div className="flex flex-col gap-0.5 text-[11px] text-[var(--color-muted-foreground)] mt-2">
              <span>{t('challenge.correctCountDesc', { correct: String(result.correctCount), total: String(result.totalQuestions) })}</span>
              <span>⏱️ {formatTime(result.timeTaken)}</span>
            </div>
          </div>

          {/* Challenger */}
          <div className="flex flex-col items-center text-center pl-2">
            <span className="text-xs font-semibold text-amber-500">
              {challengerName}
            </span>
            <span className="text-3xl sm:text-4xl font-black text-[var(--color-foreground)] mt-1">
              {result.targetScore}%
            </span>
            <div className="flex flex-col gap-0.5 text-[11px] text-[var(--color-muted-foreground)] mt-2">
              <span>{t('challenge.correctCountDesc', { correct: String(result.challengerCorrectCount), total: String(result.totalQuestions) })}</span>
              <span>⏱️ {formatTime(result.challengerTimeTaken)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Soft-Wall Conversion / Signup Card */}
      {!session?.user && (
        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-5 sm:p-6 shadow-lg">
          <div className="flex items-start gap-3.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--color-foreground)]">
                {t('challenge.saveScoreClaim')}
              </h3>
              <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                {t('challenge.saveScoreClaimDesc')}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <Button
              variant="primary"
              onClick={() => handleClaimAccount('google')}
              className="flex-1 py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-xl bg-white hover:bg-gray-100 text-gray-900 border-0 flex items-center justify-center gap-2 shadow-sm"
            >
              <span>{t('challenge.continueWithGoogle')}</span>
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleClaimAccount()}
              className="flex-1 py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t('challenge.createAccount')}</span>
            </Button>
          </div>
        </div>
      )}

      {/* 4. Action Buttons: Scorecard & Review */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="secondary"
          onClick={() => setIsScorecardOpen(true)}
          className="flex-1 py-3 px-4 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4 text-indigo-400" />
          <span>{t('challenge.bragSocial')}</span>
        </Button>

        <Button
          variant="secondary"
          onClick={() => setShowReview(!showReview)}
          className="flex-1 py-3 px-4 text-xs sm:text-sm font-semibold rounded-xl"
        >
          {showReview ? t('challenge.hideReview') : t('challenge.reviewQuestions')}
        </Button>
      </div>

      {session?.user && challenge.quiz?.id && (
        <Button
          variant="outline"
          onClick={() =>
            router.push(
              `/dashboard/student/quizzes/${challenge.quiz.id}/result?attemptId=${encodeURIComponent(result.attemptId)}`
            )
          }
          className="w-full py-3 px-4 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2"
        >
          <span>{t('challenge.viewFullAnalysis')}</span>
        </Button>
      )}

      {/* 5. Question Review Accordion */}
      {showReview && (
        <div className="flex flex-col gap-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-foreground)]">
            {t('challenge.reviewBreakdown')}
          </h4>
          {challenge.questions.map((q, idx) => {
            const graded = result.answers.find((a) => a.questionId === q.id);
            const isCorrect = graded?.isCorrect ?? false;
            const selectedOpt = graded?.selectedOption ?? -1;
            const correctOpt = graded?.correctOption ?? -1;

            return (
              <div
                key={q.id}
                className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs flex flex-col gap-2"
              >
                <div className="flex items-start gap-2">
                  {isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <span className="font-semibold text-[var(--color-foreground)] leading-normal">
                    {t('challenge.questionPromptNumber', { number: String(idx + 1), prompt: q.prompt })}
                  </span>
                </div>

                <div className="pl-6 flex flex-col gap-1 text-[11px]">
                  <p className={isCorrect ? 'text-emerald-400' : 'text-rose-400'}>
                    {t('challenge.yourChoice')}{' '}
                    <span className="font-semibold">
                      {selectedOpt >= 0 && q.options[selectedOpt]
                        ? q.options[selectedOpt]
                        : t('challenge.skipped')}
                    </span>
                  </p>
                  {!isCorrect && correctOpt >= 0 && (
                    <p className="text-emerald-400">
                      {t('challenge.correctAnswer')} <span className="font-semibold">{q.options[correctOpt]}</span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Scorecard Modal for Guest */}
      <ScorecardCanvasModal
        isOpen={isScorecardOpen}
        onClose={() => setIsScorecardOpen(false)}
        data={{
          studentName: guestName || 'Quizdo Challenger',
          quizTitle: challenge.quiz.title,
          score: result.score,
          correctCount: result.correctCount,
          totalQuestions: result.totalQuestions,
          timeTaken: result.timeTaken,
          shareUrl: typeof window !== 'undefined' ? window.location.href : 'https://quizdo.in',
        }}
      />
    </div>
  );
}
