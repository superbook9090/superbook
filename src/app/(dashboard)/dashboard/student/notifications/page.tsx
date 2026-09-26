'use client';
import { ROUTES } from '@/constants/routes';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, BookOpen, BrainCircuit, ClipboardList, Megaphone, Settings, Trophy, Video } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { useAlert } from '@/components/ui/AlertContainer';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { PageWrapper, PageHeader, EmptyState } from '@/components/layout';
import {
  fetchUserNotifications,
  markNotificationRead,
  type UserNotificationItem,
} from '@/lib/api/notifications';
import { handleDeepLink } from '@/lib/mobile/deepLink';
import type { NotificationCategory } from '@/lib/notifications/push/notificationPayload';

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
    case 'lessons': return <BookOpen className="w-5 h-5 text-blue-500" />;
    case 'quizzes': return <BrainCircuit className="w-5 h-5 text-purple-500" />;
    case 'assignments': return <ClipboardList className="w-5 h-5 text-orange-500" />;
    case 'liveClasses': return <Video className="w-5 h-5 text-red-500" />;
    case 'announcements': return <Megaphone className="w-5 h-5 text-yellow-500" />;
    case 'contests': return <Trophy className="w-5 h-5 text-emerald-500" />;
    case 'system':
    default:
      return <Settings className="w-5 h-5 text-gray-500" />;
  }
}

export default function StudentNotificationsPage() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const { t, lang } = useTranslation();
  const { addAlert } = useAlert();

  const [notifications, setNotifications] = useState<UserNotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      const { notifications: items } = await fetchUserNotifications();
      setNotifications(items);
    } catch {
      addAlert({ type: 'error', message: t('notifications.inbox.loadFailed'), duration: 5000 });
    } finally {
      setLoading(false);
    }
  }, [t, addAlert]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push(ROUTES.login);
      return;
    }
    if (session.user?.role !== 'student') {
      router.push(ROUTES.dashboard);
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
        addAlert({ type: 'error', message: t('notifications.inbox.markReadFailed'), duration: 5000 });
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
            <Bell className="w-7 h-7 text-[var(--primary)]" aria-hidden />
            {t('notifications.inbox.title')}
          </span>
        }
        description={t('notifications.inbox.description')}
      />

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title={t('notifications.inbox.empty')} />
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <button
              key={item._id}
              type="button"
              onClick={() => void handleNotificationClick(item)}
              className={`w-full text-left rounded-2xl p-4 sm:p-5 transition-all duration-200 border focus-ring ${
                item.read
                  ? 'antigravity-glass border-[var(--border)]/80 hover:border-[var(--student-primary)]/40 hover:-translate-y-0.5 shadow-xs'
                  : 'antigravity-glass border-[var(--student-primary)]/40 bg-[var(--student-soft)]/25 hover:-translate-y-0.5 shadow-sm shadow-[var(--student-primary)]/10'
              }`}
            >
              <div className="flex items-start gap-3 sm:gap-4 w-full text-left">
                <div className="relative shrink-0 mt-0.5">
                  <div className="p-2 sm:p-2.5 bg-[var(--card-solid)] border border-[var(--border)] rounded-xl shadow-xs">
                    {getCategoryIcon(item.category)}
                  </div>
                  {!item.read && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[var(--student-primary)] shadow-[0_0_8px_var(--student-primary)] animate-pulse border border-[var(--background)]" />
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mb-1.5">
                    <span className="text-[10px] sm:text-[11px] font-bold text-[var(--student-primary)] px-2 py-0.5 rounded-md bg-[var(--student-soft)] border border-[var(--student-primary)]/20 uppercase tracking-wide">
                      {t(`notifications.categories.${item.category}`)}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-[var(--color-muted-foreground)] font-medium">
                      {formatWhen(item.createdAt, lang)}
                    </span>
                  </div>
                  <p className={`text-sm sm:text-base font-bold text-[var(--color-foreground)] leading-snug break-words ${!item.read ? 'text-[var(--student-primary)]' : ''}`}>
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
