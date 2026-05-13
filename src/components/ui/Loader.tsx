'use client';

import React from 'react';
import { useRoleTheme } from '@/contexts/RoleThemeContext';

type LoaderVariant = 'spinner' | 'dots';
type LoaderSize = 'sm' | 'md' | 'lg';

interface LoaderProps {
  variant?: LoaderVariant;
  size?: LoaderSize;
  text?: string;
  className?: string;
}

export function Loader({
  variant = 'spinner',
  size = 'md',
  text,
  className = '',
}: LoaderProps) {
  const { theme } = useRoleTheme();

  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  const Spinner = (
    <div
      className={`
        ${sizeMap[size]}
        border-2 border-[var(--color-border)]
        border-t-[${theme.colors.primary}]
        rounded-full animate-spin
      `}
      style={{ borderTopColor: theme.colors.primary }}
    />
  );

  const Dots = (
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full animate-bounce"
          style={{
            backgroundColor: theme.colors.primary,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );

  return (
    <div
      className={`flex flex-col items-center justify-center ${className}`}
      role="status"
      aria-busy="true"
    >
      {variant === 'dots' ? Dots : Spinner}

      {text && (
        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
          {text}
        </p>
      )}
    </div>
  );
}
