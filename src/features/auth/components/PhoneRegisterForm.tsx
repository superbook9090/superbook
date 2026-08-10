'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useSessionStore } from '@/store/useSessionStore';
import { getFirebaseAuth } from '@/lib/notifications/push/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
import { motion } from 'framer-motion';
import { Phone, ArrowRight, ArrowLeft, GraduationCap, School, Building2 } from 'lucide-react';
import { TextField } from '@/components/ui/TextField';
import { Loader } from '@/components/ui/Loader';
import { useAlert } from '@/components/ui/AlertContainer';
import { getDashboardHomePath } from '@/lib/roles';
import { ROUTES } from '@/constants/routes';

interface PhoneRegisterFormProps {
  theme: {
    gradient: string;
    shadow: string;
  };
  callbackUrl: string;
  onBackToEmail: () => void;
  allowTeacherRegistration: boolean;
}

export default function PhoneRegisterForm({ theme, callbackUrl, onBackToEmail, allowTeacherRegistration }: PhoneRegisterFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { fetchSession } = useSessionStore();

  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [inviteCode, setInviteCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const { addAlert } = useAlert();
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

  const setupRecaptcha = () => {
    try {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error('Firebase Auth not available');

      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch {
          console.warn('Error clearing recaptcha verifier');
        }
      }

      const container = document.getElementById('recaptcha-container');
      if (!container) {
        console.error('No recaptcha-container element found');
        return null;
      }

      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        {
          size: 'invisible',
          callback: () => {},
          'expired-callback': () => {}
        }
      );
      return window.recaptchaVerifier;
    } catch (err) {
      console.error('Error setting up recaptcha', err);
      return null;
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error('Firebase Client Auth is not initialized');

      let verifier = window.recaptchaVerifier;
      if (!verifier) {
        verifier = setupRecaptcha();
      }
      if (!verifier) {
        throw new Error('Failed to initialize recaptcha');
      }

      let formattedPhone = phoneNumber.trim();
      if (!formattedPhone.startsWith('+')) {
        if (formattedPhone.length === 10) {
          formattedPhone = '+91' + formattedPhone;
        } else {
          addAlert({ type: 'error', message: t('login.invalidPhone') || 'Please enter phone number with country code (e.g. +91...)' });
          setIsLoading(false);
          return;
        }
      }

      // Check if phone already exists
      try {
        const res = await fetch('/api/auth/check-phone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: formattedPhone }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.exists) {
            router.push(`/login?phone=${encodeURIComponent(formattedPhone)}&error=exists`);
            return;
          }
        }
      } catch (err) {
        console.error('Error checking phone:', err);
      }

      const confirmResult = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      setConfirmationResult(confirmResult);
      setIsOtpSent(true);
    } catch (err) {
      console.error('Error sending OTP:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      addAlert({ type: 'error', message: errMsg || t('login.genericError') || 'Failed to send OTP. Please try again.' });
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch {}
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!confirmationResult) {
        throw new Error('No confirmation result found');
      }

      const userCredential = await confirmationResult.confirm(otpCode.trim());
      const idToken = await userCredential.user.getIdToken();

      const { getAdditionalUserInfo } = await import('firebase/auth');
      const addInfo = getAdditionalUserInfo(userCredential);
      if (addInfo?.isNewUser) {
        localStorage.setItem('quizdo_new_phone_reg', 'true');
      }

      const result = await signIn('credentials', {
        redirect: false,
        firebaseIdToken: idToken,
        role: role,
        inviteCode: inviteCode,
      });

      if (result?.error) {
        addAlert({ type: 'error', message: t('login.invalidOtp') || 'Invalid code. Please try again.' });
        setIsLoading(false);
        return;
      }

      await fetchSession(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      const redirectTo =
        role === 'student' && callbackUrl !== ROUTES.dashboard
          ? callbackUrl
          : getDashboardHomePath(role);
      router.push(redirectTo);
    } catch (err) {
      console.error('Error verifying OTP:', err);
      addAlert({ type: 'error', message: t('login.invalidOtp') || 'Invalid verification code.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (isOtpSent) {
      setIsOtpSent(false);
      setOtpCode('');
    } else {
      onBackToEmail();
    }
  };

  return (
    <form onSubmit={isOtpSent ? handleVerifyOtp : handleSendOtp} className="flex flex-col gap-4">
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
            const isSelected = role === r.id;
            const rTheme = r.theme;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
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

      {!isOtpSent ? (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-4"
        >
          <TextField
            label={t('login.enterPhone') || 'Phone Number'}
            type="tel"
            required
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+919999999999"
            startIcon={<Phone className="w-5 h-5 text-[var(--color-muted)]" />}
            fullWidth
          />

          <TextField
            label={`${t('register.inviteCode')} (${t('register.optional')})`}
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder={t('register.enterInviteCode') || "Enter invite code (optional)"}
            startIcon={<Building2 className="w-5 h-5 text-[var(--color-muted)]" />}
            fullWidth
          />

          <div id="recaptcha-container" className="my-2"></div>

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
                {t('login.sendOtp') || 'Send Code'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-4"
        >
          <p className="text-sm text-[var(--color-muted-foreground)]">
            {t('login.otpSent', { phone: phoneNumber }) || `Code sent to ${phoneNumber}`}
          </p>

          <TextField
            label={t('login.enterOtp') || 'Verification Code'}
            type="text"
            required
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            placeholder="123456"
            fullWidth
          />

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
                {t('login.verifyOtp') || 'Verify Code'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </motion.button>
        </motion.div>
      )}

      {/* Back Button */}
      <button
        type="button"
        onClick={handleBack}
        className="w-full flex items-center justify-center py-2 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {isOtpSent ? (t('common.back') || 'Back') : (t('login.backToEmail') || 'Back to Email Signup')}
      </button>
    </form>
  );
}
