'use client';
import { ROUTES } from '@/constants/routes';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { useSessionStore } from '@/store/useSessionStore';
import { isAdmin, isSuperAdmin } from '@/lib/roles';
import { sendAdminNotification } from '@/lib/api/notifications';
import { ApiClientError } from '@/lib/api/http';
import Alert from '@/components/ui/Alert';
import { PageSkeleton } from '@/components/ui/Skeleton';
import type { NotificationCategory } from '@/lib/notifications/push/notificationPayload';

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
  const { theme } = useRoleTheme();

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

  const inputClass =
    'w-full px-3 py-2.5 min-h-[44px] bg-[var(--color-surface-muted)] text-[var(--color-foreground)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]';

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
              <div>
                <label htmlFor="titleEn" className="block text-sm font-medium text-[var(--color-muted-foreground)] mb-1">
                  {t('admin.notifications.titleEn')}
                </label>
                <input
                  id="titleEn"
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="titleHi" className="block text-sm font-medium text-[var(--color-muted-foreground)] mb-1">
                  {t('admin.notifications.titleHi')}
                </label>
                <input
                  id="titleHi"
                  type="text"
                  value={titleHi}
                  onChange={(e) => setTitleHi(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="bodyEn" className="block text-sm font-medium text-[var(--color-muted-foreground)] mb-1">
                  {t('admin.notifications.bodyEn')}
                </label>
                <textarea
                  id="bodyEn"
                  value={bodyEn}
                  onChange={(e) => setBodyEn(e.target.value)}
                  required
                  rows={3}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="bodyHi" className="block text-sm font-medium text-[var(--color-muted-foreground)] mb-1">
                  {t('admin.notifications.bodyHi')}
                </label>
                <textarea
                  id="bodyHi"
                  value={bodyHi}
                  onChange={(e) => setBodyHi(e.target.value)}
                  rows={3}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-[var(--color-muted-foreground)] mb-1">
                  {t('admin.notifications.category')}
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as NotificationCategory)}
                  required
                  className={inputClass}
                >
                  <option value="">{t('admin.notifications.selectCategory')}</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {t(`notifications.categories.${cat}`)}
                    </option>
                  ))}
                </select>
              </div>

              {showOrgField && (
                <div>
                  <label htmlFor="organizationId" className="block text-sm font-medium text-[var(--color-muted-foreground)] mb-1">
                    {t('admin.notifications.organizationId')}
                  </label>
                  <input
                    id="organizationId"
                    type="text"
                    value={organizationId}
                    onChange={(e) => setOrganizationId(e.target.value)}
                    placeholder={t('admin.notifications.organizationPlaceholder')}
                    className={inputClass}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full min-h-[44px] py-2.5 rounded-xl text-white font-medium bg-gradient-to-r ${theme.gradient} hover:opacity-90 disabled:opacity-50 transition-opacity`}
              >
                {loading ? t('admin.notifications.sending') : t('admin.notifications.send')}
              </button>
            </form>
          </div>
        </div>
      </div>
    
  );
}
