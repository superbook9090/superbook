// src/app/(dashboard)/dashboard/admin/organizations/page.tsx
'use client';

import React from 'react';
import {
  Building2,
  Plus,
  RefreshCw,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { PageWrapper, EmptyState } from '@/components/layout';
import { PageSkeleton } from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Tooltip from '@/components/ui/Tooltip';
import DashboardListFilters, { FilterPanel } from '@/components/filters/DashboardListFilters';
import { useAdminOrganizations } from './_hooks/useAdminOrganizations';
import { useOrganizationsFilterChips } from './_hooks/useOrganizationsFilterChips';
import { OrganizationsStats } from './_components/OrganizationsStats';
import { OrganizationCard } from './_components/OrganizationCard';
import { OrganizationsTable } from './_components/OrganizationsTable';
import { OrganizationsMobileList } from './_components/OrganizationsMobileList';
import { OrganizationFormModal } from './_components/OrganizationFormModal';
import { OrganizationDetailModal } from './_components/OrganizationDetailModal';

export default function OrganizationsPage() {
  const { t } = useTranslation();
  const {
    status,
    filteredOrganizations,
    stats,
    isLoading,
    isSubmitting,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortOption,
    setSortOption,
    viewMode,
    setViewMode,
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    showDetailModal,
    setShowDetailModal,
    showDeleteDialog,
    setShowDeleteDialog,
    selectedOrg,
    deleteTargetOrg,
    copiedCode,
    formData,
    setFormData,
    fetchOrganizations,
    copyToClipboard,
    openCreateModal,
    openEditModal,
    openDetailModal,
    confirmDelete,
    handleCreate,
    handleUpdate,
    handleToggleActive,
    handleDelete,
  } = useAdminOrganizations();

  const filterChips = useOrganizationsFilterChips({
    statusFilter,
    setStatusFilter,
    sortOption,
    setSortOption,
  });

  if (status === 'loading' || (isLoading && stats.total === 0)) {
    return <PageSkeleton />;
  }

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSortOption('newest');
  };

  return (
    <PageWrapper className="space-y-6">
      {/* Hero Banner Header */}
      <div className="hero-banner flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 sm:p-8 rounded-3xl">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/25 shadow-xs">
            <Building2 className="w-3.5 h-3.5" />
            <span>{t('organizations.title') || 'Multi-Tenant Organizations'}</span>
          </div>
          <h1 className="heading-xl">{t('organizations.title')}</h1>
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)]">
            {t('organizations.description')}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Tooltip label={t('analytics.refresh') || 'Refresh'}>
            <Button
              onClick={() => fetchOrganizations()}
              variant="secondary"
              size="sm"
              className="flex items-center gap-2 min-h-[44px] px-3.5 shadow-xs"
              aria-label="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">{t('analytics.refresh') || 'Refresh'}</span>
            </Button>
          </Tooltip>
          <Button
            onClick={openCreateModal}
            variant="primary"
            size="sm"
            className="flex items-center gap-2 min-h-[44px] px-5 font-bold shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>{t('organizations.createOrganization')}</span>
          </Button>
        </div>
      </div>

      {/* Top Executive Stats */}
      <OrganizationsStats stats={stats} isLoading={isLoading} />

      {/* Filters & View Switcher */}
      <FilterPanel>
        <DashboardListFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClear={handleResetFilters}
          searchPlaceholder={t('organizations.searchPlaceholder')}
          chipGroups={filterChips}
          headerAside={
            <div className="hidden md:flex items-center gap-1 bg-[var(--surface-muted)] p-1 rounded-2xl border border-[var(--border)] shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[var(--primary)] text-white shadow-xs'
                    : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                }`}
                title={t('organizations.gridView')}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-[var(--primary)] text-white shadow-xs'
                    : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                }`}
                title={t('organizations.tableView')}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          }
        />
      </FilterPanel>

      {/* Organization List / Grid / Empty State */}
      {filteredOrganizations.length === 0 ? (
        <EmptyState
          title={stats.total === 0 ? t('organizations.noOrganizations') : t('organizations.noFilteredResults') || 'No matching organizations'}
          description={stats.total === 0 ? t('organizations.noOrganizationsDesc') : t('organizations.noFilteredResultsDesc') || 'Try adjusting your search query or status filter.'}
          action={
            <Button onClick={stats.total === 0 ? openCreateModal : handleResetFilters} variant="secondary">
              {stats.total === 0 ? t('organizations.createOrganization') : (t('common.reset') || 'Reset Filters')}
            </Button>
          }
        />
      ) : (
        <>
          {viewMode === 'table' && (
            <div className="hidden md:block">
              <OrganizationsTable
                organizations={filteredOrganizations}
                copiedCode={copiedCode}
                onCopy={copyToClipboard}
                onOpenDetail={openDetailModal}
                onOpenEdit={openEditModal}
                onToggleActive={handleToggleActive}
                onDelete={confirmDelete}
              />
            </div>
          )}

          {viewMode === 'grid' && (
            <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredOrganizations.map((org, index) => (
                <OrganizationCard
                  key={org._id}
                  organization={org}
                  index={index}
                  copiedCode={copiedCode}
                  onCopy={copyToClipboard}
                  onOpenDetail={openDetailModal}
                  onOpenEdit={openEditModal}
                  onToggleActive={handleToggleActive}
                  onDelete={confirmDelete}
                />
              ))}
            </div>
          )}

          <OrganizationsMobileList
            organizations={filteredOrganizations}
            copiedCode={copiedCode}
            onCopy={copyToClipboard}
            onOpenDetail={openDetailModal}
            onOpenEdit={openEditModal}
            onToggleActive={handleToggleActive}
            onDelete={confirmDelete}
          />
        </>
      )}

      {/* Modals */}
      <OrganizationFormModal
        isOpen={showCreateModal}
        isEdit={false}
        selectedOrg={null}
        formData={formData}
        setFormData={setFormData}
        isSubmitting={isSubmitting}
        copiedCode={copiedCode}
        onCopy={copyToClipboard}
        onSubmit={handleCreate}
        onClose={() => setShowCreateModal(false)}
      />

      <OrganizationFormModal
        isOpen={showEditModal}
        isEdit={true}
        selectedOrg={selectedOrg}
        formData={formData}
        setFormData={setFormData}
        isSubmitting={isSubmitting}
        copiedCode={copiedCode}
        onCopy={copyToClipboard}
        onSubmit={handleUpdate}
        onClose={() => setShowEditModal(false)}
      />

      <OrganizationDetailModal
        isOpen={showDetailModal}
        organization={selectedOrg}
        copiedCode={copiedCode}
        onCopy={copyToClipboard}
        onOpenEdit={openEditModal}
        onToggleActive={handleToggleActive}
        onDelete={confirmDelete}
        onClose={() => setShowDetailModal(false)}
      />

      <ConfirmModal
        isOpen={showDeleteDialog}
        title={t('organizations.deleteOrgTitle') || 'Delete Organization'}
        message={deleteTargetOrg ? t('organizations.deleteOrgConfirm') : t('organizations.deleteConfirm')}
        confirmText={t('admin.delete') || 'Delete'}
        cancelText={t('common.cancel') || 'Cancel'}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        type="danger"
        isLoading={isSubmitting}
      />
    </PageWrapper>
  );
}
