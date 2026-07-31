'use client';

import { Construction } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function MaintenancePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      <div className="max-w-md w-full bg-[var(--card-solid)] backdrop-blur-lg rounded-2xl p-8 border border-[var(--color-border)] shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-[var(--color-warning)]/20 blur-3xl rounded-full"></div>
            <Construction className="w-24 h-24 text-[var(--color-warning)] relative z-10" />
          </div>

          <h1 className="text-3xl font-bold text-[var(--color-foreground)] mb-4">
            {t('maintenance.title')}
          </h1>

          <p className="text-[var(--color-muted-foreground)] mb-6 leading-relaxed">
            {t('maintenance.message')}
          </p>

          <div className="bg-[var(--color-warning-light)] border border-[var(--color-warning)]/30 rounded-lg p-4 mb-6 w-full">
            <p className="text-[var(--color-warning)] text-sm">
              {t('maintenance.contactAdmin')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
