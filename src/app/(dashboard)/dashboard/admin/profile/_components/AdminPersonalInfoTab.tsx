'use client';

import React from 'react';
import type { Session } from '@/types';
import type { Session as NextAuthSession } from 'next-auth';
import { User, Shield, Building2, Fingerprint } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { isSuperAdmin } from '@/lib/roles';
import ProfileNameSection from '@/features/dashboard/components/profile/ProfileNameSection';
import ProfileEmailSection from '@/features/dashboard/components/profile/ProfileEmailSection';
import ProfilePhoneSection from '@/features/dashboard/components/profile/ProfilePhoneSection';
import ProfileOrganizationSection from '@/features/dashboard/components/profile/ProfileOrganizationSection';
import type { AccountInfo } from '@/lib/api/auth';

interface AdminPersonalInfoTabProps {
  session: Session;
  accountInfo: AccountInfo | null;
}

export function AdminPersonalInfoTab({ session, accountInfo }: AdminPersonalInfoTabProps) {
  const { t } = useTranslation();
  const superAdmin = isSuperAdmin(session.user?.role);
  const nextAuthSession = session as unknown as NextAuthSession;

  return (
    <div className="space-y-6">
      {/* Identity & Contact Card */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-solid)] shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-[var(--border)] bg-[var(--color-surface-muted)]/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-[var(--color-foreground)]">
                {t('adminProfile.personalInfoTitle') || 'Personal & Administrative Details'}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
                {t('adminProfile.personalInfoDesc') || 'Your primary profile identification across the administrative console.'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
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

      {/* Authority Meta Card */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-solid)] p-4 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Fingerprint className="w-4 h-4 text-[var(--primary)]" />
          <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
            {t('adminProfile.roleLabel') || 'Administrative Identity Parameters'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="p-3 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--border)] flex items-center gap-3">
            <Shield className="w-4 h-4 text-indigo-500 shrink-0" />
            <div>
              <p className="text-[11px] text-[var(--color-muted-foreground)]">Assigned Role</p>
              <p className="font-semibold text-[var(--color-foreground)] capitalize">
                {superAdmin ? 'Super Administrator' : 'Administrator'}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--border)] flex items-center gap-3">
            <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
            <div>
              <p className="text-[11px] text-[var(--color-muted-foreground)]">Organization ID</p>
              <p className="font-mono text-xs font-medium text-[var(--color-foreground)] truncate">
                {session.user?.organizationId || 'Global / Unrestricted'}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--border)] flex items-center gap-3">
            <Fingerprint className="w-4 h-4 text-emerald-500 shrink-0" />
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
