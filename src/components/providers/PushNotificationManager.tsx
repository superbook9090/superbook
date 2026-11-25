'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSessionStore } from '@/store/useSessionStore';
import { initMobileNotifications } from '@/lib/mobile/mobileNotifications';
import { isAndroidWebView, isIOSWebView } from '@/lib/mobile/mobileDetection';
import { subscribeToForegroundMessages } from '@/lib/notifications/push/firebase';
import { registerDeviceToken } from '@/lib/notifications/push/registerDevice';
import { useRouter } from 'next/navigation';
import { handleDeepLink } from '@/lib/mobile/deepLink';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/components/ui/AlertContainer';
import { Bell, X } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';

const PROMPT_DISMISSED_KEY = 'quizdo_push_prompt_dismissed';

type ForegroundToast = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

export default function PushNotificationManager() {
  const { session } = useSessionStore();
  const router = useRouter();
  const { t } = useTranslation();
  const { addAlert } = useAlert();
  const [toastMessage, setToastMessage] = useState<ForegroundToast | null>(null);
  const [showOptInPrompt, setShowOptInPrompt] = useState(false);
  const [enablingPush, setEnablingPush] = useState(false);

  const fallbackTitleRef = useRef(t('common.notifications'));
  fallbackTitleRef.current = t('common.notifications');

  const userId = session?.user?.id;

  const subscribeForeground = useCallback(async () => {
    return subscribeToForegroundMessages((payload) => {
      const data = (payload.data as Record<string, string> | undefined) ?? {};
      const title = payload.notification?.title || data.title;
      const body = payload.notification?.body || data.body;
      if (!title && !body) return;

      const resolvedTitle = title ?? fallbackTitleRef.current;
      const resolvedBody = body ?? '';

      setToastMessage({
        title: resolvedTitle,
        body: resolvedBody,
        data,
      });

      // If tab is hidden/minimized while still alive, show an OS notification so the user sees it
      if (
        typeof document !== 'undefined' &&
        document.visibilityState !== 'visible' &&
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted' &&
        'serviceWorker' in navigator
      ) {
        void navigator.serviceWorker.ready
          .then((reg) =>
            reg.showNotification(resolvedTitle, {
              body: resolvedBody,
              icon: '/favicon.png',
              badge: '/favicon.png',
              data,
            })
          )
          .catch(() => {});
      }
    });
  }, []);

  // Auto-dismiss foreground toast after 8 seconds
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 8000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    if (!userId) return;

    let unsubscribe: (() => void) | null = null;
    let cancelled = false;

    const attachForeground = async () => {
      if (cancelled) return;
      unsubscribe?.();
      unsubscribe = null;
      const unsub = await subscribeForeground();
      if (cancelled) {
        unsub?.();
      } else if (unsub) {
        unsubscribe = unsub;
      }
    };

    void initMobileNotifications(userId).then(async () => {
      await attachForeground();
    });

    // Show non-intrusive opt-in banner for web browsers when permission has not been asked yet
    if (
      typeof window !== 'undefined' &&
      !isAndroidWebView() &&
      !isIOSWebView() &&
      'Notification' in window &&
      'serviceWorker' in navigator &&
      Notification.permission === 'default' &&
      localStorage.getItem(PROMPT_DISMISSED_KEY) !== 'true'
    ) {
      setShowOptInPrompt(true);
    }

    const onPushEnabled = () => {
      setShowOptInPrompt(false);
      void attachForeground();
    };
    window.addEventListener('quizdo:push-enabled', onPushEnabled);

    return () => {
      cancelled = true;
      window.removeEventListener('quizdo:push-enabled', onPushEnabled);
      unsubscribe?.();
    };
  }, [userId, subscribeForeground]);

  const handleEnableBrowserPush = async () => {
    if (!userId || enablingPush) return;
    setEnablingPush(true);
    try {
      const success = await registerDeviceToken(userId, 'web', true);
      if (success) {
        setShowOptInPrompt(false);
        window.dispatchEvent(new Event('quizdo:push-enabled'));
        addAlert({ type: 'success', message: t('notifications.inbox.pushEnabled'), duration: 4000 });
      } else if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'denied') {
        setShowOptInPrompt(false);
        addAlert({ type: 'error', message: t('notifications.inbox.pushBlocked'), duration: 6000 });
      } else {
        addAlert({ type: 'error', message: t('notifications.push.enableFailed'), duration: 5000 });
      }
    } catch {
      addAlert({ type: 'error', message: t('notifications.push.enableFailed'), duration: 5000 });
    } finally {
      setEnablingPush(false);
    }
  };

  const handleDismissPrompt = () => {
    setShowOptInPrompt(false);
    try {
      localStorage.setItem(PROMPT_DISMISSED_KEY, 'true');
    } catch {
      // Ignore storage errors
    }
  };

  const toastLink = toastMessage?.data?.webUrl || toastMessage?.data?.actionUrl || toastMessage?.data?.url;

  return (
    <>
      {toastMessage && (
        <div
          className="fixed top-5 right-5 z-[9999] max-w-sm w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-[var(--primary)]/25 bg-[var(--card-solid)] shadow-2xl p-4"
          role="alert"
          aria-live="polite"
        >
          <div className="flex justify-between items-start gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Bell className="w-4 h-4 text-[var(--primary)] shrink-0" />
              <h3 className="font-semibold text-sm text-[var(--color-foreground)] truncate">
                {toastMessage.title}
              </h3>
            </div>
            <Tooltip label={t('common.cancel')}>
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="p-1 rounded hover:bg-[var(--color-foreground)]/5 text-[var(--color-muted-foreground)] cursor-pointer"
                aria-label={t('common.cancel')}
              >
                <X className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
          <p className="text-xs text-[var(--color-muted-foreground)] mt-1.5 leading-relaxed">
            {toastMessage.body}
          </p>
          {toastLink && (
            <button
              type="button"
              onClick={() => {
                setToastMessage(null);
                if (toastLink.startsWith('http://') || toastLink.startsWith('https://')) {
                  window.location.href = toastLink;
                } else {
                  handleDeepLink(toastLink, router);
                }
              }}
              className="text-xs text-[var(--primary)] hover:underline mt-2.5 font-semibold text-left cursor-pointer"
            >
              {t('notifications.push.viewDetails')}
            </button>
          )}
        </div>
      )}

      {showOptInPrompt && !toastMessage && (
        <div
          className="fixed bottom-20 md:bottom-5 right-4 z-[9990] w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-[var(--border)] bg-[var(--card-solid)] shadow-2xl p-4 space-y-3"
          role="dialog"
          aria-label={t('notifications.inbox.enablePush')}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[var(--color-foreground)]">
                  {t('notifications.push.promptTitle')}
                </h3>
                <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 leading-snug">
                  {t('notifications.push.promptDesc')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDismissPrompt}
              className="p-1 rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--surface-muted)] cursor-pointer"
              aria-label={t('common.cancel')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleDismissPrompt}
              disabled={enablingPush}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
            >
              {t('notifications.push.notNow')}
            </button>
            <button
              type="button"
              onClick={handleEnableBrowserPush}
              disabled={enablingPush}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[var(--primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {enablingPush ? t('notifications.inbox.enabling') : t('notifications.inbox.enablePush')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
