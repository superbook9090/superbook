'use client';

import React, { useEffect, useState } from 'react';
import { Monitor, Sun, Moon, Palette, Check } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import {
  getStoredThemePreference,
  setThemePreference,
  type ThemePreference,
} from '@/lib/theme';

export function ProfileAppearanceTab() {
  const { t } = useTranslation();
  const [preference, setPreference] = useState<ThemePreference>('system');

  useEffect(() => {
    setPreference(getStoredThemePreference());
  }, []);

  const options: { id: ThemePreference; label: string; desc: string; icon: React.ElementType }[] = [
    { id: 'system', label: t('profile.themeSystem'), desc: t('profile.themeSystemDesc'), icon: Monitor },
    { id: 'light', label: t('profile.themeLight'), desc: t('profile.themeLightDesc'), icon: Sun },
    { id: 'dark', label: t('profile.themeDark'), desc: t('profile.themeDarkDesc'), icon: Moon },
  ];

  const choose = (next: ThemePreference) => {
    setPreference(next);
    setThemePreference(next);
  };

  return (
    <div className="card-panel">
      <div className="card-panel-header bg-[var(--surface-muted)]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] shrink-0">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-[var(--color-foreground)]">
              {t('profile.appearanceTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
              {t('profile.appearanceDesc')}
            </p>
          </div>
        </div>
      </div>

      <div className="card-panel-body bg-[var(--card-solid)]">
        <div role="radiogroup" aria-label={t('profile.appearanceTitle')} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {options.map((opt) => {
            const Icon = opt.icon;
            const selected = preference === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => choose(opt.id)}
                className={`relative flex items-start gap-3 p-3.5 min-h-[44px] rounded-xl border text-left transition-all cursor-pointer focus-ring ${
                  selected
                    ? 'border-[var(--primary)] bg-[var(--primary-soft)] shadow-xs'
                    : 'border-[var(--border)] bg-[var(--card-solid)] hover:bg-[var(--surface-muted)]'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    selected ? 'text-[var(--primary)]' : 'text-[var(--color-muted-foreground)]'
                  }`}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-[var(--color-foreground)]">{opt.label}</span>
                  <span className="block text-xs text-[var(--color-muted-foreground)] mt-0.5">{opt.desc}</span>
                </span>
                {selected && <Check className="w-4 h-4 text-[var(--primary)] shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
