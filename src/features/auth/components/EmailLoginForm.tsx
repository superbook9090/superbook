'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useSessionStore } from '@/store/useSessionStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Phone, ArrowRight } from 'lucide-react';
import { TextField } from '@/components/ui/TextField';
import { Loader } from '@/components/ui/Loader';
import { ROUTES } from '@/constants/routes';
import { useAlert } from '@/components/ui/AlertContainer';

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

interface EmailLoginFormProps {
  theme: {
    gradient: string;
    shadow: string;
    text: string;
    hover: string;
  };
  callbackUrl: string;
  onSelectPhoneFlow: () => void;
}

export default function EmailLoginForm({ theme, callbackUrl, onSelectPhoneFlow }: EmailLoginFormProps) {
  const { t } = useTranslation();
  const { addAlert } = useAlert();
  const router = useRouter();
  const { fetchSession } = useSessionStore();
  const enablePhoneAuth = useSettingsStore(
    (s) => s.settings.featureToggles.enablePhoneAuth ?? true
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load remembered email
  useEffect(() => {
    const savedEmail = localStorage.getItem('quizdo_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        addAlert({ type: 'error', message: t('login.invalidCredentials') });
        setIsLoading(false);
        return;
      }

      if (rememberMe) {
        localStorage.setItem('quizdo_remembered_email', email);
      } else {
        localStorage.removeItem('quizdo_remembered_email');
      }

      await fetchSession(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push(callbackUrl);
    } catch (error) {
      addAlert({ type: 'error', message: t('login.genericError') });
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Check if we are running inside the React Native WebView
    if (typeof window !== 'undefined' && window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ action: 'REQUEST_GOOGLE_SIGN_IN' }));
    } else {
      // Standard web flow
      signIn('google', { callbackUrl });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Email Input */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
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
      </motion.div>

      {/* Password Input */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <TextField
          label={t('login.password')}
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          startIcon={<Lock className="w-5 h-5 text-[var(--color-muted)]" />}
          fullWidth
        />
      </motion.div>

      {/* Remember Me & Forgot Password */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-between"
      >
        <label className="flex items-center min-h-[44px] cursor-pointer group">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className={`w-4 h-4 rounded border-[var(--color-border)] ${theme.text} focus:${theme.shadow}`}
          />
          <span className="ml-2 text-sm text-[var(--color-muted-foreground)]">{t('login.rememberMe')}</span>
        </label>
        <Link
          href={ROUTES.forgotPassword}
          className={`inline-flex items-center min-h-[44px] text-sm font-medium ${theme.text} hover:text-[var(--color-foreground)] transition-colors`}
        >
          {t('login.forgotPassword')}
        </Link>
      </motion.div>

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex items-center justify-center py-4 px-6 bg-gradient-to-r ${theme.gradient} text-white font-semibold rounded-xl shadow-lg ${theme.shadow} hover:shadow-xl focus:outline-none focus:ring-2 focus:${theme.shadow} disabled:opacity-60 disabled:cursor-not-allowed transition-all`}
        >
          {isLoading ? (
            <Loader size="sm" />
          ) : (
            <>
              {t('login.signIn')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Divider */}
      <div className="relative my-[var(--card-gap)]">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--color-border)]" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-[var(--card-solid)] text-[var(--color-muted-foreground)]">{t('login.orContinueWith')}</span>
        </div>
      </div>

      {/* Google Login */}
      <motion.button
        type="button"
        onClick={handleGoogleSignIn}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center py-3.5 px-4 bg-[var(--card-solid)] border-2 border-[var(--color-border)] rounded-xl hover:border-[var(--color-muted)] hover:bg-[var(--color-surface-muted)] transition-all"
      >
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span className="font-medium text-[var(--color-foreground)]">{t('login.continueWithGoogle')}</span>
      </motion.button>

      {/* Phone Login */}
      {enablePhoneAuth && (
        <motion.button
          type="button"
          onClick={onSelectPhoneFlow}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-3 w-full flex items-center justify-center py-3.5 px-4 bg-[var(--card-solid)] border-2 border-[var(--color-border)] rounded-xl hover:border-[var(--color-muted)] hover:bg-[var(--color-surface-muted)] transition-all"
        >
          <Phone className="w-5 h-5 mr-3 text-[var(--color-muted)]" />
          <span className="font-medium text-[var(--color-foreground)]">{t('login.continueWithPhone') || 'Continue with Phone'}</span>
        </motion.button>
      )}
    </form>
  );
}
