'use client';

import React, { useState } from 'react';
import { Sliders, ShieldCheck, Layers, Sparkles, Check, RotateCcw, Lock } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useSettingsStore } from '@/store/useSettingsStore';
import Button from '@/components/ui/Button';
import {
  ORG_PERMISSION_KEYS,
  type OrganizationPolicy,
  type OrgPermissionKey,
} from '@/lib/admin/orgPolicy';
import type { User } from './types';
import { TeacherPermissionsTab } from './TeacherPermissionsTab';
import { TeacherQuotasTab } from './TeacherQuotasTab';
import { TeacherAiLimitsTab } from './TeacherAiLimitsTab';

interface UserTeacherPermissionsSectionProps {
  user: User;
  isSuperAdmin?: boolean;
  organizationPolicy?: OrganizationPolicy | null;
  onToggleVideo: (currentVal: boolean) => void;
  onTogglePublicCourse: (currentVal: boolean) => void;
  onToggleContest?: (currentVal: boolean) => void;
  onToggleAiQuizGen?: (currentVal: boolean) => void;
  limitsForm: {
    courses: string;
    quizzes: string;
    blogs: string;
    aiQuizGenerations?: string;
    aiQuizMaxQuestions?: string;
  };
  onLimitsChange: (
    field: 'courses' | 'quizzes' | 'blogs' | 'aiQuizGenerations' | 'aiQuizMaxQuestions',
    value: string
  ) => void;
  onSaveLimits: () => void;
  onResetLimits?: () => void;
  isSavingLimits?: boolean;
}

type TabType = 'permissions' | 'quotas' | 'ai';

