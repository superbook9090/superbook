'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Share2,
  Copy,
  Check,
  GraduationCap,
  Users,
  MessageCircle,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import Button from '@/components/ui/Button';

interface OrganizationInviteShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationName: string;
  inviteCode: string;
  teacherInviteCode?: string;
  logo?: string | null;
}

export function OrganizationInviteShareModal({
  isOpen,
  onClose,
  organizationName,
  inviteCode,
  teacherInviteCode,
  logo,
}: OrganizationInviteShareModalProps) {
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher'>('student');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const activeCode = selectedRole === 'teacher' ? (teacherInviteCode || inviteCode) : inviteCode;

  const inviteUrl = useMemo(() => {
    if (!activeCode) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.quizdo.in';
    return `${origin}/register?inviteCode=${encodeURIComponent(activeCode)}&role=${selectedRole}`;
  }, [activeCode, selectedRole]);

  const handleCopy = (text: string, key: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    const roleText = selectedRole === 'teacher' ? 'as a Teacher' : 'as a Student';
    const message = `Join ${organizationName} on Quiz-Do ${roleText}!\n\nUse this direct link to register (invite code is auto-prefilled):\n${inviteUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative z-10 w-full max-w-lg bg-[var(--card-solid)] border border-[var(--border)] rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-3 min-w-0">
              {logo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={logo}
                  alt={organizationName}
                  className="w-10 h-10 rounded-xl object-contain bg-[var(--color-surface)] p-1 border border-[var(--border)] shrink-0"
                />
              ) : (
                <div className="p-2.5 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] shrink-0">
                  <Share2 className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-[var(--color-foreground)] truncate">
                  {t('organizations.inviteMembers')}
                </h3>
                <p className="text-xs text-[var(--color-muted-foreground)] truncate">
                  {organizationName}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] rounded-lg hover:bg-[var(--color-surface-muted)] transition-colors"
              aria-label={t('common.close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] mb-2">
              {t('organizations.chooseInviteRole')}
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[var(--color-surface-muted)] rounded-xl border border-[var(--border)]">
              <button
                type="button"
                onClick={() => setSelectedRole('student')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  selectedRole === 'student'
                    ? 'bg-[var(--card-solid)] text-[var(--student-primary)] shadow-xs border border-[var(--border)]'
                    : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>{t('organizations.inviteStudents')}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('teacher')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  selectedRole === 'teacher'
                    ? 'bg-[var(--card-solid)] text-[var(--teacher-primary)] shadow-xs border border-[var(--border)]'
                    : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>{t('organizations.inviteTeachers')}</span>
              </button>
            </div>
          </div>

          {/* Direct Link Share Card */}
          <div className="space-y-2 p-3.5 rounded-xl border border-[var(--primary)]/25 bg-[var(--primary)]/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--color-foreground)]">
                {selectedRole === 'teacher'
                  ? t('organizations.teacherDirectLink')
                  : t('organizations.studentDirectLink')}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]">
                Auto-prefilled
              </span>
            </div>

            <div className="flex items-center gap-2 bg-[var(--card-solid)] p-2 rounded-lg border border-[var(--border)]">
              <span className="text-xs font-mono text-[var(--color-foreground)] truncate flex-1 select-all">
                {inviteUrl}
              </span>
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleCopy(inviteUrl, 'link')}
                className="shrink-0 flex items-center gap-1.5 text-xs py-1 px-3"
              >
                {copiedKey === 'link' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{t('common.copied')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t('common.copy')}</span>
                  </>
                )}
              </Button>
            </div>

            {/* WhatsApp Share Button */}
            <div className="pt-1 flex gap-2">
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold bg-[#25D366] text-white hover:opacity-95 active:scale-98 transition-all shadow-xs cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>{t('organizations.shareOnWhatsApp')}</span>
              </button>
            </div>
          </div>

          {/* Manual Invite Code Box */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--border)]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] block">
                {t('organizations.inviteCode')}
              </span>
              <span className="font-mono font-extrabold text-sm text-[var(--color-foreground)]">
                {activeCode}
              </span>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleCopy(activeCode, 'code')}
              className="flex items-center gap-1.5 text-xs"
            >
              {copiedKey === 'code' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{t('common.copied')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t('common.copy')}</span>
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default OrganizationInviteShareModal;
