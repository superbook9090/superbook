'use client';

import React from 'react';
import Link from 'next/link';
import type { Session } from '@/types';
import { ChevronRight } from 'lucide-react';
import { normalizeRole, isSuperAdmin, isAdmin } from '@/lib/roles';
import { useTranslation } from '@/hooks/useTranslation';
import { getRoleShortcuts } from './shortcutsConfig';

interface ProfileShortcutsTabProps {
  session: Session;
}

export function ProfileShortcutsTab({ session }: ProfileShortcutsTabProps) {
  const { t } = useTranslation();
  const rawRole = session.user?.role;
  const role = normalizeRole(rawRole);
  const superAdmin = isSuperAdmin(rawRole);
  const adminUser = isAdmin(rawRole);

  const shortcuts = getRoleShortcuts(role, superAdmin, adminUser, t);

  return (
    <div className="card-panel">
      <div className="card-panel-header bg-[var(--surface-muted)]">
        <h2 className="text-base sm:text-lg font-semibold text-[var(--color-foreground)]">
          {t('profile.shortcutsTitle') || 'Dashboard Quick Access'}
        </h2>
        <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
          {t('profile.shortcutsDesc') || 'Jump directly to your frequently used workspaces and tools.'}
        </p>
      </div>

      <div className="card-panel-body grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {shortcuts.map((item, i) => {
          const Icon = item.icon;
          return (
            <Link
              key={i}
              href={item.href}
              className={`p-4 rounded-xl border border-[var(--border)] bg-[var(--card-solid)] hover:shadow-sm hover:-translate-y-0.5 transition-all flex items-start gap-3.5 group cursor-pointer ${item.color}`}
            >
              <div className="p-2.5 rounded-xl bg-[var(--surface-muted)] text-[var(--primary)] border border-[var(--border)] shrink-0 group-hover:scale-105 transition-transform">
                <Icon className="w-5 h-5" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-semibold text-[var(--color-foreground)] group-hover:text-[var(--primary)] transition-colors truncate">
                  {item.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-[var(--color-muted-foreground)] line-clamp-2 leading-relaxed mt-0.5">
                  {item.desc}
                </p>
              </div>

              <ChevronRight className="w-4 h-4 text-[var(--color-muted-foreground)] group-hover:text-[var(--primary)] group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
