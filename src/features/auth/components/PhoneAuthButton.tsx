import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useSettingsStore } from '@/store/useSettingsStore';
import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';

interface PhoneAuthButtonProps {
  onClick: () => void;
}

export default function PhoneAuthButton({ onClick }: PhoneAuthButtonProps) {
  const { t } = useTranslation();
  const enablePhoneAuth = useSettingsStore(
    (s) => s.settings.featureToggles.enablePhoneAuth ?? true
  );

  if (!enablePhoneAuth) return null;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="mt-3 w-full flex items-center justify-center py-3.5 px-4 bg-[var(--card-solid)] border-2 border-[var(--color-border)] rounded-xl hover:border-[var(--color-muted)] hover:bg-[var(--color-surface-muted)] transition-all text-sm font-medium"
    >
      <Phone className="w-5 h-5 mr-3 text-[var(--color-muted)]" />
      <span className="font-medium text-[var(--color-foreground)]">
        {t('login.continueWithPhone') || 'Continue with Phone'}
      </span>
    </motion.button>
  );
}
