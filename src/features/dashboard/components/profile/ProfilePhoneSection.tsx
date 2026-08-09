'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/components/ui/AlertContainer';
import { useRouter } from 'next/navigation';
import { getCsrfToken } from 'next-auth/react';
import { useSessionStore } from '@/store/useSessionStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { TextField } from '@/components/ui/TextField';
import Button from '@/components/ui/Button';
import { getFirebaseAuth } from '@/lib/notifications/push/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
import { Session } from 'next-auth';

interface ProfilePhoneSectionProps {
  session: Session;
}

export default function ProfilePhoneSection({ session }: ProfilePhoneSectionProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { addAlert } = useAlert();
  const enablePhoneAuth = useSettingsStore(
    (s) => s.settings.featureToggles.enablePhoneAuth ?? true
  );

  const [phoneVal, setPhoneVal] = useState('');
  const [otpVal, setOtpVal] = useState('');
  const [isLinkingPhone, setIsLinkingPhone] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);

  const setupPhoneRecaptcha = () => {
    try {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error('Firebase Auth not available');

      if (window.phoneRecaptchaVerifier) {
        try {
          window.phoneRecaptchaVerifier.clear();
        } catch {
          console.warn('Error clearing recaptcha verifier');
        }
      }

      const container = document.getElementById('phone-recaptcha-container');
      if (!container) {
        console.error('No phone-recaptcha-container element found');
        return null;
      }

      window.phoneRecaptchaVerifier = new RecaptchaVerifier(
        auth,
        'phone-recaptcha-container',
        {
          size: 'invisible',
          callback: () => { },
          'expired-callback': () => { }
        }
      );
      return window.phoneRecaptchaVerifier;
    } catch (err) {
      console.error('Error setting up recaptcha', err);
      return null;
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPhoneLoading(true);

    try {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error('Firebase Auth not available');

      let verifier = window.phoneRecaptchaVerifier;
      if (!verifier) {
        verifier = setupPhoneRecaptcha();
      }
      if (!verifier) {
        throw new Error('Failed to initialize recaptcha');
      }

      let formattedPhone = phoneVal.trim();
      if (!formattedPhone.startsWith('+')) {
        if (formattedPhone.length === 10) {
          formattedPhone = '+91' + formattedPhone;
        } else {
          addAlert({ type: 'error', message: t('login.invalidPhone') || 'Please enter phone number with country code (e.g. +91...)' });
          setIsPhoneLoading(false);
          return;
        }
      }

      const confirmResult = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      setConfirmationResult(confirmResult);
      setIsOtpSent(true);
      addAlert({ type: 'success', message: 'Verification code sent successfully.' });
    } catch (err) {
      console.error('Error sending OTP:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      addAlert({ type: 'error', message: errMsg || t('login.genericError') || 'Failed to send OTP. Please try again.' });
      if (window.phoneRecaptchaVerifier) {
        try {
          window.phoneRecaptchaVerifier.clear();
          window.phoneRecaptchaVerifier = null;
        } catch { }
      }
    } finally {
      setIsPhoneLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPhoneLoading(true);

    try {
      if (!confirmationResult) {
        throw new Error('No confirmation result');
      }

      const userCredential = await confirmationResult.confirm(otpVal.trim());
      const idToken = await userCredential.user.getIdToken();

      const response = await fetch('/api/auth/add-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firebaseIdToken: idToken }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || t('profile.phoneAlreadyExists') || 'Failed to link phone number.');
      }

      const csrfToken = await getCsrfToken();
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          csrfToken,
          data: {
            phone: data.phone,
          },
        }),
      });

      await useSessionStore.getState().fetchSession(true);
      router.refresh();

      addAlert({ type: 'success', message: t('profile.phoneLinkedSuccess') || 'Phone number linked successfully.' });
      setIsLinkingPhone(false);
      setIsOtpSent(false);
      setPhoneVal('');
      setOtpVal('');
    } catch (err) {
      console.error('Error linking phone:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      addAlert({ type: 'error', message: errMsg || t('login.invalidOtp') || 'Invalid verification code.' });
    } finally {
      setIsPhoneLoading(false);
    }
  };

  const handleCancelPhoneFlow = () => {
    setIsLinkingPhone(false);
    setIsOtpSent(false);
    setPhoneVal('');
    setOtpVal('');
    if (window.phoneRecaptchaVerifier) {
      try {
        window.phoneRecaptchaVerifier.clear();
        window.phoneRecaptchaVerifier = null;
      } catch { }
    }
  };

  if (!enablePhoneAuth && !session.user?.phone) {
    return null;
  }

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-muted-foreground)]">{t('profile.phone') || 'Phone Number'}</label>
      {session.user?.phone ? (
        <p className="mt-1 text-sm sm:text-base text-[var(--color-foreground)] break-words">
          {session.user.phone}
        </p>
      ) : isLinkingPhone ? (
        <form onSubmit={isOtpSent ? handleVerifyOtp : handleSendOtp} className="mt-2 space-y-3 max-w-md">
          {!isOtpSent ? (
            <div className="space-y-3">
              <TextField
                aria-label={t('login.enterPhone') || 'Phone Number'}
                value={phoneVal}
                onChange={(e) => setPhoneVal(e.target.value)}
                placeholder="+919999999999"
                required
                disabled={isPhoneLoading}
                fullWidth
              />
              <div id="phone-recaptcha-container" className="my-2"></div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isPhoneLoading}
                  isLoading={isPhoneLoading}
                  size="md"
                >
                  {t('login.sendOtp') || 'Send Code'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancelPhoneFlow}
                  disabled={isPhoneLoading}
                  size="md"
                >
                  {t('common.cancel') || 'Cancel'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-[var(--color-muted-foreground)]">
                {t('login.otpSent', { phone: phoneVal })}
              </p>
              <TextField
                aria-label={t('login.enterOtp') || 'Verification Code'}
                value={otpVal}
                onChange={(e) => setOtpVal(e.target.value)}
                placeholder="123456"
                required
                disabled={isPhoneLoading}
                fullWidth
              />
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isPhoneLoading}
                  isLoading={isPhoneLoading}
                  size="md"
                >
                  {t('login.verifyOtp') || 'Verify Code'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsOtpSent(false)}
                  disabled={isPhoneLoading}
                  size="md"
                >
                  {t('common.back') || 'Back'}
                </Button>
              </div>
            </div>
          )}
        </form>
      ) : (
        <div className="mt-1 flex items-center justify-between gap-4">
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] italic">
            {t('profile.phoneNotLinked') || 'No phone number linked'}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsLinkingPhone(true);
            }}
          >
            {t('profile.addPhone') || 'Link Phone Number'}
          </Button>
        </div>
      )}
    </div>
  );
}
