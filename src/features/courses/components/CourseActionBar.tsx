'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Award, Users, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { getCourseById, deleteCourse as adminDeleteCourse, patchCourse as adminPatchCourse } from '@/lib/api/courses';
import { ROUTES } from '@/constants/routes';
import { useSessionStore } from '@/store/useSessionStore';
import { useTranslation } from '@/hooks/useTranslation';
import { isSuperAdmin } from '@/lib/roles';
import { useFeature } from '@/contexts/AppSettingsContext';
import Tooltip from '@/components/ui/Tooltip';
import { useAlert } from '@/components/ui/AlertContainer';
import { LazyConfirmModal } from '@/lib/lazy';
import CourseShareButton from '@/components/courses/CourseShareButton';
import { usePublishCourse, useMarkCourseCompleted, useDeleteCourse } from '@/lib/react-query/hooks';
import CourseAdminDeleteModal from './CourseAdminDeleteModal';

export default function CourseActionBar({ courseId }: { courseId: string }) {
  const router = useRouter();
  const { t } = useTranslation();
  const { session } = useSessionStore();
  const isSuperAdminUser = isSuperAdmin(session?.user?.role);
  const isAdmin = session?.user?.role === 'admin' || isSuperAdminUser;
  const isTeacher = session?.user?.role === 'teacher';
  const isEnrollmentManagementEnabled = useFeature('enableEnrollmentManagement');
  const queryClient = useQueryClient();
  const { addAlert } = useAlert();

  const [confirmDeleteCourse, setConfirmDeleteCourse] = useState(false);
  const [confirmCompleteCourse, setConfirmCompleteCourse] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeletingAdmin, setIsDeletingAdmin] = useState(false);
  const [isPublishingAdmin, setIsPublishingAdmin] = useState(false);

  const { data: course, isLoading, refetch } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourseById(courseId),
    enabled: !!courseId,
  });

  const publishCourseTeacher = usePublishCourse();
  const markCourseCompleted = useMarkCourseCompleted();
  const deleteCourseTeacher = useDeleteCourse();

  if (isLoading || !course) {
    return <div className="h-11 w-48 animate-pulse bg-[var(--surface-muted)] rounded-xl" />;
  }

  const handleTogglePublishAdmin = async () => {
    setIsPublishingAdmin(true);
    try {
      await adminPatchCourse(courseId, { isPublished: !course.isPublished });
      addAlert({ type: 'success', message: t('admin.courseUpdated') });
      refetch();
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    } catch (err) {
      addAlert({ type: 'error', message: err instanceof Error ? err.message : t('admin.failedUpdateCourse') });
    } finally {
      setIsPublishingAdmin(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!deleteReason.trim()) {
      addAlert({ type: 'error', message: 'Please provide a reason for deleting this course.' });
      return;
    }
    setIsDeletingAdmin(true);
    try {
      await adminDeleteCourse(courseId, deleteReason.trim());
      addAlert({ type: 'success', message: 'Course deleted successfully.' });
      setConfirmDeleteCourse(false);
      setDeleteReason('');
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      router.push(ROUTES.admin.courses);
    } catch (err) {
      addAlert({ type: 'error', message: err instanceof Error ? err.message : t('admin.failedDeleteCourse') });
    } finally {
      setIsDeletingAdmin(false);
    }
  };

  const handleTogglePublishTeacher = async () => {
    try {
      await publishCourseTeacher.mutateAsync({ courseId, isPublished: !course.isPublished });
      addAlert({
        type: 'success',
        message: !course.isPublished ? t('teacherCourses.coursePublished') : t('teacherCourses.courseUnpublished'),
      });
      refetch();
    } catch {
      addAlert({ type: 'error', message: t('teacherCourses.publishError') });
    }
  };

  const handleMarkCompleted = async (isCompleted: boolean) => {
    try {
      await markCourseCompleted.mutateAsync({ courseId, isCompleted });
      addAlert({
        type: 'success',
        message: isCompleted ? t('teacherCourses.courseMarkedCompleted') : t('teacherCourses.courseReopened'),
      });
      setConfirmCompleteCourse(false);
      refetch();
    } catch {
      addAlert({ type: 'error', message: t('teacherCourses.completeError') });
    }
  };

  const handleDeleteTeacher = async () => {
    try {
      await deleteCourseTeacher.mutateAsync(courseId);
      addAlert({ type: 'success', message: t('teacherCourses.courseDeleted') });
      setConfirmDeleteCourse(false);
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      router.push(ROUTES.teacher.courses);
    } catch {
      addAlert({ type: 'error', message: t('teacherCourses.deleteError') });
    }
  };

  const handleTogglePublish = isAdmin ? handleTogglePublishAdmin : handleTogglePublishTeacher;
  const isPublishing = isAdmin ? isPublishingAdmin : publishCourseTeacher.isPending;

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[var(--surface-muted)] rounded-2xl border border-[var(--border)]/80 w-full sm:w-auto">
      <button
        type="button"
        onClick={handleTogglePublish}
        disabled={isPublishing}
        className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl border transition-all cursor-pointer disabled:opacity-50 ${
          course.isPublished
            ? 'bg-[var(--warning-light)] text-amber-800 dark:text-amber-300 border-[var(--warning)]/30 hover:opacity-90'
            : 'bg-[var(--success-light)] text-[var(--success)] border-[var(--success)]/30 hover:opacity-90'
        }`}
      >
        {isPublishing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : course.isPublished ? (
          <>
            <EyeOff className="w-4 h-4" />
            <span>{isAdmin ? t('admin.unpublish') : t('teacherCourses.unpublish')}</span>
          </>
        ) : (
          <>
            <Eye className="w-4 h-4" />
            <span>{isAdmin ? t('admin.publish') : t('teacherCourses.publish')}</span>
          </>
        )}
      </button>

      {isEnrollmentManagementEnabled && (
        <Tooltip label={t('enrolledStudents.viewStudents')}>
          <button
            type="button"
            onClick={() =>
              router.push(isAdmin ? ROUTES.admin.courseStudents(courseId) : ROUTES.teacher.courseStudents(courseId))
            }
            aria-label={t('enrolledStudents.viewStudents')}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--card-solid)] border border-[var(--border)]/80 text-[var(--color-muted-foreground)] hover:text-[var(--teacher-primary)] hover:border-[var(--teacher-border)] transition-colors cursor-pointer"
          >
            <Users className="w-4 h-4" />
          </button>
        </Tooltip>
      )}

      {!isAdmin && isTeacher && (
        <Tooltip label={course.isCompleted ? t('teacherCourses.reopenCourse') : t('teacherCourses.markCompleted')}>
          <button
            type="button"
            onClick={() => (course.isCompleted ? handleMarkCompleted(false) : setConfirmCompleteCourse(true))}
            disabled={markCourseCompleted.isPending}
            aria-label={course.isCompleted ? t('teacherCourses.reopenCourse') : t('teacherCourses.markCompleted')}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-colors cursor-pointer disabled:opacity-50 ${
              course.isCompleted
                ? 'bg-[var(--info-light)] text-[var(--info)] border-[var(--info)]/30'
                : 'bg-[var(--card-solid)] border-[var(--border)]/80 text-[var(--color-muted-foreground)] hover:text-[var(--info)] hover:border-[var(--info)]/30'
            }`}
          >
            <Award className="w-4 h-4" />
          </button>
        </Tooltip>
      )}

      {!isAdmin && <CourseShareButton course={course} />}

      <Tooltip label={isAdmin ? t('common.delete') : t('teacherCourses.deleteCourse')}>
        <button
          type="button"
          onClick={() => setConfirmDeleteCourse(true)}
          aria-label={isAdmin ? t('common.delete') : t('teacherCourses.deleteCourse')}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--card-solid)] border border-[var(--error)]/25 text-[var(--error)] hover:bg-[var(--error-light)] transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </Tooltip>

      <LazyConfirmModal
        isOpen={confirmCompleteCourse}
        title={t('teacherCourses.completeConfirmTitle')}
        message={t('teacherCourses.completeConfirmMessage')}
        onConfirm={() => handleMarkCompleted(true)}
        onCancel={() => setConfirmCompleteCourse(false)}
        confirmText={t('teacherCourses.markCompleted')}
        type="info"
        isLoading={markCourseCompleted.isPending}
      />

      {!isAdmin && (
        <LazyConfirmModal
          isOpen={confirmDeleteCourse}
          title={t('teacherCourses.deleteConfirmTitle')}
          message={t('teacherCourses.deleteConfirmMessage')}
          onConfirm={handleDeleteTeacher}
          onCancel={() => setConfirmDeleteCourse(false)}
          confirmText={t('common.delete')}
          type="danger"
          isLoading={deleteCourseTeacher.isPending}
        />
      )}

      <CourseAdminDeleteModal
        isOpen={isAdmin && confirmDeleteCourse}
        courseTitle={course.title}
        deleteReason={deleteReason}
        onChangeReason={setDeleteReason}
        isDeleting={isDeletingAdmin}
        onClose={() => { setConfirmDeleteCourse(false); setDeleteReason(''); }}
        onConfirm={handleDeleteAdmin}
      />
    </div>
  );
}
