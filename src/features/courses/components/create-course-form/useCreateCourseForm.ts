'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/components/ui/AlertContainer';
import { createCourse, getCourseById, patchCourse } from '@/lib/api/courses';
import { fetchAccountInfo } from '@/lib/api/auth';
import { ApiClientError } from '@/lib/api/http';
import { useSessionStore } from '@/store/useSessionStore';
import { generateInviteCode } from '@/lib/inviteCode';
import { sendGAEvent } from '@next/third-parties/google';
import { ROUTES } from '@/constants/routes';

export function useCreateCourseForm(courseId?: string) {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const session = useSessionStore((s) => s.session);
  const { addAlert } = useAlert();
  const orgId = (session?.user as { organizationId?: string })?.organizationId || 'public';

  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(Boolean(courseId));
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    locale: 'en' as 'en' | 'hi',
    thumbnail: '',
    isPublished: true,
    isPrivateAccess: false,
    courseCode: '',
  });

  const [privateOnly, setPrivateOnly] = useState(false);
  const [blockedNotice, setBlockedNotice] = useState(false);

  const loadCourse = useCallback(async () => {
    if (!courseId) return;
    setInitialLoading(true);
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
        isPublished: Boolean(data.isPublished),
        isPrivateAccess: Boolean(data.courseCode),
        courseCode: data.courseCode ?? '',
      });
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : t('createCourseForm.loadError');
      addAlert({
        type: 'error',
        message: message || t('createCourseForm.loadError'),
        duration: 5000,
      });
    } finally {
      setInitialLoading(false);
    }
  }, [courseId, t, addAlert]);

  useEffect(() => {
    if (courseId) {
      void loadCourse();
    }
  }, [courseId, loadCourse]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const account = await fetchAccountInfo();
        if (!cancelled) setPrivateOnly(account.canCreatePublicCourses === false);
      } catch {
        // Leave the toggle usable; the API rejects public courses regardless.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!privateOnly || initialLoading) return;
    setFormData((prev) =>
      prev.isPrivateAccess && prev.courseCode
        ? prev
        : {
            ...prev,
            isPrivateAccess: true,
            courseCode: prev.courseCode || generateInviteCode(8),
          }
    );
  }, [privateOnly, initialLoading]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
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
    setIsLoading(true);

    if (privateOnly && !formData.isPrivateAccess) {
      setBlockedNotice(true);
      addAlert({
        type: 'error',
        message: t('createCourseForm.publicCourseNotAllowed'),
        duration: 5000,
      });
      setIsLoading(false);
      return;
    }

    if (formData.isPrivateAccess && formData.courseCode.trim().length < 4) {
      addAlert({
        type: 'error',
        message: t('createCourseForm.courseCodePlaceholder'),
        duration: 5000,
      });
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
        addAlert({
          type: 'success',
          message: t('createCourseForm.updateSuccess'),
          duration: 3000,
        });
        router.push(ROUTES.teacher.courses);
      } else {
        await createCourse(body);
        invalidateCourseLists();
        sendGAEvent({ event: 'create_course', course_title: formData.title });
        addAlert({
          type: 'success',
          message: t('createCourseForm.createSuccess'),
          duration: 3000,
        });
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
      addAlert({
        type: 'error',
        message,
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    initialLoading,
    formData,
    setFormData,
    privateOnly,
    blockedNotice,
    setBlockedNotice,
    handleChange,
    handleSubmit,
  };
}
