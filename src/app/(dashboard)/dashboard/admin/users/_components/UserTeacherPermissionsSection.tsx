'use client';

import React from 'react';
import { Video, Globe, Sliders, Check, BookOpen, HelpCircle, FileText, Sparkles } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import Button from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import type { User } from './types';

interface UserTeacherPermissionsSectionProps {
  user: User;
  onToggleVideo: (currentVal: boolean) => void;
  onTogglePublicCourse: (currentVal: boolean) => void;
  limitsForm: { courses: string; quizzes: string; blogs: string; aiQuizGenerations?: string };
  onLimitsChange: (field: 'courses' | 'quizzes' | 'blogs' | 'aiQuizGenerations', value: string) => void;
  onSaveLimits: () => void;
  isSavingLimits?: boolean;
}

export function UserTeacherPermissionsSection({
  user,
  onToggleVideo,
  onTogglePublicCourse,
  limitsForm,
  onLimitsChange,
  onSaveLimits,
  isSavingLimits,
}: UserTeacherPermissionsSectionProps) {
  const { t } = useTranslation();

  if (user.role !== 'teacher') {
    return null;
  }

  const hasLimitsChanged =
    limitsForm.courses !== String(user.limits?.courses ?? '') ||
    limitsForm.quizzes !== String(user.limits?.quizzes ?? '') ||
    limitsForm.blogs !== String(user.limits?.blogs ?? '') ||
    limitsForm.aiQuizGenerations !== String(user.limits?.aiQuizGenerations ?? '');

  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl bg-[var(--color-surface-muted)]/40 border border-[var(--border)]">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
        <Sliders className="w-3.5 h-3.5 text-[var(--teacher-primary)]" />
        <span>{t('adminUsers.capabilitiesAndLimits') || 'Teacher Capabilities & Quotas'}</span>
      </div>

      {/* Feature Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Video Upload Permission */}
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[var(--card-solid)] border border-[var(--border)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-[var(--teacher-soft)] text-[var(--teacher-primary)] shrink-0">
              <Video className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-[var(--color-foreground)] truncate">
                {t('adminUsers.videoUploadPermission') || 'Video Uploads'}
              </p>
              <p className="text-[11px] sm:text-xs text-[var(--color-muted-foreground)] truncate">
                {t('adminUsers.videoUploadPermissionDesc') || 'Allow unlisted YouTube lectures.'}
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={Boolean(user.canUploadVideos)}
              onChange={() => onToggleVideo(Boolean(user.canUploadVideos))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[var(--color-surface-muted-strong)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--color-border)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--teacher-primary)]" />
          </label>
        </div>

        {/* Public Course Permission */}
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[var(--card-solid)] border border-[var(--border)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-[var(--info-light)] text-[var(--info)] shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-[var(--color-foreground)] truncate">
                {t('adminUsers.canCreatePublicCourses') || 'Public Courses'}
              </p>
              <p className="text-[11px] sm:text-xs text-[var(--color-muted-foreground)] truncate">
                {t('adminUsers.canCreatePublicCoursesDesc') || 'Create courses without join code.'}
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={Boolean(user.canCreatePublicCourses)}
              onChange={() => onTogglePublicCourse(Boolean(user.canCreatePublicCourses))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[var(--color-surface-muted-strong)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--color-border)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--teacher-primary)]" />
          </label>
        </div>
      </div>

      {/* Resource Quotas */}
      <div className="p-3.5 rounded-xl bg-[var(--card-solid)] border border-[var(--border)]">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs sm:text-sm font-bold text-[var(--color-foreground)]">
            {t('adminUsers.teacherLimits') || 'Resource Creation Quotas'}
          </label>
          <span className="text-[11px] text-[var(--color-muted)]">
            {t('adminUsers.leaveEmptyForGlobal') || 'Leave empty for global limit'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <TextField
            label={t('adminUsers.courses') || 'Courses'}
            type="number"
            min="1"
            startIcon={<BookOpen className="w-4 h-4 text-[var(--color-muted)]" />}
            value={limitsForm.courses}
            onChange={(e) => onLimitsChange('courses', e.target.value)}
            placeholder={t('adminUsers.unlimited') || 'Unlimited'}
            fullWidth
          />
          <TextField
            label={t('adminUsers.quizzes') || 'Quizzes'}
            type="number"
            min="1"
            startIcon={<HelpCircle className="w-4 h-4 text-[var(--color-muted)]" />}
            value={limitsForm.quizzes}
            onChange={(e) => onLimitsChange('quizzes', e.target.value)}
            placeholder={t('adminUsers.unlimited') || 'Unlimited'}
            fullWidth
          />
          <TextField
            label={t('adminUsers.blogs') || 'Blogs'}
            type="number"
            min="1"
            startIcon={<FileText className="w-4 h-4 text-[var(--color-muted)]" />}
            value={limitsForm.blogs}
            onChange={(e) => onLimitsChange('blogs', e.target.value)}
            placeholder={t('adminUsers.unlimited') || 'Unlimited'}
            fullWidth
          />
          <TextField
            label={t('adminUsers.aiQuizGenerations') || 'AI Quiz Quota'}
            type="number"
            min="1"
            startIcon={<Sparkles className="w-4 h-4 text-[var(--color-muted)]" />}
            value={limitsForm.aiQuizGenerations || ''}
            onChange={(e) => onLimitsChange('aiQuizGenerations', e.target.value)}
            placeholder={t('adminUsers.globalDefault') || 'Global Default (5)'}
            fullWidth
          />
        </div>

        {hasLimitsChanged && (
          <div className="mt-3.5 flex justify-end">
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
        )}
      </div>
    </div>
  );
}
