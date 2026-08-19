'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useAlert } from '@/components/ui/AlertContainer';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { listFolderContents } from '@/lib/api/files';
import { ApiClientError } from '@/lib/api/http';
import { normalizeRole, isAdmin } from '@/lib/roles';
import type {
  BreadcrumbItem,
  FileNodeItem,
  FileSortOption,
  FileTypeFilter,
  FilesStatsData,
  FolderContentsResponse,
  FolderNode,
  ViewMode,
} from '../_components/types';
import { filterAndSortFiles, filterAndSortFolders } from '../_components/filterUtils';
import { useFileMutations } from './useFileMutations';

export function useAdminFiles() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, status } = useSessionStore();
  const { addAlert } = useAlert();

  const rawRole = session?.user?.role;
  const userRole = normalizeRole(rawRole);
  const isAdminUser = isAdmin(rawRole);
  const isStudent = userRole === 'student';

  const [parentId, setParentId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: null, name: t('files.root') || 'Root' },
  ]);

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<FileTypeFilter>('all');
  const [sortOption, setSortOption] = useState<FileSortOption>('newest');

  const [contents, setContents] = useState<FolderContentsResponse>({ folders: [], files: [] });
  const [isLoading, setIsLoading] = useState(true);

  // Preview state
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewTarget, setPreviewTarget] = useState<FileNodeItem | null>(null);

  const canMutate = session?.user?.role === 'superadmin';

  const loadContents = useCallback(
    async (pid: string | null) => {
      setIsLoading(true);
      try {
        const data = await listFolderContents<FolderNode, FileNodeItem>(pid);
        setContents({
          folders: data.folders || [],
          files: data.files || [],
          pagination: data.pagination,
        });
      } catch (err) {
        addAlert({
          type: 'error',
          message: err instanceof ApiClientError ? err.message : t('common.error'),
        });
      } finally {
        setIsLoading(false);
      }
    },
    [t, addAlert]
  );

  const mutations = useFileMutations({
    parentId,
    onRefresh: loadContents,
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push(ROUTES.login);
      return;
    }
    loadContents(parentId);
  }, [status, session, router, parentId, loadContents]);

  useEffect(() => {
    setBreadcrumbs((prev) => {
      if (!prev.length) return [{ id: null, name: t('files.root') || 'Root' }];
      const updated = [...prev];
      updated[0] = { id: null, name: t('files.root') || 'Root' };
      return updated;
    });
  }, [t]);

  const openFolder = useCallback((folder: FolderNode) => {
    setParentId(folder._id);
    setBreadcrumbs((prev) => [...prev, { id: folder._id, name: folder.name }]);
    setSearchQuery('');
  }, []);

  const goToCrumb = useCallback((idx: number) => {
    setBreadcrumbs((prev) => {
      const next = prev.slice(0, idx + 1);
      const target = next[next.length - 1]?.id ?? null;
      setParentId(target);
      return next;
    });
    setSearchQuery('');
  }, []);

  const goToParent = useCallback(() => {
    if (breadcrumbs.length <= 1) return;
    goToCrumb(breadcrumbs.length - 2);
  }, [breadcrumbs, goToCrumb]);

  const copyFileLink = useCallback(
    (file: FileNodeItem) => {
      const url = `${window.location.origin}/api/files/view/${file._id}`;
      navigator.clipboard.writeText(url);
      addAlert({ type: 'success', message: t('files.linkCopied') });
    },
    [t, addAlert]
  );

  const downloadFile = useCallback((file: FileNodeItem) => {
    const link = document.createElement('a');
    link.href = `/api/files/view/${file._id}`;
    link.download = file.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const stats: FilesStatsData = useMemo(() => {
    const totalFiles = contents.files.length;
    const totalFolders = contents.folders.length;
    const storageUsed = contents.files.reduce((acc, curr) => acc + (curr.size || 0), 0);
    const currentDepth = Math.max(0, breadcrumbs.length - 1);
    return { totalFiles, totalFolders, storageUsed, currentDepth };
  }, [contents, breadcrumbs]);

  const filteredFolders = useMemo(
    () => filterAndSortFolders(contents.folders, searchQuery, typeFilter, sortOption),
    [contents.folders, searchQuery, typeFilter, sortOption]
  );

  const filteredFiles = useMemo(
    () => filterAndSortFiles(contents.files, searchQuery, typeFilter, sortOption),
    [contents.files, searchQuery, typeFilter, sortOption]
  );

  return {
    status,
    session,
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
    isMutating: mutations.isMutating,
    stats,
    filteredFolders,
    filteredFiles,
    totalItemsCount: filteredFolders.length + filteredFiles.length,
    showCreateFolderModal: mutations.showCreateFolderModal,
    setShowCreateFolderModal: mutations.setShowCreateFolderModal,
    showUploadModal: mutations.showUploadModal,
    setShowUploadModal: mutations.setShowUploadModal,
    showRenameModal: mutations.showRenameModal,
    setShowRenameModal: mutations.setShowRenameModal,
    renameTarget: mutations.renameTarget,
    setRenameTarget: mutations.setRenameTarget,
    showDeleteDialog: mutations.showDeleteDialog,
    setShowDeleteDialog: mutations.setShowDeleteDialog,
    deleteTarget: mutations.deleteTarget,
    setDeleteTarget: mutations.setDeleteTarget,
    showPreviewModal,
    setShowPreviewModal,
    previewTarget,
    setPreviewTarget,
    loadContents,
    openFolder,
    goToCrumb,
    goToParent,
    handleCreateFolder: mutations.handleCreateFolder,
    handleUploadFile: mutations.handleUploadFile,
    handleRename: mutations.handleRename,
    handleDelete: mutations.handleDelete,
    isAdminUser,
    isStudent,
    userRole,
    copyFileLink,
    downloadFile,
  };
}
