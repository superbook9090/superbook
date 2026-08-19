'use client';

import React from 'react';
import type { Session as NextAuthSession } from 'next-auth';
import type { Session } from '@/types';
import { User, GraduationCap, BookOpen, Shield } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { normalizeRole, isSuperAdmin } from '@/lib/roles';
import { PageWrapper, PageHeader } from '@/components/layout';

import { useProfile } from './profile/useProfile';
import { ProfileHero } from './profile/ProfileHero';
import { ProfileTabsNav } from './profile/ProfileTabsNav';
import { ProfilePersonalInfoTab } from './profile/ProfilePersonalInfoTab';
import { ProfileSecurityTab } from './profile/ProfileSecurityTab';

interface ProfileProps {
  session: NextAuthSession | Session;
  descriptionKey?: 'manageAccount' | 'teacherProfileDesc' | 'studentProfileDesc' | 'adminProfileDesc';
}

export default function Profile({ session, descriptionKey }: ProfileProps) {
  const { t } = useTranslation();
  const normalizedSession = session as unknown as Session;
  const rawRole = normalizedSession?.user?.role;
  const role = normalizeRole(rawRole);
  const superAdmin = isSuperAdmin(rawRole);

  const profileState = useProfile(normalizedSession);

  const {
    accountInfo,
    activeTab,
    setActiveTab,
  } = profileState;

  const pageDescription = (() => {
    if (descriptionKey) return t(`profile.${descriptionKey}`);
    if (superAdmin || role === 'admin') return t('profile.adminProfileDesc') || 'Manage administrative credentials and permissions.';
    if (role === 'teacher') return t('profile.teacherProfileDesc') || 'Manage educator settings and courseware preferences.';
    return t('profile.studentProfileDesc') || 'Manage your student profile, security settings, and learning preferences.';
  })();

  const RoleHeaderIcon = (() => {
    if (superAdmin || role === 'admin') return Shield;
    if (role === 'teacher') return BookOpen;
    if (role === 'student') return GraduationCap;
    return User;
  })();

  return (
    <PageWrapper className="w-full stack-page">
      {/* Page Header */}
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <span className="p-2.5 bg-[var(--primary-soft)] text-[var(--primary)] rounded-xl shrink-0 inline-flex shadow-xs">
              <RoleHeaderIcon className="w-6 h-6" />
            </span>
            <span>{t('profile.myProfile') || 'My Profile'}</span>
          </span>
        }
        description={pageDescription}
      />

      {/* Hero Banner */}
      <ProfileHero
        session={normalizedSession}
        accountInfo={accountInfo}
      />

      {/* Tab Navigation */}
      <ProfileTabsNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content Panels */}
      <div className="pt-1">
        {activeTab === 'account' && (
          <ProfilePersonalInfoTab session={normalizedSession} accountInfo={accountInfo} />
        )}
        {activeTab === 'security' && (
          <ProfileSecurityTab
            session={normalizedSession}
            accountInfo={accountInfo}
          />
        )}
      </div>
    </PageWrapper>
  );
}
