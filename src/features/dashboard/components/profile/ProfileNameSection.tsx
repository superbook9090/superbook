'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/components/ui/AlertContainer';
import { useRouter } from 'next/navigation';
import { getCsrfToken } from 'next-auth/react';
import { updateProfileName } from '@/lib/api/auth';
import { useSessionStore } from '@/store/useSessionStore';
import { TextField } from '@/components/ui/TextField';
import Button from '@/components/ui/Button';
import { ApiClientError } from '@/lib/api/http';
import { Session } from 'next-auth';

interface ProfileNameSectionProps {
  session: Session;
}

export default function ProfileNameSection({ session }: ProfileNameSectionProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { addAlert } = useAlert();

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(session.user?.name || '');
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tempName.trim()) {
      addAlert({ type: 'error', message: t('profile.nameRequired') || 'Name is required.' });
      return;
    }

    setIsUpdatingName(true);
    try {
      await updateProfileName({ name: tempName.trim() });

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

      await useSessionStore.getState().fetchSession(true);
      router.refresh();

      addAlert({ type: 'success', message: t('profile.nameUpdateSuccess') || 'Name updated successfully.' });
      setIsEditingName(false);
    } catch (err) {
      const errMsg = err instanceof ApiClientError ? err.message : (t('profile.nameUpdateError') || 'Failed to update name.');
      addAlert({ type: 'error', message: errMsg });
    } finally {
      setIsUpdatingName(false);
    }
  };

  const displayName = session.user?.name
    ? session.user.name.charAt(0).toUpperCase() + session.user.name.slice(1)
    : '';

  return (
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
          <p className="text-sm sm:text-base text-[var(--color-foreground)] break-all break-words">
            {displayName}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setTempName(session.user?.name || '');
              setIsEditingName(true);
            }}
          >
            {t('profile.editName') || 'Edit Name'}
          </Button>
        </div>
      )}
    </div>
  );
}
