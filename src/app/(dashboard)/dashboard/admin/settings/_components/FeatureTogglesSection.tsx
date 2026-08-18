'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  FileText,
  GraduationCap,
  Notebook,
  Phone,
  Globe,
  Smartphone,
  Shield,
  BarChart3,
  Activity,
  RefreshCw,
  Users,
  Sparkles,
} from 'lucide-react';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { useTranslation } from '@/hooks/useTranslation';
import type { AppSettings } from './types';

interface Props {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  canManageSolutionAnalysis: boolean;
  searchQuery?: string;
}

interface ToggleItemDef {
  key: keyof AppSettings['featureToggles'];
  labelKey: string;
  descKey: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  isSuperAdminOnly?: boolean;
  isAiFeature?: boolean;
}

interface CategoryGroup {
  id: string;
  titleKey: string;
  descKey: string;
  items: ToggleItemDef[];
}

export function FeatureTogglesSection({
  settings,
  setSettings,
  canManageSolutionAnalysis,
  searchQuery = '',
}: Props) {
  const { t } = useTranslation();

  const categories: CategoryGroup[] = [
    {
      id: 'learning',
      titleKey: 'adminSettings.categoryLearning',
      descKey: 'adminSettings.categoryLearningDesc',
      items: [
        { key: 'enableCourses', labelKey: 'adminSettings.enableCourses', descKey: 'adminSettings.enableCoursesDesc', icon: GraduationCap, iconBg: 'bg-[var(--success-light)]', iconColor: 'text-[var(--success)]' },
        { key: 'enableQuizzes', labelKey: 'adminSettings.enableQuizzes', descKey: 'adminSettings.enableQuizzesDesc', icon: FileText, iconBg: 'bg-[var(--primary-soft)]', iconColor: 'text-[var(--primary)]' },
        { key: 'enableBlogs', labelKey: 'adminSettings.enableBlogs', descKey: 'adminSettings.enableBlogsDesc', icon: BookOpen, iconBg: 'bg-[var(--info-light)]', iconColor: 'text-[var(--info)]' },
        { key: 'enableNotes', labelKey: 'adminSettings.enableNotes', descKey: 'adminSettings.enableNotesDesc', icon: Notebook, iconBg: 'bg-[var(--warning-light)]', iconColor: 'text-[var(--warning)]' },
      ],
    },
    {
      id: 'auth',
      titleKey: 'adminSettings.categoryAuth',
      descKey: 'adminSettings.categoryAuthDesc',
      items: [
        { key: 'enablePhoneAuth', labelKey: 'adminSettings.enablePhoneAuth', descKey: 'adminSettings.enablePhoneAuthDesc', icon: Phone, iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-500' },
        { key: 'enableGoogleAuthWeb', labelKey: 'adminSettings.enableGoogleAuthWeb', descKey: 'adminSettings.enableGoogleAuthWebDesc', icon: Globe, iconBg: 'bg-blue-500/10', iconColor: 'text-blue-500' },
        { key: 'enableGoogleAuthApp', labelKey: 'adminSettings.enableGoogleAuthApp', descKey: 'adminSettings.enableGoogleAuthAppDesc', icon: Smartphone, iconBg: 'bg-indigo-500/10', iconColor: 'text-indigo-500' },
        { key: 'restrictPublicCourseCreation', labelKey: 'adminSettings.restrictPublicCourseCreation', descKey: 'adminSettings.restrictPublicCourseCreationDesc', icon: Shield, iconBg: 'bg-purple-500/10', iconColor: 'text-purple-500', isSuperAdminOnly: true },
      ],
    },
    {
      id: 'analytics',
      titleKey: 'adminSettings.categoryAnalytics',
      descKey: 'adminSettings.categoryAnalyticsDesc',
      items: [
        { key: 'enableAnalytics', labelKey: 'adminSettings.enableAnalytics', descKey: 'adminSettings.enableAnalyticsDesc', icon: BarChart3, iconBg: 'bg-teal-500/10', iconColor: 'text-teal-500' },
        { key: 'enableClarity', labelKey: 'adminSettings.enableClarity', descKey: 'adminSettings.enableClarityDesc', icon: Activity, iconBg: 'bg-amber-500/10', iconColor: 'text-amber-500' },
      ],
    },
    {
      id: 'platform_ux',
      titleKey: 'adminSettings.categoryPlatform',
      descKey: 'adminSettings.categoryPlatformDesc',
      items: [
        { key: 'enablePullToRefresh', labelKey: 'adminSettings.enablePullToRefresh', descKey: 'adminSettings.enablePullToRefreshDesc', icon: RefreshCw, iconBg: 'bg-sky-500/10', iconColor: 'text-sky-500' },
        { key: 'enableEnrollmentManagement', labelKey: 'adminSettings.enableEnrollmentManagement', descKey: 'adminSettings.enableEnrollmentManagementDesc', icon: Users, iconBg: 'bg-violet-500/10', iconColor: 'text-violet-500', isSuperAdminOnly: true },
      ],
    },
    {
      id: 'ai_systems',
      titleKey: 'adminSettings.categoryAi',
      descKey: 'adminSettings.categoryAiDesc',
      items: [
        { key: 'enableQuizSolutionAnalysis', labelKey: 'adminSettings.enableQuizSolutionAnalysis', descKey: 'adminSettings.enableQuizSolutionAnalysisDesc', icon: Sparkles, iconBg: 'bg-gradient-to-br from-amber-500/20 to-purple-500/20', iconColor: 'text-amber-500', isSuperAdminOnly: true, isAiFeature: true },
      ],
    },
  ];

  const query = searchQuery.trim().toLowerCase();

  const handleToggle = (key: keyof AppSettings['featureToggles'], val: boolean) => {
    setSettings((prev) => ({
      ...prev,
      featureToggles: { ...prev.featureToggles, [key]: val },
    }));
  };

  const filteredCategories = categories
    .map((cat) => {
      const visibleItems = cat.items.filter((item) => {
        if (item.isSuperAdminOnly && !canManageSolutionAnalysis) return false;
        if (!query) return true;
        const title = t(item.labelKey).toLowerCase();
        const desc = t(item.descKey).toLowerCase();
        const catTitle = t(cat.titleKey).toLowerCase();
        return title.includes(query) || desc.includes(query) || catTitle.includes(query);
      });
      return { ...cat, items: visibleItems };
    })
    .filter((cat) => cat.items.length > 0);

  if (filteredCategories.length === 0) {
    return (
      <div className="card-surface p-8 text-center rounded-xl border border-[var(--border)]">
        <p className="text-sm font-semibold text-[var(--color-foreground)]">{t('adminSettings.noSettingsFound')}</p>
        <p className="text-xs text-[var(--color-muted-foreground)] mt-1">{t('adminSettings.noSettingsFoundDesc')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {filteredCategories.map((cat) => (
        <motion.div
          key={cat.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-surface rounded-xl border border-[var(--border)] overflow-hidden shadow-xs"
        >
          <div className="p-4 sm:p-5 border-b border-[var(--border)]/70 bg-[var(--color-surface-muted)]/30">
            <h3 className="text-sm sm:text-base font-bold text-[var(--color-foreground)]">{t(cat.titleKey)}</h3>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">{t(cat.descKey)}</p>
          </div>

          <div className="divide-y divide-[var(--border)]/60">
            {cat.items.map((item) => {
              const isChecked = settings.featureToggles[item.key] ?? false;
              const Icon = item.icon;
              return (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-3 p-3.5 sm:p-4 hover:bg-[var(--color-surface-muted)]/30 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <div className={`p-2.5 rounded-xl shrink-0 ${item.iconBg} ${item.iconColor} shadow-xs`}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-xs sm:text-sm text-[var(--color-foreground)]">
                          {t(item.labelKey)}
                        </span>
                        {item.isSuperAdminOnly && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-500/10 text-purple-600 border border-purple-500/20">
                            {t('adminSettings.superadminOnly')}
                          </span>
                        )}
                        {item.isAiFeature && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            {t('adminSettings.aiFeature')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 leading-relaxed">
                        {t(item.descKey)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs font-semibold hidden md:inline px-2 py-0.5 rounded-md ${
                        isChecked
                          ? 'bg-[var(--color-success-light)] text-[var(--color-success)]'
                          : 'bg-[var(--color-surface-muted)] text-[var(--color-muted)]'
                      }`}
                    >
                      {isChecked ? t('adminSettings.activeBadge') : t('adminSettings.disabledBadge')}
                    </span>
                    <ToggleSwitch
                      checked={isChecked}
                      onChange={(val) => handleToggle(item.key, val)}
                      label={t(item.labelKey)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
