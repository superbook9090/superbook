'use client';

import { useMemo } from 'react';
import { History, Copy, Users, ExternalLink, Calendar } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { EmptyState } from '@/components/layout';
import Button from '@/components/ui/Button';
import { NOTIFICATION_CATEGORIES, type AdminBroadcastLogItem } from './types';

interface NotificationHistoryProps {
  broadcasts: AdminBroadcastLogItem[];
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  onDuplicate: (item: AdminBroadcastLogItem) => void;
}

export function NotificationHistory({
  broadcasts,
  selectedCategory,
  onCategoryChange,
  onDuplicate,
}: NotificationHistoryProps) {
  const { t } = useTranslation();

  const filteredBroadcasts = useMemo(() => {
    if (selectedCategory === 'all') return broadcasts;
    return broadcasts.filter((b) => b.category === selectedCategory);
  }, [broadcasts, selectedCategory]);

  return (
    <div className="space-y-4">
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--color-border)]">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[var(--color-foreground)] flex items-center gap-2">
            <History className="w-5 h-5 text-[var(--primary)]" />
            <span>{t('admin.notifications.historyTitle')}</span>
          </h3>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            {t('admin.notifications.historyDescription')}
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => onCategoryChange('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap touch-target ${
              selectedCategory === 'all'
                ? 'bg-[var(--primary)] text-white shadow-xs font-bold'
                : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
            }`}
          >
            {t('admin.notifications.allCategories')}
          </button>
          {NOTIFICATION_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => onCategoryChange(cat.key)}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap touch-target ${
                selectedCategory === cat.key
                  ? 'bg-[var(--primary)] text-white shadow-xs font-bold'
                  : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
              }`}
            >
              {t(cat.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Broadcasts List */}
      {filteredBroadcasts.length === 0 ? (
        <div className="bg-[var(--card-solid)] border border-[var(--color-border)] rounded-2xl p-6">
          <EmptyState
            title={t('admin.notifications.historyEmpty')}
            description={t('admin.notifications.historyEmptyDesc')}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBroadcasts.map((item) => {
            const catMeta =
              NOTIFICATION_CATEGORIES.find((c) => c.key === item.category) ||
              NOTIFICATION_CATEGORIES[0];
            const Icon = catMeta.icon;
            const formattedDate = new Date(item.createdAt).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
            });

            return (
              <div
                key={item.id}
                className="bg-[var(--card-solid)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-5 shadow-[var(--shadow-sm)] hover:border-[var(--primary)]/40 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-[var(--color-border)]/60">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${catMeta.bgColor} ${catMeta.borderColor} ${catMeta.color}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t(catMeta.labelKey)}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 text-xs text-[var(--color-muted-foreground)]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formattedDate}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--primary-soft)] text-[var(--primary)] text-xs font-semibold">
                      <Users className="w-3.5 h-3.5" />
                      <span>{t('admin.notifications.recipientsCount', { count: item.recipientsCount })}</span>
                    </span>

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => onDuplicate(item)}
                      className="text-xs font-semibold py-1 px-2.5 flex items-center gap-1 touch-target shadow-xs"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{t('admin.notifications.duplicateBroadcast')}</span>
                    </Button>
                  </div>
                </div>

                {/* Content Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[var(--color-surface-muted)]/60 border border-[var(--color-border)] space-y-1">
                    <div className="font-bold text-[var(--color-foreground)]">
                      🇬🇧 {item.title?.en || 'Untitled'}
                    </div>
                    <div className="text-[var(--color-muted-foreground)] line-clamp-2">
                      {item.body?.en || ''}
                    </div>
                  </div>

                  {item.title?.hi && (
                    <div className="p-3 rounded-xl bg-[var(--color-surface-muted)]/60 border border-[var(--color-border)] space-y-1">
                      <div className="font-bold text-[var(--color-foreground)]">
                        🇮🇳 {item.title.hi}
                      </div>
                      <div className="text-[var(--color-muted-foreground)] line-clamp-2">
                        {item.body?.hi || ''}
                      </div>
                    </div>
                  )}
                </div>

                {item.data?.actionUrl && (
                  <div className="flex items-center gap-1 text-xs text-[var(--primary)] font-medium">
                    <ExternalLink className="w-3 h-3" />
                    <span>Action URL: {item.data.actionUrl}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
