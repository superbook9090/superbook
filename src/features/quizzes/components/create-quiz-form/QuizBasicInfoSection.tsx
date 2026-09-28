'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import type { ChapterSelectOption, LessonSelectOption } from '@/lib/curriculum/tree';
import { QuizNegativeMarkingConfig } from './QuizNegativeMarkingConfig';
import { FileText, BookOpen, Clock, AlertTriangle, Layers, Bookmark } from 'lucide-react';
import type { Course } from './useCreateQuizForm';

type Props = {
  formData: {
    title: string;
    description: string;
    course: string;
    placement: 'course' | 'chapter' | 'lesson';
    chapter: string;
    lesson: string;
    timeLimit: string;
    enableNegativeMarking?: boolean;
    negativeMarks?: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  courses: Course[];
  quizId?: string;
  chaptersLoading: boolean;
  chapterOptions: ChapterSelectOption[];
  lessonOptions: LessonSelectOption[];
};

const TIME_PRESETS = ['10', '15', '30', '45', '60'];

export function QuizBasicInfoSection({
  formData,
  handleChange,
  courses,
  quizId,
  chaptersLoading,
  chapterOptions,
  lessonOptions,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* 1. Quiz Basic Info Card */}
      <div className="p-5 sm:p-7 rounded-[2rem] bg-[var(--card-solid)]/70 backdrop-blur-xl border border-[var(--border)] shadow-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[var(--color-foreground)]">
              {t('createQuizForm.quizTitle')} & {t('createQuizForm.description')}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
              {t('createQuizPage.description')}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-xs sm:text-sm font-bold text-[var(--color-foreground)] mb-2">
              {t('createQuizForm.quizTitle')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              id="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder={t('createQuizForm.enterQuizTitle')}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)]/60 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 focus:border-[var(--primary)] transition-all"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-xs sm:text-sm font-bold text-[var(--color-foreground)] mb-2">
              {t('createQuizForm.description')}
            </label>
            <textarea
              name="description"
              id="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder={t('createQuizForm.enterQuizDescription')}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)]/60 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 focus:border-[var(--primary)] transition-all resize-y"
            />
          </div>
        </div>
      </div>

      {/* 2. Course & Placement Card */}
      <div className="p-5 sm:p-7 rounded-[2rem] bg-[var(--card-solid)]/70 backdrop-blur-xl border border-[var(--border)] shadow-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[var(--color-foreground)]">
              {t('createQuizForm.course')} & {t('createQuizForm.placement')}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
              {t('createQuizForm.placement')}
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor="course" className="block text-xs sm:text-sm font-bold text-[var(--color-foreground)] mb-2">
              {t('createQuizForm.course')} <span className="text-red-500">*</span>
            </label>
            <select
              name="course"
              id="course"
              required={!quizId}
              disabled={Boolean(quizId)}
              value={formData.course}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--color-foreground)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 focus:border-[var(--primary)] transition-all disabled:opacity-60 cursor-pointer"
            >
              <option value="">{t('createQuizForm.selectCourse')}</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>

            {courses.length === 0 && (
              <div className="mt-3 flex items-center gap-2 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{t('createQuizForm.needCourseFirst')}</span>
              </div>
            )}
            {quizId && (
              <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
                {t('createQuizForm.courseLockedInEdit')}
              </p>
            )}
          </div>

          {formData.course && (
            <div className="space-y-4 pt-2">
              <label className="block text-xs sm:text-sm font-bold text-[var(--color-foreground)] mb-2">
                {t('createQuizForm.placement')}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: 'course', label: t('createQuizForm.placementCourse'), icon: BookOpen },
                  { value: 'chapter', label: t('createQuizForm.placementChapter'), icon: Layers },
                  { value: 'lesson', label: t('createQuizForm.placementLesson'), icon: Bookmark },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = formData.placement === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => {
                        handleChange({
                          target: { name: 'placement', value: item.value },
                        } as React.ChangeEvent<HTMLSelectElement>);
                      }}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)] shadow-xs'
                          : 'bg-[var(--surface-muted)] border-[var(--border)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:border-[var(--color-foreground)]/30'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[var(--primary)] text-white' : 'bg-[var(--card-solid)] text-[var(--color-muted-foreground)]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {formData.placement === 'chapter' && (
                <div className="space-y-2 pt-2">
                  <label htmlFor="chapter" className="block text-xs sm:text-sm font-bold text-[var(--color-foreground)]">
                    {t('createQuizForm.chapter')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="chapter"
                    id="chapter"
                    required
                    value={formData.chapter}
                    onChange={handleChange}
                    disabled={chaptersLoading}
                    className="w-full px-4 py-3 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--color-foreground)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 focus:border-[var(--primary)] transition-all cursor-pointer"
                  >
                    <option value="">{t('createQuizForm.selectChapterRequired')}</option>
                    {chapterOptions.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        {ch.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    {t('createQuizForm.selectChapterHint')}
                  </p>
                </div>
              )}

              {formData.placement === 'lesson' && (
                <div className="space-y-2 pt-2">
                  <label htmlFor="lesson" className="block text-xs sm:text-sm font-bold text-[var(--color-foreground)]">
                    {t('createQuizForm.lesson')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="lesson"
                    id="lesson"
                    required
                    value={formData.lesson}
                    onChange={handleChange}
                    disabled={chaptersLoading || lessonOptions.length === 0}
                    className="w-full px-4 py-3 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--color-foreground)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 focus:border-[var(--primary)] transition-all cursor-pointer"
                  >
                    <option value="">{t('createQuizForm.selectLessonRequired')}</option>
                    {lessonOptions.map((ls) => (
                      <option key={ls.id} value={ls.id}>
                        {ls.label}
                      </option>
                    ))}
                  </select>
                  {lessonOptions.length === 0 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      {t('createQuizForm.noLessonsInCourse')}
                    </p>
                  )}
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    {t('createQuizForm.selectLessonHint')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. Quiz Timing & Negative Marking Card */}
      <div className="p-5 sm:p-7 rounded-[2rem] bg-[var(--card-solid)]/70 backdrop-blur-xl border border-[var(--border)] shadow-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[var(--color-foreground)]">
              {t('createQuizForm.timeLimit')} & {t('createQuizForm.enableNegativeMarking')}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
              {t('createQuizForm.negativeMarkingDesc')}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="timeLimit" className="block text-xs sm:text-sm font-bold text-[var(--color-foreground)] mb-2">
              {t('createQuizForm.timeLimit')}
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="number"
                name="timeLimit"
                id="timeLimit"
                min="1"
                max="300"
                value={formData.timeLimit}
                onChange={handleChange}
                className="w-full sm:w-44 px-4 py-3 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--color-foreground)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 focus:border-[var(--primary)] transition-all"
              />
              <div className="flex items-center gap-1.5 flex-wrap">
                {TIME_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      handleChange({
                        target: { name: 'timeLimit', value: preset },
                      } as React.ChangeEvent<HTMLInputElement>);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      formData.timeLimit === preset
                        ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs'
                        : 'bg-[var(--surface-muted)] text-[var(--color-muted-foreground)] border-[var(--border)] hover:text-[var(--color-foreground)]'
                    }`}
                  >
                    {preset} {t('createQuizForm.minutes')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--border)]">
            <QuizNegativeMarkingConfig
              enableNegativeMarking={formData.enableNegativeMarking}
              negativeMarks={formData.negativeMarks}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
