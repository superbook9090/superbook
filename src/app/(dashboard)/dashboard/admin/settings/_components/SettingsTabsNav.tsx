'use client';

import React from 'react';
import {
  Search,
  X,
  Layers,
  ToggleLeft,
  GraduationCap,
  Notebook,
  Globe,
  Zap,
  Smartphone,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { AdminTabs, type AdminTabOption } from '@/features/admin/components/AdminTabs';
import type { SettingsTab } from './types';

interface Props {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function SettingsTabsNav({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
}: Props) {
  const { t } = useTranslation();

  const tabs: AdminTabOption<SettingsTab>[] = [
    { id: 'all', label: t('adminSettings.allTab'), icon: <Layers className="w-4 h-4 shrink-0" />, tone: 'amber' },
    { id: 'jobs', label: 'Manual Jobs', icon: <Zap className="w-4 h-4 shrink-0" />, tone: 'amber' },
    { id: 'features', label: t('adminSettings.featureTogglesTab'), icon: <ToggleLeft className="w-4 h-4 shrink-0" />, tone: 'amber' },
    { id: 'app_version', label: t('adminSettings.appVersionTab'), icon: <Smartphone className="w-4 h-4 shrink-0" />, tone: 'amber' },
    { id: 'teacher_limits', label: t('adminSettings.contentLimitsTab'), icon: <GraduationCap className="w-4 h-4 shrink-0" />, tone: 'amber' },
    { id: 'notes_limits', label: t('adminSettings.notesLimitsTab'), icon: <Notebook className="w-4 h-4 shrink-0" />, tone: 'amber' },
    { id: 'platform', label: t('adminSettings.platformConfigTab'), icon: <Globe className="w-4 h-4 shrink-0" />, tone: 'amber' },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
      <AdminTabs tabs={tabs} activeTab={activeTab} onChange={onTabChange} />

      <div className="relative flex-1 max-w-full lg:max-w-xs">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)] pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('adminSettings.searchPlaceholder')}
          className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm rounded-xl bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--teacher-primary)]/35 transition-all min-h-[44px]"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] rounded-[8px] cursor-pointer"
            aria-label={t('adminSettings.clearSearch')}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
