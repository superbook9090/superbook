'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useSmartBack } from '@/hooks/useSmartBack';

export interface BackButtonProps {
  /** Fallback destination if there is no in-app previous page in history (or exact target when `exactHref` is true). */
  href?: string;
  /** When true, always navigates directly to `href` instead of popping in-app history. */
  exactHref?: boolean;
  onClick?: () => void;
  label?: string | React.ReactNode;
  className?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'button' | 'ghost' | 'outline';
}

export default function BackButton({
  href,
  exactHref = false,
  onClick,
  label,
  className,
  icon: Icon = ArrowLeft,
  variant = 'default',
}: BackButtonProps) {
  const router = useRouter();
  const smartBack = useSmartBack(href || '/');

  // Safe useTranslation wrapper
  let t: (key: string) => string = () => 'Back';
  try {
    const translation = useTranslation();
    if (translation && translation.t) {
      t = translation.t;
    }
  } catch {
    // Fail silently in Server Components or contextless environments
  }

  const displayLabel = label ?? t('common.back');

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      smartBack();
    } else {
      router.back();
    }
  };

  const content = (
    <>
      <Icon className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
      {displayLabel}
    </>
  );

  const baseStyles = cn(
    'inline-flex items-center gap-1.5 font-medium transition-all group duration-200 touch-manipulation cursor-pointer',
    variant === 'default' && 'text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]',
    variant === 'ghost' && 'p-2 rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)]',
    variant === 'outline' && 'px-4 py-2 border-2 border-[var(--border)] rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] text-sm',
    variant === 'button' && 'px-4 py-2 bg-[var(--color-surface-muted)] text-[var(--color-foreground)] rounded-lg hover:bg-[var(--color-surface-muted-strong)] text-sm',
    className
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={(e) => {
          if (onClick) {
            e.preventDefault();
            onClick();
            return;
          }
          if (!exactHref && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
            e.preventDefault();
            smartBack();
          }
        }}
        className={baseStyles}
      >
        {content}
      </Link>
    );
  }

  return (
    <button onClick={handleClick} className={baseStyles} type="button">
      {content}
    </button>
  );
}
