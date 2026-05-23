'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { useSessionStore } from '@/store/useSessionStore';
import Alert from '@/components/ui/Alert';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { PageWrapper, PageHeader, EmptyState } from '@/components/layout';
import {
  fetchUserNotifications,
  markNotificationRead,
  type UserNotificationItem,
} from '@/lib/api/notifications';
import { handleDeepLink } from '@/lib/mobile/deepLink';

function localizedText(value: { en: string; hi?: string }, lang: string): string {
  if (lang === 'hi' && value.hi) return value.hi;
  return value.en;
}

function formatWhen(iso: string, lang: string): string {
  try {
    return new Intl.DateTimeFormat(lang === 'hi' ? 'hi-IN' : 'en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function StudentNotificationsPage() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const { t, lang } = useTranslation();
  const { theme } = useRoleTheme();

  const [notifications, setNotifications] = useState<UserNotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertState, setAlertState] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      const { notifications: items } = await fetchUserNotifications();
      setNotifications(items);
    } catch {
      setAlertState({ type: 'error', message: t('notifications.inbox.loadFailed') });
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    if (session.user?.role !== 'student') {
      router.push('/dashboard');
      return;
    }
    void loadNotifications();
  }, [status, session, router, loadNotifications]);

  const handleNotificationClick = async (item: UserNotificationItem) => {
    if (!item.read) {
      try {
        await markNotificationRead(item._id);
        setNotifications((prev) => prev.map((n) => (n._id === item._id ? { ...n, read: true } : n)));
      } catch {
        setAlertState({ type: 'error', message: t('notifications.inbox.markReadFailed') });
      }
    }

    const url = item.data?.url;
    if (url) {
      handleDeepLink(url, router);
    }
  };

  if (status === 'loading' || loading) {
    return <PageSkeleton />;
  }

  return (
    <PageWrapper>
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Bell className={`w-7 h-7 ${theme.text}`} aria-hidden />
            {t('notifications.inbox.title')}
          </span>
        }
        description={t('notifications.inbox.description')}
      />

      {alertState ? (
        <Alert type={alertState.type} message={alertState.message} onClose={() => setAlertState(null)} />
      ) : null}

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title={t('notifications.inbox.empty')} />
      ) : (
        <div className="card-list">
          {notifications.map((item) => (
            <button
              key={item._id}
              type="button"
              onClick={() => void handleNotificationClick(item)}
              className={`card-list-item focus-ring ${
                item.read
                  ? 'bg-[var(--card-solid)]'
                  : 'bg-[var(--primary-soft)] border-[var(--primary)]/20'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-[var(--color-foreground)]">
                    {localizedText(item.title, lang)}
                  </p>
                  <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
                    {localizedText(item.body, lang)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-medium text-[var(--primary)]">
                    {t(`notifications.categories.${item.category}`)}
                  </span>
                  <span className="text-xs text-[var(--color-muted-foreground)] block mt-1">
                    {formatWhen(item.createdAt, lang)}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
