'use client';
import { ROUTES } from '@/constants/routes';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import PremiumLogo from '@/components/ui/PremiumLogo';
import Alert from '@/components/ui/Alert';
import { Loader } from '@/components/ui/Loader';
import { useTranslation } from '@/hooks/useTranslation';
import { roleThemes } from '@/lib/roleTheme';
import { requestForgotPassword } from '@/lib/api/auth';
import { ApiClientError } from '@/lib/api/http';

export default function ForgotPasswordForm() {
  const { t } = useTranslation();
  const theme = roleThemes.student;
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await requestForgotPassword(email.trim());
      setSent(true);
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
          {t('password.forgotTitle')}
        </h1>
        <p className="text-sm text-[var(--color-muted-foreground)] text-center mb-6">
          {sent ? t('password.forgotSuccess') : t('password.forgotDescription')}
        </p>

        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError('')}
            className="relative top-0 right-0 left-0 translate-x-0 w-full mb-4 z-10"
          />
        )}

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-2">
                {t('login.emailAddress')}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
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
                  {t('password.sendResetLink')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </form>
        ) : null}

        <BackButton
          href={ROUTES.login}
          label={t('password.backToLogin')}
          className="mt-6 w-full justify-center text-[var(--student-primary)] hover:underline"
        />
      </motion.div>
    </div>
  );
}
