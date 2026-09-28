'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSessionStore } from '@/store/useSessionStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { useAlert } from '@/components/ui/AlertContainer';
import Button from '@/components/ui/Button';
import { PageSkeleton } from '@/components/ui/Skeleton';
import {
  FileText,
  Layers,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Check,
  Save,
  Trophy,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useCreateQuizForm } from './create-quiz-form/useCreateQuizForm';
import { QuizBasicInfoSection } from './create-quiz-form/QuizBasicInfoSection';
import { QuizQuestionsSection } from './create-quiz-form/QuizQuestionsSection';
import { QuizReviewSection } from './create-quiz-form/QuizReviewSection';

type Props = {
  /** When set, form loads this quiz and PATCHes on submit (edit mode). */
  quizId?: string;
  onViewLeaderboard?: () => void;
};

export default function CreateQuizForm({ quizId, onViewLeaderboard }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const session = useSessionStore((s) => s.session);
  const { theme } = useRoleTheme();
  const { addAlert } = useAlert();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const {
    isLoading,
    isFetching,
    courses,
    formData,
    chapterOptions,
    lessonOptions,
    chaptersLoading,
    questions,
    setQuestions,
    handleChange,
    handleQuestionChange,
    addQuestion,
    removeQuestion,
    addOption,
    removeOption,
    handleSubmit,
  } = useCreateQuizForm(quizId);

  if (isFetching) {
    return <PageSkeleton />;
  }

  const isAdminUser = session?.user?.role === 'admin' || session?.user?.role === 'superadmin';

  // Validation before proceeding from Step 1 to Step 2
  const validateStep1 = (): boolean => {
    if (!formData.title.trim()) {
      addAlert({ type: 'error', message: t('createQuizForm.questionRequired') });
      return false;
    }
    if (!formData.course && !quizId) {
      addAlert({ type: 'error', message: t('createQuizForm.selectCourseRequired') });
      return false;
    }
    if (formData.placement === 'chapter' && !formData.chapter) {
      addAlert({ type: 'error', message: t('createQuizForm.selectChapterRequired') });
      return false;
    }
    if (formData.placement === 'lesson' && !formData.lesson) {
      addAlert({ type: 'error', message: t('createQuizForm.selectLessonRequired') });
      return false;
    }
    return true;
  };

  // Validation before proceeding from Step 2 to Step 3
  const validateStep2 = (): boolean => {
    if (questions.length === 0) {
      addAlert({ type: 'error', message: t('createQuizForm.noValidQuestions') });
      return false;
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        addAlert({
          type: 'error',
          message: t('createQuizForm.questionRequiredNumber').replace('{number}', (i + 1).toString()),
        });
        return false;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          addAlert({
            type: 'error',
            message: t('createQuizForm.optionsRequiredNumber').replace('{number}', (i + 1).toString()),
          });
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
      title: t('createQuizForm.stepDetails'),
      subtitle: t('createQuizForm.stepDetailsSub'),
      icon: FileText,
    },
    {
      step: 2 as const,
      title: t('createQuizForm.stepQuestions'),
      subtitle: `${questions.length} ${t('createQuizForm.questions').toLowerCase()}`,
      icon: Layers,
    },
    {
      step: 3 as const,
      title: t('createQuizForm.stepReview'),
      subtitle: t('createQuizForm.stepReviewSub'),
      icon: ShieldCheck,
    },
  ];

  const chapterTitle = chapterOptions.find((ch) => ch.id === formData.chapter)?.label;
  const lessonTitle = lessonOptions.find((ls) => ls.id === formData.lesson)?.label;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-5xl mx-auto space-y-8 pb-36 md:pb-28">
      {/* 1. Sleek Top Horizontal Stepper */}
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

      {/* 2. Step Views (Persistent DOM mounting via block/hidden) */}
      <div className="relative">
        {/* Step 1: Details & Placement */}
        <div className={currentStep === 1 ? 'space-y-6 animate-in fade-in duration-300' : 'hidden'}>
          <QuizBasicInfoSection
            formData={formData}
            handleChange={handleChange}
            courses={courses}
            quizId={quizId}
            chaptersLoading={chaptersLoading}
            chapterOptions={chapterOptions}
            lessonOptions={lessonOptions}
          />
        </div>

        {/* Step 2: Questions & Content */}
        <div className={currentStep === 2 ? 'space-y-6 animate-in fade-in duration-300' : 'hidden'}>
          <QuizQuestionsSection
            theme={theme}
            questions={questions}
            onImport={(imported) => setQuestions(imported)}
            onQuestionChange={handleQuestionChange}
            onRemoveQuestion={removeQuestion}
            onAddOption={addOption}
            onRemoveOption={removeOption}
            onAddQuestion={addQuestion}
          />
        </div>

        {/* Step 3: Review & Publish */}
        <div className={currentStep === 3 ? 'space-y-6 animate-in fade-in duration-300' : 'hidden'}>
          <QuizReviewSection
            formData={formData}
            courses={courses}
            chapterTitle={chapterTitle}
            lessonTitle={lessonTitle}
            questions={questions}
            onTogglePublish={(val) => {
              handleChange({
                target: { name: 'isPublished', type: 'checkbox', checked: val },
              } as unknown as React.ChangeEvent<HTMLInputElement>);
            }}
          />
        </div>
      </div>

      {/* 3. Floating Bottom Navigation Bar */}
      <div className="fixed bottom-20 md:bottom-4 left-0 right-0 md:left-72 z-40 px-4 sm:px-6 pointer-events-none">
        <div className="max-w-5xl mx-auto p-3 sm:p-4 rounded-3xl bg-[var(--card-solid)]/90 backdrop-blur-2xl border border-[var(--border)] shadow-2xl flex items-center justify-between gap-3 pointer-events-auto">
          <div className="flex items-center gap-2">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrev}
                className="rounded-2xl px-4 sm:px-5 py-2.5 font-bold cursor-pointer inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{t('createQuizForm.prevStep')}</span>
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push(isAdminUser ? ROUTES.admin.quizzes : ROUTES.teacher.quizzes)}
                className="rounded-2xl px-4 py-2.5 font-bold cursor-pointer text-[var(--color-muted-foreground)]"
              >
                {t('createQuizForm.cancel')}
              </Button>
            )}

            {quizId && onViewLeaderboard && (
              <Button
                type="button"
                variant="outline"
                onClick={onViewLeaderboard}
                className="rounded-2xl px-3.5 py-2 font-bold cursor-pointer inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400"
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline">{t('quiz.leaderboard.title')}</span>
              </Button>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-[var(--color-muted-foreground)]">
            <span>Step {currentStep} of 3</span>
            <span>•</span>
            <span className="text-[var(--color-foreground)]">
              {currentStep === 1
                ? t('createQuizForm.stepDetails')
                : currentStep === 2
                ? `${questions.length} ${t('createQuizForm.questions')}`
                : t('createQuizForm.stepReview')}
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
                    ? t('createQuizForm.nextQuestions')
                    : t('createQuizForm.nextReview')}
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading}
                className="rounded-2xl px-8 py-3 font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer inline-flex items-center gap-2 bg-gradient-to-r from-[var(--primary)] to-purple-600 text-white"
              >
                <Save className="w-4 h-4" />
                <span>
                  {isLoading
                    ? t('createQuizForm.saving')
                    : quizId
                    ? t('createQuizForm.saveChanges')
                    : t('createQuizForm.createQuiz')}
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
