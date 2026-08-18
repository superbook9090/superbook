export type NodeType = 'folder' | 'file';

export interface FileNodeBase {
  _id: string;
  name: string;
  type: NodeType;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FolderNode extends FileNodeBase {
  type: 'folder';
  organizationId?: string | null;
}

export interface FileNodeItem extends FileNodeBase {
  type: 'file';
  fileUrl?: string;
  fileType: string;
  size: number;
  publicId?: string;
  organizationId?: string | null;
}

export interface FolderContentsResponse {
  folders: FolderNode[];
  files: FileNodeItem[];
  pagination?: {
    page: number;
    limit: number;
    foldersTotal: number;
    filesTotal: number;
  };
}

export type FileSortOption = 'newest' | 'oldest' | 'name_asc' | 'name_desc' | 'size_desc';

export type FileTypeFilter = 'all' | 'folders' | 'files';

export type ViewMode = 'grid' | 'table';

export interface BreadcrumbItem {
  id: string | null;
  name: string;
}

export interface FilesStatsData {
  totalFiles: number;
  totalFolders: number;
  storageUsed: number;
  currentDepth: number;
}

export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let n = bytes;
  let u = 0;
  while (n >= 1024 && u < units.length - 1) {
    n /= 1024;
    u += 1;
  }
  return `${n.toFixed(n >= 10 || u === 0 ? 0 : 1)} ${units[u]}`;
}
