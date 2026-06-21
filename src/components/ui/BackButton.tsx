'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

export interface BackButtonProps {
  href?: string;
  onClick?: () => void;
  label?: string | React.ReactNode;
  className?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'button' | 'ghost' | 'outline';
}

export default function BackButton({
  href,
  onClick,
  label,
  className,
  icon: Icon = ArrowLeft,
  variant = 'default',
}: BackButtonProps) {
  const router = useRouter();

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
    } else if (!href) {
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
    'inline-flex items-center gap-1.5 font-medium transition-all group duration-200 touch-manipulation',
    variant === 'default' && 'text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]',
    variant === 'ghost' && 'p-2 rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)]',
    variant === 'outline' && 'px-4 py-2 border-2 border-[var(--border)] rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] text-sm',
    variant === 'button' && 'px-4 py-2 bg-[var(--color-surface-muted)] text-[var(--color-foreground)] rounded-lg hover:bg-[var(--color-surface-muted-strong)] text-sm',
    className
  );

  if (href) {
    return (
      <Link href={href} className={baseStyles}>
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
