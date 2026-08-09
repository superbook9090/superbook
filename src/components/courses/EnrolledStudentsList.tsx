'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Mail, Calendar, Trash2 } from 'lucide-react';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import Tooltip from '@/components/ui/Tooltip';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
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
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
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
      setMessage({ type: 'error', text });
    } finally {
      setIsLoading(false);
    }
  }, [courseId, t]);

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
      setMessage({ type: 'success', text: t('enrolledStudents.removeSuccess') });
    } catch (err) {
      const text = err instanceof ApiClientError ? err.message : t('enrolledStudents.removeError');
      setMessage({ type: 'error', text });
    } finally {
      setIsRemoving(false);
      setRemoveId(null);
    }
  };

  if (!isEnabled || isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Button
          onClick={() => router.push(backHref)}
          aria-label={t('common.back')}
          variant="secondary"
          className="p-2 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="p-3 bg-[var(--info-light)] rounded-xl">
          <Users className="w-6 h-6 text-[var(--info)]" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)]">
            {t('enrolledStudents.title')}
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] mt-1">
            {courseTitle}
          </p>
        </div>
      </motion.div>

      {message && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
        </motion.div>
      )}

      {students.length === 0 ? (
        <div className="text-center py-16 bg-[var(--card-solid)] rounded-2xl shadow-sm">
          <Users className="w-16 h-16 text-[var(--color-muted-foreground)] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">
            {t('enrolledStudents.empty')}
          </h3>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--card-solid)] rounded-2xl shadow-sm overflow-hidden hidden sm:block"
          >
            <table className="min-w-full divide-y divide-[var(--border)]">
              <thead className="bg-[var(--color-surface-muted)]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                    {t('enrolledStudents.student')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                    {t('enrolledStudents.progress')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                    {t('enrolledStudents.status')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                    {t('enrolledStudents.enrolledOn')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                    {t('admin.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--card-solid)] divide-y divide-[var(--border)]">
                {students.map((row, index) => (
                  <motion.tr
                    key={row.enrollmentId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.05 * index }}
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-[var(--color-foreground)]">{row.student?.name}</p>
                      <p className="text-sm text-[var(--color-muted-foreground)] flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {row.student?.email}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-foreground)]">{row.progress}%</td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={row.status === 'completed' ? 'success' : row.status === 'dropped' ? 'error' : 'info'}
                        size="sm"
                      >
                        {row.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-muted-foreground)] flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(row.enrolledAt)}
                    </td>
                    <td className="px-6 py-4">
                      <Tooltip label={t('enrolledStudents.remove')}>
                        <Button
                          onClick={() => setRemoveId(row.enrollmentId)}
                          aria-label={t('enrolledStudents.remove')}
                          variant="danger"
                          className="p-2 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* Mobile cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sm:hidden flex flex-col gap-4"
          >
            {students.map((row, index) => (
              <motion.div
                key={row.enrollmentId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="bg-[var(--card-solid)] rounded-2xl p-4 border border-[var(--border)]"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-foreground)]">{row.student?.name}</p>
                    <p className="text-xs text-[var(--color-muted-foreground)] flex items-center">
                      <Mail className="w-3 h-3 mr-1" />
                      {row.student?.email}
                    </p>
                  </div>
                  <Badge
                    variant={row.status === 'completed' ? 'success' : row.status === 'dropped' ? 'error' : 'info'}
                    size="sm"
                  >
                    {row.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-[var(--color-muted-foreground)] mb-3">
                  <span>{t('enrolledStudents.progress')}: {row.progress}%</span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(row.enrolledAt)}
                  </span>
                </div>
                <Button
                  onClick={() => setRemoveId(row.enrollmentId)}
                  variant="danger"
                  fullWidth
                  className="flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('enrolledStudents.remove')}
                </Button>
              </motion.div>
            ))}
          </motion.div>
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
    </div>
  );
}
