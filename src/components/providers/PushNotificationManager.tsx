'use client';

import { useEffect, useState } from 'react';
import { useSessionStore } from '@/store/useSessionStore';
import { initMobileNotifications } from '@/lib/mobile/mobileNotifications';
import { subscribeToForegroundMessages } from '@/lib/notifications/push/firebase';
import { useRouter } from 'next/navigation';
import { handleDeepLink } from '@/lib/mobile/deepLink';
import { useTranslation } from '@/hooks/useTranslation';
import { X } from 'lucide-react';

type ForegroundToast = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

export default function PushNotificationManager() {
  const { session } = useSessionStore();
  const router = useRouter();
  const { t } = useTranslation();
  const [toastMessage, setToastMessage] = useState<ForegroundToast | null>(null);

  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return;

    let unsubscribe: (() => void) | null = null;
    let cancelled = false;

    void initMobileNotifications(userId).then(async () => {
      if (cancelled) return;
      const unsub = await subscribeToForegroundMessages((payload) => {
        const title = payload.notification?.title;
        const body = payload.notification?.body;
        if (!title && !body) return;
        setToastMessage({
          title: title ?? t('common.notifications'),
          body: body ?? '',
          data: payload.data as Record<string, string> | undefined,
        });
      });
      if (unsub) unsubscribe = unsub;
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [userId, t]);

  if (!toastMessage) return null;

  return (
    <div
      className="fixed top-5 right-5 z-50 max-w-sm w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-[var(--info)]/20 bg-[var(--info-light)] shadow-lg p-4"
      role="alert"
      aria-live="polite"
    >
      <div className="flex justify-between items-start gap-3">
        <h3 className="font-semibold text-sm text-[var(--color-foreground)]">{toastMessage.title}</h3>
        <button
          type="button"
          onClick={() => setToastMessage(null)}
          className="p-1 rounded hover:bg-[var(--color-foreground)]/5 text-[var(--color-muted-foreground)]"
          aria-label={t('common.cancel')}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-[var(--color-muted-foreground)] mt-1">{toastMessage.body}</p>
      {toastMessage.data?.url && (
        <button
          type="button"
          onClick={() => {
            setToastMessage(null);
            handleDeepLink(toastMessage.data!.url!, router);
          }}
          className="text-xs text-[var(--primary)] hover:underline mt-2 font-medium text-left"
        >
          {t('notifications.push.viewDetails')}
        </button>
      )}
    </div>
  );
}
