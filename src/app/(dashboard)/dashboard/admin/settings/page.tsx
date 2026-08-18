'use client';

import React from 'react';
import { Settings, RefreshCw, Save } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { PageWrapper, PageHeader } from '@/components/layout';
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

  return (
    <PageWrapper className="max-w-6xl space-y-6">
      {/* Header */}
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <span className="p-2.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl shrink-0 inline-flex shadow-xs">
              <Settings className="w-6 h-6" />
            </span>
            <span>{t('adminSettings.title')}</span>
          </span>
        }
        description={t('adminSettings.description')}
        actions={
          <div className="flex items-center gap-2">
            <Tooltip label={t('analytics.refresh') || 'Refresh'}>
              <Button
                onClick={fetchSettings}
                variant="secondary"
                size="sm"
                className="flex items-center gap-2"
                aria-label="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{t('analytics.refresh') || 'Refresh'}</span>
              </Button>
            </Tooltip>
            <Button
              onClick={handleSave}
              variant="primary"
              size="sm"
              isLoading={isSaving}
              disabled={isSaving || !isDirty}
              className="flex items-center gap-2"
            >
              {!isSaving && <Save className="w-4 h-4" />}
              <span>{isSaving ? t('adminSettings.saving') : t('adminSettings.saveSettings')}</span>
            </Button>
          </div>
        }
      />

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

        {showPlatform && (
          <PlatformConfigSection
            settings={settings}
            setSettings={setSettings}
            onToggleMaintenance={handleToggleMaintenance}
            searchQuery={searchQuery}
          />
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
