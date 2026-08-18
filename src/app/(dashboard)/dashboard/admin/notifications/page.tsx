'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { isAdmin, isSuperAdmin } from '@/lib/roles';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { PageWrapper } from '@/components/layout';
import { useAdminNotifications } from './_hooks/useAdminNotifications';
import { NotificationHero } from './_components/NotificationHero';
import { NotificationStats } from './_components/NotificationStats';
import { NotificationComposer } from './_components/NotificationComposer';
import { NotificationPreview } from './_components/NotificationPreview';
import { NotificationTemplates } from './_components/NotificationTemplates';
import { NotificationHistory } from './_components/NotificationHistory';

export default function AdminNotificationsPage() {
  const router = useRouter();
  const {
    session,
    status,
    activeTab,
    setActiveTab,
    previewDevice,
    setPreviewDevice,
    previewLang,
    setPreviewLang,
    categoryFilter,
    setCategoryFilter,
    titleEn,
    setTitleEn,
    titleHi,
    setTitleHi,
    bodyEn,
    setBodyEn,
    bodyHi,
    setBodyHi,
    category,
    setCategory,
    targetAudience,
    setTargetAudience,
    targetCourseId,
    setTargetCourseId,
    organizationId,
    setOrganizationId,
    deepLink,
    setDeepLink,
    isSending,
    isLoadingStats,
    isRefreshing,
    statsData,
    lastUpdated,
    handleRefresh,
    applyTemplate,
    duplicateBroadcast,
    handleSend,
  } = useAdminNotifications();

  const role = session?.user?.role;
  const canAccess = isAdmin(role);
  const isSuper = isSuperAdmin(role);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push(ROUTES.login);
      return;
    }
    if (!canAccess) {
      router.push(ROUTES.dashboard);
    }
  }, [status, session, router, canAccess]);

  if (status === 'loading' || (isLoadingStats && !statsData)) {
    return <PageSkeleton />;
  }

  if (!canAccess) {
    return null;
  }

  return (
    <PageWrapper className="overflow-x-hidden space-y-6">
      <NotificationHero
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
      />

      <NotificationStats statsData={statsData} isSuperAdmin={isSuper} />

      {activeTab === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            <NotificationComposer
              titleEn={titleEn}
              setTitleEn={setTitleEn}
              titleHi={titleHi}
              setTitleHi={setTitleHi}
              bodyEn={bodyEn}
              setBodyEn={setBodyEn}
              bodyHi={bodyHi}
              setBodyHi={setBodyHi}
              category={category}
              setCategory={setCategory}
              targetAudience={targetAudience}
              setTargetAudience={setTargetAudience}
              targetCourseId={targetCourseId}
              setTargetCourseId={setTargetCourseId}
              organizationId={organizationId}
              setOrganizationId={setOrganizationId}
              deepLink={deepLink}
              setDeepLink={setDeepLink}
              isSending={isSending}
              isSuperAdmin={isSuper}
              organizations={statsData?.organizations || []}
              courses={statsData?.courses || []}
              onSend={handleSend}
            />
          </div>
          <div className="lg:col-span-5 sticky top-20">
            <NotificationPreview
              titleEn={titleEn}
              titleHi={titleHi}
              bodyEn={bodyEn}
              bodyHi={bodyHi}
              category={category}
              targetAudience={targetAudience}
              deepLink={deepLink}
              previewDevice={previewDevice}
              setPreviewDevice={setPreviewDevice}
              previewLang={previewLang}
              setPreviewLang={setPreviewLang}
            />
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <NotificationTemplates onApplyTemplate={applyTemplate} />
      )}

      {activeTab === 'history' && (
        <NotificationHistory
          broadcasts={statsData?.recentBroadcasts || []}
          selectedCategory={categoryFilter}
          onCategoryChange={setCategoryFilter}
          onDuplicate={duplicateBroadcast}
        />
      )}
    </PageWrapper>
  );
}
