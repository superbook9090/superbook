'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useSessionStore } from '@/store/useSessionStore';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { TextField } from '@/components/ui/TextField';
import { Loader } from '@/components/ui/Loader';
import { ROUTES } from '@/constants/routes';
import { useAlert } from '@/components/ui/AlertContainer';
import AuthDivider from './AuthDivider';
import GoogleAuthButton from './GoogleAuthButton';
import PhoneAuthButton from './PhoneAuthButton';
import { sendGAEvent } from '@next/third-parties/google';

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

      sendGAEvent({ event: 'login', method: 'email' });

      sessionStorage.setItem('quizdo_just_logged_in', 'true');
      await fetchSession(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push(callbackUrl);
    } catch (error) {
      addAlert({ type: 'error', message: t('login.genericError') });
      console.error('Login error:', error);
      setIsLoading(false);
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

      <AuthDivider />
      <GoogleAuthButton callbackUrl={callbackUrl} />
      <PhoneAuthButton onClick={onSelectPhoneFlow} />
    </form>
  );
}
