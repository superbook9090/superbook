'use client';

import React from 'react';
import type { Session } from '@/types';
import type { Session as NextAuthSession } from 'next-auth';
import { User, Shield, Building2, Fingerprint } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { normalizeRole, isSuperAdmin } from '@/lib/roles';
import ProfileNameSection from './ProfileNameSection';
import ProfileEmailSection from './ProfileEmailSection';
import ProfilePhoneSection from './ProfilePhoneSection';
import ProfileOrganizationSection from './ProfileOrganizationSection';
import type { AccountInfo } from '@/lib/api/auth';

interface ProfilePersonalInfoTabProps {
  session: Session;
  accountInfo: AccountInfo | null;
}

export function ProfilePersonalInfoTab({ session, accountInfo }: ProfilePersonalInfoTabProps) {
  const { t } = useTranslation();
  const rawRole = session.user?.role;
  const role = normalizeRole(rawRole);
  const superAdmin = isSuperAdmin(rawRole);
  const nextAuthSession = session as unknown as NextAuthSession;

  const roleTitle = (() => {
    if (superAdmin) return 'Super Administrator';
    if (role === 'admin') return 'Administrator';
    if (role === 'teacher') return 'Educator / Teacher';
    return 'Student Learner';
  })();

  return (
    <div className="space-y-6">
      {/* Identity & Contact Card */}
      <div className="card-panel">
        <div className="card-panel-header bg-[var(--surface-muted)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-[var(--color-foreground)]">
                {t('profile.personalInfoTitle') || 'Personal & Contact Details'}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
                {t('profile.personalInfoDesc') || 'Your primary profile identification across the learning portal.'}
              </p>
            </div>
          </div>
        </div>

        <div className="card-panel-body space-y-4 sm:space-y-5">
          {/* Name */}
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card-solid)]">
            <ProfileNameSection session={nextAuthSession} />
          </div>

          {/* Email */}
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card-solid)]">
            <ProfileEmailSection session={nextAuthSession} />
          </div>

          {/* Phone */}
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card-solid)]">
            <ProfilePhoneSection session={nextAuthSession} />
          </div>

          {/* Organization */}
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card-solid)]">
            <ProfileOrganizationSection session={nextAuthSession} />
          </div>
        </div>
      </div>

      {/* Authority & Account Parameters */}
      <div className="card-surface card-body">
        <div className="flex items-center gap-2 mb-4">
          <Fingerprint className="w-4 h-4 text-[var(--primary)]" />
          <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
            {t('profile.role') || 'Account Identity Parameters'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="p-3 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--border)] flex items-center gap-3">
            <Shield className="w-4 h-4 text-[var(--primary)] shrink-0" />
            <div>
              <p className="text-[11px] text-[var(--color-muted-foreground)]">Assigned Role</p>
              <p className="font-semibold text-[var(--color-foreground)] capitalize">
                {roleTitle}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--border)] flex items-center gap-3">
            <Building2 className="w-4 h-4 text-[var(--info)] shrink-0" />
            <div>
              <p className="text-[11px] text-[var(--color-muted-foreground)]">Organization ID</p>
              <p className="font-mono text-xs font-medium text-[var(--color-foreground)] truncate">
                {session.user?.organizationId || 'Independent / Unlinked'}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--border)] flex items-center gap-3">
            <Fingerprint className="w-4 h-4 text-[var(--success)] shrink-0" />
            <div>
              <p className="text-[11px] text-[var(--color-muted-foreground)]">Auth Provider</p>
              <p className="font-semibold text-[var(--color-foreground)] capitalize">
                {accountInfo?.provider || 'Credentials'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
