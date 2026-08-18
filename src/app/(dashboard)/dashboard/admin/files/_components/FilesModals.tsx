'use client';

import React from 'react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useTranslation } from '@/hooks/useTranslation';
import { CreateFolderModal } from './CreateFolderModal';
import { UploadFileModal } from './UploadFileModal';
import { RenameModal } from './RenameModal';
import { FilePreviewModal } from './FilePreviewModal';
import type { FileNodeItem, FolderNode } from './types';

interface FilesModalsProps {
  canMutate: boolean;
  isMutating: boolean;
  showCreateFolderModal: boolean;
  setShowCreateFolderModal: (show: boolean) => void;
  showUploadModal: boolean;
  setShowUploadModal: (show: boolean) => void;
  showRenameModal: boolean;
  setShowRenameModal: (show: boolean) => void;
  renameTarget: FolderNode | FileNodeItem | null;
  setRenameTarget: (target: FolderNode | FileNodeItem | null) => void;
  showPreviewModal: boolean;
  setShowPreviewModal: (show: boolean) => void;
  previewTarget: FileNodeItem | null;
  setPreviewTarget: (target: FileNodeItem | null) => void;
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;
  deleteTarget: FolderNode | FileNodeItem | null;
  setDeleteTarget: (target: FolderNode | FileNodeItem | null) => void;
  onCreateFolder: (name: string) => Promise<void>;
  onUploadFile: (file: File) => Promise<void>;
  onRename: (id: string, newName: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onDownloadFile: (file: FileNodeItem) => void;
  onCopyLink: (file: FileNodeItem) => void;
}

export function FilesModals({
  isMutating,
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
  onCreateFolder,
  onUploadFile,
  onRename,
  onDelete,
  onDownloadFile,
  onCopyLink,
}: FilesModalsProps) {
  const { t } = useTranslation();

  return (
    <>
      <CreateFolderModal
        isOpen={showCreateFolderModal}
        isSubmitting={isMutating}
        onSubmit={onCreateFolder}
        onClose={() => setShowCreateFolderModal(false)}
      />

      <UploadFileModal
        isOpen={showUploadModal}
        isSubmitting={isMutating}
        onSubmit={onUploadFile}
        onClose={() => setShowUploadModal(false)}
      />

      <RenameModal
        isOpen={showRenameModal}
        target={renameTarget}
        isSubmitting={isMutating}
        onSubmit={onRename}
        onClose={() => {
          setShowRenameModal(false);
          setRenameTarget(null);
        }}
      />

      <FilePreviewModal
        isOpen={showPreviewModal}
        file={previewTarget}
        onDownload={onDownloadFile}
        onCopyLink={onCopyLink}
        onClose={() => {
          setShowPreviewModal(false);
          setPreviewTarget(null);
        }}
      />

      <ConfirmModal
        isOpen={showDeleteDialog}
        title={t('files.deleteItem') || 'Delete Item'}
        message={
          deleteTarget?.type === 'folder'
            ? t('files.deleteFolderConfirm', { name: deleteTarget.name }) ||
              `Delete folder "${deleteTarget.name}"?`
            : t('files.deleteFileConfirm', { name: deleteTarget?.name || '' }) ||
              `Delete file "${deleteTarget?.name}"?`
        }
        confirmText={t('admin.delete') || 'Delete'}
        cancelText={t('common.cancel') || 'Cancel'}
        onConfirm={onDelete}
        onCancel={() => {
          setShowDeleteDialog(false);
          setDeleteTarget(null);
        }}
        type="danger"
        isLoading={isMutating}
      />
    </>
  );
}
