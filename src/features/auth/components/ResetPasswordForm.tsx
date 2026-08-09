'use client';
import { ROUTES, loginWithResetSuccess } from '@/constants/routes';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, ArrowRight } from 'lucide-react';
import PremiumLogo from '@/components/ui/PremiumLogo';
import Alert from '@/components/ui/Alert';
import { Loader } from '@/components/ui/Loader';
import { TextField } from '@/components/ui/TextField';
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
      router.push(loginWithResetSuccess());
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
        <div className="max-w-md w-full bg-[var(--card-solid)]/70 backdrop-blur-md border border-[var(--border)] rounded-3xl shadow-[var(--shadow-md)] p-8 text-center">
          <p className="text-[var(--color-error)] mb-4">{t('password.invalidResetLink')}</p>
          <Link href={ROUTES.forgotPassword} className="text-[var(--student-primary)] font-medium hover:underline">
            {t('password.requestNewLink')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[var(--card-solid)]/70 backdrop-blur-md border border-[var(--border)] rounded-3xl shadow-[var(--shadow-md)] p-8 sm:p-10"
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
          <Alert
            type="error"
            message={error}
            onClose={() => setError('')}
            className="relative top-0 right-0 left-0 translate-x-0 w-full mb-4 z-10"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label={t('password.newPassword')}
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            startIcon={<Lock className="w-5 h-5 text-[var(--color-muted)]" />}
            fullWidth
          />
          <TextField
            label={t('register.confirmPassword')}
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            startIcon={<Lock className="w-5 h-5 text-[var(--color-muted)]" />}
            fullWidth
          />
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
