'use client';

import { useState, memo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/constants/routes';
import {
  BookOpen,
  User,
  ArrowRight,
  Play,
  RotateCcw,
  Trash2,
  Sparkles,
  Layers,
} from 'lucide-react';
import CourseShareButton from '@/components/courses/CourseShareButton';
import { Loader } from '@/components/ui/Loader';
import Tooltip from '@/components/ui/Tooltip';
import type { Course } from '@/types';
import type { Enrollment } from '@/lib/react-query/hooks';

interface CourseCardProps {
  course: Course | Enrollment;
  type: 'enrolled' | 'available';
  onEnroll?: (courseId: string) => Promise<void>;
  onDrop?: (enrollmentId: string) => Promise<void>;
}

function CourseCard({ course, type, onEnroll, onDrop }: CourseCardProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const isEnrollment = 'course' in course;
  const courseData = isEnrollment ? (course as Enrollment).course : (course as Course);
  const enrollment = isEnrollment ? (course as Enrollment) : null;

  const handleEnroll = async () => {
    if (!onEnroll) return;
    setIsLoading(true);
    try {
      await onEnroll(courseData._id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = async () => {
    if (!onDrop || !enrollment) return;
    setIsLoading(true);
    try {
      await onDrop(enrollment._id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    router.push(ROUTES.student.course(courseData._id));
  };

  const isComplete = enrollment?.progress === 100;
  const isNotStarted = enrollment?.progress === 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="group h-full flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-solid)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)] hover:border-[var(--student-primary)]/40 transition-all duration-300"
    >
      {/* Thumbnail Container */}
      <div className="relative h-40 sm:h-44 w-full overflow-hidden bg-[var(--color-surface-muted)]">
        {courseData.thumbnail || courseData.thumbnailUrl ? (
          <>
            <Image
              src={courseData.thumbnail || courseData.thumbnailUrl || ''}
              alt={courseData.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--student-soft)] via-[var(--student-border)] to-[var(--color-surface-muted)] flex flex-col items-center justify-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--student-primary)]/10 text-[var(--student-primary)] flex items-center justify-center mb-1">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-[var(--color-muted-foreground)]">
              {courseData.category || 'Course'}
            </span>
          </div>
        )}

        {/* Category Badge */}
        {courseData.category && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md shadow-sm">
            <Sparkles className="w-3 h-3 text-[var(--color-warning)]" />
            <span>{courseData.category}</span>
          </div>
        )}

        {/* Price or Completion status */}
        <div className="absolute top-3 right-3">
          {type === 'available' ? (
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[var(--student-primary)] text-white shadow-md">
              {courseData.price === 0 ? t('courses.free') : `₹${courseData.price}`}
            </span>
          ) : isComplete ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-success)] text-white shadow-md">
              {t('courses.completed')}
            </span>
          ) : null}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-[var(--color-muted-foreground)] mb-2">
            <div className="flex items-center gap-1.5 font-medium truncate max-w-[70%]">
              <User className="w-3.5 h-3.5 text-[var(--student-primary)] shrink-0" />
              <span className="truncate">{courseData.instructor?.name || t('courses.unknown')}</span>
            </div>
            {'chapterCount' in courseData && courseData.chapterCount ? (
              <div className="flex items-center gap-1 text-[11px]">
                <Layers className="w-3 h-3" />
                <span>{courseData.chapterCount} Ch.</span>
              </div>
            ) : null}
          </div>

          <h3 className="text-base font-bold text-[var(--color-foreground)] mb-1.5 line-clamp-1 group-hover:text-[var(--student-primary)] transition-colors">
            {courseData.title}
          </h3>

          <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] line-clamp-2 mb-4 leading-relaxed">
            {courseData.description || t('courses.noDescription')}
          </p>
        </div>

        {/* Bottom Area: Progress & Actions */}
        <div className="space-y-3 pt-2">
          {type === 'enrolled' && enrollment && (
            <div className="p-3 bg-[var(--color-surface-muted)] rounded-xl border border-[var(--border)]">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-[var(--color-muted-foreground)]">{t('courses.progress')}</span>
                <span className="text-[var(--student-primary)] tabular-nums">{enrollment.progress}%</span>
              </div>
              <div className="w-full bg-[var(--border)] rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${enrollment.progress}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-[var(--student-primary)] to-[var(--student-accent)]"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            {type === 'available' ? (
              <>
                <button
                  onClick={handleEnroll}
                  disabled={isLoading}
                  className="btn-premium flex-1 group/btn min-h-[42px] text-xs sm:text-sm"
                >
                  {isLoading ? (
                    <Loader size="sm" />
                  ) : (
                    <>
                      <span>{t('courses.enrollNow')}</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
                <CourseShareButton course={courseData} />
              </>
            ) : (
              <>
                <button
                  onClick={handleContinue}
                  className="btn-premium flex-1 group/btn min-h-[42px] text-xs sm:text-sm"
                >
                  {isNotStarted ? (
                    <><Play className="w-3.5 h-3.5 fill-current" /> {t('courses.start')}</>
                  ) : isComplete ? (
                    <><RotateCcw className="w-3.5 h-3.5" /> {t('courses.review')}</>
                  ) : (
                    <><ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" /> {t('courses.continue')}</>
                  )}
                </button>
                <CourseShareButton course={courseData} />
                <Tooltip label={t('courses.dropCourse')}>
                  <button
                    onClick={handleDrop}
                    disabled={isLoading}
                    className="p-2.5 min-h-[42px] min-w-[42px] flex items-center justify-center border border-[var(--color-error)]/25 text-[var(--color-error)] rounded-xl hover:bg-[var(--color-error-light)] transition-all disabled:opacity-50"
                    aria-label={t('courses.dropCourse')}
                  >
                    {isLoading ? <Loader size="sm" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </Tooltip>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const CourseCardMemo = memo(CourseCard);
export default CourseCardMemo;
