'use client';

import React from 'react';
import {
  Building2,
  Plus,
  RefreshCw,
  LayoutGrid,
  List,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { PageWrapper, PageHeader, EmptyState } from '@/components/layout';
import { PageSkeleton } from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Tooltip from '@/components/ui/Tooltip';
import DashboardListFilters, { FilterPanel } from '@/components/filters/DashboardListFilters';
import { useAdminOrganizations } from './_hooks/useAdminOrganizations';
import { OrganizationsStats } from './_components/OrganizationsStats';
import { OrganizationCard } from './_components/OrganizationCard';
import { OrganizationsTable } from './_components/OrganizationsTable';
import { OrganizationsMobileList } from './_components/OrganizationsMobileList';
import { OrganizationFormModal } from './_components/OrganizationFormModal';
import { OrganizationDetailModal } from './_components/OrganizationDetailModal';
import type { OrgSortOption, OrgStatusFilter } from './_components/types';

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

  if (status === 'loading' || (isLoading && stats.total === 0)) {
    return <PageSkeleton />;
  }

  const filterChips = [
    {
      label: t('organizations.status'),
      icon: <CheckCircle2 className="w-3.5 h-3.5" aria-hidden />,
      value: statusFilter,
      onChange: (val: string) => setStatusFilter(val as OrgStatusFilter),
      neutralValue: 'all',
      options: [
        { id: 'all', label: t('organizations.allStatus') || 'All Status' },
        { id: 'active', label: t('organizations.activeStatus') || 'Active' },
        { id: 'inactive', label: t('organizations.inactiveStatus') || 'Inactive' },
      ],
    },
    {
      label: t('organizations.sortBy'),
      icon: <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden />,
      value: sortOption,
      onChange: (val: string) => setSortOption(val as OrgSortOption),
      neutralValue: 'newest',
      options: [
        { id: 'newest', label: t('organizations.sortNewest') || 'Newest' },
        { id: 'name', label: t('organizations.sortName') || 'Name (A-Z)' },
        { id: 'users', label: t('organizations.sortUsers') || 'Most Users' },
        { id: 'courses', label: t('organizations.sortCourses') || 'Most Content' },
      ],
    },
  ];

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSortOption('newest');
  };

  return (
    <PageWrapper>
      {/* Header */}
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <span className="p-2.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl shrink-0 inline-flex shadow-xs">
              <Building2 className="w-6 h-6" />
            </span>
            <span>{t('organizations.title')}</span>
          </span>
        }
        description={t('organizations.description')}
        actions={
          <div className="flex items-center gap-2">
            <Tooltip label={t('analytics.refresh') || 'Refresh'}>
              <Button
                onClick={() => fetchOrganizations()}
                variant="secondary"
                size="sm"
                className="flex items-center gap-2"
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
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{t('organizations.createOrganization')}</span>
            </Button>
          </div>
        }
      />

      {/* Top Executive Stats */}
      <OrganizationsStats stats={stats} isLoading={isLoading} />

      {/* Filters, Search & View Switcher */}
      <FilterPanel>
        <DashboardListFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClear={handleResetFilters}
          searchPlaceholder={t('organizations.searchPlaceholder')}
          chipGroups={filterChips}
          headerAside={
            <div className="hidden md:flex items-center gap-1 bg-[var(--color-surface-muted)] p-1 rounded-xl border border-[var(--border)]">
              <Tooltip label={t('organizations.gridView')}>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  aria-pressed={viewMode === 'grid'}
                  aria-label={t('organizations.gridView')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-[var(--card-solid)] text-[var(--primary)] shadow-xs'
                      : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </Tooltip>
              <Tooltip label={t('organizations.tableView')}>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  aria-pressed={viewMode === 'table'}
                  aria-label={t('organizations.tableView')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'table'
                      ? 'bg-[var(--card-solid)] text-[var(--primary)] shadow-xs'
                      : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </Tooltip>
            </div>
          }
        />
      </FilterPanel>

      {/* Organization List / Grid / Empty State */}
      {filteredOrganizations.length === 0 ? (
        <EmptyState
          title={
            stats.total === 0
              ? t('organizations.noOrganizations')
              : t('organizations.noFilteredResults') || 'No matching organizations'
          }
          description={
            stats.total === 0
              ? t('organizations.noOrganizationsDesc')
              : t('organizations.noFilteredResultsDesc') || 'Try adjusting your search query or status filter.'
          }
          action={
            stats.total === 0 ? (
              <Button onClick={openCreateModal} variant="primary" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                {t('organizations.createOrganization')}
              </Button>
            ) : (
              <Button onClick={handleResetFilters} variant="secondary">
                {t('common.reset') || 'Reset Filters'}
              </Button>
            )
          }
        />
      ) : (
        <>
          {/* Desktop Table View */}
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

          {/* Desktop Grid View */}
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

          {/* Mobile Optimized View */}
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

      {/* Create Modal */}
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

      {/* Edit Modal */}
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

      {/* Detail Modal */}
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteDialog}
        title={t('organizations.deleteOrgTitle') || 'Delete Organization'}
        message={
          deleteTargetOrg
            ? t('organizations.deleteOrgConfirm')
            : t('organizations.deleteConfirm')
        }
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
