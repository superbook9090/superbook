'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Swords, MessageCircle, Send, Loader2, Share2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizAttemptId: string;
  quizTitle: string;
  score: number;
  initialShareUrl?: string;
  onOpenScorecard?: () => void;
}

export function ChallengeModal({
  isOpen,
  onClose,
  quizAttemptId,
  quizTitle,
  score,
  initialShareUrl,
  onOpenScorecard,
}: ChallengeModalProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState(initialShareUrl || '');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialShareUrl) {
      setShareUrl(initialShareUrl);
    }
  }, [initialShareUrl]);

  useEffect(() => {
    if (!isOpen || !quizAttemptId) return;
    if (shareUrl) return;

    let mounted = true;
    setIsLoading(true);
    setError(null);

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
        } else {
          setError(data.message || t('challenge.failedToCreate'));
        }
      })
      .catch(() => {
        if (mounted) setError(t('challenge.networkError'));
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, quizAttemptId]);

  const shareText = t('challenge.shareInviteText', {
    score: String(score),
    title: quizTitle,
    url: shareUrl,
  });

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleWhatsApp = () => {
    if (!shareUrl) return;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleTelegram = () => {
    if (!shareUrl) return;
    const telegramText = t('challenge.shareQuote', { score: String(score), title: quizTitle });
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`⚔️ ${telegramText}`)}`;
    window.open(url, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            className="relative z-10 w-full max-w-sm sm:max-w-md rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl overflow-hidden p-5 sm:p-6"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)]/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Icon */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                <Swords className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[var(--color-foreground)]">
                  {t('challenge.challengeFriend')}
                </h3>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  {t('challenge.dareFriends', { score: String(score) })}
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="py-10 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                <span className="text-xs text-[var(--color-muted-foreground)]">
                  {t('challenge.generatingLink')}
                </span>
              </div>
            ) : error ? (
              <div className="py-6 text-center text-sm text-[var(--error)]">
                {error}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Challenge Teaser Box */}
                <div className="p-3.5 rounded-xl bg-[var(--color-muted)]/15 border border-[var(--color-border)]">
                  <p className="text-xs font-medium text-[var(--color-foreground)] leading-relaxed">
                    💬 &ldquo;{t('challenge.shareQuote', { score: String(score), title: quizTitle })}&rdquo;
                  </p>
                  <p className="text-[11px] text-[var(--color-muted-foreground)] mt-1">
                    {t('challenge.guestPlayNotice')}
                  </p>
                </div>

                {/* 1-Click Social Share Buttons */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleWhatsApp}
                    className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98]"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    {t('challenge.whatsapp')}
                  </button>

                  <button
                    type="button"
                    onClick={handleTelegram}
                    className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#229ED9] hover:bg-[#1f8ec4] text-white font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98]"
                  >
                    <Send className="w-4 h-4 fill-white" />
                    {t('challenge.telegram')}
                  </button>
                </div>

                {/* Copy Link Input */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)]">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="w-full bg-transparent text-xs text-[var(--color-foreground)] outline-none px-2 select-all font-mono"
                  />
                  <Button
                    variant="secondary"
                    onClick={handleCopy}
                    className="shrink-0 py-1.5 px-3 text-xs rounded-lg flex items-center gap-1.5"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{t('challenge.copied')}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{t('challenge.copy')}</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* Scorecard CTA */}
                {onOpenScorecard && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenScorecard();
                    }}
                    className="w-full py-2.5 px-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    {t('challenge.preferStoryCard')}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
