'use client';

import { useState, useCallback } from 'react';
import { Share2, Check } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import Tooltip from '@/components/ui/Tooltip';
import Button from '@/components/ui/Button';
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
        {copied ? <Check className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
      </Button>
    </Tooltip>
  );
}
