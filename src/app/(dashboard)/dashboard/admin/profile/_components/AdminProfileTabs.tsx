'use client';

import React from 'react';
import { User, ShieldCheck, KeyRound, LayoutGrid } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { AdminProfileTabKey } from '../_types';

interface AdminProfileTabsProps {
  activeTab: AdminProfileTabKey;
  onTabChange: (tab: AdminProfileTabKey) => void;
}

export function AdminProfileTabs({ activeTab, onTabChange }: AdminProfileTabsProps) {
  const { t } = useTranslation();

  const tabs: { id: AdminProfileTabKey; label: string; icon: React.ElementType }[] = [
    {
      id: 'account',
      label: t('adminProfile.tabAccount') || 'Account & Identity',
      icon: User,
    },
    {
      id: 'security',
      label: t('adminProfile.tabSecurity') || 'Security & Access',
      icon: ShieldCheck,
    },
    {
      id: 'permissions',
      label: t('adminProfile.tabPermissions') || 'Role & Permissions',
      icon: KeyRound,
    },
    {
      id: 'shortcuts',
      label: t('adminProfile.tabShortcuts') || 'Admin Hub Shortcuts',
      icon: LayoutGrid,
    },
  ];

  return (
    <div className="border-b border-[var(--border)]">
      <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar py-1" aria-label="Profile Tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-[var(--primary)] text-white shadow-xs font-semibold'
                  : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)]'
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
