'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Share2, Sparkles, UserPlus, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useSessionStore } from '@/store/useSessionStore';
import { useTranslation } from '@/hooks/useTranslation';
import { ScorecardCanvasModal } from '@/features/quizzes/components/ScorecardCanvasModal';
import { ChallengeHeadToHeadCard } from './ChallengeHeadToHeadCard';
import { ChallengeReviewAccordion } from './ChallengeReviewAccordion';
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

  const challengerName = challenge.challenger.name || t('challenge.quizdoScholar');
  const opponentDisplayName = guestName || (session?.user?.name ? session.user.name : t('challenge.youGuest'));

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

  const getHeroSubtitle = () => {
    if (result.score === result.targetScore) {
      if (result.isWon) {
        const timeDiff = Math.max(1, result.challengerTimeTaken - result.timeTaken);
        return t('challenge.victoryTiebreakDesc', {
          score: String(result.score),
          timeDiff: formatTime(timeDiff),
        });
      }
      if (!result.isDraw) {
        const timeDiff = Math.max(1, result.timeTaken - result.challengerTimeTaken);
        return t('challenge.defeatTiebreakDesc', {
          score: String(result.score),
          name: challengerName,
          timeDiff: formatTime(timeDiff),
        });
      }
      return t('challenge.drawDesc', { score: String(result.score) });
    }

    if (result.isWon) {
      return t('challenge.victoryDesc', {
        score: String(result.score),
        targetScore: String(result.targetScore),
      });
    }

    return t('challenge.defeatDesc', {
      score: String(result.score),
      name: challengerName,
      targetScore: String(result.targetScore),
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto pb-12 px-2 sm:px-0">
      {/* 1. Hero Outcome Banner */}
      <div
        className={`relative overflow-hidden rounded-3xl p-4 sm:p-6 md:p-8 text-center border shadow-2xl transition-all ${
          result.isWon
            ? 'border-emerald-500/30 bg-gradient-to-b from-emerald-950/50 via-[var(--color-surface)] to-[var(--color-surface)]'
            : result.isDraw
            ? 'border-amber-500/30 bg-gradient-to-b from-amber-950/50 via-[var(--color-surface)] to-[var(--color-surface)]'
            : 'border-rose-500/30 bg-gradient-to-b from-rose-950/50 via-[var(--color-surface)] to-[var(--color-surface)]'
        }`}
      >
        <div
          className={`w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center text-3xl shadow-lg border ${
            result.isWon
              ? 'bg-emerald-500/20 border-emerald-500/40 shadow-emerald-500/20'
              : result.isDraw
              ? 'bg-amber-500/20 border-amber-500/40 shadow-amber-500/20'
              : 'bg-rose-500/20 border-rose-500/40 shadow-rose-500/20'
          }`}
        >
          {result.isWon ? '🏆' : result.isDraw ? '🤝' : '⚔️'}
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-[var(--color-foreground)] tracking-tight">
          {result.isWon
            ? t('challenge.victory', { name: challengerName })
            : result.isDraw
            ? t('challenge.draw')
            : t('challenge.defeat', { name: challengerName })}
        </h1>

        <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] mt-2 max-w-md mx-auto leading-relaxed">
          {getHeroSubtitle()}
        </p>
      </div>

      {/* 2. Head-to-Head Scoreboard */}
      <ChallengeHeadToHeadCard
        challengerName={challengerName}
        challengerImage={challenge.challenger.image}
        opponentName={opponentDisplayName}
        opponentImage={session?.user?.image}
        opponentScore={result.score}
        opponentCorrect={result.correctCount}
        opponentTotal={result.totalQuestions}
        opponentTime={result.timeTaken}
        challengerScore={result.targetScore}
        challengerCorrect={result.challengerCorrectCount}
        challengerTotal={challenge.totalQuestions}
        challengerTime={result.challengerTimeTaken}
        isWon={result.isWon}
        isDraw={result.isDraw}
        formatTime={formatTime}
      />

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

      {/* 4. Action Buttons */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="primary"
            onClick={() => setIsScorecardOpen(true)}
            className="flex-1 py-3 px-4 text-xs sm:text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-white border-0 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span>{t('challenge.bragSocial')}</span>
          </Button>

          <Button
            variant="secondary"
            onClick={() => setShowReview(!showReview)}
            className="flex-1 py-3 px-4 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2"
          >
            {showReview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span>{showReview ? t('challenge.hideReview') : t('challenge.reviewQuestions')}</span>
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
            className="w-full py-3.5 px-4 text-xs sm:text-sm font-bold rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-muted)]/10 text-[var(--color-foreground)] flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <span>{t('challenge.viewFullAnalysis')}</span>
            <ArrowRight className="w-4 h-4 text-indigo-400" />
          </Button>
        )}
      </div>

      {/* 5. Question Review Accordion */}
      {showReview && (
        <ChallengeReviewAccordion
          questions={challenge.questions}
          answers={result.answers}
        />
      )}

      {/* Share Scorecard Canvas Modal */}
      <ScorecardCanvasModal
        isOpen={isScorecardOpen}
        onClose={() => setIsScorecardOpen(false)}
        data={{
          studentName: opponentDisplayName,
          quizTitle: challenge.quiz.title,
          score: result.score,
          correctCount: result.correctCount,
          totalQuestions: result.totalQuestions,
          timeTaken: result.timeTaken,
          shareUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/challenge/${challenge.slug}`,
        }}
      />
    </div>
  );
}
