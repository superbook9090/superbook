'use client';

import React from 'react';
import { FilesTable } from './FilesTable';
import { FilesGrid } from './FilesGrid';
import { FilesMobileList } from './FilesMobileList';
import type { FileNodeItem, FolderNode, ViewMode } from './types';

interface FilesContentViewProps {
  viewMode: ViewMode;
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

export function FilesContentView({
  viewMode,
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
}: FilesContentViewProps) {
  return (
    <>
      {/* Desktop Table View */}
      {viewMode === 'table' && (
        <div className="hidden md:block">
          <FilesTable
            folders={folders}
            files={files}
            canMutate={canMutate}
            onOpenFolder={onOpenFolder}
            onPreviewFile={onPreviewFile}
            onDownloadFile={onDownloadFile}
            onCopyLink={onCopyLink}
            onRenameFolder={onRenameFolder}
            onRenameFile={onRenameFile}
            onDeleteFolder={onDeleteFolder}
            onDeleteFile={onDeleteFile}
          />
        </div>
      )}

      {/* Desktop Grid View */}
      {viewMode === 'grid' && (
        <FilesGrid
          folders={folders}
          files={files}
          canMutate={canMutate}
          onOpenFolder={onOpenFolder}
          onPreviewFile={onPreviewFile}
          onDownloadFile={onDownloadFile}
          onCopyLink={onCopyLink}
          onRenameFolder={onRenameFolder}
          onRenameFile={onRenameFile}
          onDeleteFolder={onDeleteFolder}
          onDeleteFile={onDeleteFile}
        />
      )}

      {/* Mobile Optimized View */}
      <FilesMobileList
        folders={folders}
        files={files}
        canMutate={canMutate}
        onOpenFolder={onOpenFolder}
        onPreviewFile={onPreviewFile}
        onDownloadFile={onDownloadFile}
        onCopyLink={onCopyLink}
        onRenameFolder={onRenameFolder}
        onRenameFile={onRenameFile}
        onDeleteFolder={onDeleteFolder}
        onDeleteFile={onDeleteFile}
      />
    </>
  );
}
