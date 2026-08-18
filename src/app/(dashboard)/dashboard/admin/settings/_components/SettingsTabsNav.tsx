'use client';

import React from 'react';
import { Search, X, Layers, ToggleLeft, GraduationCap, Notebook, Globe } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
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

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: t('adminSettings.allTab') || 'All Settings', icon: Layers },
    { id: 'features', label: t('adminSettings.featureTogglesTab') || 'Feature Toggles', icon: ToggleLeft },
    { id: 'teacher_limits', label: t('adminSettings.contentLimitsTab') || 'Teacher Limits', icon: GraduationCap },
    { id: 'notes_limits', label: t('adminSettings.notesLimitsTab') || 'Notes Limits', icon: Notebook },
    { id: 'platform', label: t('adminSettings.platformConfigTab') || 'Platform & Access', icon: Globe },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
      {/* Scrollable Tab bar on mobile */}
      <div className="flex items-center gap-1.5 p-1 bg-[var(--color-surface-muted)] rounded-xl overflow-x-auto no-scrollbar border border-[var(--border)] shrink-0">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all shrink-0 min-h-[38px] ${
                isActive
                  ? 'bg-[var(--card-solid)] text-[var(--primary)] shadow-xs border border-[var(--border)]'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted-strong)]/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--primary)]' : 'text-[var(--color-muted-foreground)]'}`} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Live Search input */}
      <div className="relative flex-1 max-w-full md:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)] pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('adminSettings.searchPlaceholder') || 'Search settings...'}
          className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all min-h-[40px]"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] rounded-md"
            aria-label={t('adminSettings.clearSearch') || 'Clear Search'}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
