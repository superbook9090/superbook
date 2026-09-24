'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
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
  const { theme } = useRoleTheme();

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

      <div className="flex items-center py-2">
        <input
          type="checkbox"
          name="isPublished"
          id="isPublished"
          checked={formData.isPublished}
          onChange={handleChange}
          className="h-5 w-5 text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-[var(--color-border)] rounded cursor-pointer"
        />
        <label htmlFor="isPublished" className="ml-3 block text-base sm:text-sm text-[var(--color-foreground)] cursor-pointer">
          {t('createCourseForm.publishImmediately')}
        </label>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
        <button
          type="button"
          onClick={() => router.push(ROUTES.teacher.courses)}
          className="px-4 py-3 sm:py-2 border border-[var(--color-border)] rounded-lg shadow-sm text-sm font-medium text-[var(--color-foreground)] bg-[var(--card-solid)] hover:bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] touch-manipulation"
        >
          {t('createCourseForm.cancel')}
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`px-4 py-3 sm:py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation`}
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
