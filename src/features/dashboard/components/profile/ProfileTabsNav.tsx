'use client';

import React from 'react';
import { User, ShieldCheck, Award, LayoutGrid } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { ProfileTabKey } from './types';

interface ProfileTabsNavProps {
  activeTab: ProfileTabKey;
  onTabChange: (tab: ProfileTabKey) => void;
}

export function ProfileTabsNav({ activeTab, onTabChange }: ProfileTabsNavProps) {
  const { t } = useTranslation();

  const tabs: { id: ProfileTabKey; label: string; icon: React.ElementType }[] = [
    {
      id: 'account',
      label: t('profile.tabAccount') || 'Account & Identity',
      icon: User,
    },
    {
      id: 'security',
      label: t('profile.tabSecurity') || 'Security & Access',
      icon: ShieldCheck,
    },
    {
      id: 'capabilities',
      label: t('profile.tabCapabilities') || 'Role & Privileges',
      icon: Award,
    },
    {
      id: 'shortcuts',
      label: t('profile.tabShortcuts') || 'Quick Shortcuts',
      icon: LayoutGrid,
    },
  ];

  return (
    <div className="border-b border-[var(--border)] pb-1">
      <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar py-1" aria-label="Profile Tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-[var(--primary)] text-white shadow-xs font-semibold'
                  : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--surface-muted)]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[var(--color-muted-foreground)]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
