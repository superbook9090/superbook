'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BookOpen, Layers, Users, ArrowRight, Sparkles } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import type { PublicCourseSummary } from './types';
import { useTranslation } from '@/hooks/useTranslation';

interface PublicCourseCardProps {
  course: PublicCourseSummary;
}

export default function PublicCourseCard({ course }: PublicCourseCardProps) {
  const { t } = useTranslation();
  const coursePath = ROUTES.course(course.slug);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="group relative flex flex-col h-full rounded-2xl border border-[var(--border)] bg-[var(--card-solid)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)] hover:border-[var(--student-primary)]/40 transition-all duration-300 overflow-hidden"
    >
      {/* Thumbnail area */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-[var(--color-surface-muted)]">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--student-soft)] via-[var(--teacher-soft)] to-[var(--color-surface-muted)] flex flex-col items-center justify-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--student-primary)]/10 text-[var(--student-primary)] flex items-center justify-center mb-2 shadow-sm">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-[var(--color-muted-foreground)] tracking-wide">
              {course.category}
            </span>
          </div>
        )}

        {/* Floating Category Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md shadow-sm">
          <Sparkles className="w-3 h-3 text-[var(--color-warning)]" />
          <span>{course.category}</span>
        </div>

        {/* Price Tag */}
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[var(--student-primary)] text-white shadow-md">
            {course.price === 0 ? t('courses.free') : `₹${course.price}`}
          </span>
        </div>

        {/* Overlay gradient for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Instructor & Locale info */}
          <div className="flex items-center justify-between text-xs text-[var(--color-muted-foreground)] mb-2.5">
            <span className="font-medium truncate max-w-[65%]">
              {course.instructor?.name ? `By ${course.instructor.name}` : 'Quiz-Do Faculty'}
            </span>
            <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--color-surface-muted)] border border-[var(--border)]">
              {course.locale === 'hi' ? t('common.hindi') : t('common.english')}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-bold text-[var(--color-foreground)] mb-2 line-clamp-2 group-hover:text-[var(--student-primary)] transition-colors">
            <Link href={coursePath} className="focus:outline-none">
              {course.title}
            </Link>
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] line-clamp-2 mb-4 leading-relaxed">
            {course.description || t('courses.noDescription')}
          </p>
        </div>

        {/* Metrics & Action */}
        <div className="pt-3 border-t border-[var(--border)]">
          <div className="flex items-center justify-between text-xs font-medium text-[var(--color-muted-foreground)] mb-3.5">
            <div className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[var(--student-primary)]" />
              <span>{t('courses.chaptersCount', { count: course.chapterCount })}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-[var(--student-primary)]" />
              <span>{t('courses.lessonsCount', { count: course.lessonCount })}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[var(--student-primary)]" />
              <span>{t('courses.studentsCount', { count: course.enrolledCount })}</span>
            </div>
          </div>

          <Link
            href={coursePath}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[var(--student-primary)] text-white hover:bg-[var(--student-hover)] shadow-sm hover:shadow-md transition-all duration-200 group/btn"
          >
            <span>{t('courses.viewCourse')}</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
