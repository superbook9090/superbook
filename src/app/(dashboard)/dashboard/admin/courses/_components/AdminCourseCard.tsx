'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
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
import Button from '@/components/ui/Button';
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
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="bg-[var(--card-solid)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)] transition-all duration-300 overflow-hidden flex flex-col h-full"
    >
      {/* Thumbnail */}
      <div className="relative h-36 sm:h-40 w-full bg-[var(--color-surface-muted)] overflow-hidden">
        {course.thumbnail ? (
          <>
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-[var(--color-surface-muted)] flex flex-col items-center justify-center p-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--info)]/10 text-[var(--info)] flex items-center justify-center mb-1">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-[var(--color-muted-foreground)]">
              {course.category || 'Course'}
            </span>
          </div>
        )}

        {/* Status badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
          <Badge variant={course.isPublished ? 'primary' : 'default'} size="sm">
            {course.isPublished ? t('common.published') : t('common.draft')}
          </Badge>
          {isSuperAdmin && (
            <Badge variant={course.isPrivate ? 'warning' : 'info'} size="sm">
              {course.isPrivate ? t('courses.privateCourse') : t('courses.publicCourse')}
            </Badge>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Organization badge if present */}
          {course.organizationId && isSuperAdmin && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--color-surface-muted)] border border-[var(--border)] text-[10px] font-bold text-[var(--color-muted-foreground)] mb-2">
              <Building2 className="w-3 h-3" />
              <span>Org: {course.organizationId}</span>
            </div>
          )}

          {/* Title */}
          <h3 className="text-base font-bold text-[var(--color-foreground)] mb-1.5 line-clamp-2 min-h-[3rem]">
            {course.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-[var(--color-muted-foreground)] mb-4 line-clamp-2 leading-relaxed">
            {course.description || t('courses.noDescription')}
          </p>

          {/* Metadata list */}
          <div className="space-y-1.5 text-xs text-[var(--color-muted-foreground)] mb-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[var(--student-primary)]" />
                <span className="truncate max-w-[120px]">
                  {course.instructor?.name || t('admin.unknownInstructor')}
                </span>
              </span>
              <span className="font-semibold text-[var(--color-foreground)]">
                {course.enrolledCount || 0} {t('admin.enrollments')}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[var(--border)]">
              <span className="flex items-center gap-1">
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
        <div className="flex items-center gap-2 pt-3 border-t border-[var(--border)]">
          <Button
            onClick={() => router.push(ROUTES.teacher.courseEdit(course._id))}
            variant="secondary"
            className="flex-1 min-h-[38px] text-xs sm:text-sm"
          >
            <Edit className="w-3.5 h-3.5 mr-1.5" />
            <span>{t('common.edit')}</span>
          </Button>

          <Link
            href={ROUTES.admin.courseStudents(course._id)}
            className="p-2 min-h-[38px] min-w-[38px] rounded-xl border border-[var(--border)] bg-[var(--color-surface-muted)] text-[var(--color-foreground)] hover:bg-[var(--student-soft)] hover:text-[var(--student-primary)] flex items-center justify-center transition-colors"
            title="Enrolled Students"
          >
            <UserCheck className="w-4 h-4" />
          </Link>

          {course.slug && (
            <Link
              href={`/courses/${course.slug}`}
              target="_blank"
              className="p-2 min-h-[38px] min-w-[38px] rounded-xl border border-[var(--border)] bg-[var(--color-surface-muted)] text-[var(--color-foreground)] hover:bg-[var(--student-soft)] hover:text-[var(--student-primary)] flex items-center justify-center transition-colors"
              title={t('admin.preview')}
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
