'use client';

import { Smartphone, Send, Radio, ShieldCheck } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import StatCard from '@/components/ui/StatCard';
import type { AdminNotificationStatsData } from './types';

interface NotificationStatsProps {
  statsData: AdminNotificationStatsData | null;
  isSuperAdmin: boolean;
}

export function NotificationStats({ statsData, isSuperAdmin }: NotificationStatsProps) {
  const { t } = useTranslation();

  const totalDevices = statsData?.activeDevicesCount ?? 0;
  const totalDelivered = statsData?.totalBroadcastsDelivered ?? 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
      <StatCard
        icon={Smartphone}
        label={t('admin.notifications.statsActiveDevices')}
        value={totalDevices.toLocaleString()}
        description={t('admin.notifications.statsActiveDevicesDesc')}
        color="info"
        delay={0.05}
      />
      <StatCard
        icon={Send}
        label={t('admin.notifications.statsDelivered')}
        value={totalDelivered.toLocaleString()}
        description={t('admin.notifications.statsDeliveredDesc')}
        color="success"
        delay={0.1}
      />
      <StatCard
        icon={Radio}
        label={t('admin.notifications.statsCategories')}
        value={6}
        description={t('admin.notifications.statsCategoriesDesc')}
        color="teacher"
        delay={0.15}
      />
      <StatCard
        icon={ShieldCheck}
        label={t('admin.notifications.statsScope')}
        value={
          isSuperAdmin
            ? t('admin.notifications.statsScopeGlobal')
            : t('admin.notifications.statsScopeOrg')
        }
        description={t('admin.notifications.targetAudienceDesc')}
        color="admin"
        delay={0.2}
      />
    </div>
  );
}