export function UserTeacherPermissionsSection({
  user,
  isSuperAdmin = true,
  organizationPolicy,
  onToggleVideo,
  onTogglePublicCourse,
  onToggleContest,
  onToggleAiQuizGen,
  limitsForm,
  onLimitsChange,
  onSaveLimits,
  onResetLimits,
  isSavingLimits,
}: UserTeacherPermissionsSectionProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('permissions');

  const globalCoursesLimit = useSettingsStore((s) => s.settings.teacherLimits?.courses ?? 5);
  const globalQuizzesLimit = useSettingsStore((s) => s.settings.teacherLimits?.quizzes ?? 10);
  const globalBlogsLimit = useSettingsStore((s) => s.settings.teacherLimits?.blogs ?? 2);
  const globalGenerationsLimit = useSettingsStore((s) => s.settings.teacherLimits?.aiQuizGenerations ?? 5);
  const globalMaxQuestions = useSettingsStore((s) => s.settings.teacherLimits?.aiQuizMaxQuestions ?? 10);

  if (user.role !== 'teacher') {
    return null;
  }

  const allowedPermissionKeys: OrgPermissionKey[] = isSuperAdmin
    ? [...ORG_PERMISSION_KEYS]
    : ORG_PERMISSION_KEYS.filter((k) => Boolean(organizationPolicy?.permissions?.[k]));

  const orgLimits = organizationPolicy?.teacherLimits;
  const hasContentQuotas =
    isSuperAdmin ||
    Boolean(orgLimits?.courses || orgLimits?.quizzes || orgLimits?.blogs);
  const hasAiQuotas =
    isSuperAdmin ||
    Boolean(orgLimits?.aiQuizGenerations || orgLimits?.aiQuizMaxQuestions);

  if (!isSuperAdmin && allowedPermissionKeys.length === 0 && !hasContentQuotas && !hasAiQuotas) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-[var(--color-surface-muted)]/45 border border-[var(--border)]">
        <div className="p-2 rounded-xl bg-[var(--color-surface-muted-strong)] text-[var(--color-muted-foreground)] shrink-0">
          <Lock className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h4 className="text-xs sm:text-sm font-bold text-[var(--color-foreground)]">
            {t('adminUsers.orgPermissionsManagedBySuperAdminTitle')}
          </h4>
          <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 leading-relaxed">
            {t('adminUsers.orgPermissionsManagedBySuperAdminDesc')}
          </p>
        </div>
      </div>
    );
  }

  const hasLimitsChanged =
    limitsForm.courses !== String(user.limits?.courses ?? '') ||
    limitsForm.quizzes !== String(user.limits?.quizzes ?? '') ||
    limitsForm.blogs !== String(user.limits?.blogs ?? '') ||
    limitsForm.aiQuizGenerations !== String(user.limits?.aiQuizGenerations ?? '') ||
    limitsForm.aiQuizMaxQuestions !== String(user.limits?.aiQuizMaxQuestions ?? '');

  const permissionsActiveCount = allowedPermissionKeys.filter((k) => Boolean(user[k])).length;
  const contentOverridesCount = [limitsForm.courses, limitsForm.quizzes, limitsForm.blogs].filter(
    (v) => Boolean(v?.trim())
  ).length;
  const aiOverridesCount = [limitsForm.aiQuizGenerations, limitsForm.aiQuizMaxQuestions].filter(
    (v) => Boolean(v?.trim())
  ).length;

  const tabs: Array<{
    id: TabType;
    label: string;
    icon: React.ReactNode;
    badge: string;
    hasOverride: boolean;
  }> = [
    ...(allowedPermissionKeys.length > 0
      ? [
          {
            id: 'permissions' as const,
            label: t('adminUsers.tabFeatureAccess'),
            icon: <ShieldCheck className="w-4 h-4" />,
            badge: `${permissionsActiveCount}/${allowedPermissionKeys.length}`,
            hasOverride: false,
          },
        ]
      : []),
    ...(hasContentQuotas
      ? [
          {
            id: 'quotas' as const,
            label: t('adminUsers.tabContentQuotas'),
            icon: <Layers className="w-4 h-4" />,
            badge: contentOverridesCount > 0 ? `${contentOverridesCount} custom` : 'default',
            hasOverride: contentOverridesCount > 0,
          },
        ]
      : []),
    ...(hasAiQuotas
      ? [
          {
            id: 'ai' as const,
            label: t('adminUsers.tabAiIntelligence'),
            icon: <Sparkles className="w-4 h-4" />,
            badge: aiOverridesCount > 0 ? `${aiOverridesCount} custom` : 'default',
            hasOverride: aiOverridesCount > 0,
          },
        ]
      : []),
  ];

  const effectiveTab = tabs.some((tab) => tab.id === activeTab) ? activeTab : tabs[0].id;

  return (
    <div className="flex flex-col gap-3.5 p-4 sm:p-5 rounded-2xl bg-[var(--color-surface-muted)]/45 border border-[var(--border)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-[var(--teacher-soft)] to-[var(--primary-soft)] text-[var(--teacher-primary)] shadow-sm shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-[var(--color-foreground)] leading-tight">
              {t('adminUsers.teacherPrivilegesAndLimits')}
            </h4>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
              {isSuperAdmin
                ? t('adminUsers.teacherPrivilegesDesc')
                : t('adminUsers.orgTeacherPrivilegesDesc')}
            </p>
          </div>
        </div>
      </div>

      {tabs.length > 1 && (
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--color-surface)] border border-[var(--border)] overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = effectiveTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[var(--teacher-primary)] text-white shadow-xs'
                    : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : tab.hasOverride
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      : 'bg-[var(--color-surface-muted-strong)] text-[var(--color-muted-foreground)]'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="min-h-[120px]">
        {effectiveTab === 'permissions' && (
          <TeacherPermissionsTab
            user={user}
            allowedKeys={isSuperAdmin ? undefined : allowedPermissionKeys}
            onToggleVideo={onToggleVideo}
            onTogglePublicCourse={onTogglePublicCourse}
            onToggleContest={onToggleContest}
            onToggleAiQuizGen={onToggleAiQuizGen}
          />
        )}

        {effectiveTab === 'quotas' && (
          <TeacherQuotasTab
            limitsForm={{
              courses: limitsForm.courses,
              quizzes: limitsForm.quizzes,
              blogs: limitsForm.blogs,
            }}
            usedCounts={{
              courses: user.activityStats?.coursesCount,
              quizzes: user.activityStats?.quizzesCount,
              blogs: user.activityStats?.blogsCount,
            }}
            orgMaxLimits={isSuperAdmin ? undefined : orgLimits}
            isSuperAdmin={isSuperAdmin}
            globalCoursesLimit={globalCoursesLimit}
            globalQuizzesLimit={globalQuizzesLimit}
            globalBlogsLimit={globalBlogsLimit}
            onLimitsChange={(field, val) => onLimitsChange(field, val)}
          />
        )}

        {effectiveTab === 'ai' && (
          <TeacherAiLimitsTab
            limitsForm={{
              aiQuizGenerations: limitsForm.aiQuizGenerations,
              aiQuizMaxQuestions: limitsForm.aiQuizMaxQuestions,
            }}
            orgMaxLimits={isSuperAdmin ? undefined : orgLimits}
            isSuperAdmin={isSuperAdmin}
            globalGenerationsLimit={globalGenerationsLimit}
            globalMaxQuestions={globalMaxQuestions}
            usedGenerationsCount={user.aiQuizGenerationsCount}
            onLimitsChange={(field, val) => onLimitsChange(field, val)}
          />
        )}
      </div>

      {hasLimitsChanged && (hasContentQuotas || hasAiQuotas) && (
        <div className="flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[var(--color-foreground)]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <p className="text-xs sm:text-sm font-medium text-amber-900 dark:text-amber-200 truncate">
              {t('adminUsers.unsavedChanges')}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onResetLimits && (
              <button
                type="button"
                onClick={onResetLimits}
                disabled={isSavingLimits}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('adminUsers.discard')}</span>
              </button>
            )}
            <Button
              onClick={onSaveLimits}
              variant="primary"
              size="sm"
              disabled={isSavingLimits}
              className="flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isSavingLimits ? t('admin.saving') : t('adminUsers.saveLimits')}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
