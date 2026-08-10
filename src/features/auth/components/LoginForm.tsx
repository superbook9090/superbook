'use client';

import { Suspense, useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useSessionStore } from '@/store/useSessionStore';
import { getSafeCallbackUrl } from '@/lib/callbackUrl';
import { roleThemes } from '@/lib/roleTheme';
import { ROUTES } from '@/constants/routes';
import { onWebViewMessage } from '@/lib/mobile/webviewBridge';
import Link from 'next/link';
import { motion } from 'framer-motion';

import Alert from '@/components/ui/Alert';
import { Loader } from '@/components/ui/Loader';
import AuthBranding from './AuthBranding';
import EmailLoginForm from './EmailLoginForm';
import PhoneLoginForm from './PhoneLoginForm';

function LoginFormInner() {
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get('reset') === 'success';
  const callbackUrl = getSafeCallbackUrl(searchParams.get('callbackUrl'));
  const { status, fetchSession } = useSessionStore();
  const router = useRouter();
  const { t } = useTranslation();

  const theme = roleThemes.student;
  const [error, setError] = useState(
    searchParams.get('error') === 'exists' ? t('login.phoneExists') : ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isPhoneFlow, setIsPhoneFlow] = useState(!!searchParams.get('phone'));

  // Client-side guard for UX improvement
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  // Listen for Native Google Sign-In tokens
  useEffect(() => {
    const cleanup = onWebViewMessage(async (data) => {
      if (data.action === 'GOOGLE_NATIVE_TOKEN' && data.token) {
        setIsLoading(true);
        setError('');
        try {
          const result = await signIn('credentials', {
            redirect: false,
            googleIdToken: data.token,
          });

          if (result?.error) {
            setError(t('login.genericError'));
            setIsLoading(false);
            return;
          }

          await fetchSession(true);
          await new Promise(resolve => setTimeout(resolve, 500));
          router.push(callbackUrl);
        } catch (error) {
          setError(t('login.genericError'));
          console.error('Native Google Login error:', error);
          setIsLoading(false);
        }
      } else if (data.action === 'GOOGLE_NATIVE_TOKEN_ERROR' && data.error) {
        setError(data.error);
        setIsLoading(false);
      }
    });

    return cleanup;
  }, [router, fetchSession, t, callbackUrl]);

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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--color-foreground)] tracking-tight mb-2">
              {t('login.welcomeBack')}
            </h1>
            <p className="text-[var(--color-muted-foreground)]">
              {t('login.signInCredentials')}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-8 bg-[var(--card-solid)] rounded-2xl border border-[var(--color-border)] shadow-xl relative overflow-hidden"
          >
            {/* Background Decorative Blob */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${theme.gradient} opacity-5 rounded-full blur-2xl -mr-16 -mt-16`} />

            {isLoading && (
              <div className="absolute inset-0 bg-[var(--card-solid)]/80 flex items-center justify-center z-50 rounded-2xl">
                <Loader />
              </div>
            )}

            {/* Reset Success Message */}
            {resetSuccess && (
              <Alert
                type="success"
                message={t('password.forgotSuccess')}
                className="relative top-0 right-0 left-0 translate-x-0 w-full mb-6 z-10"
              />
            )}

            {/* Error Message */}
            {error && (
              <Alert
                type="error"
                message={error}
                onClose={() => setError('')}
                className="relative top-0 right-0 left-0 translate-x-0 w-full mb-6 z-10"
              />
            )}

            {/* Conditionally Render Phone or Email Login Flow */}
            {isPhoneFlow ? (
              <PhoneLoginForm
                theme={theme}
                callbackUrl={callbackUrl}
                onBackToEmail={() => setIsPhoneFlow(false)}
              />
            ) : (
              <EmailLoginForm
                theme={theme}
                callbackUrl={callbackUrl}
                onSelectPhoneFlow={() => setIsPhoneFlow(true)}
                setError={setError}
              />
            )}

            {/* Register Link */}
            {!isPhoneFlow && (
              <p className="mt-8 text-center text-sm text-[var(--color-muted-foreground)]">
                {t('login.dontHaveAccount')}{' '}
                <Link
                  href={
                    callbackUrl === ROUTES.dashboard
                      ? ROUTES.register
                      : `${ROUTES.register}?callbackUrl=${encodeURIComponent(callbackUrl)}`
                  }
                  className={`font-semibold ${theme.text} hover:text-[var(--color-foreground)] transition-colors`}
                >
                  {t('login.createOne')}
                </Link>
              </p>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader /></div>}>
      <LoginFormInner />
    </Suspense>
  );
}
