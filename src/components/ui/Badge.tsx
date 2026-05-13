'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { useRoleTheme } from '@/contexts/RoleThemeContext';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  icon?: ReactNode;
}

const sizes = {
  sm: 'px-2.5 py-1 text-xs rounded-lg',
  md: 'px-3 py-1.5 text-sm rounded-lg',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
  icon
}: BadgeProps) {
  const { theme } = useRoleTheme();

  const variants = {
    default: 'bg-[var(--color-accent)] text-[var(--color-muted-foreground)] border-[var(--color-border)]',
    primary: `${theme.activeBg} ${theme.activeText} ${theme.border}`,
    success: 'bg-[var(--color-success-light)] text-[var(--color-success)] border-[var(--color-success)]/20',
    warning: 'bg-[var(--color-warning-light)] text-[var(--color-warning)] border-[var(--color-warning)]/20',
    error: 'bg-[var(--color-error-light)] text-[var(--color-error)] border-[var(--color-error)]/20',
    info: 'bg-[var(--color-info-light)] text-[var(--color-info)] border-[var(--color-info)]/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold border',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
