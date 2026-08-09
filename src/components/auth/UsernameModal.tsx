'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { updateProfileName } from '@/lib/api/auth';
import { getCsrfToken } from 'next-auth/react';
import { useSessionStore } from '@/store/useSessionStore';
import { motion } from 'framer-motion';
import { TextField } from '@/components/ui/TextField';
import Button from '@/components/ui/Button';
import { Sparkles, User } from 'lucide-react';

interface UsernameModalProps {
  currentName: string;
  onClose: () => void;
}

export default function UsernameModal({ currentName, onClose }: UsernameModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(currentName === 'Phone User' ? '' : currentName);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('profile.nameRequired') || 'Name is required.');
      return;
    }

    setIsUpdating(true);
    setError('');

    try {
      // 1. Update name in the database
      await updateProfileName({ name: name.trim() });

      // 2. Request a NextAuth session update
      const csrfToken = await getCsrfToken();
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          csrfToken,
          data: {
            name: name.trim(),
          },
        }),
      });

      // 3. Force-fetch updated session to sync Zustand state
      await useSessionStore.getState().fetchSession(true);

      onClose();
    } catch (err) {
      console.error(err);
      setError(t('profile.nameUpdateError') || 'Failed to update name.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-[var(--card-solid)]/90 border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-[var(--shadow-lg)] backdrop-blur-md overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--color-primary)]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-soft)] flex items-center justify-center text-[var(--color-primary)]">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground)]">
            {t('profile.usernameModalTitle') || 'Set Username'}
          </h2>
        </div>

        <p className="text-sm text-[var(--color-muted-foreground)] mb-6">
          {t('profile.usernameModalDesc') || 'Please choose a display name for your account.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label={t('profile.usernameLabel') || 'Display Name'}
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            disabled={isUpdating}
            startIcon={<User className="w-5 h-5 text-[var(--color-muted)]" />}
            fullWidth
          />

          {error && (
            <p className="text-sm text-[var(--color-error)] mt-1">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isUpdating}
            >
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button
              type="submit"
              isLoading={isUpdating}
              disabled={isUpdating}
            >
              {t('common.save') || 'Save'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
