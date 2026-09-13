'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, Check, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';
import { renderScorecardToCanvas, type ScorecardData } from '@/lib/scorecard/renderScorecard';

interface ScorecardCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ScorecardData;
}

export function ScorecardCanvasModal({ isOpen, onClose, data }: ScorecardCanvasModalProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setIsRendering(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    let mounted = true;
    renderScorecardToCanvas(canvas, data)
      .catch(() => {})
      .finally(() => {
        if (mounted) setIsRendering(false);
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, data]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `quizdo-scorecard-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setIsSharing(true);
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsSharing(false);
          return;
        }

        const file = new File([blob], 'quizdo-scorecard.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `My Score on Quizdo: ${data.score}%`,
            text: `I scored ${data.score}% in "${data.quizTitle}" on Quizdo! Can you beat my score?`,
            files: [file],
          });
        } else {
          // Fallback: copy challenge link
          await navigator.clipboard.writeText(data.shareUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        }
        setIsSharing(false);
      }, 'image/png');
    } catch {
      setIsSharing(false);
    }
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
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            className="relative z-10 w-full max-w-sm sm:max-w-md max-h-[92vh] flex flex-col rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
              <div>
                <h3 className="font-bold text-base text-[var(--color-foreground)]">
                  {t('challenge.shareScorecard')}
                </h3>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  {t('challenge.shareScorecardSubtitle')}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)]/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Canvas Preview Area */}
            <div className="relative flex-1 p-4 overflow-y-auto flex items-center justify-center bg-black/40 min-h-[380px]">
              {isRendering && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 z-10">
                  <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
                  <span className="text-xs text-white/80">{t('challenge.generatingCard')}</span>
                </div>
              )}
              <canvas
                ref={canvasRef}
                className="w-full max-w-[280px] sm:max-w-[320px] aspect-[9/16] rounded-xl shadow-2xl border border-white/10"
              />
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-[var(--color-border)] flex flex-col gap-2.5 bg-[var(--color-surface)]">
              <div className="grid grid-cols-2 gap-2.5">
                <Button
                  variant="secondary"
                  onClick={handleDownload}
                  disabled={isRendering}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-semibold rounded-xl"
                >
                  <Download className="w-4 h-4" />
                  {t('challenge.download')}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleShare}
                  disabled={isRendering || isSharing}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      {t('challenge.linkCopied')}
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      {t('challenge.shareCard')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
