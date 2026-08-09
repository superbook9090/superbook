'use client';
import { ROUTES } from '@/constants/routes';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { isAdmin, isSuperAdmin } from '@/lib/roles';
import { sendAdminNotification } from '@/lib/api/notifications';
import { ApiClientError } from '@/lib/api/http';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { PageSkeleton } from '@/components/ui/Skeleton';
import type { NotificationCategory } from '@/lib/notifications/push/notificationPayload';
import { TextField } from '@/components/ui/TextField';
import { Dropdown } from '@/components/ui/Dropdown';

const CATEGORIES: NotificationCategory[] = [
  'lessons',
  'quizzes',
  'assignments',
  'liveClasses',
  'announcements',
  'system',
];

export default function AdminNotificationsPage() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const { t } = useTranslation();

  const [titleEn, setTitleEn] = useState('');
  const [titleHi, setTitleHi] = useState('');
  const [bodyEn, setBodyEn] = useState('');
  const [bodyHi, setBodyHi] = useState('');
  const [category, setCategory] = useState<NotificationCategory | ''>('');
  const [organizationId, setOrganizationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertState, setAlertState] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const role = session?.user?.role;
  const canSend = isAdmin(role);
  const showOrgField = isSuperAdmin(role);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push(ROUTES.login);
      return;
    }
    if (!canSend) {
      router.push(ROUTES.dashboard);
    }
  }, [status, session, router, canSend]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend || !category) return;

    if (!titleEn.trim() || !bodyEn.trim()) {
      setAlertState({ type: 'error', message: t('admin.notifications.validationRequired') });
      return;
    }

    setLoading(true);
    setAlertState(null);

    try {
      const result = await sendAdminNotification({
        title: { en: titleEn.trim(), hi: titleHi.trim() || undefined },
        body: { en: bodyEn.trim(), hi: bodyHi.trim() || undefined },
        category,
        organizationId: showOrgField && organizationId.trim() ? organizationId.trim() : undefined,
      });

      if (result.delivered === 0) {
        setAlertState({ type: 'error', message: t('admin.notifications.noRecipients') });
      } else {
        setAlertState({
          type: 'success',
          message: t('admin.notifications.sendSuccess', { count: result.delivered }),
        });
        setTitleEn('');
        setTitleHi('');
        setBodyEn('');
        setBodyHi('');
        setCategory('');
        setOrganizationId('');
      }
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t('admin.notifications.unexpectedError');
      setAlertState({ type: 'error', message: message || t('admin.notifications.sendFailed') });
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <PageSkeleton />;
  }

  if (!canSend) {
    return null;
  }


  return (
    
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)]">
            {t('admin.notifications.title')}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[var(--color-muted-foreground)]">
            {t('admin.notifications.description')}
          </p>
        </div>

        {alertState && (
          <Alert
            type={alertState.type}
            message={alertState.message}
            onClose={() => setAlertState(null)}
          />
        )}

        <div className="bg-[var(--card-solid)] shadow rounded-2xl border border-[var(--border)]">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <TextField
                id="titleEn"
                label={t('admin.notifications.titleEn')}
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                required
                fullWidth
              />

              <TextField
                id="titleHi"
                label={t('admin.notifications.titleHi')}
                type="text"
                value={titleHi}
                onChange={(e) => setTitleHi(e.target.value)}
                fullWidth
              />

              <TextField
                id="bodyEn"
                label={t('admin.notifications.bodyEn')}
                multiline
                value={bodyEn}
                onChange={(e) => setBodyEn(e.target.value)}
                required
                rows={3}
                fullWidth
              />

              <TextField
                id="bodyHi"
                label={t('admin.notifications.bodyHi')}
                multiline
                value={bodyHi}
                onChange={(e) => setBodyHi(e.target.value)}
                rows={3}
                fullWidth
              />

              <Dropdown
                id="category"
                label={t('admin.notifications.category')}
                value={category}
                onChange={(val) => setCategory(val as NotificationCategory)}
                required
                options={CATEGORIES.map((cat) => ({
                  value: cat,
                  label: t(`notifications.categories.${cat}`),
                }))}
                placeholder={t('admin.notifications.selectCategory')}
              />

              {showOrgField && (
                <TextField
                  id="organizationId"
                  label={t('admin.notifications.organizationId')}
                  type="text"
                  value={organizationId}
                  onChange={(e) => setOrganizationId(e.target.value)}
                  placeholder={t('admin.notifications.organizationPlaceholder')}
                  fullWidth
                />
              )}

              <Button
                type="submit"
                disabled={loading}
                isLoading={loading}
                fullWidth
              >
                {t('admin.notifications.send')}
              </Button>
            </form>
          </div>
        </div>
      </div>
    
  );
}
