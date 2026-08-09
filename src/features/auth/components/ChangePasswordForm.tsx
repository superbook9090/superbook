'use client';

import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { changePassword, fetchAccountInfo } from '@/lib/api/auth';
import { ApiClientError } from '@/lib/api/http';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { TextField } from '@/components/ui/TextField';

export default function ChangePasswordForm() {
  const { t } = useTranslation();
  const [loadingAccount, setLoadingAccount] = useState(true);
  const [canChangePassword, setCanChangePassword] = useState(false);
  const [provider, setProvider] = useState<string>('credentials');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchAccountInfo()
      .then((info) => {
        if (!cancelled) {
          setCanChangePassword(info.canChangePassword);
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
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError(t('register.passwordsDoNotMatch'));
      return;
    }

    setIsSaving(true);
    try {
      const res = await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setSuccess(res.message || t('password.changeSuccess'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(
        err instanceof ApiClientError && err.status === 429
          ? t('password.rateLimited')
          : err instanceof ApiClientError
            ? err.message
            : t('password.genericError')
      );
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError('')}
          className="relative top-0 right-0 left-0 translate-x-0 w-full z-10"
        />
      )}
      {success && (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess('')}
          className="relative top-0 right-0 left-0 translate-x-0 w-full z-10"
        />
      )}

      <TextField
        label={t('password.currentPassword')}
        type="password"
        required
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        startIcon={<Lock className="w-4 h-4 text-[var(--color-muted)]" />}
        fullWidth
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          label={t('password.newPassword')}
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
        {t('password.updatePassword')}
      </Button>
    </form>
  );
}
