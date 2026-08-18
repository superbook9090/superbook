'use client';

import React from 'react';
import type { Session } from '@/types';
import { CheckCircle2, Lock } from 'lucide-react';
import { normalizeRole, isSuperAdmin, isAdmin } from '@/lib/roles';
import { useTranslation } from '@/hooks/useTranslation';
import type { AccountInfo } from '@/lib/api/auth';
import { getRoleCapabilities } from './capabilitiesConfig';

interface ProfileCapabilitiesTabProps {
  session: Session;
  accountInfo: AccountInfo | null;
}

export function ProfileCapabilitiesTab({ session, accountInfo }: ProfileCapabilitiesTabProps) {
  const { t } = useTranslation();
  const rawRole = session.user?.role;
  const role = normalizeRole(rawRole);
  const superAdmin = isSuperAdmin(rawRole);
  const adminUser = isAdmin(rawRole);

  const capabilities = getRoleCapabilities(role, superAdmin, adminUser, accountInfo, session, t);

  return (
    <div className="card-panel">
      <div className="card-panel-header bg-[var(--surface-muted)]">
        <h2 className="text-base sm:text-lg font-semibold text-[var(--color-foreground)]">
          {capabilities.title}
        </h2>
        <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
          {capabilities.desc}
        </p>
      </div>

      <div className="card-panel-body grid grid-cols-1 md:grid-cols-2 gap-4">
        {capabilities.items.map((perm, i) => {
          const Icon = perm.icon;
          return (
            <div
              key={i}
              className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                perm.allowed
                  ? 'border-[var(--border)] bg-[var(--card-solid)] hover:border-[var(--primary)]/30'
                  : 'border-[var(--border)] bg-[var(--color-surface-muted)]/50 opacity-60'
              }`}
            >
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  perm.allowed
                    ? 'bg-[var(--primary-soft)] text-[var(--primary)]'
                    : 'bg-[var(--surface-muted)] text-[var(--color-muted)]'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-xs sm:text-sm font-semibold text-[var(--color-foreground)] truncate">
                    {perm.title}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold shrink-0 border ${
                      perm.allowed
                        ? 'bg-[var(--success-light)] text-[var(--success)] border-[var(--success)]/20'
                        : 'bg-[var(--surface-muted)] text-[var(--color-muted)] border-[var(--border)]'
                    }`}
                  >
                    {perm.allowed ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> Granted
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3" /> Restricted
                      </>
                    )}
                  </span>
                </div>

                <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">
                  {perm.desc}
                </p>

                <div className="mt-2 pt-2 border-t border-[var(--border)]/60 flex items-center justify-between text-[11px] text-[var(--color-muted-foreground)]">
                  <span>Scope</span>
                  <span className="font-medium text-[var(--color-foreground)]">{perm.scope}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
