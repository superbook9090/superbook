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
            platform: 'mobile',
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
    <div className="w-full flex-1 flex flex-col items-center justify-center p-3 sm:p-6 lg:p-8 my-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md lg:max-w-5xl rounded-2xl sm:rounded-3xl border border-[var(--color-border)] shadow-2xl bg-[var(--card-solid)]/95 backdrop-blur-2xl overflow-hidden my-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
          {/* Left: Branding Showcase (Visible on lg+) */}
          <AuthBranding mode="login" className="lg:col-span-6" />

          {/* Right: Form Area */}
          <div className="lg:col-span-6 p-6 sm:p-8 xl:p-10 flex flex-col justify-center relative">
            {/* Ambient decorative glow */}
            <div
              className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-br ${theme.gradient} opacity-10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none`}
            />

            {isLoading && (
              <div className="absolute inset-0 bg-[var(--card-solid)]/85 backdrop-blur-sm flex items-center justify-center z-50">
                <Loader />
              </div>
            )}

            {/* Header */}
            <div className="mb-6 space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--student-soft)] text-[var(--student-primary)] text-xs font-semibold">
                <span>👋 {t('login.welcomeBack')}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-foreground)]">
                {t('login.welcomeBack')}
              </h1>
              <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
                {t('login.signInCredentials')}
              </p>
            </div>

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

            {/* Register Footer Link */}
            {!isPhoneFlow && (
              <div className="mt-6 pt-4 border-t border-[var(--color-border)]/60 text-center">
                <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
                  {t('login.dontHaveAccount')}{' '}
                  <Link
                    href={
                      callbackUrl === ROUTES.dashboard
                        ? ROUTES.register
                        : `${ROUTES.register}?callbackUrl=${encodeURIComponent(callbackUrl)}`
                    }
                    className="font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] hover:underline transition-colors ml-1"
                  >
                    {t('login.createOne')}
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginForm() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center min-h-screen">
          <Loader />
        </div>
      }
    >
      <LoginFormInner />
    </Suspense>
  );
}
