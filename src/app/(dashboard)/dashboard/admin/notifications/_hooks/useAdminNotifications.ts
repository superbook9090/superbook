'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSessionStore } from '@/store/useSessionStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/components/ui/AlertContainer';
import { ApiClientError } from '@/lib/api/http';
import {
  sendAdminNotification,
  fetchAdminNotificationCenterData,
  type AdminNotificationStatsData,
  type AdminBroadcastLogItem,
  type BroadcastTargetAudience,
} from '@/lib/api/notifications';
import type { NotificationCategory } from '@/lib/notifications/push/notificationPayload';
import type {
  NotificationTabKey,
  DevicePreviewMode,
  PreviewLang,
  NotificationTemplateItem,
} from '../_components/types';

export function useAdminNotifications() {
  const { session, status } = useSessionStore();
  const { t } = useTranslation();
  const { addAlert } = useAlert();

  // Navigation & View State
  const [activeTab, setActiveTab] = useState<NotificationTabKey>('compose');
  const [previewDevice, setPreviewDevice] = useState<DevicePreviewMode>('ios');
  const [previewLang, setPreviewLang] = useState<PreviewLang>('en');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Form State
  const [titleEn, setTitleEn] = useState('');
  const [titleHi, setTitleHi] = useState('');
  const [bodyEn, setBodyEn] = useState('');
  const [bodyHi, setBodyHi] = useState('');
  const [category, setCategory] = useState<NotificationCategory | ''>('announcements');
  const [targetAudience, setTargetAudience] = useState<BroadcastTargetAudience>('all');
  const [targetCourseId, setTargetCourseId] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [deepLink, setDeepLink] = useState('');

  // Async States
  const [isSending, setIsSending] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statsData, setStatsData] = useState<AdminNotificationStatsData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async (refreshing = false) => {
    if (refreshing) setIsRefreshing(true);
    else setIsLoadingStats(true);

    try {
      const data = await fetchAdminNotificationCenterData();
      setStatsData(data);
      setLastUpdated(new Date());
    } catch {
      // Fail gracefully
    } finally {
      setIsLoadingStats(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      void loadData();
    }
  }, [session, loadData]);

  const handleRefresh = useCallback(() => {
    void loadData(true);
  }, [loadData]);

  const applyTemplate = useCallback(
    (template: NotificationTemplateItem) => {
      setTitleEn(template.titleEn);
      setTitleHi(template.titleHi);
      setBodyEn(template.bodyEn);
      setBodyHi(template.bodyHi);
      setCategory(template.category);
      if (template.defaultDeepLink) {
        setDeepLink(template.defaultDeepLink);
      }
      if (template.defaultAudience) {
        setTargetAudience(template.defaultAudience);
      }
      setActiveTab('compose');
      addAlert({ type: 'success', message: t('admin.notifications.appliedTemplate') });
    },
    [addAlert, t]
  );

  const duplicateBroadcast = useCallback(
    (item: AdminBroadcastLogItem) => {
      setTitleEn(item.title.en || '');
      setTitleHi(item.title.hi || '');
      setBodyEn(item.body.en || '');
      setBodyHi(item.body.hi || '');
      setCategory((item.category as NotificationCategory) || 'announcements');
      if (item.data?.actionUrl) {
        setDeepLink(item.data.actionUrl);
      }
      setActiveTab('compose');
      addAlert({ type: 'success', message: t('admin.notifications.duplicateSuccess') });
    },
    [addAlert, t]
  );

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;

    if (!titleEn.trim() || !bodyEn.trim()) {
      addAlert({ type: 'error', message: t('admin.notifications.validationRequired') });
      return;
    }

    if (targetAudience === 'course_enrolled' && !targetCourseId.trim()) {
      addAlert({ type: 'error', message: t('admin.notifications.selectCourseRequired') });
      return;
    }

    setIsSending(true);
    try {
      const payloadData: Record<string, string> = {};
      if (deepLink.trim()) {
        payloadData.actionUrl = deepLink.trim();
      }

      const result = await sendAdminNotification({
        title: { en: titleEn.trim(), hi: titleHi.trim() || undefined },
        body: { en: bodyEn.trim(), hi: bodyHi.trim() || undefined },
        category,
        organizationId: organizationId.trim() ? organizationId.trim() : undefined,
        targetAudience,
        targetCourseId: targetAudience === 'course_enrolled' && targetCourseId.trim() ? targetCourseId.trim() : undefined,
        data: Object.keys(payloadData).length > 0 ? payloadData : undefined,
      });

      if (result.delivered === 0) {
        addAlert({ type: 'error', message: t('admin.notifications.noRecipients') });
      } else {
        addAlert({
          type: 'success',
          message: t('admin.notifications.sendSuccess', { count: result.delivered }),
        });
        setTitleEn('');
        setTitleHi('');
        setBodyEn('');
        setBodyHi('');
        setDeepLink('');
        setTargetCourseId('');
        void loadData(true);
      }
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t('admin.notifications.unexpectedError');
      addAlert({ type: 'error', message: message || t('admin.notifications.sendFailed') });
    } finally {
      setIsSending(false);
    }
  };

  return {
    session,
    status,
    activeTab,
    setActiveTab,
    previewDevice,
    setPreviewDevice,
    previewLang,
    setPreviewLang,
    categoryFilter,
    setCategoryFilter,
    titleEn,
    setTitleEn,
    titleHi,
    setTitleHi,
    bodyEn,
    setBodyEn,
    bodyHi,
    setBodyHi,
    category,
    setCategory,
    targetAudience,
    setTargetAudience,
    targetCourseId,
    setTargetCourseId,
    organizationId,
    setOrganizationId,
    deepLink,
    setDeepLink,
    isSending,
    isLoadingStats,
    isRefreshing,
    statsData,
    lastUpdated,
    handleRefresh,
    applyTemplate,
    duplicateBroadcast,
    handleSend,
  };
}
