'use client';

import { Settings, RefreshCw, Save, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { PageWrapper } from '@/components/layout';
import { PageSkeleton } from '@/components/ui/Skeleton';
import Tooltip from '@/components/ui/Tooltip';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { AdminPageBanner } from '@/features/admin/components/AdminPageBanner';

import { useAdminSettings } from './_hooks/useAdminSettings';
import { SettingsOverviewStats } from './_components/SettingsOverviewStats';
import { SettingsTabsNav } from './_components/SettingsTabsNav';
import { FeatureTogglesSection } from './_components/FeatureTogglesSection';
import { TeacherLimitsSection } from './_components/TeacherLimitsSection';
import { NotesLimitsSection } from './_components/NotesLimitsSection';
import { PlatformConfigSection } from './_components/PlatformConfigSection';
import { AppVersionSection } from './_components/AppVersionSection';
import { SettingsActionBar } from './_components/SettingsActionBar';
import { CronJobsSection } from './_components/CronJobsSection';

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const {
    status,
    settings,
    setSettings,
    stats,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    isLoading,
    isSaving,
    isDirty,
    pendingChangesCount,
    canManageSolutionAnalysis,
    showMaintenanceModal,
    setShowMaintenanceModal,
    showDiscardModal,
    setShowDiscardModal,
    fetchSettings,
    handleSave,
    handleDiscard,
    handleToggleMaintenance,
    confirmEnableMaintenance,
  } = useAdminSettings();

  if (status === 'loading' || (isLoading && !settings)) {
    return <PageSkeleton />;
  }

  const showFeatures = activeTab === 'all' || activeTab === 'features';
  const showAppVersion = activeTab === 'all' || activeTab === 'app_version';
  const showTeacherLimits = activeTab === 'all' || activeTab === 'teacher_limits';
  const showNotesLimits = activeTab === 'all' || activeTab === 'notes_limits';
  const showPlatform = activeTab === 'all' || activeTab === 'platform';
  const showJobs = activeTab === 'all' || activeTab === 'jobs';

  return (
    <PageWrapper className="max-w-6xl">
      <AdminPageBanner
        icon={Settings}
        eyebrow={t('adminSettings.title')}
        title={t('adminSettings.title')}
        description={t('adminSettings.description')}
        tier="superadmin"
        actions={
          <>
            <Tooltip label={t('analytics.refresh')}>
              <button
                type="button"
                onClick={fetchSettings}
                aria-label="Refresh"
                className="teacher-pill-btn min-h-[44px] px-3.5 text-xs sm:text-sm font-semibold cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{t('analytics.refresh')}</span>
              </button>
            </Tooltip>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !isDirty}
              className="teacher-cta-btn min-h-[44px] px-4 text-xs sm:text-sm cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? t('adminSettings.saving') : t('adminSettings.saveSettings')}</span>
            </button>
          </>
        }
      />

      <SettingsOverviewStats stats={stats} />

      <SettingsTabsNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="space-y-6">
        {showFeatures && (
          <FeatureTogglesSection
            settings={settings}
            setSettings={setSettings}
            canManageSolutionAnalysis={canManageSolutionAnalysis}
            searchQuery={searchQuery}
          />
        )}

        {showAppVersion && (
          <AppVersionSection
            settings={settings}
            setSettings={setSettings}
            searchQuery={searchQuery}
          />
        )}

        {showTeacherLimits && (
          <TeacherLimitsSection
            settings={settings}
            setSettings={setSettings}
            searchQuery={searchQuery}
          />
        )}

        {showNotesLimits && (
          <NotesLimitsSection
            settings={settings}
            setSettings={setSettings}
            searchQuery={searchQuery}
          />
        )}

        {showPlatform && (
          <PlatformConfigSection
            settings={settings}
            setSettings={setSettings}
            onToggleMaintenance={handleToggleMaintenance}
            searchQuery={searchQuery}
          />
        )}

        {showJobs && <CronJobsSection />}
      </div>

      <SettingsActionBar
        isDirty={isDirty}
        isSaving={isSaving}
        pendingCount={pendingChangesCount}
        onSave={handleSave}
        onRequestDiscard={() => setShowDiscardModal(true)}
      />

      <ConfirmModal
        isOpen={showMaintenanceModal}
        type="danger"
        title={t('adminSettings.maintenanceConfirmationTitle')}
        message={t('adminSettings.maintenanceConfirmationMessage')}
        confirmText={t('adminSettings.maintenanceMode')}
        cancelText={t('common.cancel')}
        onConfirm={confirmEnableMaintenance}
        onCancel={() => setShowMaintenanceModal(false)}
      />

      <ConfirmModal
        isOpen={showDiscardModal}
        type="warning"
        title={t('adminSettings.discardConfirmTitle')}
        message={t('adminSettings.discardConfirmMessage')}
        confirmText={t('adminSettings.discardChanges')}
        cancelText={t('common.cancel')}
        onConfirm={handleDiscard}
        onCancel={() => setShowDiscardModal(false)}
      />
    </PageWrapper>
  );
}
