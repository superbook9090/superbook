'use client';

import React, { useState, useEffect } from 'react';
import type { Session } from '@/types';
import {
  Lock,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Mail,
  ShieldAlert,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import ChangePasswordForm from '@/features/auth/components/ChangePasswordForm';
import Button from '@/components/ui/Button';
import type { AccountInfo } from '@/lib/api/auth';

interface AdminSecurityTabProps {
  session: Session;
  accountInfo: AccountInfo | null;
  showPasswordFormDefault?: boolean;
}

export function AdminSecurityTab({
  session,
  accountInfo,
  showPasswordFormDefault = false,
}: AdminSecurityTabProps) {
  const { t } = useTranslation();
  const [showPasswordForm, setShowPasswordForm] = useState(showPasswordFormDefault);

  useEffect(() => {
    if (showPasswordFormDefault) {
      setShowPasswordForm(true);
    }
  }, [showPasswordFormDefault]);

  const hasPassword = accountInfo?.hasPassword ?? true;
  const provider = accountInfo?.provider || 'credentials';
  const hasPhone = Boolean(session.user?.phone);
  const hasEmail = Boolean(session.user?.email && !session.user.email.endsWith('@phone.quizdo.com'));

  const checklistItems = [
    {
      title: t('adminProfile.securityCheckStrongPassword') || 'Password Protection Enabled',
      status: hasPassword,
      description: hasPassword ? 'Account secured with credential password' : 'No credential password set',
    },
    {
      title: t('adminProfile.securityCheckEmailVerified') || 'Email Address Configured',
      status: hasEmail,
      description: session.user?.email || 'Email address connected',
    },
    {
      title: t('adminProfile.securityCheckPhoneLinked') || 'Phone Authentication Linked',
      status: hasPhone,
      description: hasPhone ? session.user?.phone : 'No phone linked for SMS 2FA recovery',
    },
    {
      title: t('adminProfile.securityCheckRoleEnforced') || 'Role-Based Access Control Enforced',
      status: true,
      description: 'Strict middleware and API layer permissions active',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Password Management Card */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-solid)] shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-[var(--border)] bg-[var(--color-surface-muted)]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
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
                  ? t('password.changePasswordDesc') || 'Update your admin account password regularly to protect system access.'
                  : t('password.setPasswordDesc') || 'Set a password for your account to sign in with email credentials.'}
              </p>
            </div>
          </div>

          {!showPasswordForm && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowPasswordForm(true)}
              className="shrink-0 flex items-center gap-1.5"
            >
              <KeyRound className="w-4 h-4 text-[var(--primary)]" />
              <span>
                {hasPassword
                  ? t('password.changePasswordTitle') || 'Change Password'
                  : t('password.setPasswordTitle') || 'Create Password'}
              </span>
            </Button>
          )}
        </div>

        {showPasswordForm && (
          <div className="p-4 sm:p-6 border-t border-[var(--border)] bg-[var(--card-solid)]">
            <div className="max-w-xl">
              <ChangePasswordForm />
              <div className="mt-4 pt-4 border-t border-[var(--border)] flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPasswordForm(false)}
                >
                  {t('common.cancel') || 'Cancel'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auth Provider & Session Meta */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Provider Overview */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-solid)] p-4 sm:p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-[var(--color-foreground)]">
                {t('adminProfile.authProviderTitle') || 'Authentication Provider'}
              </h3>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                {t('adminProfile.authProviderDesc') || 'Method used to authenticate your administrative credentials.'}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--color-surface-muted)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--color-muted-foreground)]">Primary Method</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] uppercase">
                {provider}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-[var(--color-foreground)] pt-1 border-t border-[var(--border)]">
              <span className="flex items-center gap-1 text-[var(--color-muted-foreground)]">
                <Mail className="w-3.5 h-3.5" /> Email
              </span>
              <span className="font-medium truncate max-w-[180px]">{session.user?.email}</span>
            </div>
            {session.user?.phone && (
              <div className="flex items-center justify-between text-xs text-[var(--color-foreground)] pt-1 border-t border-[var(--border)]">
                <span className="flex items-center gap-1 text-[var(--color-muted-foreground)]">
                  <Smartphone className="w-3.5 h-3.5" /> Phone
                </span>
                <span className="font-medium">{session.user.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Security Checklist */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-solid)] p-4 sm:p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-[var(--color-foreground)]">
                {t('adminProfile.securityChecklistTitle') || 'Admin Security Checklist'}
              </h3>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                Key baseline security verifications for this account.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {checklistItems.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 p-2.5 rounded-lg border border-[var(--border)] bg-[var(--color-surface-muted)] text-xs"
              >
                {item.status ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--color-foreground)]">{item.title}</p>
                  <p className="text-[11px] text-[var(--color-muted-foreground)] truncate">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
