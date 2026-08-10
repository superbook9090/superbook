'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useSessionStore } from '@/store/useSessionStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { registerAccount } from '@/lib/api/auth';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, ArrowRight, GraduationCap, School, Building2 } from 'lucide-react';
import { TextField } from '@/components/ui/TextField';
import { Loader } from '@/components/ui/Loader';
import { getDashboardHomePath } from '@/lib/roles';
import { ROUTES } from '@/constants/routes';

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

interface EmailRegisterFormProps {
  theme: {
    gradient: string;
    shadow: string;
    text: string;
    hover: string;
  };
  callbackUrl: string;
  onSelectPhoneFlow: () => void;
  setError: (err: string) => void;
  allowTeacherRegistration: boolean;
}

export default function EmailRegisterForm({ theme, callbackUrl, onSelectPhoneFlow, setError, allowTeacherRegistration }: EmailRegisterFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { fetchSession } = useSessionStore();
  const enablePhoneAuth = useSettingsStore(
    (s) => s.settings.featureToggles.enablePhoneAuth ?? true
  );

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as 'student' | 'teacher',
    inviteCode: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    {
      id: 'student' as const,
      label: t('register.student'),
      desc: t('register.studentDesc'),
      icon: GraduationCap,
      theme: {
        colors: { primary: 'var(--student-primary)' },
        activeBg: 'bg-[var(--student-primary)]/10',
        text: 'text-[var(--student-primary)]',
        activeText: 'text-[var(--student-primary)]',
      }
    },
    ...(allowTeacherRegistration ? [{
      id: 'teacher' as const,
      label: t('register.teacher'),
      desc: t('register.teacherDesc'),
      icon: School,
      theme: {
        colors: { primary: 'var(--teacher-primary)' },
        activeBg: 'bg-[var(--teacher-primary)]/10',
        text: 'text-[var(--teacher-primary)]',
        activeText: 'text-[var(--teacher-primary)]',
      }
    }] : [])
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('register.passwordsDoNotMatch'));
      return;
    }

    if (formData.role === 'teacher' && !allowTeacherRegistration) {
      setError(t('register.teacherRegistrationDisabled'));
      return;
    }

    setIsLoading(true);

    try {
      await registerAccount({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        inviteCode: formData.inviteCode,
      });

      // Sign in automatically
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        setError(t('login.genericError'));
        setIsLoading(false);
        return;
      }

      await fetchSession(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      const redirectTo =
        formData.role === 'student' && callbackUrl !== ROUTES.dashboard
          ? callbackUrl
          : getDashboardHomePath(formData.role);
      router.push(redirectTo);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      setError(errMsg || t('register.genericError'));
      console.error('Registration error:', error);
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    if (typeof window !== 'undefined' && window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ action: 'REQUEST_GOOGLE_SIGN_IN' }));
    } else {
      signIn('google', { callbackUrl });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Role Selection */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-2">
          {t('register.iWantTo')}
        </label>
        <div className={`grid gap-3 ${roles.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {roles.map((r) => {
            const Icon = r.icon;
            const isSelected = formData.role === r.id;
            const rTheme = r.theme;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: r.id }))}
                className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                  isSelected
                    ? `border-[${rTheme.colors.primary}] ${rTheme.activeBg}`
                    : 'border-[var(--color-border)] hover:border-[var(--color-muted)] bg-[var(--card-solid)]'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
                  isSelected
                    ? `${rTheme.activeBg} ${rTheme.text}`
                    : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`font-semibold text-sm ${isSelected ? rTheme.activeText : 'text-[var(--color-foreground)]'}`}>
                  {r.label}
                </span>
                <span className="text-xs text-[var(--color-muted-foreground)] mt-0.5">{r.desc}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Name Input */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <TextField
          label={t('register.fullName')}
          type="text"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
          startIcon={<User className="w-5 h-5 text-[var(--color-muted)]" />}
          fullWidth
        />
      </motion.div>

      {/* Email Input */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <TextField
          label={t('register.emailAddress')}
          type="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          startIcon={<Mail className="w-5 h-5 text-[var(--color-muted)]" />}
          fullWidth
        />
      </motion.div>

      {/* Password Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <TextField
            label={t('register.password')}
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
          placeholder={t('register.min8Chars') || "Min 8 characters"}
            startIcon={<Lock className="w-5 h-5 text-[var(--color-muted)]" />}
            fullWidth
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <TextField
            label={t('register.confirmPassword')}
            type="password"
            name="confirmPassword"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder={t('register.confirmPassword')}
            startIcon={<Lock className="w-5 h-5 text-[var(--color-muted)]" />}
            fullWidth
          />
        </motion.div>
      </div>

      {/* Invite Code (Optional) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
      >
        <TextField
          label={`${t('register.inviteCode')} (${t('register.optional')})`}
          type="text"
          name="inviteCode"
          value={formData.inviteCode}
          onChange={handleChange}
          placeholder={t('register.enterInviteCode') || "Enter invite code (optional)"}
          startIcon={<Building2 className="w-5 h-5 text-[var(--color-muted)]" />}
          fullWidth
        />
      </motion.div>

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex items-center justify-center py-3.5 px-6 bg-gradient-to-r ${theme.gradient} text-white font-semibold rounded-xl shadow-lg ${theme.shadow} hover:shadow-xl focus:outline-none focus:ring-2 focus:${theme.shadow} disabled:opacity-60 disabled:cursor-not-allowed transition-all`}
        >
          {isLoading ? (
            <Loader size="sm" />
          ) : (
            <>
              {t('register.signUp')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--color-border)]" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-[var(--card-solid)] text-[var(--color-muted-foreground)]">{t('login.orContinueWith')}</span>
        </div>
      </div>

      {/* Google Sign In */}
      <motion.button
        type="button"
        onClick={handleGoogleSignIn}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center py-3 px-4 bg-[var(--card-solid)] border-2 border-[var(--color-border)] rounded-xl hover:border-[var(--color-muted)] hover:bg-[var(--color-surface-muted)] transition-all text-sm font-medium"
      >
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span className="font-medium text-[var(--color-foreground)]">{t('login.continueWithGoogle')}</span>
      </motion.button>

      {/* Phone Registration Option */}
      {enablePhoneAuth && (
        <motion.button
          type="button"
          onClick={onSelectPhoneFlow}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-3 w-full flex items-center justify-center py-3 px-4 bg-[var(--card-solid)] border-2 border-[var(--color-border)] rounded-xl hover:border-[var(--color-muted)] hover:bg-[var(--color-surface-muted)] transition-all text-sm font-medium"
        >
          <Phone className="w-5 h-5 mr-3 text-[var(--color-muted)]" />
          <span className="font-medium text-[var(--color-foreground)]">{t('login.continueWithPhone') || 'Continue with Phone'}</span>
        </motion.button>
      )}
    </form>
  );
}
