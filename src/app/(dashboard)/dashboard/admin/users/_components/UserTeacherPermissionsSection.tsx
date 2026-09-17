'use client';

import React from 'react';
import {
  Video,
  Globe,
  Sliders,
  Check,
  BookOpen,
  HelpCircle,
  FileText,
  Sparkles,
  Trophy,
  RotateCcw,
  Layers,
  Zap,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useSettingsStore } from '@/store/useSettingsStore';
import Button from '@/components/ui/Button';
import type { User } from './types';
import {
  PermissionToggleCard,
  ContentQuotaCard,
  AiQuotaCard,
} from './UserTeacherPermissionCards';

interface UserTeacherPermissionsSectionProps {
  user: User;
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

export function UserTeacherPermissionsSection({
  user,
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
  const globalCoursesLimit = useSettingsStore((s) => s.settings.teacherLimits?.courses ?? 5);
  const globalQuizzesLimit = useSettingsStore((s) => s.settings.teacherLimits?.quizzes ?? 10);
  const globalBlogsLimit = useSettingsStore((s) => s.settings.teacherLimits?.blogs ?? 2);
  const globalGenerationsLimit = useSettingsStore((s) => s.settings.teacherLimits?.aiQuizGenerations ?? 5);
  const globalMaxQuestions = useSettingsStore((s) => s.settings.teacherLimits?.aiQuizMaxQuestions ?? 10);

  if (user.role !== 'teacher') {
    return null;
  }

  const hasLimitsChanged =
    limitsForm.courses !== String(user.limits?.courses ?? '') ||
    limitsForm.quizzes !== String(user.limits?.quizzes ?? '') ||
    limitsForm.blogs !== String(user.limits?.blogs ?? '') ||
    limitsForm.aiQuizGenerations !== String(user.limits?.aiQuizGenerations ?? '') ||
    limitsForm.aiQuizMaxQuestions !== String(user.limits?.aiQuizMaxQuestions ?? '');

  const activeOverridesCount = [
    Boolean(limitsForm.courses && limitsForm.courses.trim() !== ''),
    Boolean(limitsForm.quizzes && limitsForm.quizzes.trim() !== ''),
    Boolean(limitsForm.blogs && limitsForm.blogs.trim() !== ''),
    Boolean(limitsForm.aiQuizGenerations && limitsForm.aiQuizGenerations.trim() !== ''),
    Boolean(limitsForm.aiQuizMaxQuestions && limitsForm.aiQuizMaxQuestions.trim() !== ''),
  ].filter(Boolean).length;

  const customText = t('adminUsers.customOverride') || 'Custom';
  const globalText = t('adminUsers.globalDefaultBadge') || 'Global';
  const resetText = t('adminUsers.resetToGlobal') || 'Reset to Global';
  const presetText = t('adminUsers.preset') || 'Preset';

  const toggles = [
    {
      key: 'video',
      icon: <Video className="w-4 h-4" />,
      iconBgClass: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
      title: t('adminUsers.videoUploadPermission') || 'Video Uploads',
      description: t('adminUsers.videoUploadPermissionDesc') || 'Allow unlisted YouTube lectures.',
      checked: Boolean(user.canUploadVideos),
      onChange: () => onToggleVideo(Boolean(user.canUploadVideos)),
      checkedBgClass: 'peer-checked:bg-[var(--teacher-primary)]',
    },
    {
      key: 'publicCourse',
      icon: <Globe className="w-4 h-4" />,
      iconBgClass: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
      title: t('adminUsers.canCreatePublicCourses') || 'Public Courses',
      description: t('adminUsers.canCreatePublicCoursesDesc') || 'Create courses without join code.',
      checked: Boolean(user.canCreatePublicCourses),
      onChange: () => onTogglePublicCourse(Boolean(user.canCreatePublicCourses)),
      checkedBgClass: 'peer-checked:bg-[var(--teacher-primary)]',
    },
    {
      key: 'contest',
      icon: <Trophy className="w-4 h-4" />,
      iconBgClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      title: t('adminUsers.canCreateContests') || 'Contest Creator',
      description: t('adminUsers.canCreateContestsDesc') || 'Create & schedule live contests.',
      checked: Boolean(user.canCreateContests),
      onChange: () => onToggleContest?.(Boolean(user.canCreateContests)),
      checkedBgClass: 'peer-checked:bg-[var(--warning)]',
    },
    {
      key: 'aiQuiz',
      icon: <Sparkles className="w-4 h-4" />,
      iconBgClass: 'bg-[var(--primary-soft)] text-[var(--color-primary)]',
      title: t('adminUsers.canGenerateAiQuizzes') || 'AI Quiz Generator',
      description: t('adminUsers.canGenerateAiQuizzesDesc') || 'Generate questions using AI models.',
      checked: Boolean(user.canGenerateAiQuizzes),
      onChange: () => onToggleAiQuizGen?.(Boolean(user.canGenerateAiQuizzes)),
      checkedBgClass: 'peer-checked:bg-[var(--color-primary)]',
    },
  ];

  const standardQuotas: Array<{
    field: 'courses' | 'quizzes' | 'blogs';
    icon: React.ReactNode;
    title: string;
    globalVal: number;
  }> = [
    {
      field: 'courses',
      icon: <BookOpen className="w-3.5 h-3.5 text-[var(--color-primary)]" />,
      title: t('adminUsers.courses') || 'Courses',
      globalVal: globalCoursesLimit,
    },
    {
      field: 'quizzes',
      icon: <HelpCircle className="w-3.5 h-3.5 text-[var(--info)]" />,
      title: t('adminUsers.quizzes') || 'Quizzes',
      globalVal: globalQuizzesLimit,
    },
    {
      field: 'blogs',
      icon: <FileText className="w-3.5 h-3.5 text-[var(--warning)]" />,
      title: t('adminUsers.blogs') || 'Blogs',
      globalVal: globalBlogsLimit,
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-5 rounded-2xl bg-[var(--color-surface-muted)]/50 border border-[var(--border)]">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-[var(--teacher-soft)] to-[var(--primary-soft)] text-[var(--teacher-primary)] shadow-sm shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-[var(--color-foreground)] leading-tight">
              {t('adminUsers.teacherPrivilegesAndLimits') || 'Teacher Privileges & Quotas'}
            </h4>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
              {t('adminUsers.teacherPrivilegesDesc') || 'Configure feature access toggles and custom creation limits for this teacher.'}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="shrink-0 self-start sm:self-center">
          {activeOverridesCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>{activeOverridesCount} {t('adminUsers.activeOverrides') || 'Custom Overrides'}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-surface-muted-strong)] text-[var(--color-muted-foreground)]">
              {t('adminUsers.allGlobalDefaults') || 'All Global Defaults'}
            </span>
          )}
        </div>
      </div>

      {/* 1. Feature Permissions (Symmetrical 2x2 Grid) */}
      <div className="flex flex-col gap-2.5">
        <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] flex items-center gap-1.5">
          <span>{t('adminUsers.featurePermissions') || 'Feature Permissions'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {toggles.map((item) => (
            <PermissionToggleCard
              key={item.key}
              icon={item.icon}
              iconBgClass={item.iconBgClass}
              title={item.title}
              description={item.description}
              checked={item.checked}
              onChange={item.onChange}
              checkedBgClass={item.checkedBgClass}
            />
          ))}
        </div>
      </div>

      {/* 2. Standard Content Quotas (Courses, Quizzes, Blogs) */}
      <div className="p-4 rounded-xl bg-[var(--card-solid)] border border-[var(--border)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3.5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--color-muted-foreground)]" />
            <h5 className="text-xs sm:text-sm font-bold text-[var(--color-foreground)]">
              {t('adminUsers.contentQuotasTitle') || 'Standard Content Quotas'}
            </h5>
          </div>
          <span className="text-[11px] text-[var(--color-muted-foreground)]">
            {t('adminUsers.leaveEmptyForGlobal') || 'Leave empty for global limit'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {standardQuotas.map((q) => (
            <ContentQuotaCard
              key={q.field}
              icon={q.icon}
              title={q.title}
              value={limitsForm[q.field]}
              globalValue={q.globalVal}
              onChange={(val) => onLimitsChange(q.field, val)}
              customLabel={customText}
              globalLabel={globalText}
              resetTitle={resetText}
            />
          ))}
        </div>
      </div>

      {/* 3. AI Quiz Intelligence & Capacity (Featured Highlight Card) */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--primary-soft)]/20 via-[var(--card-solid)] to-[var(--card-solid)] border border-[var(--color-primary)]/25 shadow-xs flex flex-col gap-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[var(--color-primary)] text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs sm:text-sm font-bold text-[var(--color-foreground)] leading-tight">
                {t('adminUsers.aiQuotasTitle') || 'AI Intelligence & Quiz Limits'}
              </h5>
              <p className="text-[11px] text-[var(--color-muted-foreground)] mt-0.5">
                {t('adminUsers.aiQuotasDesc') || 'Manage AI question generation quotas and single-generation question limits.'}
              </p>
            </div>
          </div>

          {/* Usage Tracker Badge */}
          {user.aiQuizGenerationsCount !== undefined && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 self-start sm:self-center">
              <Sparkles className="w-3 h-3" />
              <span>{t('adminUsers.usedGenerations') || 'Used'}: {user.aiQuizGenerationsCount || 0}</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <AiQuotaCard
            icon={<Zap className="w-3.5 h-3.5 text-[var(--color-primary)]" />}
            title={t('adminUsers.aiQuizGenerations') || 'AI Quiz Quota'}
            subLabel={t('adminUsers.totalAiRuns') || 'Total Generations Allowed'}
            value={limitsForm.aiQuizGenerations || ''}
            globalValue={globalGenerationsLimit}
            onChange={(val) => onLimitsChange('aiQuizGenerations', val)}
            presets={[10, 25, 50, 100]}
            customLabel={customText}
            globalLabel={globalText}
            resetTitle={resetText}
            presetLabel={presetText}
          />

          <AiQuotaCard
            icon={<Sparkles className="w-3.5 h-3.5 text-[var(--teacher-primary)]" />}
            title={t('adminUsers.aiQuizMaxQuestions') || 'Max Questions / Gen'}
            subLabel={t('adminUsers.maxQuestionsPerRun') || 'Max Questions per Generation'}
            value={limitsForm.aiQuizMaxQuestions || ''}
            globalValue={globalMaxQuestions}
            onChange={(val) => onLimitsChange('aiQuizMaxQuestions', val)}
            presets={[15, 20, 25, 30]}
            customLabel={customText}
            globalLabel={globalText}
            resetTitle={resetText}
            presetLabel={presetText}
            hintText={t('adminUsers.extraQuestionsHighlighted') || 'Questions above default (10) are highlighted during quiz creation.'}
            max={50}
          />
        </div>
      </div>

      {/* 4. Unsaved Changes Docked Bar */}
      {hasLimitsChanged && (
        <div className="flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[var(--color-foreground)]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <p className="text-xs sm:text-sm font-medium text-amber-900 dark:text-amber-200 truncate">
              {t('adminUsers.unsavedChanges') || 'Unsaved limit changes'}
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
                <span>{t('adminUsers.discard') || 'Discard'}</span>
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


