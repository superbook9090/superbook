'use client';

import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { changePassword, fetchAccountInfo } from '@/lib/api/auth';
import { ApiClientError } from '@/lib/api/http';
import { useAlert } from '@/components/ui/AlertContainer';
import Button from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { TextField } from '@/components/ui/TextField';

export default function ChangePasswordForm() {
  const { t } = useTranslation();
  const { addAlert } = useAlert();
  const [loadingAccount, setLoadingAccount] = useState(true);
  const [canChangePassword, setCanChangePassword] = useState(false);
  const [hasPassword, setHasPassword] = useState(true);
  const [provider, setProvider] = useState<string>('credentials');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchAccountInfo()
      .then((info) => {
        if (!cancelled) {
          setCanChangePassword(info.canChangePassword);
          setHasPassword(info.hasPassword);
          setProvider(info.provider);
        }
      })
      .catch(() => {
        if (!cancelled) setCanChangePassword(false);
      })
      .finally(() => {
        if (!cancelled) setLoadingAccount(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      addAlert({ type: 'error', message: t('register.passwordsDoNotMatch') });
      return;
    }

    setIsSaving(true);
    try {
      let res;
      if (hasPassword) {
        res = await changePassword({
          currentPassword,
          newPassword,
          confirmPassword,
        });
      } else {
        res = await changePassword({
          password: newPassword,
          confirmPassword,
        });
      }
      addAlert({ type: 'success', message: res.message || (hasPassword ? t('password.changeSuccess') : 'Password created successfully.') });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setHasPassword(true);
    } catch (err) {
      const errMsg = err instanceof ApiClientError && err.status === 429
        ? t('password.rateLimited')
        : err instanceof ApiClientError
          ? err.message
          : t('password.genericError');
      addAlert({ type: 'error', message: errMsg });
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingAccount) {
    return (
      <div className="flex justify-center py-6">
        <Loader size="sm" />
      </div>
    );
  }

  if (!canChangePassword) {
    return (
      <p className="text-sm text-[var(--color-muted-foreground)]">
        {provider === 'google' ? t('password.googleNoPassword') : t('password.noPasswordSet')}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {hasPassword && (
        <TextField
          label={t('password.currentPassword')}
          type="password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          startIcon={<Lock className="w-4 h-4 text-[var(--color-muted)]" />}
          fullWidth
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          label={hasPassword ? t('password.newPassword') : (t('password.newPassword') || 'New Password')}
          type="password"
          required
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          startIcon={<Lock className="w-4 h-4 text-[var(--color-muted)]" />}
          fullWidth
        />
        <TextField
          label={t('register.confirmPassword')}
          type="password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          startIcon={<Lock className="w-4 h-4 text-[var(--color-muted)]" />}
          fullWidth
        />
      </div>

      <Button type="submit" disabled={isSaving} isLoading={isSaving}>
        {hasPassword ? t('password.updatePassword') : (t('password.createPassword') || 'Create Password')}
      </Button>
    </form>
  );
}
