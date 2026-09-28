'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { useAlert } from '@/components/ui/AlertContainer';
import Button from '@/components/ui/Button';
import { PageSkeleton } from '@/components/ui/Skeleton';
import {
  CalendarDays,
  Layers,
  Trophy,
  ArrowRight,
  ArrowLeft,
  Check,
  Save,
  Sparkles,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import type { TeacherContestFormProps } from './teacher-contest-form/types';
import { useTeacherContestForm } from './teacher-contest-form/useTeacherContestForm';
import { ContestOverviewSection } from './teacher-contest-form/ContestOverviewSection';
import { ContestScheduleSection } from './teacher-contest-form/ContestScheduleSection';
import { ContestPrizesSection } from './teacher-contest-form/ContestPrizesSection';
import { ContestSettingsSection } from './teacher-contest-form/ContestSettingsSection';
import { ContestQuestionsSection } from './teacher-contest-form/ContestQuestionsSection';
import { ContestSeoSection } from './teacher-contest-form/ContestSeoSection';
import { isAdmin } from '@/lib/roles';

export function TeacherContestForm({ contestId }: TeacherContestFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme, role } = useRoleTheme();
  const { addAlert } = useAlert();
  const userIsAdmin = isAdmin(role);

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const form = useTeacherContestForm(contestId);

  if (form.isEdit && form.fetchingExisting) {
    return <PageSkeleton />;
  }

  // Calculate total points across all questions
  const totalPoints = form.questions.reduce((sum, q) => sum + (q.points || 1), 0);

  // Validation before advancing to step 2
  const validateStep1 = (): boolean => {
    if (!form.title.trim()) {
      addAlert({ type: 'error', message: 'Please enter a contest title.' });
      return false;
    }
    if (!form.startTime || !form.endTime) {
      addAlert({ type: 'error', message: 'Please provide both start and end times.' });
      return false;
    }
    if (new Date(form.endTime) <= new Date(form.startTime)) {
      addAlert({ type: 'error', message: 'End time must be after start time.' });
      return false;
    }
    return true;
  };

  // Validation before advancing to step 3
  const validateStep2 = (): boolean => {
    if (form.questions.length === 0) {
      addAlert({ type: 'error', message: 'Please add at least one question.' });
      return false;
    }
    for (let i = 0; i < form.questions.length; i++) {
      const q = form.questions[i];
      if (!q.question.trim()) {
        addAlert({ type: 'error', message: `Question #${i + 1} prompt cannot be empty.` });
        return false;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          addAlert({ type: 'error', message: `Option ${j + 1} in Question #${i + 1} cannot be empty.` });
          return false;
        }
      }
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setCurrentStep(3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const steps = [
    {
      step: 1 as const,
      title: t('contest.stepDetails'),
      subtitle: t('contest.stepDetailsSub'),
      icon: CalendarDays,
    },
    {
      step: 2 as const,
      title: t('contest.stepQuestions'),
      subtitle: `${form.questions.length} questions added`,
      icon: Layers,
    },
    {
      step: 3 as const,
      title: t('contest.stepRewards'),
      subtitle: t('contest.stepRewardsSub'),
      icon: Trophy,
    },
  ];

  return (
    <form onSubmit={form.handleSubmit} className="w-full max-w-5xl mx-auto space-y-8 pb-28">
      {/* Sleek Top Horizontal Stepper */}
      <div className="relative overflow-hidden p-4 sm:p-6 rounded-[2rem] bg-[var(--card-solid)]/70 backdrop-blur-2xl border border-[var(--border)] shadow-xl">
        {/* Animated Progress Bar */}
        <div className="w-full bg-[var(--surface-muted)]/70 h-1.5 rounded-full overflow-hidden mb-6">
          <motion.div
            className="h-full bg-gradient-to-r from-[var(--primary)] to-purple-500 rounded-full"
            initial={{ width: '33%' }}
            animate={{
              width: currentStep === 1 ? '33%' : currentStep === 2 ? '66%' : '100%',
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {steps.map((s) => {
            const Icon = s.icon;
            const isCompleted = currentStep > s.step;
            const isActive = currentStep === s.step;

            return (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  if (s.step < currentStep) {
                    setCurrentStep(s.step);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else if (s.step === 2 && currentStep === 1) {
                    if (validateStep1()) {
                      setCurrentStep(2);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  } else if (s.step === 3 && currentStep === 2) {
                    if (validateStep2()) {
                      setCurrentStep(3);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }
                }}
                className={`flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3.5 p-2 sm:p-3 rounded-2xl transition-all text-center sm:text-left ${
                  isActive
                    ? 'bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]/40 shadow-xs'
                    : isCompleted
                    ? 'hover:bg-[var(--surface-muted)] cursor-pointer'
                    : 'opacity-60 cursor-default'
                }`}
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-all font-bold text-sm ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : isActive
                      ? 'bg-[var(--primary)] text-white shadow-md ring-2 ring-[var(--primary)]/20'
                      : 'bg-[var(--surface-muted)] text-[var(--color-muted-foreground)]'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                </div>

                <div className="min-w-0 flex-1 hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                      Step {s.step}
                    </span>
                  </div>
                  <h4 className={`text-xs sm:text-sm font-bold truncate ${isActive ? 'text-[var(--primary)]' : 'text-[var(--color-foreground)]'}`}>
                    {s.title}
                  </h4>
                  <p className="text-[11px] text-[var(--color-muted-foreground)] truncate">
                    {s.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="relative">
        <div className={currentStep === 1 ? 'space-y-6 animate-in fade-in duration-300' : 'hidden'}>
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
            onSuperAdminAutofill={() => {
              form.handleSuperAdminAutofill(() => {
                setCurrentStep(2);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              });
            }}
            isAutofilling={form.isAutofilling}
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
        </div>

        <div className={currentStep === 2 ? 'space-y-6 animate-in fade-in duration-300' : 'hidden'}>
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
        </div>

        <div className={currentStep === 3 ? 'space-y-6 animate-in fade-in duration-300' : 'hidden'}>
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

          {userIsAdmin && (
            <ContestSeoSection
              slug={form.slug}
              setSlug={form.setSlug}
              metaTitle={form.metaTitle}
              setMetaTitle={form.setMetaTitle}
              metaDescription={form.metaDescription}
              setMetaDescription={form.setMetaDescription}
            />
          )}

          {/* Launch Summary Card */}
          <div className="p-6 sm:p-8 rounded-[2rem] bg-gradient-to-br from-[var(--primary)]/10 via-[var(--card-solid)]/70 to-purple-500/10 border border-[var(--primary)]/30 backdrop-blur-2xl shadow-xl space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-[var(--border)]/40">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--primary)] text-white shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--color-foreground)] tracking-tight">
                  {t('contest.reviewSummary')}
                </h3>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  {t('contest.reviewReady')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-3.5 rounded-2xl bg-[var(--card-solid)] border border-[var(--border)]/60">
                <span className="text-[10px] uppercase font-bold text-[var(--color-muted-foreground)] block mb-1">
                  Title
                </span>
                <span className="text-xs sm:text-sm font-bold text-[var(--color-foreground)] truncate block" title={form.title}>
                  {form.title || 'Untitled Contest'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--card-solid)] border border-[var(--border)]/60">
                <span className="text-[10px] uppercase font-bold text-[var(--color-muted-foreground)] block mb-1">
                  Questions
                </span>
                <span className="text-xs sm:text-sm font-bold text-[var(--primary)] block">
                  {form.questions.length} Questions ({totalPoints} pts)
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--card-solid)] border border-[var(--border)]/60">
                <span className="text-[10px] uppercase font-bold text-[var(--color-muted-foreground)] block mb-1">
                  Duration
                </span>
                <span className="text-xs sm:text-sm font-bold text-[var(--color-foreground)] block">
                  {form.duration} Minutes
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--card-solid)] border border-[var(--border)]/60">
                <span className="text-[10px] uppercase font-bold text-[var(--color-muted-foreground)] block mb-1">
                  Prizes
                </span>
                <span className="text-xs sm:text-sm font-bold text-amber-500 block truncate">
                  {form.prizes.length > 0 ? `${form.prizes.length} Tier(s)` : 'Rank honors'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-[var(--color-muted-foreground)]">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface-muted)] border border-[var(--border)]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Visibility: <strong className="capitalize text-[var(--color-foreground)]">{form.visibility}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface-muted)] border border-[var(--border)]">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                Attempts: <strong className="text-[var(--color-foreground)]">{form.maxAttempts}</strong>
              </span>
              {form.enableNegativeMarking && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 font-bold">
                  Negative Marking: -{form.negativeMarks}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating / Sticky Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 md:left-72 z-30 p-4 bg-[var(--card-solid)]/80 backdrop-blur-2xl border-t border-[var(--border)]/60 shadow-2xl">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div>
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrev}
                className="rounded-2xl px-4 py-2.5 font-bold shadow-xs cursor-pointer inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('contest.previousStep')}</span>
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/dashboard/teacher/contests')}
                className="rounded-2xl px-4 py-2.5 font-bold cursor-pointer text-[var(--color-muted-foreground)]"
              >
                {t('common.cancel')}
              </Button>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-[var(--color-muted-foreground)]">
            <span>Step {currentStep} of 3</span>
            <span>•</span>
            <span className="text-[var(--color-foreground)]">
              {currentStep === 1
                ? 'Details & Schedule'
                : currentStep === 2
                ? `${form.questions.length} Questions`
                : 'Prizes & Launch'}
            </span>
          </div>

          <div>
            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="rounded-2xl px-6 py-2.5 font-bold shadow-md hover:shadow-lg transition-all cursor-pointer inline-flex items-center gap-2 bg-[var(--primary)] text-white"
              >
                <span>
                  {currentStep === 1
                    ? t('contest.nextQuestions')
                    : t('contest.nextRewards')}
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={form.isSaving}
                className="rounded-2xl px-8 py-3 font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer inline-flex items-center gap-2 bg-gradient-to-r from-[var(--primary)] to-purple-600 text-white"
              >
                <Save className="w-4 h-4" />
                <span>
                  {form.isSaving
                    ? 'Saving...'
                    : form.isEdit
                    ? t('contest.updateContest')
                    : t('contest.publishContest')}
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
