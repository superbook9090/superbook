'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/components/ui/AlertContainer';
import { useRouter } from 'next/navigation';
import { getCsrfToken } from 'next-auth/react';
import { updateProfileEmail } from '@/lib/api/auth';
import { useSessionStore } from '@/store/useSessionStore';
import { TextField } from '@/components/ui/TextField';
import Button from '@/components/ui/Button';
import { ApiClientError } from '@/lib/api/http';
import { Session } from 'next-auth';

interface ProfileEmailSectionProps {
  session: Session;
}

export default function ProfileEmailSection({ session }: ProfileEmailSectionProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { addAlert } = useAlert();

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [tempEmail, setTempEmail] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  const isMockEmail = session.user?.email?.endsWith('@phone.quizdo.com');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingEmail(true);

    try {
      const trimmedEmail = tempEmail.trim().toLowerCase();
      if (!trimmedEmail) {
        throw new Error(t('profile.emailRequired') || 'Email is required.');
      }

      const response = await updateProfileEmail({ email: trimmedEmail });

      const csrfToken = await getCsrfToken();
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          csrfToken,
          data: {
            email: response.email,
          },
        }),
      });

      await useSessionStore.getState().fetchSession(true);
      router.refresh();
      addAlert({ type: 'success', message: t('profile.emailUpdatedSuccess') || 'Email address added successfully.' });
      setIsEditingEmail(false);
    } catch (err) {
      console.error('Error updating email:', err);
      const errMsg = err instanceof ApiClientError ? err.message : (err instanceof Error ? err.message : String(err));
      addAlert({ type: 'error', message: errMsg || t('common.errorOccurred') || 'An error occurred.' });
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-muted-foreground)]">{t('profile.email')}</label>
      {isMockEmail ? (
        isEditingEmail ? (
          <form onSubmit={handleEmailSubmit} className="mt-2 space-y-3 max-w-md">
            <div className="space-y-3">
              <TextField
                aria-label={t('profile.enterEmail') || 'Email Address'}
                value={tempEmail}
                onChange={(e) => setTempEmail(e.target.value)}
                placeholder="you@example.com"
                type="email"
                required
                disabled={isUpdatingEmail}
                fullWidth
              />
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isUpdatingEmail}
                  isLoading={isUpdatingEmail}
                  size="md"
                >
                  {t('common.save') || 'Save'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsEditingEmail(false);
                  }}
                  disabled={isUpdatingEmail}
                  size="md"
                >
                  {t('common.cancel') || 'Cancel'}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="mt-1 flex items-center justify-between gap-4">
            <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] italic">
              {t('profile.emailNotLinked') || 'No email address linked'}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTempEmail('');
                setIsEditingEmail(true);
              }}
            >
              {t('profile.addEmail') || 'Add Email'}
            </Button>
          </div>
        )
      ) : (
        <p className="mt-1 text-sm sm:text-base text-[var(--color-foreground)] break-all break-words">
          {session.user?.email?.toUpperCase()}
        </p>
      )}
    </div>
  );
}
