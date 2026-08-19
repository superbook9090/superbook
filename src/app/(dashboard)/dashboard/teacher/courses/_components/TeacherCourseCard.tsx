'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { BookOpen, Users, Edit, Award, Sparkles, UserCheck } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import CourseShareButton from '@/components/courses/CourseShareButton';
import Button from '@/components/ui/Button';
import type { Course } from '@/lib/react-query/hooks';

interface TeacherCourseCardProps {
  course: Course;
}

export default function TeacherCourseCard({ course }: TeacherCourseCardProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const isPrivate = (course as { isPrivate?: boolean }).isPrivate;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="group bg-[var(--card-solid)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)] hover:border-[var(--teacher-primary)]/40 transition-all duration-300 overflow-hidden flex flex-col h-full"
    >
      {/* Thumbnail Area */}
      <div className="relative h-40 sm:h-44 w-full bg-[var(--color-surface-muted)] overflow-hidden">
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
          <div className="w-full h-full bg-gradient-to-br from-[var(--teacher-soft)] via-[var(--teacher-border)] to-[var(--color-surface-muted)] flex flex-col items-center justify-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--teacher-primary)]/10 text-[var(--teacher-primary)] flex items-center justify-center mb-1">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-[var(--color-muted-foreground)]">
              {course.category || 'Course'}
            </span>
          </div>
        )}

        {/* Badges on Top */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              course.isPublished
                ? 'bg-[var(--color-success)] text-white shadow-sm'
                : 'bg-black/60 text-white backdrop-blur-md'
            }`}
          >
            {course.isPublished ? t('teacherCourses.published') : t('teacherCourses.draft')}
          </span>

          {course.isCompleted && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--color-info)] text-white shadow-sm">
              <Award className="w-3 h-3" />
              {t('teacherCourses.completed')}
            </span>
          )}

          {isPrivate && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--color-warning)] text-white shadow-sm">
              {t('courses.privateCourse')}
            </span>
          )}
        </div>

        {/* Price Tag */}
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[var(--teacher-primary)] text-white shadow-md">
            {course.price > 0 ? `₹${course.price}` : t('teacherCourses.free')}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          {course.category && (
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--teacher-primary)] mb-1.5">
              <Sparkles className="w-3 h-3" />
              <span>{course.category}</span>
            </div>
          )}

          {/* Title */}
          <h3 className="text-base font-bold text-[var(--color-foreground)] mb-1.5 line-clamp-1 group-hover:text-[var(--teacher-primary)] transition-colors">
            {course.title}
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] mb-4 line-clamp-2 leading-relaxed">
            {course.description || t('teacherCourses.noDescription')}
          </p>
        </div>

        {/* Metrics & Actions */}
        <div className="space-y-3 pt-3 border-t border-[var(--border)]">
          <div className="flex items-center justify-between text-xs font-medium text-[var(--color-muted-foreground)]">
            <Link
              href={ROUTES.teacher.courseStudents(course._id)}
              className="flex items-center gap-1.5 hover:text-[var(--teacher-primary)] font-semibold transition-colors"
            >
              <Users className="w-4 h-4 text-[var(--teacher-primary)]" />
              <span>{course.enrolledCount || 0} {t('teacherCourses.studentsEnrolled')}</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => router.push(ROUTES.teacher.courseEdit(course._id))}
              variant="primary"
              className="flex-1 min-h-[40px] text-xs sm:text-sm"
            >
              <Edit className="w-3.5 h-3.5 mr-1.5" />
              <span>{t('teacherCourses.edit')}</span>
            </Button>

            <Link
              href={ROUTES.teacher.courseStudents(course._id)}
              className="p-2.5 min-h-[40px] min-w-[40px] rounded-xl border border-[var(--border)] bg-[var(--color-surface-muted)] text-[var(--color-foreground)] hover:bg-[var(--teacher-soft)] hover:text-[var(--teacher-primary)] hover:border-[var(--teacher-border)] flex items-center justify-center transition-colors"
              title={t('teacherCourses.viewStudents')}
            >
              <UserCheck className="w-4 h-4" />
            </Link>

            <CourseShareButton course={course} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
