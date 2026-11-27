'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  BookOpen,
  BrainCircuit,
  ClipboardList,
  Megaphone,
  Settings,
  Trophy,
  Video,
  CheckCircle2,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { useAlert } from '@/components/ui/AlertContainer';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { PageWrapper, EmptyState } from '@/components/layout';
import {
  fetchUserNotifications,
  markNotificationRead,
  type UserNotificationItem,
} from '@/lib/api/notifications';
import { handleDeepLink } from '@/lib/mobile/deepLink';
import type { NotificationCategory } from '@/lib/notifications/push/notificationPayload';
import { StudentPageBanner } from '@/features/student/components/StudentPageBanner';
import { StudentTabs } from '@/features/student/components/StudentTabs';
import { queryKeys } from '@/lib/react-query/query-keys';
import { cn } from '@/lib/utils';

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

function getCategoryIcon(category: NotificationCategory | string) {
  switch (category) {
    case 'lessons': return <BookOpen className="w-4 h-4 text-[var(--info)]" />;
    case 'quizzes': return <BrainCircuit className="w-4 h-4 text-[var(--student-primary)]" />;
    case 'assignments': return <ClipboardList className="w-4 h-4 text-[var(--warning)]" />;
    case 'liveClasses': return <Video className="w-4 h-4 text-[var(--error)]" />;
    case 'announcements': return <Megaphone className="w-4 h-4 text-[var(--warning)]" />;
    case 'contests': return <Trophy className="w-4 h-4 text-[var(--success)]" />;
    default: return <Settings className="w-4 h-4 text-[var(--color-muted-foreground)]" />;
  }
}

