'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { isAdmin, getDashboardHomePath } from '@/lib/roles';
import { PageWrapper, PageHeader } from '@/components/layout';
import { PageSkeleton } from '@/components/ui/Skeleton';

import { useAdminProfile } from './_hooks/useAdminProfile';
import { AdminProfileHero } from './_components/AdminProfileHero';
import { AdminProfileStats } from './_components/AdminProfileStats';
import { AdminProfileTabs } from './_components/AdminProfileTabs';
import { AdminPersonalInfoTab } from './_components/AdminPersonalInfoTab';
import { AdminSecurityTab } from './_components/AdminSecurityTab';
import { AdminPermissionsCard } from './_components/AdminPermissionsCard';
import { AdminShortcutsTab } from './_components/AdminShortcutsTab';

export default function AdminProfilePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, status } = useSessionStore();

  const profileState = useAdminProfile(session);

  if (status === 'loading' || !session) {
    return <PageSkeleton />;
  }

  if (!isAdmin(session.user?.role)) {
    router.replace(getDashboardHomePath(session.user?.role));
    return <PageSkeleton />;
  }

  const {
    accountInfo,
    activeTab,
    setActiveTab,
    showPasswordModal,
    setShowPasswordModal,
    copiedId,
    handleCopyId,
  } = profileState;

  return (
    <PageWrapper className="max-w-6xl space-y-6">
      {/* Page Header */}
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <span className="p-2.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl shrink-0 inline-flex shadow-xs">
              <Shield className="w-6 h-6" />
            </span>
            <span>{t('adminProfile.title') || 'Admin Profile & Security'}</span>
          </span>
        }
        description={
          t('adminProfile.description') ||
          'Manage your administrative identity, credentials, permissions, and security settings.'
        }
      />

      {/* Hero Banner */}
      <AdminProfileHero
        session={session}
        accountInfo={accountInfo}
        copiedId={copiedId}
        onCopyId={handleCopyId}
        onSelectTab={setActiveTab}
        onOpenPassword={() => setShowPasswordModal(true)}
      />

      {/* Stats & Authority Overview */}
      <AdminProfileStats session={session} accountInfo={accountInfo} />

      {/* Navigation Tabs */}
      <AdminProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Panels */}
      <div className="pt-1">
        {activeTab === 'account' && (
          <AdminPersonalInfoTab session={session} accountInfo={accountInfo} />
        )}
        {activeTab === 'security' && (
          <AdminSecurityTab
            session={session}
            accountInfo={accountInfo}
            showPasswordFormDefault={showPasswordModal}
          />
        )}
        {activeTab === 'permissions' && <AdminPermissionsCard session={session} />}
        {activeTab === 'shortcuts' && <AdminShortcutsTab session={session} />}
      </div>
    </PageWrapper>
  );
}
