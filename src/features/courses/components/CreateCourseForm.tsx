'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import { supportedLanguages } from '@/i18n/config';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { TextField } from '@/components/ui/TextField';
import { Dropdown } from '@/components/ui/Dropdown';
import { useCreateCourseForm } from './create-course-form/useCreateCourseForm';
import { CoursePrivateAccessSection } from './create-course-form/CoursePrivateAccessSection';

type Props = {
  /** When set, form loads this course and PATCHes on submit. */
  courseId?: string;
};

export default function CreateCourseForm({ courseId }: Props) {
  const { t } = useTranslation();
  const router = useRouter();

  const {
    isLoading,
    initialLoading,
    formData,
    setFormData,
    privateOnly,
    blockedNotice,
    setBlockedNotice,
    handleChange,
    handleSubmit,
  } = useCreateCourseForm(courseId);

  if (initialLoading) {
    return (
      <div className="py-12 text-center text-sm text-[var(--color-muted-foreground)]" role="status">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <TextField
        label={t('createCourseForm.courseTitle')}
        type="text"
        name="title"
        id="title"
        required
        value={formData.title}
        onChange={handleChange}
        placeholder={t('createCourseForm.enterCourseTitle')}
        fullWidth
      />

      <TextField
        label={t('createCourseForm.description')}
        multiline
        name="description"
        id="description"
        rows={4}
        value={formData.description}
        onChange={handleChange}
        placeholder={t('createCourseForm.enterCourseDescription')}
        fullWidth
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <TextField
          label={t('createCourseForm.price')}
          type="number"
          name="price"
          id="price"
          min="0"
          step="0.01"
          value={formData.price}
          onChange={handleChange}
          placeholder={t('createCourseForm.pricePlaceholder')}
          fullWidth
        />

        <TextField
          label={t('createCourseForm.category')}
          type="text"
          name="category"
          id="category"
          value={formData.category}
          onChange={handleChange}
          placeholder={t('createCourseForm.categoryPlaceholder')}
          fullWidth
        />

        <Dropdown
          label={t('createCourseForm.language')}
          name="locale"
          id="locale"
          value={formData.locale}
          onChange={(val) => setFormData((prev) => ({ ...prev, locale: val as 'en' | 'hi' }))}
          options={supportedLanguages.map((language) => ({
            value: language,
            label: t(language === 'en' ? 'common.english' : 'common.hindi'),
          }))}
          placeholder=""
        />
      </div>

      <ImageUpload
        label={t('createCourseForm.thumbnailUrl')}
        value={formData.thumbnail}
        onChange={(url) => setFormData((prev) => ({ ...prev, thumbnail: url }))}
        aspectRatio="video"
        allowDownload
        downloadFilename={formData.title || 'course-image'}
        downloadFallbackUrl={
          courseId ? `/api/courses/${encodeURIComponent(courseId)}/thumbnail` : undefined
        }
      />

      <CoursePrivateAccessSection
        isPrivateAccess={formData.isPrivateAccess}
        courseCode={formData.courseCode}
        privateOnly={privateOnly}
        blockedNotice={blockedNotice}
        setBlockedNotice={setBlockedNotice}
        onPrivateAccessChange={(checked, newCode) =>
          setFormData((prev) => ({
            ...prev,
            isPrivateAccess: checked,
            courseCode: newCode !== undefined ? newCode : prev.courseCode,
          }))
        }
        onCourseCodeChange={(code) =>
          setFormData((prev) => ({ ...prev, courseCode: code }))
        }
      />

      <label
        htmlFor="isPublished"
        className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--surface-muted)]/70 border border-[var(--border)]/80 cursor-pointer hover:border-[var(--teacher-primary)]/40 transition-colors"
      >
        <input
          type="checkbox"
          name="isPublished"
          id="isPublished"
          checked={formData.isPublished}
          onChange={handleChange}
          className="h-5 w-5 accent-[var(--teacher-primary)] rounded cursor-pointer shrink-0"
        />
        <span className="text-sm font-medium text-[var(--color-foreground)]">
          {t('createCourseForm.publishImmediately')}
        </span>
      </label>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-4 border-t border-[var(--border)]/70">
        <button
          type="button"
          onClick={() => router.push(ROUTES.teacher.courses)}
          className="teacher-pill-btn w-full sm:w-auto"
        >
          {t('createCourseForm.cancel')}
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="teacher-cta-btn w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading
            ? courseId
              ? t('createCourseForm.saving')
              : t('createCourseForm.creating')
            : courseId
              ? t('createCourseForm.saveChanges')
              : t('createCourseForm.createCourse')}
        </button>
      </div>
    </form>
  );
}
