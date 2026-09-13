'use client';

import { useState, useEffect } from 'react';
import { Swords, Image as ImageIcon, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTranslation } from '@/hooks/useTranslation';
import { ChallengeModal } from './ChallengeModal';
import { ScorecardCanvasModal } from './ScorecardCanvasModal';

interface QuizChallengeBannerProps {
  quizAttemptId: string;
  quizTitle: string;
  studentName?: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeTaken: number;
  percentile?: number;
  rank?: number;
}

export function QuizChallengeBanner({
  quizAttemptId,
  quizTitle,
  studentName = 'Quizdo Scholar',
  score,
  correctCount,
  totalQuestions,
  timeTaken,
  percentile,
  rank,
}: QuizChallengeBannerProps) {
  const { t } = useTranslation();
  const settings = useSettingsStore((s) => s.settings);
  const isEnabled = settings?.featureToggles?.enableQuizChallenges ?? true;

  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [isScorecardModalOpen, setIsScorecardModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');

  useEffect(() => {
    if (!isEnabled || !quizAttemptId) return;
    let mounted = true;

    fetch('/api/challenges/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quizAttemptId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        if (data.success && data.challenge?.shareUrl) {
          setShareUrl(data.challenge.shareUrl);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [isEnabled, quizAttemptId]);

  if (!isEnabled) return null;

  const fallbackBaseUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://quizdo.in';
  const effectiveShareUrl = shareUrl || `${fallbackBaseUrl}/challenge/attempt/${quizAttemptId}`;

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-indigo-500/15 p-4 sm:p-5 mb-4 shadow-lg backdrop-blur-sm">
        {/* Background glow circle */}
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-orange-500/20">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 uppercase tracking-wider mb-0.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('challenge.viralBadge')}</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--color-foreground)] leading-snug">
                {t('challenge.bannerTitle', { score: String(score) })}
              </h3>
              <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 max-w-lg">
                {t('challenge.bannerSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsScorecardModalOpen(true)}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 py-2 px-3.5 text-xs sm:text-sm font-semibold rounded-xl"
            >
              <ImageIcon className="w-4 h-4 text-indigo-400" />
              <span>{t('challenge.scorecard')}</span>
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={() => setIsChallengeModalOpen(true)}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 py-2 px-4 text-xs sm:text-sm font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 shadow-md shadow-orange-500/20"
            >
              <Swords className="w-4 h-4" />
              <span>{t('challenge.challengeFriend')}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Challenge Link Share Modal */}
      <ChallengeModal
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
        quizAttemptId={quizAttemptId}
        quizTitle={quizTitle}
        score={score}
        initialShareUrl={shareUrl}
        onOpenScorecard={() => setIsScorecardModalOpen(true)}
      />

      {/* Branded Canvas Scorecard Modal */}
      <ScorecardCanvasModal
        isOpen={isScorecardModalOpen}
        onClose={() => setIsScorecardModalOpen(false)}
        data={{
          studentName,
          quizTitle,
          score,
          correctCount,
          totalQuestions,
          timeTaken,
          percentile,
          rank,
          shareUrl: effectiveShareUrl,
        }}
      />
    </>
  );
}
