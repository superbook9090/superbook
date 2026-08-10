'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCourseById } from '@/lib/api/courses';
import { ROUTES } from '@/constants/routes';
import { useSessionStore } from '@/store/useSessionStore';
import { useTranslation } from '@/hooks/useTranslation';
import { isSuperAdmin } from '@/lib/roles';
import { useFeature } from '@/contexts/AppSettingsContext';
import { Award, Users, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';
import { useAlert } from '@/components/ui/AlertContainer';
import { LazyConfirmModal } from '@/lib/lazy';
import CourseShareButton from '@/components/courses/CourseShareButton';
import { usePublishCourse, useMarkCourseCompleted, useDeleteCourse } from '@/lib/react-query/hooks';
import { deleteCourse as adminDeleteCourse, patchCourse as adminPatchCourse } from '@/lib/api/courses';

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
  
  // Modals state
  const [confirmDeleteCourse, setConfirmDeleteCourse] = useState<boolean>(false);
  const [confirmCompleteCourse, setConfirmCompleteCourse] = useState<boolean>(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeletingAdmin, setIsDeletingAdmin] = useState(false);
  const [isPublishingAdmin, setIsPublishingAdmin] = useState(false);

  // Fetch course
  const { data: course, isLoading, refetch } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourseById(courseId),
    enabled: !!courseId,
  });

  // Teacher Hooks
  const publishCourseTeacher = usePublishCourse();
  const markCourseCompleted = useMarkCourseCompleted();
  const deleteCourseTeacher = useDeleteCourse();

  if (isLoading || !course) {
    return <div className="h-10 w-full animate-pulse bg-[var(--color-surface-muted)] rounded-xl" />;
  }

  // Admin Actions
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

  // Teacher Actions
  const handleTogglePublishTeacher = async () => {
    try {
      await publishCourseTeacher.mutateAsync({ courseId, isPublished: !course.isPublished });
      addAlert({
        type: 'success',
        message: !course.isPublished ? t('teacherCourses.coursePublished') : t('teacherCourses.courseUnpublished')
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
        message: isCompleted ? t('teacherCourses.courseMarkedCompleted') : t('teacherCourses.courseReopened')
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

  // Dispatchers
  const handleTogglePublish = isAdmin ? handleTogglePublishAdmin : handleTogglePublishTeacher;
  const isPublishing = isAdmin ? isPublishingAdmin : publishCourseTeacher.isPending;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 p-2 bg-[var(--color-surface-muted)] rounded-xl border border-[var(--color-border)] w-fit">
        
        {/* Publish/Unpublish */}
        <button
          onClick={handleTogglePublish}
          disabled={isPublishing}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${course.isPublished
            ? 'text-[var(--color-warning)] hover:bg-[var(--color-warning-light)]'
            : 'text-[var(--color-success)] hover:bg-[var(--color-success-light)]'
            }`}
        >
          {isPublishing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : course.isPublished ? (
            <><EyeOff className="w-4 h-4" /> {isAdmin ? t('admin.unpublish') : t('teacherCourses.unpublish')}</>
          ) : (
            <><Eye className="w-4 h-4" /> {isAdmin ? t('admin.publish') : t('teacherCourses.publish')}</>
          )}
        </button>

        {/* View Students */}
        {isEnrollmentManagementEnabled && (
          <Tooltip label={t('enrolledStudents.viewStudents')}>
            <button
              onClick={() => router.push(isAdmin ? ROUTES.admin.courseStudents(courseId) : ROUTES.teacher.courseStudents(courseId))}
              className="p-2 text-[var(--color-muted-foreground)] hover:bg-[var(--info-light)] hover:text-[var(--info)] rounded-lg transition-colors"
            >
              <Users className="w-5 h-5" />
            </button>
          </Tooltip>
        )}

        {/* Mark Completed (Teacher Only) */}
        {!isAdmin && isTeacher && (
          <Tooltip label={course.isCompleted ? t('teacherCourses.reopenCourse') : t('teacherCourses.markCompleted')}>
            <button
              onClick={() => course.isCompleted ? handleMarkCompleted(false) : setConfirmCompleteCourse(true)}
              disabled={markCourseCompleted.isPending}
              className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${course.isCompleted
                ? 'text-[var(--color-info)] bg-[var(--color-info-light)] hover:bg-[var(--color-info)]/20'
                : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-info-light)] hover:text-[var(--color-info)]'
                }`}
            >
              <Award className="w-5 h-5" />
            </button>
          </Tooltip>
        )}

        {/* Share Course */}
        {!isAdmin && <CourseShareButton course={course} />}

        {/* Delete Course */}
        <Tooltip label={isAdmin ? t('common.delete') : t('teacherCourses.deleteCourse')}>
          <button
            onClick={() => setConfirmDeleteCourse(true)}
            className="p-2 text-[var(--color-error)] hover:bg-[var(--color-error-light)] rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </Tooltip>
      </div>

      {/* Teacher Mark Complete Modal */}
      <LazyConfirmModal
        isOpen={confirmCompleteCourse}
        title={t('teacherCourses.completeConfirmTitle') || 'Mark Course as Completed?'}
        message={t('teacherCourses.completeConfirmMessage') || 'Students who have finished all lessons and quizzes will automatically receive a completion certificate. Continue?'}
        onConfirm={() => handleMarkCompleted(true)}
        onCancel={() => setConfirmCompleteCourse(false)}
        confirmText={t('teacherCourses.markCompleted')}
        type="info"
        isLoading={markCourseCompleted.isPending}
      />

      {/* Teacher Delete Modal */}
      {!isAdmin && (
        <LazyConfirmModal
          isOpen={confirmDeleteCourse}
          title={t('teacherCourses.deleteConfirmTitle') || 'Delete Course'}
          message={t('teacherCourses.deleteConfirmMessage') || 'Are you sure you want to delete this course? This action cannot be undone.'}
          onConfirm={handleDeleteTeacher}
          onCancel={() => setConfirmDeleteCourse(false)}
          confirmText={t('common.delete')}
          type="danger"
          isLoading={deleteCourseTeacher.isPending}
        />
      )}

      {/* Admin Delete Modal */}
      {isAdmin && confirmDeleteCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--card-solid)] border border-[var(--border)] rounded-2xl p-6 max-w-lg w-full shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-[var(--color-foreground)]">Delete Course</h3>
                <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                  Deleting course: <strong className="text-[var(--color-foreground)]">{course.title}</strong>
                </p>
              </div>
              <button
                onClick={() => {
                  setConfirmDeleteCourse(false);
                  setDeleteReason('');
                }}
                className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-[var(--error-light)] border-l-4 border-[var(--color-error)] p-3 rounded-r-lg">
              <p className="text-xs text-[var(--color-error)]">
                Warning: This action will permanently remove the course and its contents. An email notification will be sent to the instructor with your reason for deletion.
              </p>
            </div>

            <div>
              <label htmlFor="deleteReason" className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
                Reason for Deletion <span className="text-[var(--color-error)]">*</span>
              </label>
              <textarea
                id="deleteReason"
                rows={4}
                required
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Please state why this course is being deleted. This reason will be emailed directly to the instructor..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)] focus:ring-2 focus:ring-[var(--color-error)] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmDeleteCourse(false);
                  setDeleteReason('');
                }}
                disabled={isDeletingAdmin}
                className="px-4 py-2 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-muted-strong)] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAdmin}
                disabled={isDeletingAdmin || !deleteReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-error)] hover:opacity-90 rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeletingAdmin ? 'Deleting...' : 'Confirm & Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
