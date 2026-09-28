'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import type { Question } from '../types';
import type { Course } from './useCreateQuizForm';
import {
  BookOpen,
  Clock,
  Layers,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';

type Props = {
  formData: {
    title: string;
    description: string;
    course: string;
    placement: 'course' | 'chapter' | 'lesson';
    chapter: string;
    lesson: string;
    timeLimit: string;
    isPublished: boolean;
    enableNegativeMarking?: boolean;
    negativeMarks?: string;
  };
  courses: Course[];
  chapterTitle?: string;
  lessonTitle?: string;
  questions: Question[];
  onTogglePublish: (val: boolean) => void;
};

export function QuizReviewSection({
  formData,
  courses,
  chapterTitle,
  lessonTitle,
  questions,
  onTogglePublish,
}: Props) {
  const { t } = useTranslation();

  const selectedCourse = courses.find((c) => c._id === formData.course);
  const courseName = selectedCourse?.title || t('createQuizForm.selectCourse');

  let placementLabel = t('createQuizForm.placementCourse');
  if (formData.placement === 'chapter') {
    placementLabel = chapterTitle ? `${t('createQuizForm.placementChapter')}: ${chapterTitle}` : t('createQuizForm.placementChapter');
  } else if (formData.placement === 'lesson') {
    placementLabel = lessonTitle ? `${t('createQuizForm.placementLesson')}: ${lessonTitle}` : t('createQuizForm.placementLesson');
  }

  return (
    <div className="space-y-6">
      {/* 1. Summary Overview Card */}
      <div className="p-5 sm:p-7 rounded-[2rem] bg-[var(--card-solid)]/70 backdrop-blur-xl border border-[var(--border)] shadow-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[var(--color-foreground)]">
              {t('createQuizForm.summaryTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
              {t('createQuizForm.stepReviewSub')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title & Description */}
          <div className="p-4 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] space-y-2">
            <span className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
              {t('createQuizForm.quizTitle')}
            </span>
            <h4 className="text-sm sm:text-base font-bold text-[var(--color-foreground)] line-clamp-2">
              {formData.title || 'Untitled Quiz'}
            </h4>
            {formData.description ? (
              <p className="text-xs text-[var(--color-muted-foreground)] line-clamp-3">
                {formData.description}
              </p>
            ) : null}
          </div>

          {/* Course & Placement */}
          <div className="p-4 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] space-y-2">
            <span className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
              {t('createQuizForm.course')} & {t('createQuizForm.placement')}
            </span>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-500 shrink-0" />
              <h4 className="text-sm font-bold text-[var(--color-foreground)] truncate">
                {courseName}
              </h4>
            </div>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              {placementLabel}
            </p>
          </div>

          {/* Questions Metric */}
          <div className="p-4 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-[var(--color-muted-foreground)]">
                {t('createQuizForm.totalQuestions')}
              </span>
              <p className="text-lg font-extrabold text-[var(--color-foreground)]">
                {questions.length} Questions
              </p>
            </div>
          </div>

          {/* Time & Scoring Metric */}
          <div className="p-4 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-[var(--color-muted-foreground)]">
                {t('createQuizForm.timeLimit')}
              </span>
              <p className="text-lg font-extrabold text-[var(--color-foreground)]">
                {formData.timeLimit} {t('createQuizForm.minutes')}
              </p>
              <p className="text-[11px] text-[var(--color-muted-foreground)]">
                {formData.enableNegativeMarking
                  ? `Negative penalty: -${formData.negativeMarks || '0.25'} per wrong answer`
                  : 'No negative marking'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Publication Setting Card */}
      <div className="p-5 sm:p-7 rounded-[2rem] bg-[var(--card-solid)]/70 backdrop-blur-xl border border-[var(--border)] shadow-xl space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                formData.isPublished
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : 'bg-[var(--surface-muted)] text-[var(--color-muted-foreground)]'
              }`}
            >
              {formData.isPublished ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-[var(--color-foreground)]">
                {t('createQuizForm.readyToPublish')}
              </h4>
              <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] mt-0.5">
                {formData.isPublished
                  ? t('createQuizForm.publishDescription')
                  : 'Quiz will be saved as a draft. You can publish it later from the quiz management table.'}
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
            <input
              type="checkbox"
              name="isPublished"
              checked={formData.isPublished}
              onChange={(e) => onTogglePublish(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-[var(--surface-muted)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)] border border-[var(--border)]"></div>
          </label>
        </div>
      </div>
    </div>
  );
}
