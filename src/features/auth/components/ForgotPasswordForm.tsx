'use client';
import { ROUTES } from '@/constants/routes';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import PremiumLogo from '@/components/ui/PremiumLogo';
import { useAlert } from '@/components/ui/AlertContainer';
import { Loader } from '@/components/ui/Loader';
import { useTranslation } from '@/hooks/useTranslation';
import { TextField } from '@/components/ui/TextField';
import { roleThemes } from '@/lib/roleTheme';
import { requestForgotPassword } from '@/lib/api/auth';
import { ApiClientError } from '@/lib/api/http';

export default function ForgotPasswordForm() {
  const { t } = useTranslation();
  const theme = roleThemes.student;
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addAlert } = useAlert();
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await requestForgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      addAlert({
        type: 'error',
        message: err instanceof ApiClientError && err.status === 429
          ? t('password.rateLimited')
          : err instanceof ApiClientError
            ? err.message
            : t('password.genericError')
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[var(--card-solid)]/70 backdrop-blur-md border border-[var(--border)] rounded-3xl shadow-[var(--shadow-md)] card-body"
      >
        <div className="flex justify-center mb-[var(--section-gap)]">
          <PremiumLogo variant="default" size="md" theme="student" />
        </div>

        <h1 className="heading-lg text-center mb-2">
          {t('password.forgotTitle')}
        </h1>
        <p className="text-sm text-[var(--color-muted-foreground)] text-center mb-[var(--section-gap)]">
          {sent ? t('password.forgotSuccess') : t('password.forgotDescription')}
        </p>

        {!sent ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextField
              label={t('login.emailAddress')}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              startIcon={<Mail className="w-5 h-5 text-[var(--color-muted)]" />}
              fullWidth
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center min-h-[44px] py-3.5 bg-gradient-to-r ${theme.gradient} text-white font-semibold rounded-xl disabled:opacity-60`}
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
          className="mt-[var(--section-gap)] w-full justify-center text-[var(--student-primary)] hover:underline"
        />
      </motion.div>
    </div>
  );
}
