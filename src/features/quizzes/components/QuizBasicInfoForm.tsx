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
    </>
  );
}
