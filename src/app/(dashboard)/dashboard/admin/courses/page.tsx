'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Search,
  Filter,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Users,
  GraduationCap,
} from 'lucide-react';
import { Skeleton, CardSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import { useSessionStore } from '@/store/useSessionStore';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDate } from '@/lib/dateUtils';

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  language: string;
  instructor: { _id: string; name: string; email: string };
  enrolledStudents: string[];
  isPublished: boolean;
  createdAt: string;
  thumbnail?: string;
}

export default function AdminCoursesPage() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const { theme } = useRoleTheme();
  const { t } = useTranslation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Debounced search handler
  const debouncedSearchHandler = useCallback(
    ((value: string) => {
      const timer = setTimeout(() => setSearchTerm(value), 300);
      return () => clearTimeout(timer);
    }),
    []
  );

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      // Role-based redirect handled in /dashboard/page.tsx
      fetchCourses();
    }
  }, [status, session, router]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setCourses(data.courses || []);
    } catch {
      setMessage({ type: 'error', text: t('admin.failedFetchCourses') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePublish = async (courseId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !currentStatus }),
      });

      if (!response.ok) throw new Error('Failed to update course');
      setMessage({ type: 'success', text: t('admin.courseUpdated') });
      fetchCourses();
    } catch {
      setMessage({ type: 'error', text: t('admin.failedUpdateCourse') });
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm(t('admin.deleteCourseConfirm'))) return;

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete course');
      setMessage({ type: 'success', text: t('admin.courseDeleted') });
      setDeleteId(null);
      fetchCourses();
    } catch {
      setMessage({ type: 'error', text: t('admin.failedDeleteCourse') });
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' ||
                         (filter === 'published' && course.isPublished) ||
                         (filter === 'draft' && !course.isPublished);
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Filters skeleton */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Course cards skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-6 overflow-x-hidden">
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
        className="bg-[var(--card-solid)] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted-foreground)]" />
          <input
            type="text"
            placeholder={t('admin.searchCourses')}
            defaultValue={searchTerm}
            onChange={(e) => debouncedSearchHandler(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 min-h-[44px] bg-[var(--color-muted)] text-[var(--color-foreground)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
          />
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-[var(--color-muted-foreground)]" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'published' | 'draft')}
            className="px-4 py-2.5 min-h-[44px] bg-[var(--color-muted)] text-[var(--color-foreground)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
          >
            <option value="all">{t('admin.allCourses')}</option>
            <option value="published">{t('common.published')}</option>
            <option value="draft">{t('common.draft')}</option>
          </select>
        </div>
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
              className="bg-[var(--card-solid)] rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-accent)] text-white">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={course.isPublished ? 'primary' : 'default'} size="sm">
                      {course.isPublished ? t('common.published') : t('common.draft')}
                    </Badge>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-2 line-clamp-2">
                  {course.title}
                </h3>

                {/* Description */}
                <p className="text-[var(--color-muted-foreground)] text-sm mb-4 line-clamp-2">
                  {course.description || t('courses.noDescription')}
                </p>

                {/* Meta */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-[var(--color-muted-foreground)]">
                    <Users className="w-4 h-4 mr-2" />
                    {course.instructor.name}
                  </div>
                  <div className="flex items-center text-sm text-[var(--color-muted-foreground)]">
                    <Users className="w-4 h-4 mr-2" />
                    {t('admin.studentsEnrolled', { count: course.enrolledStudents?.length || 0 })}
                  </div>
                  <div className="flex items-center text-sm text-[var(--color-muted-foreground)]">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(course.createdAt)}
                  </div>
                  <div className="flex items-center text-sm text-[var(--color-muted-foreground)]">
                    <span className="mr-2">{t('admin.languageLabel')}:</span>
                    <span className="font-medium">{course.language === 'hi' ? t('common.hindi') : t('common.english')}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-[var(--border)]">
                  <button
                    onClick={() => handleTogglePublish(course._id, course.isPublished)}
                    className="flex-1 flex items-center justify-center min-h-[44px] sm:min-h-0 px-3 py-2 bg-[var(--color-muted)] text-[var(--color-foreground)] rounded-lg hover:bg-[var(--color-muted)]/80 transition-colors text-sm"
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
