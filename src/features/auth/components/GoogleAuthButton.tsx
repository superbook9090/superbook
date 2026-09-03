'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useSettingsStore } from '@/store/useSettingsStore';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { sendGAEvent } from '@next/third-parties/google';

interface GoogleAuthButtonProps {
  callbackUrl: string;
  role?: string;
  isRegistration?: boolean;
}

export default function GoogleAuthButton({ callbackUrl, role, isRegistration }: GoogleAuthButtonProps) {
  const { t } = useTranslation();
  const enableGoogleAuthApp = useSettingsStore(
    (s) => s.settings.featureToggles.enableGoogleAuthApp ?? true
  );
  const enableGoogleAuthWeb = useSettingsStore(
    (s) => s.settings.featureToggles.enableGoogleAuthWeb ?? true
  );

  const [showGoogleAuth, setShowGoogleAuth] = useState(true);

  useEffect(() => {
    const isApp = typeof window !== 'undefined' && !!window.ReactNativeWebView;
    setShowGoogleAuth(isApp ? enableGoogleAuthApp : enableGoogleAuthWeb);
  }, [enableGoogleAuthApp, enableGoogleAuthWeb]);

  const handleGoogleSignIn = () => {
    sendGAEvent({ event: isRegistration ? 'sign_up' : 'login', method: 'google' });
    
    if (role) {
      document.cookie = `google-auth-role=${role}; path=/; max-age=300`; // expires in 5 minutes
    }
    
    if (typeof window !== 'undefined' && window.ReactNativeWebView) {
      sessionStorage.setItem('quizdo_just_logged_in', 'true');
      window.ReactNativeWebView.postMessage(JSON.stringify({ action: 'REQUEST_GOOGLE_SIGN_IN' }));
    } else {
      sessionStorage.setItem('quizdo_just_logged_in', 'true');
      signIn('google', { callbackUrl });
    }
  };

  if (!showGoogleAuth) return null;

  return (
    <motion.button
      type="button"
      onClick={handleGoogleSignIn}
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.99 }}
      className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-[var(--card-solid)] border border-[var(--color-border)] rounded-xl hover:border-[var(--color-muted)] hover:bg-[var(--color-surface-muted)] transition-all text-sm font-semibold text-[var(--color-foreground)] shadow-sm min-h-[44px] cursor-pointer"
    >
      <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      <span>{t('login.continueWithGoogle')}</span>
    </motion.button>
  );
}
