'use client';

import { useCallback } from 'react';
import { signOut } from 'next-auth/react';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

type LogoutButtonVariant = 'sidebar' | 'mobile' | 'profile';

interface LogoutButtonProps {
  /** Visual variant — determines styling */
  variant?: LogoutButtonVariant;
  /** Extra class names */
  className?: string;
}

const variantStyles: Record<LogoutButtonVariant, string> = {
  sidebar:
    'p-2 rounded-xl text-[var(--color-muted-foreground)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-light)] transition-all',
  mobile:
    'w-full touch-target bg-[var(--color-surface-muted)] text-[var(--color-foreground)] border border-[var(--color-border)] px-[var(--space-4)] py-2.5 rounded-lg text-base font-medium hover:bg-[var(--color-surface-muted-strong)] focus-ring flex items-center justify-center gap-[var(--space-2)]',
  profile:
    'w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold text-[var(--color-error)] border border-[var(--color-error)]/20 bg-[var(--color-error-light)] hover:bg-[var(--color-error)]/20 transition-colors flex items-center justify-center gap-2',
};

export default function LogoutButton({ variant = 'profile', className }: LogoutButtonProps) {
  const { t } = useTranslation();
  const handleSignOut = useCallback(() => {
    const callbackUrl = typeof window !== 'undefined' ? `${window.location.origin}${ROUTES.login}` : ROUTES.login;
    signOut({ callbackUrl });
  }, []);

  const showLabel = variant !== 'sidebar';

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className={cn(variantStyles[variant], className)}
      aria-label={t('common.signOut')}
    >
      <LogOut className={variant === 'sidebar' ? 'w-4 h-4' : 'w-5 h-5'} aria-hidden />
      {showLabel && (t('common.signOut') || 'Sign Out')}
    </button>
  );
}
