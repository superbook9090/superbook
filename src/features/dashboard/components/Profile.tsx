'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import ChangePasswordForm from '@/features/auth/components/ChangePasswordForm';
import LogoutButton from '@/components/ui/LogoutButton';
import { updateProfileName } from '@/lib/api/auth';
import { useSessionStore } from '@/store/useSessionStore';
import { getCsrfToken } from 'next-auth/react';
import { TextField } from '@/components/ui/TextField';
import Button from '@/components/ui/Button';
import { ApiClientError } from '@/lib/api/http';

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
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Name editing states
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(session.user?.name || '');
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [nameError, setNameError] = useState('');
  const [nameSuccess, setNameSuccess] = useState('');

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError('');
    setNameSuccess('');

    if (!tempName.trim()) {
      setNameError(t('profile.nameRequired') || 'Name is required.');
      return;
    }

    setIsUpdatingName(true);
    try {
      // 1. Update the name in the database
      await updateProfileName({ name: tempName.trim() });

      // 2. Request a NextAuth session update
      const csrfToken = await getCsrfToken();
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          csrfToken,
          data: {
            name: tempName.trim(),
          },
        }),
      });

      // 3. Force-fetch updated session to sync Zustand state
      await useSessionStore.getState().fetchSession(true);

      setNameSuccess(t('profile.nameUpdateSuccess') || 'Name updated successfully.');
      setIsEditingName(false);
    } catch (err) {
      setNameError(
        err instanceof ApiClientError
          ? err.message
          : t('profile.nameUpdateError') || 'Failed to update name.'
      );
    } finally {
      setIsUpdatingName(false);
    }
  };

  const displayName = session.user?.name
    ? session.user.name.charAt(0).toUpperCase() + session.user.name.slice(1)
    : '';

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground)]">{t('profile.myProfile')}</h1>
      <p className="mt-2 text-sm sm:text-base text-[var(--color-muted-foreground)]">
        {t(`profile.${descriptionKey}`)}
      </p>

      <div className="mt-6 sm:mt-8 card-surface">
        <div className="card-body">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-muted-foreground)]">{t('profile.name')}</label>
              {isEditingName ? (
                <form onSubmit={handleNameSubmit} className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 max-w-md">
                  <div className="flex-grow">
                    <TextField
                      aria-label={t('profile.name')}
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      required
                      disabled={isUpdatingName}
                      fullWidth
                    />
                  </div>
                  <div className="flex space-x-2 shrink-0">
                    <Button
                      type="submit"
                      disabled={isUpdatingName}
                      isLoading={isUpdatingName}
                      size="md"
                    >
                      {t('common.save') || 'Save'}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setIsEditingName(false);
                        setNameError('');
                      }}
                      disabled={isUpdatingName}
                      size="md"
                    >
                      {t('common.cancel') || 'Cancel'}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="mt-1 flex items-center justify-between gap-4">
                  <p className="text-sm sm:text-base text-[var(--color-foreground)] break-words">
                    {displayName}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setTempName(session.user?.name || '');
                      setIsEditingName(true);
                      setNameError('');
                      setNameSuccess('');
                    }}
                  >
                    {t('profile.editName') || 'Edit Name'}
                  </Button>
                </div>
              )}
              {nameError && <p className="mt-1 text-xs text-[var(--color-error)]">{nameError}</p>}
              {nameSuccess && <p className="mt-1 text-xs text-[var(--color-success)]">{nameSuccess}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-muted-foreground)]">{t('profile.email')}</label>
              <p className="mt-1 text-sm sm:text-base text-[var(--color-foreground)] break-all break-words">
                {session.user?.email?.toUpperCase()}
              </p>
            </div>
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
          <h2 className="text-base sm:text-lg font-semibold text-[var(--color-foreground)]">{t('password.changePasswordTitle')}</h2>
          <p className="mt-1 text-xs sm:text-sm text-[var(--color-muted-foreground)]">{t('password.changePasswordDesc')}</p>
        </div>
        <div className="card-body">
          {!showPasswordForm ? (
            <Button
              onClick={() => setShowPasswordForm(true)}
            >
              {t('password.changePasswordTitle')}
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

