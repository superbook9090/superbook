'use client';

import { Construction } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function MaintenancePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full"></div>
            <Construction className="w-24 h-24 text-yellow-500 relative z-10" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">
            {t('maintenance.title')}
          </h1>

          <p className="text-gray-300 mb-6 leading-relaxed">
            {t('maintenance.message')}
          </p>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6 w-full">
            <p className="text-yellow-200 text-sm">
              {t('maintenance.contactAdmin')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
