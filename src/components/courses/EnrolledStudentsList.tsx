'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Mail, Calendar, Trash2 } from 'lucide-react';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import Tooltip from '@/components/ui/Tooltip';
import { useAlert } from '@/components/ui/AlertContainer';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { PageWrapper, EmptyState } from '@/components/layout';
import { TeacherPageBanner } from '@/features/teacher/components/TeacherPageBanner';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDate } from '@/lib/dateUtils';
import { listCourseStudents, getCourseById, type CourseStudentRow } from '@/lib/api/courses';
import { dropEnrollment } from '@/lib/api/enrollments';
import { ApiClientError } from '@/lib/api/http';
import { useFeature } from '@/contexts/AppSettingsContext';

export default function EnrolledStudentsList({
  courseId,
  backHref,
}: {
  courseId: string;
  backHref: string;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const isEnabled = useFeature('enableEnrollmentManagement');
  const [students, setStudents] = useState<CourseStudentRow[]>([]);
  const [courseTitle, setCourseTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { addAlert } = useAlert();
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [studentsData, course] = await Promise.all([
        listCourseStudents(courseId),
        getCourseById(courseId),
      ]);
      setStudents(studentsData.students || []);
      setCourseTitle(course.title);
    } catch (err) {
      const text = err instanceof ApiClientError ? err.message : t('enrolledStudents.fetchError');
      addAlert({ type: 'error', message: text });
    } finally {
      setIsLoading(false);
    }
  }, [courseId, t, addAlert]);

  useEffect(() => {
    if (!isEnabled) {
      router.replace(backHref);
      return;
    }
    fetchData();
  }, [isEnabled, backHref, router, fetchData]);

  const handleRemove = async (enrollmentId: string) => {
    setIsRemoving(true);
    try {
      await dropEnrollment(enrollmentId);
      setStudents((prev) => prev.filter((s) => s.enrollmentId !== enrollmentId));
      addAlert({ type: 'success', message: t('enrolledStudents.removeSuccess') });
    } catch (err) {
      const text = err instanceof ApiClientError ? err.message : t('enrolledStudents.removeError');
      addAlert({ type: 'error', message: text });
    } finally {
      setIsRemoving(false);
      setRemoveId(null);
    }
  };

  if (!isEnabled || isLoading) return <PageSkeleton />;

  return (
    <PageWrapper>
      <TeacherPageBanner
        icon={Users}
        eyebrow={t('common.myCourses')}
        title={t('enrolledStudents.title')}
        description={courseTitle}
        backHref={backHref}
        backLabel={t('courses.backToCourses')}
        actions={
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]/80">
            <Users className="w-4 h-4 text-[var(--teacher-primary)] shrink-0" />
            <span className="text-sm font-extrabold tabular-nums text-[var(--color-foreground)]">
              {students.length}
            </span>
          </div>
        }
      />

      {students.length === 0 ? (
        <EmptyState icon={Users} title={t('enrolledStudents.empty')} />
      ) : (
        <>
          <div className="teacher-panel overflow-hidden hidden sm:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--border)]/80">
                <thead className="bg-[var(--surface-muted)]/80">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                      {t('enrolledStudents.student')}
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                      {t('enrolledStudents.progress')}
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                      {t('enrolledStudents.status')}
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                      {t('enrolledStudents.enrolledOn')}
                    </th>
                    <th className="px-5 py-3.5 text-right text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                      {t('admin.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]/70">
                  {students.map((row) => (
                    <tr key={row.enrollmentId} className="hover:bg-[var(--teacher-soft)]/25 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-semibold text-[var(--color-foreground)]">
                          {row.student?.name}
                        </p>
                        <p className="text-xs text-[var(--color-muted-foreground)] flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span>{row.student?.email}</span>
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="w-28 space-y-1">
                          <span className="text-xs font-bold tabular-nums text-[var(--teacher-primary)]">
                            {row.progress}%
                          </span>
                          <div className="w-full h-1.5 rounded-full bg-[var(--surface-muted-strong)] overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${row.progress}%`, background: 'var(--teacher-gradient)' }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          variant={row.status === 'completed' ? 'success' : row.status === 'dropped' ? 'error' : 'info'}
                          size="sm"
                        >
                          {row.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[var(--color-muted-foreground)]">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          <span>{formatDate(row.enrolledAt)}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Tooltip label={t('enrolledStudents.remove')}>
                          <Button
                            onClick={() => setRemoveId(row.enrollmentId)}
                            aria-label={t('enrolledStudents.remove')}
                            variant="danger"
                            className="min-h-[38px] min-w-[38px] p-0 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="sm:hidden flex flex-col gap-3">
            {students.map((row) => (
              <div key={row.enrollmentId} className="teacher-card p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[var(--color-foreground)] truncate">
                      {row.student?.name}
                    </p>
                    <p className="text-xs text-[var(--color-muted-foreground)] flex items-center gap-1 truncate mt-0.5">
                      <Mail className="w-3 h-3 shrink-0" />
                      <span className="truncate">{row.student?.email}</span>
                    </p>
                  </div>
                  <Badge
                    variant={row.status === 'completed' ? 'success' : row.status === 'dropped' ? 'error' : 'info'}
                    size="sm"
                  >
                    {row.status}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-[var(--color-muted-foreground)]">
                    <span className="font-semibold text-[var(--teacher-primary)] tabular-nums">
                      {t('enrolledStudents.progress')}: {row.progress}%
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(row.enrolledAt)}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[var(--surface-muted-strong)] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${row.progress}%`, background: 'var(--teacher-gradient)' }}
                    />
                  </div>
                </div>

                <Button
                  onClick={() => setRemoveId(row.enrollmentId)}
                  variant="danger"
                  fullWidth
                  className="min-h-[42px] rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{t('enrolledStudents.remove')}</span>
                </Button>
              </div>
            ))}
          </div>
        </>
      )}

      <ConfirmModal
        isOpen={!!removeId}
        title={t('enrolledStudents.removeConfirmTitle')}
        message={t('enrolledStudents.removeConfirmMessage')}
        onConfirm={() => removeId && handleRemove(removeId)}
        onCancel={() => setRemoveId(null)}
        confirmText={t('enrolledStudents.remove')}
        type="danger"
        isLoading={isRemoving}
      />
    </PageWrapper>
  );
}
