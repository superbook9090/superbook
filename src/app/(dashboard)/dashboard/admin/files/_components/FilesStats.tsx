'use client';

import React from 'react';
import { FileText, Folder, HardDrive, Layers } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { useTranslation } from '@/hooks/useTranslation';
import { formatBytes, type FilesStatsData } from './types';

interface FilesStatsProps {
  stats: FilesStatsData;
  isLoading?: boolean;
}

export function FilesStats({ stats, isLoading }: FilesStatsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
      <StatCard
        icon={FileText}
        label={t('files.totalFiles')}
        value={isLoading ? '...' : stats.totalFiles}
        color="info"
        description={t('files.filesOnly')}
        delay={0.05}
      />
      <StatCard
        icon={Folder}
        label={t('files.totalFolders')}
        value={isLoading ? '...' : stats.totalFolders}
        color="warning"
        description={t('files.foldersOnly')}
        delay={0.1}
      />
      <StatCard
        icon={HardDrive}
        label={t('files.storageUsed')}
        value={isLoading ? '...' : formatBytes(stats.storageUsed)}
        color="success"
        description={t('files.uploadRestrictions')}
        delay={0.15}
      />
      <StatCard
        icon={Layers}
        label={t('files.currentLocation')}
        value={isLoading ? '...' : stats.currentDepth === 0 ? t('files.root') : `Lvl ${stats.currentDepth}`}
        color="admin"
        description={stats.currentDepth === 0 ? 'Top Directory' : `Depth: ${stats.currentDepth}`}
        delay={0.2}
      />
    </div>
  );
}
