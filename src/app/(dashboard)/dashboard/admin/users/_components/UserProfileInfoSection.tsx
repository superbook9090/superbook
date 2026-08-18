'use client';

import React, { useState } from 'react';
import {
  Mail,
  Phone,
  Calendar,
  KeyRound,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Building2,
  UserCheck,
  Send,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDateTime } from '@/lib/dateUtils';
import Tooltip from '@/components/ui/Tooltip';
import Button from '@/components/ui/Button';
import type { User } from './types';

interface UserProfileInfoSectionProps {
  user: User;
  organizations: Array<{ _id: string; name: string }>;
  onSendEmailClick?: () => void;
}

export function UserProfileInfoSection({
  user,
  organizations,
  onSendEmailClick,
}: UserProfileInfoSectionProps) {
  const { t } = useTranslation();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyValue = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const orgName = organizations.find((org) => org._id === user.organizationId)?.name;

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--color-surface-muted)]/40 border border-[var(--border)]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
          <UserCheck className="w-3.5 h-3.5 text-[var(--info)]" />
          <span>{t('adminUsers.overview') || 'User Details & Contact Info'}</span>
        </div>

        {onSendEmailClick && (
          <Button
            onClick={onSendEmailClick}
            variant="primary"
            size="sm"
            className="flex items-center gap-1.5 py-1 px-3 text-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t('adminUsers.sendEmail') || 'Send Email'}</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Email */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--card-solid)] border border-[var(--border)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-[var(--info-light)] text-[var(--info)] shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-[var(--color-muted-foreground)] uppercase">
                {t('common.email') || 'Email Address'}
              </p>
              <a
                href={`mailto:${user.email}`}
                className="text-xs sm:text-sm font-bold text-[var(--color-foreground)] hover:text-[var(--primary)] transition-colors truncate block"
                title={user.email}
              >
                {user.email}
              </a>
            </div>
          </div>
          <Tooltip label={copiedKey === 'email' ? t('common.copied') || 'Copied!' : t('common.copy') || 'Copy'}>
            <button
              onClick={() => copyValue('email', user.email)}
              className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] transition-colors shrink-0"
              aria-label="Copy Email"
            >
              {copiedKey === 'email' ? <Check className="w-4 h-4 text-[var(--success)]" /> : <Copy className="w-4 h-4" />}
            </button>
          </Tooltip>
        </div>

        {/* Phone */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--card-solid)] border border-[var(--border)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-[var(--success-light)] text-[var(--success)] shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-[var(--color-muted-foreground)] uppercase">
                {t('common.phone') || 'Phone Number'}
              </p>
              {user.phone ? (
                <a
                  href={`tel:${user.phone}`}
                  className="text-xs sm:text-sm font-bold text-[var(--color-foreground)] hover:text-[var(--primary)] transition-colors truncate block"
                >
                  {user.phone}
                </a>
              ) : (
                <span className="text-xs text-[var(--color-muted)] italic">
                  {t('common.notProvided') || 'Not provided'}
                </span>
              )}
            </div>
          </div>
          {user.phone && (
            <Tooltip label={copiedKey === 'phone' ? t('common.copied') || 'Copied!' : t('common.copy') || 'Copy'}>
              <button
                onClick={() => copyValue('phone', user.phone!)}
                className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] transition-colors shrink-0"
                aria-label="Copy Phone"
              >
                {copiedKey === 'phone' ? <Check className="w-4 h-4 text-[var(--success)]" /> : <Copy className="w-4 h-4" />}
              </button>
            </Tooltip>
          )}
        </div>

        {/* Joined Date & Time */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--card-solid)] border border-[var(--border)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-[var(--student-soft)] text-[var(--student-primary)] shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-[var(--color-muted-foreground)] uppercase">
                {t('admin.joined') || 'Registration Date & Time'}
              </p>
              <p className="text-xs sm:text-sm font-bold text-[var(--color-foreground)] truncate">
                {formatDateTime(user.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Auth Provider & Verification */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--card-solid)] border border-[var(--border)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-[var(--warning-light)] text-[var(--warning)] shrink-0">
              <KeyRound className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-[var(--color-muted-foreground)] uppercase">
                {t('adminUsers.authProvider') || 'Auth & Verification'}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs sm:text-sm font-bold text-[var(--color-foreground)] capitalize">
                  {user.provider || 'credentials'}
                </span>
                {user.isVerified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--success)]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-muted)]">
                    <XCircle className="w-3.5 h-3.5" />
                    Unverified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Organization if assigned */}
        {orgName && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--card-solid)] border border-[var(--border)] col-span-1 sm:col-span-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-lg bg-[var(--info-light)] text-[var(--info)] shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-[var(--color-muted-foreground)] uppercase">
                  {t('adminUsers.organization') || 'Assigned Organization'}
                </p>
                <p className="text-xs sm:text-sm font-bold text-[var(--color-foreground)] truncate">
                  {orgName}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
