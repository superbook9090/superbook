'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { BookOpen, Edit, ExternalLink, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDate } from '@/lib/dateUtils';
import type { Course } from '@/types';

interface AdminCoursesTableProps {
  courses: Course[];
  isSuperAdmin: boolean;
}

export default function AdminCoursesTable({ courses, isSuperAdmin }: AdminCoursesTableProps) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="bg-[var(--card-solid)] border border-[var(--border)] rounded-2xl shadow-[var(--shadow-sm)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)] font-bold uppercase text-[11px] tracking-wider">
              <th className="py-3.5 px-4">{t('admin.courseTitle')}</th>
              <th className="py-3.5 px-4">{t('admin.instructor')}</th>
              <th className="py-3.5 px-4">{t('admin.status')}</th>
              {isSuperAdmin && <th className="py-3.5 px-4">{t('admin.organization')}</th>}
              <th className="py-3.5 px-4 text-center">{t('admin.enrollments')}</th>
              <th className="py-3.5 px-4">{t('admin.created')}</th>
              <th className="py-3.5 px-4 text-right">{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {courses.map((course) => (
              <tr
                key={course._id}
                className="hover:bg-[var(--color-surface-muted)]/50 transition-colors"
              >
                {/* Course Title + Thumbnail */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[var(--color-surface-muted)] shrink-0 border border-[var(--border)]">
                      {course.thumbnail ? (
                        <Image
                          src={course.thumbnail}
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[var(--info)]/10 text-[var(--info)]">
                          <BookOpen className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-[var(--color-foreground)] line-clamp-1 max-w-xs">
                        {course.title}
                      </p>
                      {course.category && (
                        <span className="text-[11px] text-[var(--color-muted-foreground)] font-medium">
                          {course.category}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Instructor */}
                <td className="py-3 px-4 text-[var(--color-foreground)] font-medium">
                  {course.instructor?.name || t('admin.unknownInstructor')}
                </td>

                {/* Status */}
                <td className="py-3 px-4">
                  <Badge variant={course.isPublished ? 'primary' : 'default'} size="sm">
                    {course.isPublished ? t('common.published') : t('common.draft')}
                  </Badge>
                </td>

                {/* Organization / Visibility */}
                {isSuperAdmin && (
                  <td className="py-3 px-4">
                    <span className="text-xs font-semibold text-[var(--color-muted-foreground)]">
                      {course.isPrivate
                        ? t('courses.privateCourse')
                        : course.organizationId
                        ? course.organizationId
                        : t('courses.publicCourse')}
                    </span>
                  </td>
                )}

                {/* Enrollments */}
                <td className="py-3 px-4 text-center font-bold tabular-nums text-[var(--color-foreground)]">
                  {course.enrolledCount || 0}
                </td>

                {/* Created */}
                <td className="py-3 px-4 text-[var(--color-muted-foreground)] text-xs">
                  {course.createdAt ? formatDate(course.createdAt) : '—'}
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      onClick={() => router.push(ROUTES.teacher.courseEdit(course._id))}
                      className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--card-solid)] text-[var(--color-foreground)] hover:bg-[var(--student-soft)] hover:text-[var(--student-primary)] transition-colors"
                      title={t('common.edit')}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <Link
                      href={ROUTES.admin.courseStudents(course._id)}
                      className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--card-solid)] text-[var(--color-foreground)] hover:bg-[var(--student-soft)] hover:text-[var(--student-primary)] transition-colors"
                      title="Enrolled Students"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                    </Link>

                    {course.slug && (
                      <Link
                        href={`/courses/${course.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--card-solid)] text-[var(--color-foreground)] hover:bg-[var(--student-soft)] hover:text-[var(--student-primary)] transition-colors"
                        title={t('admin.preview')}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
