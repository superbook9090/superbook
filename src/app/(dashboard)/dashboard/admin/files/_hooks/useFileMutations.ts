'use client';

import { useCallback, useState } from 'react';
import { useAlert } from '@/components/ui/AlertContainer';
import { useTranslation } from '@/hooks/useTranslation';
import {
  createFileFolder,
  uploadFile,
  deleteFileNode,
  renameFileNode,
} from '@/lib/api/files';
import { ApiClientError } from '@/lib/api/http';
import type { FileNodeItem, FolderNode } from '../_components/types';

interface UseFileMutationsProps {
  parentId: string | null;
  onRefresh: (parentId: string | null) => Promise<void>;
}

export function useFileMutations({ parentId, onRefresh }: UseFileMutationsProps) {
  const { t } = useTranslation();
  const { addAlert } = useAlert();
  const [isMutating, setIsMutating] = useState(false);

  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameTarget, setRenameTarget] = useState<FolderNode | FileNodeItem | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FolderNode | FileNodeItem | null>(null);

  const handleCreateFolder = useCallback(
    async (name: string) => {
      setIsMutating(true);
      try {
        await createFileFolder({ name, parentId });
        addAlert({ type: 'success', message: t('files.folderCreated') });
        setShowCreateFolderModal(false);
        await onRefresh(parentId);
      } catch (e) {
        addAlert({
          type: 'error',
          message: e instanceof ApiClientError ? e.message : t('common.error'),
        });
      } finally {
        setIsMutating(false);
      }
    },
    [parentId, t, addAlert, onRefresh]
  );

  const handleUploadFile = useCallback(
    async (file: File) => {
      setIsMutating(true);
      try {
        const fd = new FormData();
        fd.append('file', file);
        if (parentId) fd.append('parentId', parentId);

        await uploadFile(fd);
        addAlert({ type: 'success', message: t('files.uploaded') });
        setShowUploadModal(false);
        await onRefresh(parentId);
      } catch (e) {
        addAlert({
          type: 'error',
          message: e instanceof ApiClientError ? e.message : t('common.error'),
        });
      } finally {
        setIsMutating(false);
      }
    },
    [parentId, t, addAlert, onRefresh]
  );

  const handleRename = useCallback(
    async (id: string, newName: string) => {
      setIsMutating(true);
      try {
        await renameFileNode(id, newName);
        addAlert({ type: 'success', message: t('files.renamed') });
        setShowRenameModal(false);
        setRenameTarget(null);
        await onRefresh(parentId);
      } catch (e) {
        addAlert({
          type: 'error',
          message: e instanceof ApiClientError ? e.message : t('common.error'),
        });
      } finally {
        setIsMutating(false);
      }
    },
    [parentId, t, addAlert, onRefresh]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsMutating(true);
    try {
      await deleteFileNode(deleteTarget._id);
      addAlert({ type: 'success', message: t('files.deleted') });
      setShowDeleteDialog(false);
      setDeleteTarget(null);
      await onRefresh(parentId);
    } catch (e) {
      addAlert({
        type: 'error',
        message: e instanceof ApiClientError ? e.message : t('common.error'),
      });
    } finally {
      setIsMutating(false);
    }
  }, [deleteTarget, parentId, t, addAlert, onRefresh]);

  return {
    isMutating,
    showCreateFolderModal,
    setShowCreateFolderModal,
    showUploadModal,
    setShowUploadModal,
    showRenameModal,
    setShowRenameModal,
    renameTarget,
    setRenameTarget,
    showDeleteDialog,
    setShowDeleteDialog,
    deleteTarget,
    setDeleteTarget,
    handleCreateFolder,
    handleUploadFile,
    handleRename,
    handleDelete,
  };
}
