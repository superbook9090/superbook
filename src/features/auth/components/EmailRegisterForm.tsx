'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useSessionStore } from '@/store/useSessionStore';
import { registerAccount } from '@/lib/api/auth';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Building2, ArrowRight } from 'lucide-react';
import { TextField } from '@/components/ui/TextField';
import { Loader } from '@/components/ui/Loader';
import { getDashboardHomePath } from '@/lib/roles';
import { ROUTES } from '@/constants/routes';
import { useAlert } from '@/components/ui/AlertContainer';
import AuthDivider from './AuthDivider';
import GoogleAuthButton from './GoogleAuthButton';
import PhoneAuthButton from './PhoneAuthButton';
import RoleSelector, { UserRole } from './RoleSelector';
import { sendGAEvent } from '@next/third-parties/google';

interface EmailRegisterFormProps {
  theme: {
    gradient: string;
    shadow: string;
    text: string;
    hover: string;
  };
  callbackUrl: string;
  onSelectPhoneFlow: () => void;
  allowTeacherRegistration: boolean;
}

export default function EmailRegisterForm({ theme, callbackUrl, onSelectPhoneFlow, allowTeacherRegistration }: EmailRegisterFormProps) {
  const { t } = useTranslation();
  const { addAlert } = useAlert();
  const router = useRouter();
  const { fetchSession } = useSessionStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as UserRole,
    inviteCode: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      addAlert({ type: 'error', message: t('register.passwordsDoNotMatch') });
      return;
    }

    if (formData.role === 'teacher' && !allowTeacherRegistration) {
      addAlert({ type: 'error', message: t('register.teacherRegistrationDisabled') });
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
        addAlert({ type: 'error', message: t('login.genericError') });
        setIsLoading(false);
        return;
      }

      sendGAEvent({ event: 'sign_up', method: 'email' });

      await fetchSession(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      const redirectTo =
        formData.role === 'student' && callbackUrl !== ROUTES.dashboard
          ? callbackUrl
          : getDashboardHomePath(formData.role);
      router.push(redirectTo);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      addAlert({ type: 'error', message: errMsg || t('register.genericError') });
      console.error('Registration error:', error);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 sm:gap-3">
      {/* Role Selection */}
      <RoleSelector 
        role={formData.role} 
        onChange={(role) => setFormData(prev => ({ ...prev, role }))} 
        allowTeacherRegistration={allowTeacherRegistration} 
      />

      {/* Inputs Grid: Row 1 - Full Name & Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <TextField
            label={t('register.fullName')}
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            startIcon={<User className="w-4.5 h-4.5 text-[var(--color-muted)]" />}
            fullWidth
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <TextField
            label={t('register.emailAddress')}
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            startIcon={<Mail className="w-4.5 h-4.5 text-[var(--color-muted)]" />}
            fullWidth
          />
        </motion.div>
      </div>

      {/* Inputs Grid: Row 2 - Password & Confirm Password */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          <TextField
            label={t('register.password')}
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder={t('register.min8Chars') || "Min 8 characters"}
            startIcon={<Lock className="w-4.5 h-4.5 text-[var(--color-muted)]" />}
            fullWidth
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <TextField
            label={t('register.confirmPassword')}
            type="password"
            name="confirmPassword"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder={t('register.confirmPassword')}
            startIcon={<Lock className="w-4.5 h-4.5 text-[var(--color-muted)]" />}
            fullWidth
          />
        </motion.div>
      </div>

      {/* Invite Code (Optional) */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.35 }}
      >
        <TextField
          label={`${t('register.inviteCode')} (${t('register.optional')})`}
          type="text"
          name="inviteCode"
          value={formData.inviteCode}
          onChange={handleChange}
          placeholder={t('register.enterInviteCode') || "Enter invite code (optional)"}
          startIcon={<Building2 className="w-4.5 h-4.5 text-[var(--color-muted)]" />}
          fullWidth
        />
      </motion.div>

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`w-full flex items-center justify-center py-2.5 sm:py-3 px-5 bg-gradient-to-r ${theme.gradient} text-white font-semibold text-sm sm:text-base rounded-xl shadow-md ${theme.shadow} hover:shadow-lg focus:outline-none focus:ring-2 focus:${theme.shadow} disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer`}
        >
          {isLoading ? (
            <Loader size="sm" />
          ) : (
            <>
              {t('register.signUp')}
              <ArrowRight className="w-4.5 h-4.5 ml-2" />
            </>
          )}
        </motion.button>
      </motion.div>

      <AuthDivider />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
        <GoogleAuthButton callbackUrl={callbackUrl} role={formData.role} isRegistration={true} />
        <PhoneAuthButton onClick={onSelectPhoneFlow} />
      </div>
    </form>
  );
}
