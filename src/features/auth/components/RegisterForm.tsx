'use client';

import { Suspense, useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSessionStore } from '@/store/useSessionStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { getSafeCallbackUrl } from '@/lib/callbackUrl';
import { roleThemes } from '@/lib/roleTheme';
import { ROUTES } from '@/constants/routes';
import { signIn } from 'next-auth/react';
import { onWebViewMessage } from '@/lib/mobile/webviewBridge';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { useAlert } from '@/components/ui/AlertContainer';
import { Loader } from '@/components/ui/Loader';
import EmailRegisterForm from './EmailRegisterForm';
import PhoneRegisterForm from './PhoneRegisterForm';

function RegisterFormInner() {
  const { status, fetchSession } = useSessionStore();
  const allowTeacherRegistration = useSettingsStore(
    (s) => s.settings.platformConfig.allowTeacherRegistration ?? true
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = getSafeCallbackUrl(searchParams.get('callbackUrl'));
  const { t } = useTranslation();

  const theme = roleThemes.student;
  const { addAlert } = useAlert();
  const [isPhoneFlow, setIsPhoneFlow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
          console.error('Native Google Register error:', error);
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
    <div className="w-full h-full flex flex-col items-center justify-center p-3 sm:p-5 pt-14 sm:pt-16 pb-3 overflow-y-auto sm:overflow-hidden relative">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-lg sm:max-w-xl lg:max-w-2xl my-auto"
      >
        {/* Header */}
        <div className="mb-3 sm:mb-4 text-center space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--color-foreground)]">
            {t('register.createAccount')}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
            {t('register.getStartedText')}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[var(--card-solid)]/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-[var(--color-border)] shadow-2xl p-4 sm:p-6 relative overflow-hidden transition-all">
          {/* Ambient decorative glow inside card */}
          <div
            className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-br ${theme.gradient} opacity-10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none`}
          />

          {isLoading && (
            <div className="absolute inset-0 bg-[var(--card-solid)]/85 backdrop-blur-sm flex items-center justify-center z-50 rounded-3xl">
              <Loader />
            </div>
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
              allowTeacherRegistration={allowTeacherRegistration}
            />
          )}

          {/* Login Footer Link */}
          {!isPhoneFlow && (
            <div className="mt-3.5 pt-3 border-t border-[var(--color-border)]/60 text-center">
              <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
                {t('register.alreadyHaveAccount')}{' '}
                <Link
                  href={
                    callbackUrl === ROUTES.dashboard
                      ? ROUTES.login
                      : `${ROUTES.login}?callbackUrl=${encodeURIComponent(callbackUrl)}`
                  }
                  className="font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] hover:underline transition-colors ml-1"
                >
                  {t('register.signIn')}
                </Link>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function RegisterForm() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center min-h-screen">
          <Loader />
        </div>
      }
    >
      <RegisterFormInner />
    </Suspense>
  );
}
