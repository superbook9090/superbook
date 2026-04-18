'use client';

import { useTranslation } from '@/hooks/useTranslation';

interface ProfileProps {
  session: {
    user?: {
      name?: string | null;
      email?: string | null;
      role?: string | null;
    };
  };
  descriptionKey?: 'manageAccount' | 'teacherProfileDesc';
}

export default function Profile({ session, descriptionKey = 'manageAccount' }: ProfileProps) {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{t('profile.myProfile')}</h1>
      <p className="mt-2 text-gray-600">
        {t(`profile.${descriptionKey}`)}
      </p>

      <div className="mt-8 bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('profile.name')}</label>
              <p className="mt-1 text-sm text-gray-900">{session.user?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('profile.email')}</label>
              <p className="mt-1 text-sm text-gray-900">{session.user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('profile.role')}</label>
              <p className="mt-1 text-sm text-gray-900 capitalize">{session.user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
