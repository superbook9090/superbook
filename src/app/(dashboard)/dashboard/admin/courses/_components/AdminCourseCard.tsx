'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import {
  BookOpen,
  Calendar,
  Users,
  Edit,
  ExternalLink,
  UserCheck,
  Building2,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDate } from '@/lib/dateUtils';
import type { Course } from '@/types';

interface AdminCourseCardProps {
  course: Course;
  isSuperAdmin: boolean;
}

export default function AdminCourseCard({ course, isSuperAdmin }: AdminCourseCardProps) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="teacher-card overflow-hidden flex flex-col h-full group">
      {/* Thumbnail */}
      <div className="relative h-44 w-full bg-[var(--surface-muted)] overflow-hidden shrink-0">
        {course.thumbnail ? (
          <>
            <Image
              src={course.thumbnail}
              alt=""
              fill
              aria-hidden
              className="object-cover blur-md opacity-25 scale-110"
            />
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              className="object-contain p-1 group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--teacher-soft)] via-[var(--surface-muted)] to-[var(--surface-muted)] flex flex-col items-center justify-center p-4">
            <div className="w-10 h-10 rounded-[10px] bg-[var(--card-solid)] text-[var(--teacher-primary)] border border-[var(--teacher-border)] flex items-center justify-center mb-1.5">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-[var(--color-muted-foreground)]">
              {course.category || 'Course'}
            </span>
          </div>
        )}

        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
          <Badge variant={course.isPublished ? 'default' : 'secondary'}>
            {course.isPublished ? t('common.published') : t('common.draft')}
          </Badge>
          {isSuperAdmin && (
            <Badge variant={course.isPrivate ? 'secondary' : 'outline'}>
              {course.isPrivate ? t('courses.privateCourse') : t('courses.publicCourse')}
            </Badge>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-2">
          {course.organizationId && isSuperAdmin && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--surface-muted)] border border-[var(--border)] text-[10px] font-bold text-[var(--color-muted-foreground)]">
              <Building2 className="w-3 h-3" />
              <span className="truncate max-w-[160px]">Org: {course.organizationId}</span>
            </div>
          )}

          <h3 className="text-base font-bold text-[var(--color-foreground)] line-clamp-2 min-h-[2.75rem] leading-snug group-hover:text-[var(--teacher-primary)] transition-colors">
            {course.title}
          </h3>

          <p className="text-xs text-[var(--color-muted-foreground)] line-clamp-2 min-h-[2.25rem] leading-relaxed">
            {course.description || t('courses.noDescription')}
          </p>

          <div className="space-y-1.5 pt-2 text-xs text-[var(--color-muted-foreground)]">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 min-w-0">
                <Users className="w-3.5 h-3.5 text-[var(--teacher-primary)] shrink-0" />
                <span className="truncate">
                  {course.instructor?.name || t('admin.unknownInstructor')}
                </span>
              </span>
              <span className="font-semibold text-[var(--color-foreground)] tabular-nums shrink-0">
                {course.enrolledCount || 0} {t('admin.enrollments')}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[var(--border)]/70">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {course.createdAt ? formatDate(course.createdAt) : '—'}
              </span>
              <span className="uppercase font-bold">
                {course.locale === 'hi' ? t('common.hindi') : t('common.english')}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pt-3 border-t border-[var(--border)]/70">
          <button
            type="button"
            onClick={() => router.push(ROUTES.teacher.courseEdit(course._id))}
            className="teacher-pill-btn flex-1 min-h-[40px] px-3 text-xs font-semibold cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>{t('common.edit')}</span>
          </button>

          <Link
            href={ROUTES.admin.courseStudents(course._id)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--color-foreground)] hover:bg-[var(--teacher-soft)] hover:text-[var(--teacher-primary)] transition-colors"
            title="Enrolled Students"
          >
            <UserCheck className="w-4 h-4" />
          </Link>

          {course.slug && (
            <Link
              href={`/courses/${course.slug}`}
              target="_blank"
              className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--color-foreground)] hover:bg-[var(--teacher-soft)] hover:text-[var(--teacher-primary)] transition-colors"
              title={t('admin.preview')}
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
