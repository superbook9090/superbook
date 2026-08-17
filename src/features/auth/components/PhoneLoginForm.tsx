'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useSessionStore } from '@/store/useSessionStore';
import { getFirebaseAuth } from '@/lib/notifications/push/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Phone, ShieldCheck, Edit2 } from 'lucide-react';

import { Loader } from '@/components/ui/Loader';
import { useAlert } from '@/components/ui/AlertContainer';

interface PhoneLoginFormProps {
  theme: {
    gradient: string;
    shadow: string;
  };
  callbackUrl: string;
  onBackToEmail: () => void;
}

export default function PhoneLoginForm({ theme, callbackUrl, onBackToEmail }: PhoneLoginFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchSession } = useSessionStore();

  const [phoneNumber, setPhoneNumber] = useState(searchParams.get('phone') || '');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const { addAlert } = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOtpSent && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [isOtpSent]);

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
    if (phoneNumber.length < 10) {
      addAlert({ type: 'error', message: 'Please enter a valid 10-digit number.' });
      return;
    }
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
    if (otpCode.length < 6) return;
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
      });

      if (result?.error) {
        addAlert({ type: 'error', message: t('login.invalidOtp') || 'Invalid code. Please try again.' });
        setIsLoading(false);
        return;
      }

      await fetchSession(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push(callbackUrl);
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
    <form onSubmit={isOtpSent ? handleVerifyOtp : handleSendOtp} className="flex flex-col gap-5 sm:gap-6 w-full max-w-sm mx-auto">
      <AnimatePresence mode="wait">
        {!isOtpSent ? (
          <motion.div
            key="phone-step"
            initial={{ opacity: 0, x: -10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: 10, filter: 'blur(4px)' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-[var(--color-foreground)] mb-1.5 ml-1">
                {t('login.enterPhone') || 'Phone Number'}
              </label>

              <div className="relative flex items-center min-h-[50px] sm:min-h-[56px] w-full rounded-2xl bg-[var(--color-surface)] border-2 border-[var(--color-border)] focus-within:border-[var(--color-primary)] focus-within:shadow-[0_0_0_3px_var(--color-primary)]/10 transition-all overflow-hidden group">
                <div className="flex items-center pl-3.5 pr-2.5 h-full bg-[var(--color-surface-muted)] group-focus-within:bg-[var(--color-primary)]/5 transition-colors border-r border-[var(--color-border)]">
                  <span className="text-lg mr-1.5 select-none" role="img" aria-label="India flag">🇮🇳</span>
                  <span className="font-semibold text-[var(--color-foreground)] text-sm sm:text-base">+91</span>
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Mobile number"
                  className="flex-1 bg-transparent px-3.5 py-3 text-base sm:text-lg font-bold tracking-wide text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)]/50 focus:outline-none w-full"
                />
              </div>
            </div>

            <div id="recaptcha-container" className="absolute opacity-0 pointer-events-none -z-10"></div>

            <motion.button
              type="submit"
              disabled={isLoading || phoneNumber.length < 10}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center justify-center min-h-[48px] sm:min-h-[52px] px-5 bg-gradient-to-r ${theme.gradient} text-white text-sm sm:text-base font-bold rounded-xl shadow-md ${theme.shadow} hover:shadow-lg hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all mt-1`}
            >
              {isLoading ? (
                <Loader size="sm" className="text-white" />
              ) : (
                <>
                  {t('login.sendOtp') || 'Continue'}
                  <ArrowRight className="w-4 h-4 ml-2 opacity-90" />
                </>
              )}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="otp-step"
            initial={{ opacity: 0, x: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -10, filter: 'blur(4px)' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1.5 ml-1 mr-1">
                <label className="text-sm font-semibold text-[var(--color-foreground)]">
                  {t('login.enterOtp') || 'Verification Code'}
                </label>
                <button 
                  type="button" 
                  onClick={handleBack}
                  className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  +91 {phoneNumber}
                </button>
              </div>
            </div>

            <div className="relative flex justify-between gap-1.5 sm:gap-2 my-1">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <div
                  key={index}
                  className={`
                    flex-1 aspect-[4/5] sm:h-14 flex items-center justify-center rounded-xl text-lg sm:text-xl font-bold transition-all border-2
                    ${
                      otpCode.length === index
                        ? 'border-[var(--color-primary)] shadow-[0_0_0_3px_var(--color-primary)]/10 bg-[var(--color-surface)]'
                        : otpCode.length > index
                        ? 'border-[var(--color-primary)]/40 bg-[var(--color-primary)]/5 text-[var(--color-foreground)]'
                        : 'border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]'
                    }
                  `}
                >
                  {otpCode[index] || ''}
                </div>
              ))}
              <input
                ref={otpInputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10"
                autoComplete="one-time-code"
              />
            </div>

            <motion.button
              type="submit"
              disabled={isLoading || otpCode.length < 6}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center justify-center min-h-[48px] sm:min-h-[52px] px-5 bg-gradient-to-r ${theme.gradient} text-white text-sm sm:text-base font-bold rounded-xl shadow-md ${theme.shadow} hover:shadow-lg hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all mt-1`}
            >
              {isLoading ? (
                <Loader size="sm" className="text-white" />
              ) : (
                <>
                  {t('login.verifyOtp') || 'Verify & Login'}
                  <ArrowRight className="w-4 h-4 ml-2 opacity-90" />
                </>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={handleBack}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center min-h-[44px] sm:min-h-[48px] bg-transparent border-2 border-[var(--color-border)] rounded-xl text-xs sm:text-sm font-semibold text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:border-[var(--color-muted)] hover:bg-[var(--color-surface-muted)] transition-all mt-1"
      >
        <ArrowLeft className="w-4 h-4 mr-2 opacity-70" />
        {isOtpSent ? (t('common.back') || 'Back to Phone Number') : (t('login.backToEmail') || 'Back to Email Login')}
      </motion.button>
    </form>
  );
}

