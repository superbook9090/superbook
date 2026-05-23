'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import PremiumLogo from '@/components/ui/PremiumLogo';
import { Loader } from '@/components/ui/Loader';
import { useTranslation } from '@/hooks/useTranslation';
import { roleThemes } from '@/lib/roleTheme';
import { resetPasswordWithToken } from '@/lib/api/auth';
import { ApiClientError } from '@/lib/api/http';

function ResetPasswordFormInner() {
  const { t } = useTranslation();
  const theme = roleThemes.student;
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('register.passwordsDoNotMatch'));
      return;
    }

    if (!token) {
      setError(t('password.invalidResetLink'));
      return;
    }

    setIsLoading(true);
    try {
      await resetPasswordWithToken({ token, password, confirmPassword });
      router.push('/login?reset=success');
    } catch (err) {
      setError(
        err instanceof ApiClientError && err.status === 429
          ? t('password.rateLimited')
          : err instanceof ApiClientError
            ? err.message
            : t('password.genericError')
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <p className="text-[var(--color-error)] mb-4">{t('password.invalidResetLink')}</p>
          <Link href="/forgot-password" className="text-[var(--student-primary)] font-medium hover:underline">
            {t('password.requestNewLink')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[var(--student-primary)]/10 to-[var(--student-accent)]/10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-10"
      >
        <div className="flex justify-center mb-6">
          <PremiumLogo variant="default" size="md" theme="student" />
        </div>

        <h1 className="text-2xl font-bold text-[var(--color-foreground)] text-center mb-2">
          {t('password.resetTitle')}
        </h1>
        <p className="text-sm text-[var(--color-muted-foreground)] text-center mb-6">
          {t('password.resetDescription')}
        </p>

        {error && (
          <div className="mb-4 p-3 text-sm bg-[var(--error-light)] border border-[var(--error)]/20 rounded-xl text-[var(--error)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">{t('password.newPassword')}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3 bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--student-primary)]/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">{t('register.confirmPassword')}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--student-primary)]/30"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex items-center justify-center py-3.5 bg-gradient-to-r ${theme.gradient} text-white font-semibold rounded-xl disabled:opacity-60`}
          >
            {isLoading ? <Loader size="sm" /> : (
              <>
                {t('password.updatePassword')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordForm() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader /></div>}>
      <ResetPasswordFormInner />
    </Suspense>
  );
}
