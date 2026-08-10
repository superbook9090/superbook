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

import { useAlert } from '@/components/ui/AlertContainer';
import { Loader } from '@/components/ui/Loader';
import AuthBranding from './AuthBranding';
import EmailLoginForm from './EmailLoginForm';
import PhoneLoginForm from './PhoneLoginForm';

function LoginFormInner() {
  const searchParams = useSearchParams();
  const callbackUrl = getSafeCallbackUrl(searchParams.get('callbackUrl'));
  const { status, fetchSession } = useSessionStore();
  const router = useRouter();
  const { t } = useTranslation();

  const theme = roleThemes.student;
  const { addAlert } = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  const [isPhoneFlow, setIsPhoneFlow] = useState(!!searchParams.get('phone'));

  // Client-side guard for UX improvement
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  // Handle URL errors and success messages
  useEffect(() => {
    if (searchParams.get('error') === 'exists') {
      addAlert({ type: 'error', message: t('login.phoneExists') });
    }
    if (searchParams.get('reset') === 'success') {
      addAlert({ type: 'success', message: t('password.forgotSuccess') });
    }
  }, [searchParams, t, addAlert]);

  // Listen for Native Google Sign-In tokens
  useEffect(() => {
    const cleanup = onWebViewMessage(async (data) => {
      if (data.action === 'GOOGLE_NATIVE_TOKEN' && data.token) {
        setIsLoading(true);
        try {
          const result = await signIn('credentials', {
            redirect: false,
            googleIdToken: data.token,
          });

          if (result?.error) {
            addAlert({ type: 'error', message: t('login.genericError') });
            setIsLoading(false);
            return;
          }

          await fetchSession(true);
          await new Promise(resolve => setTimeout(resolve, 500));
          router.push(callbackUrl);
        } catch (error) {
          addAlert({ type: 'error', message: t('login.genericError') });
          console.error('Native Google Login error:', error);
          setIsLoading(false);
        }
      } else if (data.action === 'GOOGLE_NATIVE_TOKEN_ERROR' && data.error) {
        addAlert({ type: 'error', message: data.error });
        setIsLoading(false);
      }
    });

    return cleanup;
  }, [router, fetchSession, t, callbackUrl, addAlert]);

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
