'use client';
import { ROUTES } from '@/constants/routes';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Users,
  GraduationCap,
  Edit,
} from 'lucide-react';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import { useSessionStore } from '@/store/useSessionStore';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDate } from '@/lib/dateUtils';
import type { Course } from '@/types';
import { listCoursesAdmin, patchCourse, deleteCourse } from '@/lib/api/courses';
import { ApiClientError } from '@/lib/api/http';
import DashboardListFilters, { FilterPanel } from '@/components/filters/DashboardListFilters';
import { buildPublishStatusOptions, type PublishStatusFilter } from '@/components/filters/publishStatusOptions';
import { isSuperAdmin } from '@/lib/roles';

export default function AdminCoursesPage() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const isSuperAdminUser = isSuperAdmin(session?.user?.role);
  const { theme } = useRoleTheme();
  const { t } = useTranslation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<PublishStatusFilter>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const clearFilters = () => {
    setSearchQuery('');
    setFilter('all');
  };

  const fetchCourses = useCallback(async () => {
    try {
      const data = await listCoursesAdmin();
      setCourses((data.courses || []) as Course[]);
    } catch (err) {
      const text =
        err instanceof ApiClientError ? err.message : t('admin.failedFetchCourses');
      setMessage({ type: 'error', text });
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push(ROUTES.login);
      return;
    }

    if (status === 'authenticated') {
      // Role-based redirect handled in /dashboard/page.tsx
      fetchCourses();
    }
  }, [status, session, router, fetchCourses]);

  const handleTogglePublish = async (courseId: string, currentStatus: boolean) => {
    try {
      await patchCourse(courseId, { isPublished: !currentStatus });
      setMessage({ type: 'success', text: t('admin.courseUpdated') });
      fetchCourses();
    } catch (err) {
      const text =
        err instanceof ApiClientError ? err.message : t('admin.failedUpdateCourse');
      setMessage({ type: 'error', text });
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm(t('admin.deleteCourseConfirm'))) return;

    try {
      await deleteCourse(courseId);
      setMessage({ type: 'success', text: t('admin.courseDeleted') });
      setDeleteId(null);
      fetchCourses();
    } catch (err) {
      const text =
        err instanceof ApiClientError ? err.message : t('admin.failedDeleteCourse');
      setMessage({ type: 'error', text });
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' ||
                         (filter === 'published' && course.isPublished) ||
                         (filter === 'draft' && !course.isPublished);
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-3 bg-[var(--info-light)] rounded-xl">
          <BookOpen className="w-6 h-6 text-[var(--info)]" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)]">{t('admin.allCourses')}</h1>
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] mt-1">{t('admin.manageCoursesDesc')}</p>
        </div>
      </motion.div>

      {/* Alert */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert
            type={message.type}
            message={message.text}
            onClose={() => setMessage(null)}
          />
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <FilterPanel>
          <DashboardListFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClear={clearFilters}
            searchPlaceholder={t('admin.searchCourses')}
            segmentedFilter={{
              value: filter,
              onChange: (id) => setFilter(id as PublishStatusFilter),
              neutralValue: 'all',
              options: buildPublishStatusOptions({
                all: t('admin.allCourses'),
                published: t('common.published'),
                draft: t('common.draft'),
              }),
            }}
          />
        </FilterPanel>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <div className="bg-[var(--card-solid)] rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-[var(--info)]">{courses.length}</p>
          <p className="text-sm text-[var(--color-muted-foreground)]">{t('admin.totalCourses')}</p>
        </div>
        <div className="bg-[var(--card-solid)] rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-[var(--success)]">{courses.filter(c => c.isPublished).length}</p>
          <p className="text-sm text-[var(--color-muted-foreground)]">{t('common.published')}</p>
        </div>
        <div className="bg-[var(--card-solid)] rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-[var(--warning)]">{courses.filter(c => !c.isPublished).length}</p>
          <p className="text-sm text-[var(--color-muted-foreground)]">{t('common.draft')}</p>
        </div>
      </motion.div>

      {/* Courses Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredCourses.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-[var(--card-solid)] rounded-2xl shadow-sm">
            <BookOpen className="w-16 h-16 text-[var(--color-muted-foreground)] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">{t('admin.noCoursesFound')}</h3>
            <p className="text-[var(--color-muted-foreground)]">{t('admin.adjustSearch')}</p>
          </div>
        ) : (
          filteredCourses.map((course, index) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-[var(--card-solid)] rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group flex flex-col h-full"
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex-grow flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-accent)] text-white">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={course.isPublished ? 'primary' : 'default'} size="sm">
                        {course.isPublished ? t('common.published') : t('common.draft')}
                      </Badge>
                      {isSuperAdminUser && (
                        <Badge variant={course.isPrivate ? 'warning' : 'info'} size="sm">
                          {course.isPrivate ? t('courses.privateCourse') : t('courses.publicCourse')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-2 line-clamp-2 min-h-[3.5rem]">
                    {course.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[var(--color-muted-foreground)] text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                    {course.description || t('courses.noDescription')}
                  </p>

                  {/* Meta */}
                  <div className="space-y-2 mb-4 mt-auto">
                    <div className="flex items-center text-sm text-[var(--color-muted-foreground)]">
                      <Users className="w-4 h-4 mr-2" />
                      {course.instructor?.name || t('admin.unknownInstructor')}
                    </div>
                    <div className="flex items-center text-sm text-[var(--color-muted-foreground)]">
                      <Users className="w-4 h-4 mr-2" />
                      {t('admin.studentsEnrolled', { count: course.enrolledCount || 0 })}
                    </div>
                    <div className="flex items-center text-sm text-[var(--color-muted-foreground)]">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(course.createdAt)}
                    </div>
                    <div className="flex items-center text-sm text-[var(--color-muted-foreground)]">
                      <span className="mr-2">{t('admin.languageLabel')}:</span>
                      <span className="font-medium">{course.locale === 'hi' ? t('common.hindi') : t('common.english')}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-[var(--border)] mt-auto">
                  {isSuperAdminUser && (
                    <button
                      onClick={() => router.push(ROUTES.teacher.courseEdit(course._id))}
                      className="flex-1 flex items-center justify-center min-h-[44px] sm:min-h-0 px-3 py-2 bg-[var(--info-light)] text-[var(--info)] rounded-lg hover:bg-[var(--info-light)]/80 transition-colors text-sm font-medium"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      {t('common.edit')}
                    </button>
                  )}
                  <button
                    onClick={() => handleTogglePublish(course._id, course.isPublished)}
                    className="flex-1 flex items-center justify-center min-h-[44px] sm:min-h-0 px-3 py-2 bg-[var(--color-surface-muted)] text-[var(--color-foreground)] rounded-lg hover:bg-[var(--color-surface-muted)]/80 transition-colors text-sm"
                  >
                    {course.isPublished ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-1" />
                        {t('admin.unpublish')}
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-1" />
                        {t('admin.publish')}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setDeleteId(course._id)}
                    className="px-3 py-2 min-h-[44px] sm:min-h-0 bg-[var(--error-light)] text-[var(--error)] rounded-lg hover:bg-[var(--error-light)]/80 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Delete Confirmation */}
              {deleteId === course._id && (
                <div className="px-6 pb-6">
                  <div className="bg-[var(--error-light)] border border-[var(--error)] rounded-xl p-4">
                    <p className="text-sm text-[var(--error)] mb-3">
                      {t('admin.deleteCourseConfirm')}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(course._id)}
                        className={`flex-1 min-h-[44px] sm:min-h-0 px-3 py-2 bg-gradient-to-r ${theme.gradient} text-white rounded-lg hover:opacity-90 transition-colors text-sm`}
                      >
                        {t('common.delete')}
                      </button>
                      <button
                        onClick={() => setDeleteId(null)}
                        className="flex-1 min-h-[44px] sm:min-h-0 px-3 py-2 bg-[var(--card-solid)] text-[var(--error)] border border-[var(--error)] rounded-lg hover:bg-[var(--error-light)] transition-colors text-sm"
                      >
                        {t('common.cancel')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}
