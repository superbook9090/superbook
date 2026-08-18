'use client';

import React from 'react';
import {
  FolderOpen,
  FolderPlus,
  UploadCloud,
  RefreshCw,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { PageWrapper, PageHeader } from '@/components/layout';
import { PageSkeleton } from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';
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
      {/* Header */}
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <span className="p-2.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl shrink-0 inline-flex shadow-xs">
              <FolderOpen className="w-6 h-6" />
            </span>
            <span>{t('files.title') || 'Files & Documents'}</span>
          </span>
        }
        description={t('files.description') || 'Upload, manage, organize, and preview system documents.'}
        actions={
          <div className="flex items-center gap-2">
            <Tooltip label={t('analytics.refresh') || 'Refresh'}>
              <Button
                onClick={() => loadContents(parentId)}
                variant="secondary"
                size="sm"
                className="flex items-center gap-2"
                aria-label="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{t('analytics.refresh') || 'Refresh'}</span>
              </Button>
            </Tooltip>
            {canMutate && (
              <>
                <Button
                  onClick={() => setShowCreateFolderModal(true)}
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <FolderPlus className="w-4 h-4 text-[var(--color-warning)]" />
                  <span className="hidden min-[450px]:inline">{t('files.createFolder') || 'New Folder'}</span>
                </Button>
                <Button
                  onClick={() => setShowUploadModal(true)}
                  variant="primary"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{t('files.uploadPdf') || 'Upload PDF'}</span>
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* Executive Summary Stats */}
      <FilesStats stats={stats} isLoading={isLoading} />

      {/* Breadcrumb Navigation */}
      <FilesBreadcrumbs
        breadcrumbs={breadcrumbs}
        totalItems={totalItemsCount}
        onGoToCrumb={goToCrumb}
        onGoToParent={goToParent}
      />

      {/* Drag & Drop Quick Dropzone */}
      <FileDropzone
        onUploadFile={handleUploadFile}
        canMutate={canMutate}
        isMutating={isMutating}
      />

      {/* Filter Bar with Search, Type Chips & View Mode Switcher */}
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

      {/* Content Rendering / Empty State */}
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

      {/* Modals & Dialogs */}
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
