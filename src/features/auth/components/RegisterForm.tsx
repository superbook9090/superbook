'use client';
import { ROUTES } from '@/constants/routes';
import { getDashboardHomePath } from '@/lib/roles';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PremiumLogo from '@/components/ui/PremiumLogo';
import { signIn } from 'next-auth/react';
import { useTranslation } from '@/hooks/useTranslation';
import { registerAccount } from '@/lib/api/auth';
import { roleThemes } from '@/lib/roleTheme';
import { useSessionStore } from '@/store/useSessionStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { getSafeCallbackUrl } from '@/lib/callbackUrl';
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  BookOpen,
  Users,
  Building2
} from 'lucide-react';
import Alert from '@/components/ui/Alert';
import { Loader } from '@/components/ui/Loader';
import { TextField } from '@/components/ui/TextField';

function RegisterFormInner() {
  const { status, fetchSession } = useSessionStore();
  const allowTeacherRegistration = useSettingsStore(
    (s) => s.settings.platformConfig.allowTeacherRegistration ?? true
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = getSafeCallbackUrl(searchParams.get('callbackUrl'));
  const { t } = useTranslation();
  // Use student theme as base brand identity for auth pages
  const theme = roleThemes.student;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    inviteCode: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Client-side guard for UX improvement
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  useEffect(() => {
    if (!allowTeacherRegistration && formData.role === 'teacher') {
      setFormData((prev) => ({ ...prev, role: 'student' }));
    }
  }, [allowTeacherRegistration, formData.role]);

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
        inviteCode: formData.inviteCode || undefined,
      });

      // Automatically sign in after successful registration
      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error('Registration successful but auto-login failed. Please login manually.');
      }

      // Update Zustand store session
      await fetchSession(true);

      // Delay to ensure session is fully loaded
      await new Promise(resolve => setTimeout(resolve, 500));

      // For students, return to the callback URL so seamless enrollment can complete
      const redirectTo =
        formData.role === 'student' && callbackUrl !== ROUTES.dashboard
          ? callbackUrl
          : getDashboardHomePath(formData.role);
      router.push(redirectTo);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const roles = useMemo(
    () =>
      [
        { id: 'student', label: t('common.student'), icon: BookOpen, theme: roleThemes.student, desc: t('register.iWantToLearn') },
        { id: 'teacher', label: t('common.teacher'), icon: Users, theme: roleThemes.teacher, desc: t('register.iWantToTeach') },
      ].filter((role) => role.id !== 'teacher' || allowTeacherRegistration),
    [allowTeacherRegistration, t]
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden">
        {/* Animated Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`} />

        {/* Animated Shapes */}
        <motion.div
          className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-96 h-96 bg-[var(--student-accent)]/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <PremiumLogo 
                variant="default"
                size="lg"
                mono
              />
            </motion.div>

            <h2 className="text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
              {t('register.startYour')}
              <br />
              <span className="text-white/80">{t('register.journeyToday')}</span>
            </h2>

            <p className="text-xl text-white/70 max-w-md mb-12">
              {t('register.joinCommunity')}
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
              {(['courses', 'quizzes', 'languages'] as const).map((key, i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm"
                >
                  <div className="text-sm font-semibold text-white">{t(`home.highlights.${key}`)}</div>
                  <div className="text-xs text-white/60">{t(`home.highlights.${key}Hint`)}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="lg:hidden flex items-center justify-center mb-6"
          >
            <PremiumLogo 
              variant="default"
              size="lg"
              theme="student"
            />
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[var(--card-solid)]/70 backdrop-blur-md border border-[var(--border)] rounded-3xl shadow-[var(--shadow-md)] p-6 sm:p-8"
          >
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-foreground)] mb-2">
                {t('register.createAccount')}
              </h2>
              <p className="text-[var(--color-muted-foreground)] text-sm">
                {t('register.joinCommunityDesc')}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <Alert
                type="error"
                message={error}
                onClose={() => setError('')}
                className="relative top-0 right-0 left-0 translate-x-0 w-full mb-4 z-10"
              />
            )}

            {/* Form */}
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
                  {roles.map((role) => {
                    const Icon = role.icon;
                    const isSelected = formData.role === role.id;
                    const roleTheme = role.theme;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, role: role.id }))}
                        className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                          isSelected
                            ? `border-[${roleTheme.colors.primary}] ${roleTheme.activeBg}`
                            : 'border-[var(--color-border)] hover:border-[var(--color-muted)] bg-[var(--card-solid)]'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
                          isSelected
                            ? `${roleTheme.activeBg} ${roleTheme.text}`
                            : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`font-semibold text-sm ${isSelected ? roleTheme.activeText : 'text-[var(--color-foreground)]'}`}>
                          {role.label}
                        </span>
                        <span className="text-xs text-[var(--color-muted-foreground)] mt-0.5">{role.desc}</span>
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

              {/* Password Input */}
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
                  placeholder="Create a password"
                  startIcon={<Lock className="w-5 h-5 text-[var(--color-muted)]" />}
                  fullWidth
                />
              </motion.div>

              {/* Confirm Password Input */}
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
                  placeholder="Confirm your password"
                  startIcon={<Lock className="w-5 h-5 text-[var(--color-muted)]" />}
                  fullWidth
                />
              </motion.div>

              {/* Organization Code Input (Optional) */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 }}
              >
                <TextField
                  label={`${t('register.inviteCode')} (${t('register.optional')})`}
                  type="text"
                  name="inviteCode"
                  value={formData.inviteCode}
                  onChange={handleChange}
                  placeholder="Enter invite code (optional)"
                  startIcon={<Building2 className="w-5 h-5 text-[var(--color-muted)]" />}
                  fullWidth
                />
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="pt-2"
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
                      {t('register.createAccount')}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--color-border)]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[var(--card-solid)] text-[var(--color-muted-foreground)]">{t('register.or')}</span>
              </div>
            </div>

            {/* Google Sign Up */}
            <motion.button
              type="button"
              onClick={() => signIn('google', { callbackUrl })}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center py-3 px-4 bg-[var(--card-solid)] border-2 border-[var(--color-border)] rounded-xl hover:border-[var(--color-muted)] hover:bg-[var(--color-surface-muted)] transition-all"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-medium text-[var(--color-foreground)]">{t('register.continueWithGoogle')}</span>
            </motion.button>

            {/* Login Link */}
            <p className="mt-6 text-center text-sm text-[var(--color-muted-foreground)]">
              {t('register.alreadyHaveAccount')}{' '}
              <Link
                href={
                  callbackUrl === ROUTES.dashboard
                    ? ROUTES.login
                    : `${ROUTES.login}?callbackUrl=${encodeURIComponent(callbackUrl)}`
                }
                className={`font-semibold ${theme.text} ${theme.hover.replace('hover:', 'hover:').replace('bg-', 'text-')} transition-colors`}
              >
                {t('register.signIn')}
              </Link>
            </p>
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
