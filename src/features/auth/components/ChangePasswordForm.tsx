'use client';

import { useEffect, useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { changePassword, fetchAccountInfo } from '@/lib/api/auth';
import { ApiClientError } from '@/lib/api/http';
import Button from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import Tooltip from '@/components/ui/Tooltip';

export default function ChangePasswordForm() {
  const { t } = useTranslation();
  const [loadingAccount, setLoadingAccount] = useState(true);
  const [canChangePassword, setCanChangePassword] = useState(false);
  const [provider, setProvider] = useState<string>('credentials');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
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
        <div className="p-3 text-sm bg-[var(--error-light)] border border-[var(--error)]/20 rounded-lg text-[var(--error)]">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 text-sm bg-[var(--success-light)] border border-[var(--success)]/20 rounded-lg text-[var(--success)]">
          {success}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('password.currentPassword')}</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type={showCurrent ? 'text' : 'password'}
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--student-primary)]/30 focus:border-[var(--student-primary)]"
          />
          <Tooltip
            label={showCurrent ? t('password.hidePassword') : t('password.showPassword')}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              aria-label={showCurrent ? t('password.hidePassword') : t('password.showPassword')}
              className="text-gray-400"
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('password.newPassword')}</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showNew ? 'text' : 'password'}
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--student-primary)]/30"
            />
            <Tooltip
              label={showNew ? t('password.hidePassword') : t('password.showPassword')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                aria-label={showNew ? t('password.hidePassword') : t('password.showPassword')}
                className="text-gray-400"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </Tooltip>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('register.confirmPassword')}</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showNew ? 'text' : 'password'}
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--student-primary)]/30"
            />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isSaving} isLoading={isSaving}>
        {t('password.updatePassword')}
      </Button>
    </form>
  );
}
