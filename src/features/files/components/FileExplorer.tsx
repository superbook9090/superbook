'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  FileText,
  Folder,
  Grid2X2,
  List as ListIcon,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import Alert from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';

type NodeType = 'folder' | 'file';

interface FileNodeBase {
  _id: string;
  name: string;
  type: NodeType;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FolderNode extends FileNodeBase {
  type: 'folder';
}

interface FileNode extends FileNodeBase {
  type: 'file';
  fileUrl: string;
  fileType: string;
  size: number;
}

interface FolderContentsResponse {
  folders: FolderNode[];
  files: FileNode[];
}

type ViewMode = 'grid' | 'list';

function formatBytes(bytes: number) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let n = bytes;
  let u = 0;
  while (n >= 1024 && u < units.length - 1) {
    n /= 1024;
    u += 1;
  }
  return `${n.toFixed(n >= 10 || u === 0 ? 0 : 1)} ${units[u]}`;
}

export default function FileExplorer() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, status } = useSessionStore();

  const [parentId, setParentId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: string | null; name: string }>>([
    { id: null, name: t('common.files') },
  ]);

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [contents, setContents] = useState<FolderContentsResponse>({ folders: [], files: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const canMutate = session?.user?.role === 'superadmin';
  const canView = session?.user?.role === 'student' || session?.user?.role === 'admin' || session?.user?.role === 'superadmin';
  const canRename = session?.user?.role === 'superadmin';

  const loadContents = useCallback(async (pid: string | null) => {
    setIsLoading(true);
    setMessage(null);
    try {
      const url = pid ? `/api/files?parentId=${pid}` : '/api/files';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = (await res.json()) as FolderContentsResponse;
      setContents({ folders: data.folders || [], files: data.files || [] });
    } catch {
      setMessage({ type: 'error', text: t('common.error') });
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    loadContents(parentId);
  }, [status, session, router, parentId, loadContents]);

  useEffect(() => {
    // keep root label translated when language switches
    setBreadcrumbs((prev) => {
      if (!prev.length) return [{ id: null, name: t('common.files') }];
      const updated = [...prev];
      updated[0] = { id: null, name: t('common.files') };
      return updated;
    });
  }, [t]);

  const openFolder = useCallback((folder: FolderNode) => {
    setParentId(folder._id);
    setBreadcrumbs((prev) => [...prev, { id: folder._id, name: folder.name }]);
  }, []);

  const goToCrumb = useCallback((idx: number) => {
    setBreadcrumbs((prev) => {
      const next = prev.slice(0, idx + 1);
      const target = next[next.length - 1]?.id ?? null;
      setParentId(target);
      return next;
    });
  }, []);

  const handleCreateFolder = useCallback(async () => {
    const name = prompt(t('files.newFolderPrompt'));
    if (!name) return;

    try {
      const res = await fetch('/api/files/folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, parentId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || 'Failed');
      }
      setMessage({ type: 'success', text: t('files.folderCreated') });
      await loadContents(parentId);
    } catch (e) {
      setMessage({ type: 'error', text: (e as Error).message || t('common.error') });
    }
  }, [t, parentId, loadContents]);

  const uploadPdf = useCallback(async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    if (parentId) fd.append('parentId', parentId);

    const res = await fetch('/api/files/upload', { method: 'POST', body: fd });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.message || 'Upload failed');
    }
  }, [parentId]);

  const handlePickUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFilePicked = useCallback(async (f?: File | null) => {
    if (!f) return;
    try {
      await uploadPdf(f);
      setMessage({ type: 'success', text: t('files.uploaded') });
      await loadContents(parentId);
    } catch (e) {
      setMessage({ type: 'error', text: (e as Error).message || t('common.error') });
    }
  }, [uploadPdf, t, loadContents, parentId]);

  const handleDeleteNode = useCallback(async (id: string, name: string) => {
    if (!confirm(t('files.deleteConfirm', { name }))) return;
    try {
      const res = await fetch(`/api/files/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || 'Delete failed');
      }
      setMessage({ type: 'success', text: t('files.deleted') });
      await loadContents(parentId);
    } catch (e) {
      setMessage({ type: 'error', text: (e as Error).message || t('common.error') });
    }
  }, [t, loadContents, parentId]);

  const handleRenameNode = useCallback(async (id: string, currentName: string) => {
    const name = prompt(t('files.renamePrompt'), currentName);
    if (!name || name.trim() === currentName) return;

    try {
      const res = await fetch(`/api/files/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || 'Rename failed');
      }
      setMessage({ type: 'success', text: t('files.renamed') });
      await loadContents(parentId);
    } catch (e) {
      setMessage({ type: 'error', text: (e as Error).message || t('common.error') });
    }
  }, [t, loadContents, parentId]);

  const handleViewFile = useCallback(async (file: FileNode) => {
    if (!canView) return;
    
    // For PDF files, open in viewer instead of direct download
    if (file.fileType?.toLowerCase() === 'pdf') {
      window.open(`/api/files/view/${file._id}`, '_blank');
    } else {
      // For other files, fallback to direct link
      window.open(file.fileUrl, '_blank');
    }
  }, [canView]);

  const onDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    if (!canMutate) return;
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    await handleFilePicked(f);
  }, [canMutate, handleFilePicked]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const headerActions = useMemo(() => {
    if (!canMutate) return null;
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleCreateFolder}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--primary-soft)] hover:bg-[var(--primary-border)] border border-[var(--border)] text-[var(--foreground)] text-sm transition"
        >
          <Plus className="w-4 h-4" />
          {t('files.createFolder')}
        </button>
        <button
          onClick={handlePickUpload}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--primary-soft)] hover:bg-[var(--primary-border)] border border-[var(--border)] text-[var(--foreground)] text-sm transition"
        >
          <Upload className="w-4 h-4" />
          {t('files.uploadPdf')}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFilePicked(e.target.files?.[0] || null)}
        />
      </div>
    );
  }, [canMutate, handleCreateFolder, handlePickUpload, t, handleFilePicked]);

  return (
    <div className="p-4 sm:p-6">
      {message && (
        <div className="mb-4">
          <Alert type={message.type} message={message.text} />
        </div>
      )}

      <div className="glass rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1 text-sm text-[var(--foreground)]">
              {breadcrumbs.map((c, idx) => (
                <div key={`${c.id || 'root'}-${idx}`} className="flex items-center gap-1">
                  {idx > 0 && <ChevronRight className="w-4 h-4 text-[var(--muted-light)]" />}
                  <button
                    onClick={() => goToCrumb(idx)}
                    className={`truncate max-w-[12rem] hover:opacity-80 transition ${
                      idx === breadcrumbs.length - 1 ? 'font-semibold' : ''
                    }`}
                    title={c.name}
                  >
                    {c.name}
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {canMutate ? t('files.superadminHint') : t('files.viewOnlyHint')}
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2">
            <div className="inline-flex items-center rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--card-solid)]">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm text-[var(--foreground)] hover:opacity-80 transition ${
                  viewMode === 'grid' ? 'bg-[var(--primary-soft)] font-semibold' : ''
                }`}
                aria-label={t('files.grid')}
                title={t('files.grid')}
              >
                <Grid2X2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm text-[var(--foreground)] hover:opacity-80 transition ${
                  viewMode === 'list' ? 'bg-[var(--primary-soft)] font-semibold' : ''
                }`}
                aria-label={t('files.list')}
                title={t('files.list')}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>

            {headerActions}
          </div>
        </div>

        <div
          className={`mt-4 rounded-2xl border border-dashed border-[var(--border)] ${
            canMutate ? 'bg-[var(--card)]' : 'bg-transparent'
          }`}
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-[var(--muted)]">
                {canMutate ? t('files.dragDropHint') : t('files.browseHint')}
              </div>
              {canMutate && (
                <button
                  onClick={handlePickUpload}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--primary-soft)] hover:bg-[var(--primary-border)] border border-[var(--border)] text-[var(--foreground)] text-sm transition"
                >
                  <Upload className="w-4 h-4" />
                  {t('files.uploadPdf')}
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className={viewMode === 'grid'
                ? 'mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'
                : 'mt-4 space-y-2'
              }>
                {contents.folders.map((f) => (
                  <div
                    key={f._id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openFolder(f)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openFolder(f);
                      }
                    }}
                    className="group w-full text-left flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-solid)] transition cursor-pointer select-none"
                  >
                    <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/20">
                      <Folder className="w-5 h-5 text-amber-200" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[var(--foreground)] truncate">{f.name}</div>
                      <div className="text-xs text-[var(--muted)]">{t('files.folder')}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {canRename && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenameNode(f._id, f.name);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-[var(--primary-soft)] transition"
                          aria-label={t('common.edit')}
                          title={t('common.edit')}
                        >
                          <Pencil className="w-4 h-4 text-[var(--muted)]" />
                        </button>
                      )}
                      {canMutate && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNode(f._id, f.name);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-[var(--primary-soft)] transition"
                          aria-label={t('common.delete')}
                          title={t('common.delete')}
                        >
                          <Trash2 className="w-4 h-4 text-[var(--muted)]" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {contents.files.map((file) => (
                  <div
                    key={file._id}
                    className="group flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-solid)] transition"
                  >
                    <div className="p-2 rounded-lg bg-rose-500/15 border border-rose-500/20">
                      <FileText className="w-5 h-5 text-rose-200" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[var(--foreground)] truncate">{file.name}</div>
                      <div className="text-xs text-[var(--muted)]">
                        {file.fileType?.toUpperCase() || 'FILE'} • {formatBytes(file.size)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {canView && (
                        <button
                          onClick={() => handleViewFile(file)}
                          className="px-3 py-2 rounded-xl bg-[var(--primary-soft)] hover:bg-[var(--primary-border)] border border-[var(--border)] text-[var(--foreground)] text-sm transition"
                        >
                          {t('files.view')}
                        </button>
                      )}
                      {canRename && (
                        <button
                          onClick={() => handleRenameNode(file._id, file.name)}
                          className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-[var(--primary-soft)] transition"
                          aria-label={t('common.edit')}
                          title={t('common.edit')}
                        >
                          <Pencil className="w-4 h-4 text-[var(--muted)]" />
                        </button>
                      )}
                      {canMutate && (
                        <button
                          onClick={() => handleDeleteNode(file._id, file.name)}
                          className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-[var(--primary-soft)] transition"
                          aria-label={t('common.delete')}
                          title={t('common.delete')}
                        >
                          <Trash2 className="w-4 h-4 text-[var(--muted)]" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {!contents.folders.length && !contents.files.length && (
                  <div className="text-sm text-[var(--muted)] py-8 text-center">
                    {t('files.empty')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

