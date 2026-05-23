'use client';

import { useTranslation } from '@/hooks/useTranslation';
import ChangePasswordForm from '@/features/auth/components/ChangePasswordForm';

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
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('profile.myProfile')}</h1>
      <p className="mt-2 text-sm sm:text-base text-gray-600">
        {t(`profile.${descriptionKey}`)}
      </p>

      <div className="mt-6 sm:mt-8 bg-white overflow-hidden shadow rounded-lg">
        <div className="px-3 sm:px-4 py-4 sm:py-5">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('profile.name')}</label>
              <p className="mt-1 text-sm sm:text-base text-gray-900 break-words">
                {session.user?.name
                  ? session.user.name.charAt(0).toUpperCase() + session.user.name.slice(1)
                  : session.user?.name}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('profile.email')}</label>
              <p className="mt-1 text-sm sm:text-base text-gray-900 break-all break-words">
                {session.user?.email?.toUpperCase()}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('profile.role')}</label>
              <p className="mt-1 text-sm sm:text-base text-gray-900 capitalize break-words">
                {session.user?.role}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 bg-white overflow-hidden shadow rounded-lg">
        <div className="px-3 sm:px-4 py-4 sm:py-5 border-b border-gray-100">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">{t('password.changePasswordTitle')}</h2>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">{t('password.changePasswordDesc')}</p>
        </div>
        <div className="px-3 sm:px-4 py-4 sm:py-5">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
