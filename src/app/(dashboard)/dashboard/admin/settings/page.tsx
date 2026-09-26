'use client';

import { Settings, RefreshCw, Save } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { PageWrapper } from '@/components/layout';
import { PageSkeleton } from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';
import ConfirmModal from '@/components/ui/ConfirmModal';

import { useAdminSettings } from './_hooks/useAdminSettings';
import { SettingsOverviewStats } from './_components/SettingsOverviewStats';
import { SettingsTabsNav } from './_components/SettingsTabsNav';
import { FeatureTogglesSection } from './_components/FeatureTogglesSection';
import { TeacherLimitsSection } from './_components/TeacherLimitsSection';
import { NotesLimitsSection } from './_components/NotesLimitsSection';
import { PlatformConfigSection } from './_components/PlatformConfigSection';
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
  const showTeacherLimits = activeTab === 'all' || activeTab === 'teacher_limits';
  const showNotesLimits = activeTab === 'all' || activeTab === 'notes_limits';
  const showPlatform = activeTab === 'all' || activeTab === 'platform';
  const showJobs = activeTab === 'all' || activeTab === 'jobs';

  return (
    <PageWrapper className="max-w-6xl">
      {/* Hero Banner */}
      <div className="hero-banner flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 md:p-8 rounded-3xl">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/25 shadow-xs">
            <Settings className="w-3.5 h-3.5" />
            <span>{t('adminSettings.title')}</span>
          </div>
          <h1 className="heading-xl">{t('adminSettings.title')}</h1>
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)]">
            {t('adminSettings.description')}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Tooltip label={t('analytics.refresh')}>
            <Button
              onClick={fetchSettings}
              variant="secondary"
              size="sm"
              className="flex items-center gap-2 min-h-[44px] px-3.5 shadow-xs"
              aria-label="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{t('analytics.refresh')}</span>
            </Button>
          </Tooltip>
          <Button
            onClick={handleSave}
            variant="primary"
            size="sm"
            isLoading={isSaving}
            disabled={isSaving || !isDirty}
            className="flex items-center gap-2 min-h-[44px] px-5 font-bold shadow-md"
          >
            {!isSaving && <Save className="w-4 h-4" />}
            <span>{isSaving ? t('adminSettings.saving') : t('adminSettings.saveSettings')}</span>
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <SettingsOverviewStats stats={stats} />

      {/* Tab Navigation & Search */}
      <SettingsTabsNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Sections */}
      <div className="space-y-6">
        {showFeatures && (
          <FeatureTogglesSection
            settings={settings}
            setSettings={setSettings}
            canManageSolutionAnalysis={canManageSolutionAnalysis}
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

        { showPlatform && (
          <PlatformConfigSection
            settings={settings}
            setSettings={setSettings}
            onToggleMaintenance={handleToggleMaintenance}
            searchQuery={searchQuery}
          />
        )}
        { showJobs && (
          <CronJobsSection />
        )}
      </div>

      {/* Sticky Floating Action Bar for Unsaved Changes */}
      <SettingsActionBar
        isDirty={isDirty}
        isSaving={isSaving}
        pendingCount={pendingChangesCount}
        onSave={handleSave}
        onRequestDiscard={() => setShowDiscardModal(true)}
      />

      {/* Maintenance Confirmation Modal */}
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

      {/* Discard Changes Confirmation Modal */}
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
