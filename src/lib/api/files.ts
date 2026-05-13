import { apiFormJson, apiJson } from '@/lib/api/http';

export type FolderContentsResponse = {
  folders: unknown[];
  files: unknown[];
};

export function listFolderContents(parentId: string | null): Promise<FolderContentsResponse> {
  const url = parentId ? `/api/files?parentId=${encodeURIComponent(parentId)}` : '/api/files';
  return apiJson<FolderContentsResponse>(url, { method: 'GET' });
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
