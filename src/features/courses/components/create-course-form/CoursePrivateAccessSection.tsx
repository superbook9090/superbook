'use client';

import React, { useState } from 'react';
import { Copy, RefreshCw, Lock } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { TextField } from '@/components/ui/TextField';
import { generateInviteCode } from '@/lib/inviteCode';

interface CoursePrivateAccessSectionProps {
  isPrivateAccess: boolean;
  courseCode: string;
  privateOnly: boolean;
  blockedNotice: boolean;
  setBlockedNotice: (blocked: boolean) => void;
  onPrivateAccessChange: (checked: boolean, newCode?: string) => void;
  onCourseCodeChange: (code: string) => void;
}

export function CoursePrivateAccessSection({
  isPrivateAccess,
  courseCode,
  privateOnly,
  blockedNotice,
  setBlockedNotice,
  onPrivateAccessChange,
  onCourseCodeChange,
}: CoursePrivateAccessSectionProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleGenerateCode = () => {
    onCourseCodeChange(generateInviteCode(8));
  };

  const handleCopyCode = async () => {
    if (!courseCode) return;
    try {
      await navigator.clipboard.writeText(courseCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]/30 p-4 sm:p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
          <Lock className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div
            className="flex items-center py-1"
            onClick={privateOnly ? () => setBlockedNotice(true) : undefined}
          >
            <span className={privateOnly ? 'inline-flex cursor-not-allowed' : 'inline-flex'}>
              <input
                type="checkbox"
                id="isPrivateAccess"
                checked={isPrivateAccess}
                disabled={privateOnly}
                aria-describedby={privateOnly ? 'privateAccessLocked' : undefined}
                onChange={(e) => {
                  const checked = e.target.checked;
                  onPrivateAccessChange(
                    checked,
                    checked && !courseCode ? generateInviteCode(8) : courseCode
                  );
                }}
                className={`h-5 w-5 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] ${
                  privateOnly ? 'pointer-events-none opacity-70' : ''
                }`}
              />
            </span>
            <label
              htmlFor="isPrivateAccess"
              className={`ml-3 text-sm font-medium text-[var(--color-foreground)] ${
                privateOnly ? 'cursor-not-allowed' : ''
              }`}
            >
              {t('createCourseForm.privateAccess')}
            </label>
          </div>
          <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
            {t('createCourseForm.privateAccessDesc')}
          </p>
          {privateOnly && (
            <p
              id="privateAccessLocked"
              role="note"
              aria-live="polite"
              className={`mt-2 rounded-lg border px-3 py-2 text-xs transition-colors ${
                blockedNotice
                  ? 'border-[var(--color-error)] bg-[var(--color-error-light)] text-[var(--color-error)]'
                  : 'border-[var(--color-border)] bg-[var(--color-surface-muted)]/60 text-[var(--color-muted-foreground)]'
              }`}
            >
              {t('createCourseForm.publicCourseNotAllowed')}
            </p>
          )}
        </div>
      </div>

      {isPrivateAccess && (
        <div className="space-y-1.5 w-full">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <TextField
              label={t('createCourseForm.courseCode')}
              type="text"
              name="courseCode"
              id="courseCode"
              value={courseCode}
              onChange={(e) =>
                onCourseCodeChange(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))
              }
              maxLength={12}
              required={isPrivateAccess}
              className="font-mono uppercase tracking-widest"
              placeholder={t('createCourseForm.courseCodePlaceholder')}
              containerClassName="flex-1"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleGenerateCode}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--card-solid)] px-3 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)]"
              >
                <RefreshCw className="h-4 w-4" />
                {t('createCourseForm.generateCode')}
              </button>
              <button
                type="button"
                onClick={handleCopyCode}
                disabled={!courseCode}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--card-solid)] px-3 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] disabled:opacity-50"
              >
                <Copy className="h-4 w-4" />
                {copied ? t('createCourseForm.codeCopied') : t('createCourseForm.copyCode')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
