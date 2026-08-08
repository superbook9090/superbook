'use client';

import { useState, useCallback } from 'react';
import { Share2, Check } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import Tooltip from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';

interface CourseShareButtonProps {
  course: {
    _id: string;
    title?: string;
    slug?: string | null;
    courseCode?: string | null;
  };
  className?: string;
  variant?: 'icon' | 'button';
}

export default function CourseShareButton({
  course,
  className,
  variant = 'icon',
}: CourseShareButtonProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const shareUrl = (() => {
    if (course.courseCode) {
      return `/join/${course.courseCode}`;
    }
    if (course.slug) {
      return `/courses/${course.slug}`;
    }
    return null;
  })();

  const handleShare = useCallback(async () => {
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

  if (!shareUrl) return null;

  const label = copied ? t('common.linkCopied') : t('common.share');

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={handleShare}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)]',
          className
        )}
      >
        {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
        {label}
      </button>
    );
  }

  return (
    <Tooltip label={label}>
      <button
        type="button"
        onClick={handleShare}
        aria-label={label}
        className={cn(
          'flex items-center justify-center rounded-xl p-2.5 transition-colors',
          'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)]',
          className
        )}
      >
        {copied ? <Check className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
      </button>
    </Tooltip>
  );
}
