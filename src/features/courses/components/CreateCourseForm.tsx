'use client';
import { ROUTES } from '@/constants/routes';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { createCourse, getCourseById, patchCourse } from '@/lib/api/courses';
import { ApiClientError } from '@/lib/api/http';
import { supportedLanguages } from '@/i18n/config';
import { useSessionStore } from '@/store/useSessionStore';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { generateInviteCode } from '@/lib/inviteCode';
import { Copy, RefreshCw, Lock } from 'lucide-react';

type Props = {
  /** When set, form loads this course and PATCHes on submit. */
  courseId?: string;
};

export default function CreateCourseForm({ courseId }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme } = useRoleTheme();
  const queryClient = useQueryClient();
  const session = useSessionStore((s) => s.session);
  const orgId = (session?.user as { organizationId?: string })?.organizationId || 'public';

  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!courseId);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    locale: 'en' as 'en' | 'hi',
    thumbnail: '',
    isPublished: false,
    isPrivateAccess: false,
    courseCode: '',
  });
  const [copied, setCopied] = useState(false);

  const loadCourse = useCallback(async () => {
    if (!courseId) return;
    setInitialLoading(true);
    setError('');
    try {
      const data = await getCourseById(courseId);
      const loc = data.locale ?? data.language ?? 'en';
      setFormData({
        title: data.title ?? '',
        description: data.description ?? '',
        price: String(data.price ?? 0),
        category: data.category ?? '',
        locale: loc === 'hi' ? 'hi' : 'en',
        thumbnail: data.thumbnail ?? '',
        isPublished: !!data.isPublished,
        isPrivateAccess: !!data.courseCode,
        courseCode: data.courseCode ?? '',
      });
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : t('createCourseForm.loadError');
      setError(message || t('createCourseForm.loadError'));
    } finally {
      setInitialLoading(false);
    }
  }, [courseId, t]);

  useEffect(() => {
    if (courseId) {
      void loadCourse();
    }
  }, [courseId, loadCourse]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const invalidateCourseLists = () => {
    queryClient.invalidateQueries({ queryKey: ['courses', orgId, 'teacher'] });
    queryClient.invalidateQueries({ queryKey: ['courses', orgId] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (formData.isPrivateAccess && formData.courseCode.trim().length < 4) {
      setError(t('createCourseForm.courseCodePlaceholder'));
      setIsLoading(false);
      return;
    }

    const body = {
      title: formData.title,
      description: formData.description,
      price: Number(formData.price) || 0,
      category: formData.category,
      locale: formData.locale,
      thumbnail: formData.thumbnail,
      isPublished: formData.isPublished,
      courseCode: formData.isPrivateAccess
        ? formData.courseCode.trim().toUpperCase() || null
        : null,
    };

    try {
      if (courseId) {
        await patchCourse(courseId, body);
        invalidateCourseLists();
        router.push(ROUTES.teacher.courses);
      } else {
        await createCourse(body);
        invalidateCourseLists();
        router.push(ROUTES.teacher.courses);
      }
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : courseId
              ? t('createCourseForm.updateFailed')
              : t('createCourseForm.errorOccurred');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCode = () => {
    setFormData((prev) => ({
      ...prev,
      isPrivateAccess: true,
      courseCode: generateInviteCode(8),
    }));
  };

  const handleCopyCode = async () => {
    if (!formData.courseCode) return;
    try {
      await navigator.clipboard.writeText(formData.courseCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  if (initialLoading) {
    return (
      <div className="py-12 text-center text-sm text-gray-600" role="status">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-3 sm:p-4 rounded-r-lg">
          <p className="text-sm text-red-700">{error}</p>
          {courseId && (
            <button
              type="button"
              onClick={() => router.push(ROUTES.teacher.courses)}
              className="mt-3 text-sm font-medium text-red-800 underline"
            >
              {t('createCourseForm.cancel')}
            </button>
          )}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
          {t('createCourseForm.courseTitle')} *
        </label>
        <input
          type="text"
          name="title"
          id="title"
          required
          value={formData.title}
          onChange={handleChange}
          className="px-3 py-2.5 sm:py-2 block w-full rounded-lg border-[var(--color-border)] bg-[var(--card-solid)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] text-base sm:text-sm text-[var(--color-foreground)] placeholder-[var(--color-muted)] touch-manipulation"
          placeholder={t('createCourseForm.enterCourseTitle')}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
          {t('createCourseForm.description')}
        </label>
        <textarea
          name="description"
          id="description"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          className="px-3 py-2.5 sm:py-2 block w-full rounded-lg border-[var(--color-border)] bg-[var(--card-solid)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] text-base sm:text-sm text-[var(--color-foreground)] placeholder-[var(--color-muted)] resize-y"
          placeholder={t('createCourseForm.enterCourseDescription')}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
            {t('createCourseForm.price')}
          </label>
          <input
            type="number"
            name="price"
            id="price"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            className="px-3 py-2.5 sm:py-2 block w-full rounded-lg border-[var(--color-border)] bg-[var(--card-solid)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] text-base sm:text-sm text-[var(--color-foreground)] placeholder-[var(--color-muted)]"
            placeholder={t('createCourseForm.pricePlaceholder')}
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
            {t('createCourseForm.category')}
          </label>
          <input
            type="text"
            name="category"
            id="category"
            value={formData.category}
            onChange={handleChange}
            className="px-3 py-2.5 sm:py-2 block w-full rounded-lg border-[var(--color-border)] bg-[var(--card-solid)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] text-base sm:text-sm text-[var(--color-foreground)] placeholder-[var(--color-muted)]"
            placeholder={t('createCourseForm.categoryPlaceholder')}
          />
        </div>

        <div>
          <label htmlFor="locale" className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
            {t('createCourseForm.language')}
          </label>
          <select
            name="locale"
            id="locale"
            value={formData.locale}
            onChange={handleChange}
            className="px-3 py-2.5 sm:py-2 block w-full rounded-lg border-[var(--color-border)] bg-[var(--card-solid)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] text-base sm:text-sm text-[var(--color-foreground)]"
          >
            {supportedLanguages.map((language) => (
              <option key={language} value={language}>
                {t(language === 'en' ? 'common.english' : 'common.hindi')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ImageUpload
        label={t('createCourseForm.thumbnailUrl')}
        value={formData.thumbnail}
        onChange={(url) => setFormData(prev => ({ ...prev, thumbnail: url }))}
        aspectRatio="video"
      />

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]/30 p-4 sm:p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            <Lock className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center py-1">
              <input
                type="checkbox"
                id="isPrivateAccess"
                checked={formData.isPrivateAccess}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setFormData((prev) => ({
                    ...prev,
                    isPrivateAccess: checked,
                    courseCode: checked && !prev.courseCode ? generateInviteCode(8) : prev.courseCode,
                  }));
                }}
                className="h-5 w-5 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              <label htmlFor="isPrivateAccess" className="ml-3 text-sm font-medium text-[var(--color-foreground)]">
                {t('createCourseForm.privateAccess')}
              </label>
            </div>
            <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
              {t('createCourseForm.privateAccessDesc')}
            </p>
          </div>
        </div>

        {formData.isPrivateAccess && (
          <div>
            <label htmlFor="courseCode" className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
              {t('createCourseForm.courseCode')}
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                name="courseCode"
                id="courseCode"
                value={formData.courseCode}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    courseCode: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''),
                  }))
                }
                maxLength={12}
                required={formData.isPrivateAccess}
                className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--card-solid)] px-3 py-2.5 font-mono text-sm uppercase tracking-widest text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                placeholder={t('createCourseForm.courseCodePlaceholder')}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--card-solid)] px-3 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)]"
                >
                  <RefreshCw className="h-4 w-4" />
                  {t('createCourseForm.generateCode')}
                </button>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  disabled={!formData.courseCode}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--card-solid)] px-3 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] disabled:opacity-50"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? t('createCourseForm.codeCopied') : t('createCourseForm.copyCode')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

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
