import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { TextField } from '@/components/ui/TextField';
import { Dropdown } from '@/components/ui/Dropdown';
import type { ChapterSelectOption, LessonSelectOption } from '@/lib/curriculum/tree';

interface Course {
  _id: string;
  title: string;
}

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

export function QuizBasicInfoForm({
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
    <>
      <TextField
        label={`${t('createQuizForm.quizTitle')} *`}
        type="text"
        name="title"
        id="title"
        required
        value={formData.title}
        onChange={handleChange}
        placeholder={t('createQuizForm.enterQuizTitle')}
        fullWidth
      />

      <TextField
        label={t('createQuizForm.description')}
        multiline
        name="description"
        id="description"
        rows={2}
        value={formData.description}
        onChange={handleChange}
        placeholder={t('createQuizForm.enterQuizDescription')}
        fullWidth
      />

      <div>
        <Dropdown
          label={`${t('createQuizForm.course')} *`}
          name="course"
          id="course"
          required={!quizId}
          disabled={!!quizId}
          value={formData.course}
          onChange={(val) => {
            handleChange({ target: { name: 'course', value: val } } as React.ChangeEvent<HTMLSelectElement>);
          }}
          options={courses.map((course) => ({
            value: course._id,
            label: course.title,
          }))}
          placeholder={t('createQuizForm.selectCourse')}
        />
        {courses.length === 0 && (
          <p className="mt-2 text-sm text-[var(--color-warning)]">
            {t('createQuizForm.needCourseFirst')}
          </p>
        )}
        {quizId && (
          <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
            {t('createQuizForm.courseLockedInEdit')}
          </p>
        )}
      </div>

      {formData.course && (
        <>
          <Dropdown
            label={t('createQuizForm.placement')}
            name="placement"
            id="placement"
            value={formData.placement}
            onChange={(val) => {
              handleChange({ target: { name: 'placement', value: val } } as React.ChangeEvent<HTMLSelectElement>);
            }}
            disabled={chaptersLoading}
            options={[
              { value: 'course', label: t('createQuizForm.placementCourse') },
              { value: 'chapter', label: t('createQuizForm.placementChapter') },
              { value: 'lesson', label: t('createQuizForm.placementLesson') },
            ]}
            placeholder=""
          />

          {formData.placement === 'chapter' && (
            <div>
              <Dropdown
                label={t('createQuizForm.chapter')}
                name="chapter"
                id="chapter"
                required
                value={formData.chapter}
                onChange={(val) => {
                  handleChange({ target: { name: 'chapter', value: val } } as React.ChangeEvent<HTMLSelectElement>);
                }}
                disabled={chaptersLoading}
                options={chapterOptions.map((ch) => ({
                  value: ch.id,
                  label: ch.label,
                }))}
                placeholder={t('createQuizForm.selectChapterRequired')}
              />
              <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                {t('createQuizForm.selectChapterHint')}
              </p>
            </div>
          )}

          {formData.placement === 'lesson' && (
            <div>
              <Dropdown
                label={t('createQuizForm.lesson')}
                name="lesson"
                id="lesson"
                required
                value={formData.lesson}
                onChange={(val) => {
                  handleChange({ target: { name: 'lesson', value: val } } as React.ChangeEvent<HTMLSelectElement>);
                }}
                disabled={chaptersLoading || lessonOptions.length === 0}
                options={lessonOptions.map((ls) => ({
                  value: ls.id,
                  label: ls.label,
                }))}
                placeholder={t('createQuizForm.selectLessonRequired')}
              />
              {lessonOptions.length === 0 && (
                <p className="mt-2 text-sm text-[var(--color-warning)]">{t('createQuizForm.noLessonsInCourse')}</p>
              )}
              <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                {t('createQuizForm.selectLessonHint')}
              </p>
            </div>
          )}
        </>
      )}

      <TextField
        label={t('createQuizForm.timeLimit')}
        type="number"
        name="timeLimit"
        id="timeLimit"
        min="1"
        max="180"
        value={formData.timeLimit}
        onChange={handleChange}
        fullWidth
      />

      {/* Negative Marking Configuration */}
      <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <label htmlFor="enableNegativeMarking" className="text-sm font-semibold text-[var(--color-foreground)] flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                id="enableNegativeMarking"
                name="enableNegativeMarking"
                checked={formData.enableNegativeMarking || false}
                onChange={handleChange}
                className="h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-[var(--color-border)] rounded cursor-pointer"
              />
              <span>{t('createQuizForm.enableNegativeMarking') || 'Enable Negative Marking'}</span>
            </label>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 ml-6">
              {t('createQuizForm.negativeMarkingDesc') || 'Deduct marks for incorrect answers to simulate competitive exam grading.'}
            </p>
          </div>
        </div>

        {formData.enableNegativeMarking && (
          <div className="pt-2 border-t border-[var(--color-border)] space-y-3 ml-6">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-foreground)] mb-1">
                {t('createQuizForm.negativeMarks') || 'Penalty per incorrect answer'}
              </label>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {[
                  { label: t('createQuizForm.negativeMarksPresetQuarter') || '1/4 (-0.25)', value: '0.25' },
                  { label: t('createQuizForm.negativeMarksPresetThird') || '1/3 (-0.33)', value: '0.33' },
                  { label: t('createQuizForm.negativeMarksPresetHalf') || '1/2 (-0.5)', value: '0.5' },
                  { label: t('createQuizForm.negativeMarksPresetOne') || '1 (-1.0)', value: '1' },
                ].map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => {
                      handleChange({ target: { name: 'negativeMarks', value: preset.value, type: 'text' } } as React.ChangeEvent<HTMLInputElement>);
                    }}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                      formData.negativeMarks === preset.value
                        ? 'bg-[var(--color-primary)] text-white border-transparent'
                        : 'bg-[var(--color-surface-muted)] text-[var(--color-foreground)] border-[var(--color-border)] hover:bg-[var(--color-accent)]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                name="negativeMarks"
                value={formData.negativeMarks ?? '0.25'}
                onChange={handleChange}
                placeholder="0.25"
                className="w-32 px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:ring-1 focus:ring-[var(--color-primary)]"
              />
              <span className="text-[11px] text-[var(--color-muted-foreground)] block mt-1">
                {t('createQuizForm.negativeMarksHint') || 'Unattempted / skipped questions receive 0 deduction.'}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
