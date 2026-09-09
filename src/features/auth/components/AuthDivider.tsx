'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export default function AuthDivider() {
  const { t } = useTranslation();

  return (
    <div className="relative my-3 sm:my-3.5 flex items-center justify-center select-none">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[var(--color-border)]/60" />
      </div>
      <span className="relative px-3 py-0.5 rounded-full bg-[var(--card-solid)] border border-[var(--color-border)]/40 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
        {t('login.orContinueWith')}
      </span>
    </div>
  );
}
