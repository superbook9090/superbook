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
import { PageWrapper, PageHeader } from '@/components/layout';

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
    <PageWrapper>
      <PageHeader
        title={t('profile.myProfile')}
        description={t(`profile.${descriptionKey}`)}
      />

      <div className="card-surface">
        <div className="card-body">
          <div className="space-y-3.5 sm:space-y-4">
            <ProfileNameSection session={session} />
            <ProfileEmailSection session={session} />
            <ProfilePhoneSection session={session} />
            <ProfileOrganizationSection session={session} />
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">{t('profile.role')}</label>
              <p className="mt-0.5 text-sm sm:text-base font-medium text-[var(--color-foreground)] capitalize break-words">
                {session.user?.role}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card-surface">
        <div className="card-body border-b border-[var(--color-border)]">
          <h2 className="text-sm sm:text-base font-semibold text-[var(--color-foreground)]">
            {hasPassword ? t('password.changePasswordTitle') : (t('password.setPasswordTitle') || 'Create Password')}
          </h2>
          <p className="mt-0.5 text-xs text-[var(--color-muted-foreground)]">
            {hasPassword ? t('password.changePasswordDesc') : (t('password.setPasswordDesc') || 'Set a password for your account to sign in with email/credentials.')}
          </p>
        </div>
        <div className="card-body">
          {!showPasswordForm ? (
            <Button
              onClick={() => setShowPasswordForm(true)}
              className="min-h-[38px] text-xs sm:text-sm"
            >
              {hasPassword ? t('password.changePasswordTitle') : (t('password.setPasswordTitle') || 'Create Password')}
            </Button>
          ) : (
            <div className="space-y-3">
              <ChangePasswordForm />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-start">
        <LogoutButton variant="profile" />
      </div>
    </PageWrapper>
  );
}
