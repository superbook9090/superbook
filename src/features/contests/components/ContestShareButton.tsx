'use client';

import { useState, useCallback } from 'react';
import { Share2, Check } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import Tooltip from '@/components/ui/Tooltip';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ContestShareButtonProps {
  contestId: string;
  className?: string;
  variant?: 'icon' | 'button';
}

export function ContestShareButton({
  contestId,
  className,
  variant = 'icon',
}: ContestShareButtonProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const shareUrl = `/dashboard/student/contests/${contestId}/take`;

  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!shareUrl) return;
    const fullUrl = `${window.location.origin}${shareUrl}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: do nothing if clipboard is unavailable
    }
  }, [shareUrl]);

  const label = copied ? t('common.linkCopied') || 'Copied!' : t('common.share') || 'Share';

  if (variant === 'button') {
    return (
      <Button
        type="button"
        onClick={handleShare}
        variant={copied ? "primary" : "secondary"}
        className={className}
      >
        {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
        {label}
      </Button>
    );
  }

  return (
    <Tooltip label={label}>
      <Button
        type="button"
        onClick={handleShare}
        aria-label={label}
        variant={copied ? "primary" : "secondary"}
        className={cn('p-2.5 rounded-xl flex items-center justify-center', className)}
      >
        {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      </Button>
    </Tooltip>
  );
}