export default function StudentNotificationsPage() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t, lang } = useTranslation();
  const { addAlert } = useAlert();

  const [filterTab, setFilterTab] = useState<'all' | 'unread'>('all');
  const [permissionState, setPermissionState] = useState<NotificationPermission | 'unsupported'>('default');
  const [requestingPush, setRequestingPush] = useState(false);

  const inboxKey = queryKeys.notifications.inbox(session?.user?.id);

  const notificationsQuery = useQuery({
    queryKey: inboxKey,
    queryFn: async () => {
      const { notifications: items } = await fetchUserNotifications();
      return items;
    },
    enabled: status === 'authenticated' && session?.user?.role === 'student',
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (notificationsQuery.error) {
      addAlert({ type: 'error', message: t('notifications.inbox.loadFailed'), duration: 5000 });
    }
  }, [notificationsQuery.error, addAlert, t]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) { router.push(ROUTES.login); return; }
    if (session.user?.role !== 'student') { router.push(ROUTES.dashboard); }
  }, [status, session, router]);

  const notifications = useMemo(() => notificationsQuery.data ?? [], [notificationsQuery.data]);
  const loading = notificationsQuery.isPending;

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionState(Notification.permission);
    } else {
      setPermissionState('unsupported');
    }
  }, []);

  const handleNotificationClick = async (item: UserNotificationItem) => {
    if (!item.read) {
      try {
        await markNotificationRead(item._id);
        queryClient.setQueryData<UserNotificationItem[]>(inboxKey, (prev) =>
          (prev ?? []).map((n) => (n._id === item._id ? { ...n, read: true } : n))
        );
      } catch {
        addAlert({ type: 'error', message: t('notifications.inbox.markReadFailed'), duration: 5000 });
      }
    }
    if (item.data?.url) handleDeepLink(item.data.url, router);
  };

  const handleEnablePush = async () => {
    if (!session?.user?.id) return;
    setRequestingPush(true);
    try {
      const { registerDeviceToken } = await import('@/lib/notifications/push/registerDevice');
      const success = await registerDeviceToken(session.user.id, 'web', true);
      if (typeof window !== 'undefined' && 'Notification' in window) {
        setPermissionState(Notification.permission);
      }
      if (success) {
        window.dispatchEvent(new Event('quizdo:push-enabled'));
        addAlert({ type: 'success', message: t('notifications.inbox.pushEnabled'), duration: 4000 });
      } else if (Notification.permission === 'denied') {
        addAlert({ type: 'error', message: t('notifications.inbox.pushBlocked'), duration: 6000 });
      } else {
        addAlert({ type: 'error', message: t('notifications.push.enableFailed'), duration: 5000 });
      }
    } catch {
      addAlert({ type: 'error', message: t('notifications.inbox.loadFailed'), duration: 4000 });
    } finally {
      setRequestingPush(false);
    }
  };

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
  const visibleItems = useMemo(
    () => (filterTab === 'unread' ? notifications.filter((n) => !n.read) : notifications),
    [notifications, filterTab]
  );

  if (status === 'loading' || loading) return <PageSkeleton />;

  return (
    <PageWrapper>
      <StudentPageBanner
        icon={Bell}
        eyebrow={t('common.notifications')}
        title={t('notifications.inbox.title')}
        description={t('notifications.inbox.description')}
        actions={
          permissionState !== 'unsupported' ? (
            permissionState === 'granted' ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[var(--success-light)] text-[var(--success)] border border-[var(--success)]/25">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('notifications.inbox.pushEnabled')}</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleEnablePush}
                disabled={requestingPush}
                className="student-cta-btn w-full sm:w-auto disabled:opacity-50"
              >
                <Bell className="w-4 h-4" />
                <span>{requestingPush ? t('notifications.inbox.enabling') : t('notifications.inbox.enablePush')}</span>
              </button>
            )
          ) : null
        }
      />

      {notifications.length > 0 && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <StudentTabs
            activeTab={filterTab}
            onChange={setFilterTab}
            tabs={[
              { id: 'all', label: t('studentUi.allNotifications'), count: notifications.length },
              {
                id: 'unread',
                label: t('studentUi.unreadNotifications'),
                count: unreadCount > 0 ? unreadCount : undefined,
                tone: 'danger',
              },
            ]}
          />
        </div>
      )}

      {visibleItems.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={
            filterTab === 'unread'
              ? t('studentUi.noUnreadNotifications')
              : t('notifications.inbox.empty')
          }
          description={filterTab === 'unread' ? t('studentUi.noUnreadNotificationsDesc') : undefined}
        />
      ) : (
        <div className="space-y-2.5 sm:space-y-3">
          {visibleItems.map((item) => (
            <button
              key={item._id}
              type="button"
              onClick={() => void handleNotificationClick(item)}
              className={cn(
                'student-card w-full text-left p-4 sm:p-5 focus-ring cursor-pointer',
                !item.read && 'border-[var(--student-primary)]/40 bg-[var(--student-soft)]/30'
              )}
            >
              <div className="flex items-start gap-3 sm:gap-4 w-full">
                <div className="relative shrink-0 mt-0.5">
                  <div className="w-10 h-10 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]/80 flex items-center justify-center">
                    {getCategoryIcon(item.category)}
                  </div>
                  {!item.read && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[var(--student-primary)] ring-2 ring-[var(--card-solid)]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold text-[var(--student-primary)] px-2 py-0.5 rounded-md bg-[var(--student-soft)] border border-[var(--student-border)] uppercase tracking-wider">
                      {t(`notifications.categories.${item.category}`)}
                    </span>
                    <span className="text-[11px] text-[var(--color-muted-foreground)] font-medium">
                      {formatWhen(item.createdAt, lang)}
                    </span>
                  </div>
                  <p
                    className={cn(
                      'text-sm sm:text-base font-bold leading-snug break-words',
                      !item.read ? 'text-[var(--student-primary)]' : 'text-[var(--color-foreground)]'
                    )}
                  >
                    {localizedText(item.title, lang)}
                  </p>
                  <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] leading-relaxed break-words mt-1">
                    {localizedText(item.body, lang)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
