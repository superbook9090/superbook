'use client';

import React, { useState } from 'react';
import { Share2, Check, MessageCircle } from 'lucide-react';

interface ContestScorecardShareButtonProps {
  contestTitle: string;
  contestSlug?: string | null;
  contestId: string;
  score?: number;
  rank?: number | null;
  percentage?: number;
  className?: string;
}

export function ContestScorecardShareButton({
  contestTitle,
  contestSlug,
  contestId,
  score,
  rank,
  percentage,
  className = '',
}: ContestScorecardShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (typeof window === 'undefined') return '';
    const base = window.location.origin;
    return contestSlug ? `${base}/contests/${contestSlug}` : `${base}/dashboard/student/contests/${contestId}/take`;
  };

  const getShareText = () => {
    const url = getShareUrl();
    const rankStr = rank ? ` (Rank #${rank})` : '';
    const scoreStr = score !== undefined ? `with ${score} points (${percentage ?? 0}%)` : '';

    return `🎯 I just completed the "${contestTitle}" live contest on Quiz-Do ${scoreStr}${rankStr}! Think you can beat my score? Join the live arena now:\n${url}`;
  };

  const handleWhatsAppShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const text = getShareText();
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const text = getShareText();
    const url = getShareUrl();

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Quiz-Do: ${contestTitle}`,
          text,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignored
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* WhatsApp One-Click Share */}
      <button
        type="button"
        onClick={handleWhatsAppShare}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#25D366] text-white hover:opacity-90 active:scale-95 transition-all shadow-xs"
        title="Share score on WhatsApp"
        aria-label="Share score on WhatsApp"
      >
        <MessageCircle className="w-3.5 h-3.5 fill-current" />
        <span>WhatsApp</span>
      </button>

      {/* Copy / Native Share */}
      <button
        type="button"
        onClick={handleNativeShare}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)] active:scale-95 transition-all shadow-xs"
        title="Share score link"
        aria-label="Share scorecard link"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            <span>Share</span>
          </>
        )}
      </button>
    </div>
  );
}

export default ContestScorecardShareButton;
