// src/app/(dashboard)/dashboard/admin/organizations/page.tsx
'use client';

import React from 'react';
import { Building2, Plus, RefreshCw, LayoutGrid, List } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { PageWrapper, EmptyState } from '@/components/layout';
import { PageSkeleton } from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Tooltip from '@/components/ui/Tooltip';
import DashboardListFilters, { FilterPanel } from '@/components/filters/DashboardListFilters';
import { AdminPageBanner } from '@/features/admin/components/AdminPageBanner';
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
  const o = useAdminOrganizations();

  const filterChips = useOrganizationsFilterChips({
    statusFilter: o.statusFilter,
    setStatusFilter: o.setStatusFilter,
    sortOption: o.sortOption,
    setSortOption: o.setSortOption,
  });

  if (o.status === 'loading' || (o.isLoading && o.stats.total === 0)) {
    return <PageSkeleton />;
  }

  const handleResetFilters = () => {
    o.setSearchQuery('');
    o.setStatusFilter('all');
    o.setSortOption('newest');
  };

  return (
    <PageWrapper>
      <AdminPageBanner
        icon={Building2}
        eyebrow={t('organizations.title')}
        title={t('organizations.title')}
        description={t('organizations.description')}
        tier="superadmin"
        actions={
          <>
            <Tooltip label={t('analytics.refresh')}>
              <button
                type="button"
                onClick={() => o.fetchOrganizations()}
                aria-label="Refresh"
                className="teacher-pill-btn min-h-[44px] px-3.5 text-xs sm:text-sm font-semibold cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${o.isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{t('analytics.refresh')}</span>
              </button>
            </Tooltip>
            <button
              type="button"
              onClick={o.openCreateModal}
              className="teacher-cta-btn min-h-[44px] px-4 text-xs sm:text-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('organizations.createOrganization')}</span>
            </button>
          </>
        }
      />

      <OrganizationsStats stats={o.stats} isLoading={o.isLoading} />

      <FilterPanel>
        <DashboardListFilters
          searchQuery={o.searchQuery}
          onSearchChange={o.setSearchQuery}
          onClear={handleResetFilters}
          searchPlaceholder={t('organizations.searchPlaceholder')}
          chipGroups={filterChips}
          headerAside={
            <div className="hidden md:flex items-center gap-1 bg-[var(--surface-muted)] p-1 rounded-xl border border-[var(--border)]">
              <button
                type="button"
                onClick={() => o.setViewMode('grid')}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-[8px] transition-colors cursor-pointer ${
                  o.viewMode === 'grid'
                    ? 'bg-[var(--card-solid)] text-[var(--teacher-primary)] shadow-xs'
                    : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                }`}
                title={t('organizations.gridView')}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => o.setViewMode('table')}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-[8px] transition-colors cursor-pointer ${
                  o.viewMode === 'table'
                    ? 'bg-[var(--card-solid)] text-[var(--teacher-primary)] shadow-xs'
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

      {o.filteredOrganizations.length === 0 ? (
        <EmptyState
          title={o.stats.total === 0 ? t('organizations.noOrganizations') : t('organizations.noFilteredResults')}
          description={o.stats.total === 0 ? t('organizations.noOrganizationsDesc') : t('organizations.noFilteredResultsDesc')}
          action={
            <Button onClick={o.stats.total === 0 ? o.openCreateModal : handleResetFilters} variant="secondary">
              {o.stats.total === 0 ? t('organizations.createOrganization') : t('common.reset')}
            </Button>
          }
        />
      ) : (
        <>
          {o.viewMode === 'table' && (
            <div className="hidden md:block">
              <OrganizationsTable
                organizations={o.filteredOrganizations}
                copiedCode={o.copiedCode}
                onCopy={o.copyToClipboard}
                onOpenDetail={o.openDetailModal}
                onOpenEdit={o.openEditModal}
                onToggleActive={o.handleToggleActive}
                onDelete={o.confirmDelete}
              />
            </div>
          )}

          {o.viewMode === 'grid' && (
            <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {o.filteredOrganizations.map((org, index) => (
                <OrganizationCard
                  key={org._id}
                  organization={org}
                  index={index}
                  copiedCode={o.copiedCode}
                  onCopy={o.copyToClipboard}
                  onOpenDetail={o.openDetailModal}
                  onOpenEdit={o.openEditModal}
                  onToggleActive={o.handleToggleActive}
                  onDelete={o.confirmDelete}
                />
              ))}
            </div>
          )}

          <OrganizationsMobileList
            organizations={o.filteredOrganizations}
            copiedCode={o.copiedCode}
            onCopy={o.copyToClipboard}
            onOpenDetail={o.openDetailModal}
            onOpenEdit={o.openEditModal}
            onToggleActive={o.handleToggleActive}
            onDelete={o.confirmDelete}
          />
        </>
      )}

      <OrganizationFormModal
        isOpen={o.showCreateModal}
        isEdit={false}
        selectedOrg={null}
        formData={o.formData}
        setFormData={o.setFormData}
        isSubmitting={o.isSubmitting}
        copiedCode={o.copiedCode}
        onCopy={o.copyToClipboard}
        onSubmit={o.handleCreate}
        onClose={() => o.setShowCreateModal(false)}
      />

      <OrganizationFormModal
        isOpen={o.showEditModal}
        isEdit={true}
        selectedOrg={o.selectedOrg}
        formData={o.formData}
        setFormData={o.setFormData}
        isSubmitting={o.isSubmitting}
        copiedCode={o.copiedCode}
        onCopy={o.copyToClipboard}
        onSubmit={o.handleUpdate}
        onClose={() => o.setShowEditModal(false)}
      />

      <OrganizationDetailModal
        isOpen={o.showDetailModal}
        organization={o.selectedOrg}
        copiedCode={o.copiedCode}
        onCopy={o.copyToClipboard}
        onOpenEdit={o.openEditModal}
        onToggleActive={o.handleToggleActive}
        onDelete={o.confirmDelete}
        onClose={() => o.setShowDetailModal(false)}
      />

      <ConfirmModal
        isOpen={o.showDeleteDialog}
        title={t('organizations.deleteOrgTitle')}
        message={o.deleteTargetOrg ? t('organizations.deleteOrgConfirm') : t('organizations.deleteConfirm')}
        confirmText={t('admin.delete')}
        cancelText={t('common.cancel')}
        onConfirm={o.handleDelete}
        onCancel={() => o.setShowDeleteDialog(false)}
        type="danger"
        isLoading={o.isSubmitting}
      />
    </PageWrapper>
  );
}
