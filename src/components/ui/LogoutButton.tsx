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
    'p-2 rounded-xl text-[var(--student-primary-light)] hover:text-white hover:bg-white/10 transition-all',
  mobile:
    'w-full touch-target bg-white/20 text-white px-[var(--space-4)] py-2.5 rounded-lg text-base font-medium hover:bg-white/30 focus-ring flex items-center justify-center gap-[var(--space-2)]',
  profile:
    'w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center gap-2',
};

export default function LogoutButton({ variant = 'profile', className }: LogoutButtonProps) {
  const { t } = useTranslation();
  const handleSignOut = useCallback(() => signOut({ callbackUrl: ROUTES.login }), []);

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
