'use client';

import React from 'react';
import {
  FolderOpen,
  FolderPlus,
  UploadCloud,
  RefreshCw,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { PageWrapper } from '@/components/layout';
import { PageSkeleton } from '@/components/ui/Skeleton';
import Tooltip from '@/components/ui/Tooltip';
import { AdminPageBanner } from '@/features/admin/components/AdminPageBanner';
import { useAdminFiles } from './_hooks/useAdminFiles';
import { FilesStats } from './_components/FilesStats';
import { FilesBreadcrumbs } from './_components/FilesBreadcrumbs';
import { FileDropzone } from './_components/FileDropzone';
import { FilesFilterBar } from './_components/FilesFilterBar';
import { FilesEmptyState } from './_components/FilesEmptyState';
import { FilesContentView } from './_components/FilesContentView';
import { FilesModals } from './_components/FilesModals';

export default function AdminFilesPage() {
  const { t } = useTranslation();
  const {
    status,
    canMutate,
    parentId,
    breadcrumbs,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    sortOption,
    setSortOption,
    isLoading,
    isMutating,
    stats,
    filteredFolders,
    filteredFiles,
    totalItemsCount,
    showCreateFolderModal,
    setShowCreateFolderModal,
    showUploadModal,
    setShowUploadModal,
    showRenameModal,
    setShowRenameModal,
    renameTarget,
    setRenameTarget,
    showPreviewModal,
    setShowPreviewModal,
    previewTarget,
    setPreviewTarget,
    showDeleteDialog,
    setShowDeleteDialog,
    deleteTarget,
    setDeleteTarget,
    loadContents,
    openFolder,
    goToCrumb,
    goToParent,
    handleCreateFolder,
    handleUploadFile,
    handleRename,
    handleDelete,
    isStudent,
    copyFileLink,
    downloadFile,
  } = useAdminFiles();

  if (status === 'loading' || (isLoading && stats.totalFiles === 0 && stats.totalFolders === 0)) {
    return <PageSkeleton />;
  }

  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setSortOption('newest');
  };

  const handleOpenPreview = (f: typeof previewTarget) => {
    setPreviewTarget(f);
    setShowPreviewModal(true);
  };

  const handleOpenRename = (item: typeof renameTarget) => {
    setRenameTarget(item);
    setShowRenameModal(true);
  };

  const handleOpenDelete = (item: typeof deleteTarget) => {
    setDeleteTarget(item);
    setShowDeleteDialog(true);
  };

  return (
    <PageWrapper>
      <AdminPageBanner
        icon={FolderOpen}
        eyebrow={t('files.title')}
        title={t('files.title')}
        description={isStudent ? t('files.studentDescription') : t('files.description')}
        tier={isStudent ? 'admin' : 'superadmin'}
        actions={
          <>
            <Tooltip label={t('analytics.refresh')}>
              <button
                type="button"
                onClick={() => loadContents(parentId)}
                aria-label="Refresh"
                className="teacher-pill-btn min-h-[44px] px-3.5 text-xs sm:text-sm font-semibold cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{t('analytics.refresh')}</span>
              </button>
            </Tooltip>
            {canMutate && (
              <>
                <button
                  type="button"
                  onClick={() => setShowCreateFolderModal(true)}
                  className="teacher-pill-btn min-h-[44px] px-3.5 text-xs sm:text-sm font-semibold cursor-pointer"
                >
                  <FolderPlus className="w-4 h-4 text-[var(--warning)]" />
                  <span className="hidden min-[450px]:inline">{t('files.createFolder')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(true)}
                  className="teacher-cta-btn min-h-[44px] px-4 text-xs sm:text-sm cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{t('files.uploadPdf')}</span>
                </button>
              </>
            )}
          </>
        }
      />

      {!isStudent && <FilesStats stats={stats} isLoading={isLoading} />}

      <FilesBreadcrumbs
        breadcrumbs={breadcrumbs}
        totalItems={totalItemsCount}
        onGoToCrumb={goToCrumb}
        onGoToParent={goToParent}
      />

      <FileDropzone
        onUploadFile={handleUploadFile}
        canMutate={canMutate}
        isMutating={isMutating}
      />

      <FilesFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        sortOption={sortOption}
        onSortOptionChange={setSortOption}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onReset={handleResetFilters}
      />

      {totalItemsCount === 0 ? (
        <FilesEmptyState
          isFolderEmpty={stats.totalFiles === 0 && stats.totalFolders === 0}
          canMutate={canMutate}
          onOpenCreateFolder={() => setShowCreateFolderModal(true)}
          onOpenUpload={() => setShowUploadModal(true)}
          onResetFilters={handleResetFilters}
        />
      ) : (
        <FilesContentView
          viewMode={viewMode}
          folders={filteredFolders}
          files={filteredFiles}
          canMutate={canMutate}
          onOpenFolder={openFolder}
          onPreviewFile={handleOpenPreview}
          onDownloadFile={downloadFile}
          onCopyLink={copyFileLink}
          onRenameFolder={handleOpenRename}
          onRenameFile={handleOpenRename}
          onDeleteFolder={handleOpenDelete}
          onDeleteFile={handleOpenDelete}
        />
      )}

      <FilesModals
        canMutate={canMutate}
        isMutating={isMutating}
        showCreateFolderModal={showCreateFolderModal}
        setShowCreateFolderModal={setShowCreateFolderModal}
        showUploadModal={showUploadModal}
        setShowUploadModal={setShowUploadModal}
        showRenameModal={showRenameModal}
        setShowRenameModal={setShowRenameModal}
        renameTarget={renameTarget}
        setRenameTarget={setRenameTarget}
        showPreviewModal={showPreviewModal}
        setShowPreviewModal={setShowPreviewModal}
        previewTarget={previewTarget}
        setPreviewTarget={setPreviewTarget}
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
        deleteTarget={deleteTarget}
        setDeleteTarget={setDeleteTarget}
        onCreateFolder={handleCreateFolder}
        onUploadFile={handleUploadFile}
        onRename={handleRename}
        onDelete={handleDelete}
        onDownloadFile={downloadFile}
        onCopyLink={copyFileLink}
      />
    </PageWrapper>
  );
}
