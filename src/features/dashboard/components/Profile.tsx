'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import ChangePasswordForm from '@/features/auth/components/ChangePasswordForm';
import LogoutButton from '@/components/ui/LogoutButton';
import { fetchAccountInfo } from '@/lib/api/auth';
import Button from '@/components/ui/Button';
import { Session } from 'next-auth';

import ProfileNameSection from './profile/ProfileNameSection';
import ProfileEmailSection from './profile/ProfileEmailSection';
import ProfilePhoneSection from './profile/ProfilePhoneSection';
import ProfileOrganizationSection from './profile/ProfileOrganizationSection';

interface ProfileProps {
  session: Session;
  descriptionKey?: 'manageAccount' | 'teacherProfileDesc';
}

export default function Profile({ session, descriptionKey = 'manageAccount' }: ProfileProps) {
  const { t } = useTranslation();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [hasPassword, setHasPassword] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchAccountInfo()
      .then((info) => {
        if (!cancelled) {
          setHasPassword(info.hasPassword);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground)]">{t('profile.myProfile')}</h1>
      <p className="mt-2 text-sm sm:text-base text-[var(--color-muted-foreground)]">
        {t(`profile.${descriptionKey}`)}
      </p>

      <div className="mt-6 sm:mt-8 card-surface">
        <div className="card-body">
          <div className="space-y-6 sm:space-y-8">
            <ProfileNameSection session={session} />
            <ProfileEmailSection session={session} />
            <ProfilePhoneSection session={session} />
            <ProfileOrganizationSection session={session} />
            <div>
              <label className="block text-sm font-medium text-[var(--color-muted-foreground)]">{t('profile.role')}</label>
              <p className="mt-1 text-sm sm:text-base text-[var(--color-foreground)] capitalize break-words">
                {session.user?.role}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 card-surface">
        <div className="card-body border-b border-[var(--color-border)]">
          <h2 className="text-base sm:text-lg font-semibold text-[var(--color-foreground)]">
            {hasPassword ? t('password.changePasswordTitle') : (t('password.setPasswordTitle') || 'Create Password')}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[var(--color-muted-foreground)]">
            {hasPassword ? t('password.changePasswordDesc') : (t('password.setPasswordDesc') || 'Set a password for your account to sign in with email/credentials.')}
          </p>
        </div>
        <div className="card-body">
          {!showPasswordForm ? (
            <Button
              onClick={() => setShowPasswordForm(true)}
            >
              {hasPassword ? t('password.changePasswordTitle') : (t('password.setPasswordTitle') || 'Create Password')}
            </Button>
          ) : (
            <div className="space-y-4">
              <ChangePasswordForm />
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 sm:mt-8 flex justify-start">
        <LogoutButton variant="profile" />
      </div>
    </div>
  );
}
