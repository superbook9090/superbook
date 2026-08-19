'use client';

import React from 'react';
import type { Session } from '@/types';
import type { Session as NextAuthSession } from 'next-auth';
import { User } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import ProfileNameSection from './ProfileNameSection';
import ProfileEmailSection from './ProfileEmailSection';
import ProfilePhoneSection from './ProfilePhoneSection';
import ProfileOrganizationSection from './ProfileOrganizationSection';
import type { AccountInfo } from '@/lib/api/auth';

interface ProfilePersonalInfoTabProps {
  session: Session;
  accountInfo?: AccountInfo | null;
}

export function ProfilePersonalInfoTab({ session }: ProfilePersonalInfoTabProps) {
  const { t } = useTranslation();
  const nextAuthSession = session as unknown as NextAuthSession;

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

        <div className="card-panel-body grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
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
    </div>
  );
}
