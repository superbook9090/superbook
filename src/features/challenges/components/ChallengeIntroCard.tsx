'use client';

import { motion } from 'framer-motion';
import { Swords, Sparkles, User, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import type { PublicChallengeData } from '../types';

interface ChallengeIntroCardProps {
  challenge: PublicChallengeData;
  guestName: string;
  setGuestName: (name: string) => void;
  onAccept: () => void;
  isStarting: boolean;
  startError: string | null;
}

export function ChallengeIntroCard({
  challenge,
  guestName,
  setGuestName,
  onAccept,
  isStarting,
  startError,
}: ChallengeIntroCardProps) {
  const { t } = useTranslation();
  const session = useSessionStore((s) => s.session);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-lg card-surface rounded-3xl border border-[var(--color-border)] shadow-2xl p-4 sm:p-6 md:p-8 flex flex-col items-center text-center"
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
        {t('challenge.canYouBeat', { name: challenge.challenger.name || t('challenge.quizdoScholar') })}
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

      {/* Identity or Nickname Input */}
      {session?.user ? (
        <div className="w-full flex items-center gap-3 p-3.5 mb-5 rounded-2xl bg-[var(--color-muted)]/15 border border-[var(--color-border)] text-left">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={session.user.name || ''}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              (session.user.name || session.user.email || 'U')[0].toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-[var(--color-muted-foreground)]">
              {t('challenge.playingAs')}
            </p>
            <p className="text-sm font-bold text-[var(--color-foreground)] truncate">
              {session.user.name || session.user.email}
            </p>
          </div>
        </div>
      ) : (
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
      )}

      <Button
        variant="primary"
        onClick={onAccept}
        disabled={isStarting}
        className="w-full py-3.5 px-6 text-sm font-bold rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white border-0 shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
      >
        {isStarting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{t('common.loading')}</span>
          </>
        ) : (
          <>
            <span>{t('challenge.acceptChallenge')}</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>

      {startError && (
        <div className="w-full mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 text-left">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{startError}</span>
        </div>
      )}

      <div className="flex items-center gap-4 text-[11px] text-[var(--color-muted-foreground)] mt-4">
        {!session?.user && (
          <>
            <span>{t('challenge.noSignupRequired')}</span>
            <span>·</span>
          </>
        )}
        <span>{t('challenge.questionsCount', { count: String(challenge.totalQuestions) })}</span>
      </div>
    </motion.div>
  );
}
