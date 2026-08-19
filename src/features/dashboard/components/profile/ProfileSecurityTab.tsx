'use client';

import React from 'react';
import type { Session } from '@/types';
import { Lock } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import ChangePasswordForm from '@/features/auth/components/ChangePasswordForm';
import type { AccountInfo } from '@/lib/api/auth';

interface ProfileSecurityTabProps {
  session: Session;
  accountInfo?: AccountInfo | null;
}

export function ProfileSecurityTab({
  accountInfo,
}: ProfileSecurityTabProps) {
  const { t } = useTranslation();
  const hasPassword = accountInfo?.hasPassword ?? true;

  return (
    <div className="space-y-6">
      {/* Password Management Card */}
      <div className="card-panel">
        <div className="card-panel-header bg-[var(--surface-muted)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[var(--warning-light)] text-[var(--warning)] shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-[var(--color-foreground)]">
                {hasPassword
                  ? t('password.changePasswordTitle') || 'Change Password'
                  : t('password.setPasswordTitle') || 'Create Password'}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
                {hasPassword
                  ? t('password.changePasswordDesc') || 'Update your account password regularly to protect your account.'
                  : t('password.setPasswordDesc') || 'Set a password for your account to sign in with email credentials.'}
              </p>
            </div>
          </div>
        </div>

        <div className="card-panel-body bg-[var(--card-solid)]">
          <div className="max-w-xl">
            <ChangePasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}
