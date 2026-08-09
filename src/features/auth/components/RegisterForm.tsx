'use client';

import { Suspense, useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSessionStore } from '@/store/useSessionStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { getSafeCallbackUrl } from '@/lib/callbackUrl';
import { roleThemes } from '@/lib/roleTheme';
import { ROUTES } from '@/constants/routes';
import Link from 'next/link';
import { motion } from 'framer-motion';

import Alert from '@/components/ui/Alert';
import { Loader } from '@/components/ui/Loader';
import AuthBranding from './AuthBranding';
import EmailRegisterForm from './EmailRegisterForm';
import PhoneRegisterForm from './PhoneRegisterForm';

function RegisterFormInner() {
  const { status } = useSessionStore();
  const allowTeacherRegistration = useSettingsStore(
    (s) => s.settings.platformConfig.allowTeacherRegistration ?? true
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = getSafeCallbackUrl(searchParams.get('callbackUrl'));
  const { t } = useTranslation();

  const theme = roleThemes.student;
  const [error, setError] = useState('');
  const [isPhoneFlow, setIsPhoneFlow] = useState(false);

  // Client-side guard for UX improvement
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding (Shared Component) */}
      <AuthBranding />

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-[var(--color-background)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-md"
        >
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[var(--color-foreground)] tracking-tight mb-2">
              {t('register.createAccount')}
            </h1>
            <p className="text-[var(--color-muted-foreground)]">
              {t('register.getStartedText')}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-6 sm:p-8 bg-[var(--card-solid)] rounded-2xl border border-[var(--color-border)] shadow-xl relative overflow-hidden"
          >
            {/* Background Decorative Blob */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${theme.gradient} opacity-5 rounded-full blur-2xl -mr-16 -mt-16`} />

            {/* Error Message */}
            {error && (
              <Alert
                type="error"
                message={error}
                onClose={() => setError('')}
                className="relative top-0 right-0 left-0 translate-x-0 w-full mb-6 z-10"
              />
            )}

            {/* Conditionally Render Phone or Email Signup Flow */}
            {isPhoneFlow ? (
              <PhoneRegisterForm
                theme={theme}
                callbackUrl={callbackUrl}
                onBackToEmail={() => setIsPhoneFlow(false)}
                allowTeacherRegistration={allowTeacherRegistration}
              />
            ) : (
              <EmailRegisterForm
                theme={theme}
                callbackUrl={callbackUrl}
                onSelectPhoneFlow={() => setIsPhoneFlow(true)}
                setError={setError}
                allowTeacherRegistration={allowTeacherRegistration}
              />
            )}

            {/* Login Link */}
            {!isPhoneFlow && (
              <p className="mt-8 text-center text-sm text-[var(--color-muted-foreground)]">
                {t('register.alreadyHaveAccount')}{' '}
                <Link
                  href={
                    callbackUrl === ROUTES.dashboard
                      ? ROUTES.login
                      : `${ROUTES.login}?callbackUrl=${encodeURIComponent(callbackUrl)}`
                  }
                  className={`font-semibold ${theme.text} hover:text-[var(--color-foreground)] transition-colors`}
                >
                  {t('register.signIn')}
                </Link>
              </p>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default function RegisterForm() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader /></div>}>
      <RegisterFormInner />
    </Suspense>
  );
}
