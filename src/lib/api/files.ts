import { apiFormJson, apiJson } from '@/lib/api/http';

export type FolderContentsResponse<TFolder = unknown, TFile = unknown> = {
  folders: TFolder[];
  files: TFile[];
  pagination?: {
    page: number;
    limit: number;
    foldersTotal: number;
    filesTotal: number;
  };
};

export function listFolderContents<TFolder = unknown, TFile = unknown>(
  parentId: string | null
): Promise<FolderContentsResponse<TFolder, TFile>> {
  const url = parentId ? `/api/files?parentId=${encodeURIComponent(parentId)}` : '/api/files';
  return apiJson<FolderContentsResponse<TFolder, TFile>>(url, { method: 'GET' });
}

export function createFileFolder(body: { name: string; parentId: string | null }): Promise<unknown> {
  return apiJson('/api/files/folder', { method: 'POST', body });
}

export function uploadFile(formData: FormData): Promise<unknown> {
  return apiFormJson('/api/files/upload', formData, { method: 'POST' });
}

export function deleteFileNode(id: string): Promise<unknown> {
  return apiJson(`/api/files/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function renameFileNode(id: string, name: string): Promise<unknown> {
  return apiJson(`/api/files/${encodeURIComponent(id)}`, { method: 'PATCH', body: { name } });
}
