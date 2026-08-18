'use client';

import React from 'react';
import { FolderGridCard } from './FolderGridCard';
import { FileGridCard } from './FileGridCard';
import type { FileNodeItem, FolderNode } from './types';

interface FilesGridProps {
  folders: FolderNode[];
  files: FileNodeItem[];
  canMutate: boolean;
  onOpenFolder: (folder: FolderNode) => void;
  onPreviewFile: (file: FileNodeItem) => void;
  onDownloadFile: (file: FileNodeItem) => void;
  onCopyLink: (file: FileNodeItem) => void;
  onRenameFolder: (folder: FolderNode) => void;
  onRenameFile: (file: FileNodeItem) => void;
  onDeleteFolder: (folder: FolderNode) => void;
  onDeleteFile: (file: FileNodeItem) => void;
}

export function FilesGrid({
  folders,
  files,
  canMutate,
  onOpenFolder,
  onPreviewFile,
  onDownloadFile,
  onCopyLink,
  onRenameFolder,
  onRenameFile,
  onDeleteFolder,
  onDeleteFile,
}: FilesGridProps) {
  return (
    <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      {folders.map((folder) => (
        <FolderGridCard
          key={folder._id}
          folder={folder}
          canMutate={canMutate}
          onOpen={onOpenFolder}
          onRename={onRenameFolder}
          onDelete={onDeleteFolder}
        />
      ))}

      {files.map((file) => (
        <FileGridCard
          key={file._id}
          file={file}
          canMutate={canMutate}
          onPreview={onPreviewFile}
          onDownload={onDownloadFile}
          onCopyLink={onCopyLink}
          onRename={onRenameFile}
          onDelete={onDeleteFile}
        />
      ))}
    </div>
  );
}
