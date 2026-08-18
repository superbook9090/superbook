import type {
  FileNodeItem,
  FileSortOption,
  FileTypeFilter,
  FolderNode,
} from './types';

export function filterAndSortFolders(
  folders: FolderNode[],
  searchQuery: string,
  typeFilter: FileTypeFilter,
  sortOption: FileSortOption
): FolderNode[] {
  if (typeFilter === 'files') return [];
  let list = [...folders];
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    list = list.filter((f) => f.name.toLowerCase().includes(q));
  }
  list.sort((a, b) => {
    if (sortOption === 'name_asc') return a.name.localeCompare(b.name);
    if (sortOption === 'name_desc') return b.name.localeCompare(a.name);
    if (sortOption === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  return list;
}

export function filterAndSortFiles(
  files: FileNodeItem[],
  searchQuery: string,
  typeFilter: FileTypeFilter,
  sortOption: FileSortOption
): FileNodeItem[] {
  if (typeFilter === 'folders') return [];
  let list = [...files];
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    list = list.filter((f) => f.name.toLowerCase().includes(q));
  }
  list.sort((a, b) => {
    if (sortOption === 'name_asc') return a.name.localeCompare(b.name);
    if (sortOption === 'name_desc') return b.name.localeCompare(a.name);
    if (sortOption === 'size_desc') return (b.size || 0) - (a.size || 0);
    if (sortOption === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  return list;
}
