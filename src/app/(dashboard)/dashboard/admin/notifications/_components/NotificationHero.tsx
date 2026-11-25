'use client';

import { useState } from 'react';
import {
  BellRing,
  RefreshCw,
  Send,
  Sparkles,
  History,
  Bell,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { useAlert } from '@/components/ui/AlertContainer';
import { registerDeviceToken } from '@/lib/notifications/push/registerDevice';
import { apiJsonData, ApiClientError } from '@/lib/api/http';
import { AdminPageBanner } from '@/features/admin/components/AdminPageBanner';
import { AdminTabs, type AdminTabOption } from '@/features/admin/components/AdminTabs';
import type { NotificationTabKey } from './types';

interface NotificationHeroProps {
  activeTab: NotificationTabKey;
  onTabChange: (tab: NotificationTabKey) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: Date | null;
}

export function NotificationHero({
  activeTab,
  onTabChange,
  onRefresh,
  isRefreshing,
  lastUpdated,
}: NotificationHeroProps) {
  const { t } = useTranslation();
  const { session } = useSessionStore();
  const { addAlert } = useAlert();
  const [testingPush, setTestingPush] = useState(false);

  const handleTestBrowserPush = async () => {
    const userId = session?.user?.id;
    if (!userId || testingPush) return;
    setTestingPush(true);
    try {
      const registered = await registerDeviceToken(userId, 'web', true);
      if (!registered) {
        const blocked =
          typeof window !== 'undefined' &&
          'Notification' in window &&
          Notification.permission === 'denied';
        addAlert({
          type: 'error',
          message: blocked
            ? t('notifications.inbox.pushBlocked')
            : t('notifications.push.enableFailed'),
          duration: 6000,
        });
        return;
      }
      window.dispatchEvent(new Event('quizdo:push-enabled'));
      const { data } = await apiJsonData<{ message?: string }>('/api/notifications/test', {
        method: 'POST',
      });
      addAlert({
        type: 'success',
        message: data?.message || t('notifications.push.testSent'),
        duration: 5000,
      });
      onRefresh();
    } catch (err) {
      addAlert({
        type: 'error',
        message: err instanceof ApiClientError ? err.message : t('notifications.push.enableFailed'),
        duration: 6000,
      });
    } finally {
      setTestingPush(false);
    }
  };

  const tabs: AdminTabOption<NotificationTabKey>[] = [
    { id: 'compose', label: t('admin.notifications.tabCompose'), icon: <Send className="w-4 h-4 shrink-0" />, tone: 'amber' },
    { id: 'templates', label: t('admin.notifications.tabTemplates'), icon: <Sparkles className="w-4 h-4 shrink-0" />, tone: 'amber' },
    { id: 'history', label: t('admin.notifications.tabHistory'), icon: <History className="w-4 h-4 shrink-0" />, tone: 'amber' },
  ];

  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '';

  return (
    <div className="space-y-4 w-full min-w-0">
      <AdminPageBanner
        icon={BellRing}
        eyebrow={t('admin.notifications.title')}
        title={t('admin.notifications.title')}
        description={t('admin.notifications.description')}
        tier="superadmin"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {formattedTime && (
              <span className="text-xs text-[var(--color-muted-foreground)] font-medium tabular-nums mr-1">
                {t('adminAnalytics.lastUpdated', { time: formattedTime })}
              </span>
            )}
            <button
              type="button"
              onClick={handleTestBrowserPush}
              disabled={testingPush}
              className="teacher-pill-btn min-h-[44px] px-3.5 text-xs sm:text-sm font-semibold cursor-pointer"
            >
              <Bell className={`w-4 h-4 text-amber-500 ${testingPush ? 'animate-pulse' : ''}`} />
              <span>{testingPush ? t('notifications.inbox.enabling') : t('notifications.push.testBrowser')}</span>
            </button>
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="teacher-pill-btn min-h-[44px] px-3.5 text-xs sm:text-sm font-semibold cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? t('adminAnalytics.refreshing') : t('adminAnalytics.refresh')}</span>
            </button>
          </div>
        }
      />

      <AdminTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={onTabChange}
        fullWidth
      />
    </div>
  );
}
