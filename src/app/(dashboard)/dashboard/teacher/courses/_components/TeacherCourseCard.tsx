'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { BookOpen, Users, Edit, Award, Sparkles, UserCheck } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import CourseShareButton from '@/components/courses/CourseShareButton';
import Tooltip from '@/components/ui/Tooltip';
import type { Course } from '@/lib/react-query/hooks';

interface TeacherCourseCardProps {
  course: Course;
}

export default function TeacherCourseCard({ course }: TeacherCourseCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const isPrivate = (course as { isPrivate?: boolean }).isPrivate;

  return (
    <article className="group h-full flex flex-col overflow-hidden teacher-card">
      {/* Thumbnail Area */}
      <div className="relative h-44 w-full bg-[var(--color-surface-muted)] overflow-hidden shrink-0">
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--teacher-soft)] via-[var(--teacher-border)] to-[var(--color-surface-muted)] flex flex-col items-center justify-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--teacher-primary)]/12 text-[var(--teacher-primary)] flex items-center justify-center mb-1">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-[var(--color-muted-foreground)]">
              {course.category || t('common.course')}
            </span>
          </div>
        )}

        {/* Top Left Status Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
              course.isPublished
                ? 'bg-[var(--success)] text-white shadow-sm'
                : 'bg-black/65 text-white backdrop-blur-md'
            }`}
          >
            {course.isPublished ? t('teacherCourses.published') : t('teacherCourses.draft')}
          </span>

          {course.isCompleted && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[var(--info)] text-white shadow-sm">
              <Award className="w-3 h-3" />
              {t('teacherCourses.completed')}
            </span>
          )}

          {isPrivate && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[var(--warning)] text-white shadow-sm">
              {t('courses.privateCourse')}
            </span>
          )}
        </div>

        {/* Price Pill */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[var(--teacher-primary)] text-white shadow-md">
            {course.price > 0 ? `₹${course.price}` : t('teacherCourses.free')}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {course.category && (
            <div className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[var(--teacher-primary)] mb-1.5">
              <Sparkles className="w-3 h-3 shrink-0" />
              <span className="truncate">{course.category}</span>
            </div>
          )}

          <h3 className="text-base font-bold text-[var(--color-foreground)] mb-1.5 line-clamp-1 group-hover:text-[var(--teacher-primary)] transition-colors">
            {course.title}
          </h3>

          <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] mb-4 line-clamp-2 min-h-[2.5rem] leading-relaxed">
            {course.description || t('teacherCourses.noDescription')}
          </p>
        </div>

        {/* Metrics & Actions */}
        <div className="space-y-3 pt-3 border-t border-[var(--border)]/70">
          <Link
            href={ROUTES.teacher.courseStudents(course._id)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-muted-foreground)] hover:text-[var(--teacher-primary)] transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-[var(--teacher-primary)]" />
            <span>
              {course.enrolledCount || 0} {t('teacherCourses.studentsEnrolled')}
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push(ROUTES.teacher.courseEdit(course._id))}
              className="teacher-cta-btn flex-1 text-xs sm:text-sm"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>{t('teacherCourses.edit')}</span>
            </button>

            <Tooltip label={t('teacherCourses.viewStudents')}>
              <Link
                href={ROUTES.teacher.courseStudents(course._id)}
                aria-label={t('teacherCourses.viewStudents')}
                className="min-h-[44px] min-w-[44px] rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--color-foreground)] hover:bg-[var(--teacher-soft)] hover:text-[var(--teacher-primary)] hover:border-[var(--teacher-border)] flex items-center justify-center transition-colors focus-ring"
              >
                <UserCheck className="w-4 h-4" />
              </Link>
            </Tooltip>

            <CourseShareButton course={course} />
          </div>
        </div>
      </div>
    </article>
  );
}
