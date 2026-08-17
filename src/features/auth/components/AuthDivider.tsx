import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export default function AuthDivider() {
  const { t } = useTranslation();

  return (
    <div className="relative my-[var(--card-gap)]">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[var(--color-border)]" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-4 bg-[var(--card-solid)] text-[var(--color-muted-foreground)]">
          {t('login.orContinueWith')}
        </span>
      </div>
    </div>
  );
}
