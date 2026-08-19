'use client';

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
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.99 }}
      className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-[var(--card-solid)] border border-[var(--color-border)] rounded-xl hover:border-[var(--color-muted)] hover:bg-[var(--color-surface-muted)] transition-all text-sm font-semibold text-[var(--color-foreground)] shadow-sm min-h-[44px] cursor-pointer"
    >
      <Phone className="w-4 h-4 text-[var(--color-muted)] shrink-0" />
      <span>{t('login.continueWithPhone') || 'Continue with Phone'}</span>
    </motion.button>
  );
}
