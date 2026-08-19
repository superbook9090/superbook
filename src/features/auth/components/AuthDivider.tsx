'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export default function AuthDivider() {
  const { t } = useTranslation();

  return (
    <div className="relative my-3.5 sm:my-4 flex items-center justify-center select-none">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[var(--color-border)]" />
      </div>
      <span className="relative px-3.5 bg-[var(--card-solid)] text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
        {t('login.orContinueWith')}
      </span>
    </div>
  );
}
