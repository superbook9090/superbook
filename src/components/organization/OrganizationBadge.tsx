'use client';

import React from 'react';
import { Building2 } from 'lucide-react';

interface OrganizationBadgeProps {
  name?: string | null;
  logo?: string | null;
  color?: string | null;
  size?: 'sm' | 'md';
  variant?: 'pill' | 'card';
  className?: string;
}

function getOrgInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function OrganizationBadge({
  name,
  logo,
  color,
  size = 'sm',
  variant = 'pill',
  className = '',
}: OrganizationBadgeProps) {
  if (!name) return null;

  const initials = getOrgInitials(name);
  const isPill = variant === 'pill';

  if (isPill) {
    const iconDim = size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[var(--border)] bg-[var(--card-solid)] shadow-xs transition-all ${className}`}
        style={color ? { borderColor: `${color}40` } : undefined}
        title={`Affiliated with ${name}`}
      >
        {logo ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={logo}
            alt={name}
            className={`${iconDim} rounded object-contain shrink-0`}
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div
            className={`${iconDim} rounded text-[9px] font-extrabold flex items-center justify-center text-white shrink-0`}
            style={{ backgroundColor: color || 'var(--primary)' }}
          >
            {initials}
          </div>
        )}
        <span className="text-xs font-bold text-[var(--color-foreground)] truncate max-w-[140px] sm:max-w-[200px]">
          {name}
        </span>
      </div>
    );
  }

  // Card Variant (for sidebars or profiles)
  return (
    <div
      className={`flex items-center gap-2.5 p-2.5 rounded-xl border border-[var(--border)] bg-[var(--card-solid)] shadow-xs ${className}`}
      style={color ? { borderColor: `${color}40` } : undefined}
    >
      {logo ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={logo}
          alt={name}
          className="w-7 h-7 rounded-lg object-contain bg-[var(--color-surface)] p-0.5 border border-[var(--border)] shrink-0"
        />
      ) : (
        <div
          className="w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center text-white shrink-0 shadow-xs"
          style={{ backgroundColor: color || 'var(--primary)' }}
        >
          {initials}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <Building2 className="w-3 h-3 text-[var(--primary)] shrink-0" />
          <p className="text-xs font-bold text-[var(--color-foreground)] truncate">{name}</p>
        </div>
        <span className="text-[10px] text-[var(--color-muted-foreground)] font-medium block">
          Affiliated Organization
        </span>
      </div>
    </div>
  );
}

export default OrganizationBadge;
