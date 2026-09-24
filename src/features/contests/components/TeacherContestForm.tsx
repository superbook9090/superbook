'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import Button from '@/components/ui/Button';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { Save } from 'lucide-react';
import type { TeacherContestFormProps } from './teacher-contest-form/types';
import { useTeacherContestForm } from './teacher-contest-form/useTeacherContestForm';
import { ContestOverviewSection } from './teacher-contest-form/ContestOverviewSection';
import { ContestScheduleSection } from './teacher-contest-form/ContestScheduleSection';
import { ContestPrizesSection } from './teacher-contest-form/ContestPrizesSection';
import { ContestSettingsSection } from './teacher-contest-form/ContestSettingsSection';
import { ContestQuestionsSection } from './teacher-contest-form/ContestQuestionsSection';
import { ContestSeoSection } from './teacher-contest-form/ContestSeoSection';

export function TeacherContestForm({ contestId }: TeacherContestFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme } = useRoleTheme();

  const form = useTeacherContestForm(contestId);

  if (form.isEdit && form.fetchingExisting) {
    return <PageSkeleton />;
  }

  return (
    <form onSubmit={form.handleSubmit} className="space-y-8 max-w-4xl">
      <ContestOverviewSection
        isEdit={form.isEdit}
        title={form.title}
        setTitle={form.setTitle}
        description={form.description}
        setDescription={form.setDescription}
        instructions={form.instructions}
        setInstructions={form.setInstructions}
        scheduleType={form.scheduleType}
        setScheduleType={form.setScheduleType}
        notifyAllStudents={form.notifyAllStudents}
        setNotifyAllStudents={form.setNotifyAllStudents}
        onSuperAdminAutofill={form.handleSuperAdminAutofill}
      />

      <ContestSeoSection
        slug={form.slug}
        setSlug={form.setSlug}
        metaTitle={form.metaTitle}
        setMetaTitle={form.setMetaTitle}
        metaDescription={form.metaDescription}
        setMetaDescription={form.setMetaDescription}
      />

      <ContestScheduleSection
        startTime={form.startTime}
        setStartTime={form.setStartTime}
        endTime={form.endTime}
        setEndTime={form.setEndTime}
        duration={form.duration}
        setDuration={form.setDuration}
        solutionsReleaseAt={form.solutionsReleaseAt}
        setSolutionsReleaseAt={form.setSolutionsReleaseAt}
      />

      <ContestPrizesSection
        prizes={form.prizes}
        onAddPrize={form.handleAddPrize}
        onUpdatePrize={form.handleUpdatePrize}
        onRemovePrize={form.handleRemovePrize}
      />

      <ContestSettingsSection
        maxAttempts={form.maxAttempts}
        setMaxAttempts={form.setMaxAttempts}
        maxParticipants={form.maxParticipants}
        setMaxParticipants={form.setMaxParticipants}
        visibility={form.visibility}
        setVisibility={form.setVisibility}
        leaderboardVisibility={form.leaderboardVisibility}
        setLeaderboardVisibility={form.setLeaderboardVisibility}
        enableNegativeMarking={form.enableNegativeMarking}
        setEnableNegativeMarking={form.setEnableNegativeMarking}
        negativeMarks={form.negativeMarks}
        setNegativeMarks={form.setNegativeMarks}
      />

      <ContestQuestionsSection
        canEditQuestions={form.canEditQuestions}
        questions={form.questions}
        theme={theme}
        triggerAiModalOpen={form.triggerAiModalOpen}
        enableNegativeMarking={form.enableNegativeMarking}
        negativeMarks={form.negativeMarks}
        onImportQuestions={form.handleImportQuestions}
        onAddQuestion={form.handleAddQuestion}
        onRemoveQuestion={form.handleRemoveQuestion}
        onQuestionChange={form.handleQuestionChange}
        onOptionChange={form.handleOptionChange}
        onSetCorrectAnswer={form.handleSetCorrectAnswer}
        onAddOption={form.handleAddOption}
        onRemoveOption={form.handleRemoveOption}
        onPointsChange={form.handlePointsChange}
        onNegativePointsChange={form.handleNegativePointsChange}
      />

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/dashboard/teacher/contests')}
        >
          {t('common.cancel') || 'Cancel'}
        </Button>

        <Button type="submit" disabled={form.isSaving} className="min-w-[160px]">
          <Save className="w-4 h-4" />
          <span>
            {form.isSaving
              ? 'Saving...'
              : form.isEdit
              ? t('contest.updateContest') || 'Update Contest'
              : t('contest.publishContest') || 'Publish & Schedule'}
          </span>
        </Button>
      </div>
    </form>
  );
}
