'use client';

import { useState, useEffect } from 'react';
import { Smartphone, ExternalLink } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/constants/routes';
import { isMobileApp } from '@/lib/mobile/mobileDetection';

export default function DownloadAppSidebarCard({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  const [inMobileApp, setInMobileApp] = useState(false);

  useEffect(() => {
    setInMobileApp(isMobileApp());
  }, []);

  if (inMobileApp) return null;

  if (compact) {
    return (
      <a
        href={ROUTES.downloadApp}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/15 border border-emerald-500/30 text-[var(--color-foreground)] hover:border-emerald-500/60 hover:bg-emerald-500/20 transition-all group shadow-xs text-xs font-semibold"
      >
        <Smartphone className="w-4 h-4 text-emerald-500 shrink-0 group-hover:scale-110 transition-transform" />
        <span className="truncate flex-1">{t('common.downloadApp')}</span>
        <ExternalLink className="w-3 h-3 text-[var(--color-muted-foreground)] opacity-70 group-hover:opacity-100 shrink-0" />
      </a>
    );
  }

  return (
    <a
      href={ROUTES.downloadApp}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/15 border border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/20 transition-all group shadow-xs my-2"
    >
      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-xs">
        <Smartphone className="w-4.5 h-4.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-[var(--color-foreground)] flex items-center justify-between">
          <span className="truncate">{t('common.downloadApp')}</span>
          <ExternalLink className="w-3 h-3 text-[var(--color-muted-foreground)] opacity-70 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
        </div>
        <div className="text-[10px] text-[var(--color-muted-foreground)] truncate">
          {t('common.getOnGooglePlay')}
        </div>
      </div>
    </a>
  );
}
