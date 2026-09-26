'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, X, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import Tooltip from '@/components/ui/Tooltip';
import Button from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { sendAdminUserEmail } from '@/lib/api/adminUsers';
import { ApiClientError } from '@/lib/api/http';
import { useAlert } from '@/components/ui/AlertContainer';
import type { User } from './types';

interface SendEmailModalProps {
  user: User;
  onClose: () => void;
}

export function SendEmailModal({ user, onClose }: SendEmailModalProps) {
  const { t } = useTranslation();
  const { addAlert } = useAlert();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setError(t('adminUsers.emailSubject') + ' is required');
      return;
    }
    if (!message.trim()) {
      setError(t('adminUsers.emailMessage') + ' is required');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      await sendAdminUserEmail(user._id, {
        subject: subject.trim(),
        message: message.trim(),
      });
      addAlert({
        type: 'success',
        message: t('adminUsers.emailSentSuccess'),
      });
      onClose();
    } catch (err) {
      const errorMsg =
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
          ? err.message
          : t('adminUsers.failedSendEmail');
      setError(errorMsg);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-3 sm:p-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 15 }}
        className="bg-[var(--card-solid)] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[min(90vh,calc(100dvh-1.5rem))] sm:max-h-[min(88dvh,750px)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className="p-4 sm:p-6 border-b border-[var(--border)] bg-[var(--color-surface-muted)]/40 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] shrink-0 shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-[var(--color-foreground)] truncate">
                {t('adminUsers.sendDirectEmail')}
              </h3>
              <p className="text-xs text-[var(--color-muted-foreground)] truncate">
                To: <span className="font-semibold text-[var(--color-foreground)]">{user.name}</span> ({user.email})
              </p>
            </div>
          </div>

          <Tooltip label={t('common.close')} position="bottom">
            <button
              onClick={onClose}
              aria-label={t('common.close')}
              className="p-2 hover:bg-[var(--color-surface-muted)] rounded-xl transition-colors text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] shrink-0 min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </Tooltip>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSend} className="p-4 sm:p-6 flex flex-col gap-4 overflow-y-auto flex-1 min-h-0 overscroll-contain">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--error-light)] text-[var(--error)] text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <TextField
            label={t('adminUsers.emailSubject')}
            type="text"
            required
            placeholder={t('adminUsers.emailSubjectPlaceholder')}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isSending}
            fullWidth
          />

          <TextField
            label={t('adminUsers.emailMessage')}
            multiline
            rows={4}
            required
            placeholder={t('adminUsers.emailMessagePlaceholder')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSending}
            fullWidth
          />

          <p className="text-[11px] text-[var(--color-muted)]">
            {t('adminUsers.directEmailDesc')}
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)] mt-auto">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              size="md"
              disabled={isSending}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSending}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSending ? t('adminUsers.sendingEmail') : t('adminUsers.sendEmail')}</span>
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
