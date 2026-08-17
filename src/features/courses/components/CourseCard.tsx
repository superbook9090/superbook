'use client';
import { ROUTES } from '@/constants/routes';

import { useState, memo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslation } from '@/hooks/useTranslation';
import {
  BookOpen,
  User,
  Tag,
  ArrowRight,
  Play,
  RotateCcw,
  Trash2
} from 'lucide-react';
import CourseShareButton from '@/components/courses/CourseShareButton';
import { Badge } from '@/components/ui/Badge';
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

  // Handle both course and enrollment objects
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

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
      className="group h-full flex flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--card-solid)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow duration-300"
    >
      {/* Thumbnail */}
      <div className="relative h-36 sm:h-40 overflow-hidden">
        {(courseData.thumbnail || courseData.thumbnailUrl) ? (
          <>
            <Image
              src={courseData.thumbnail || courseData.thumbnailUrl || ''}
              alt={courseData.title}
              fill
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[var(--primary-soft)] border-b border-[var(--color-border)]">
            <BookOpen className="w-10 h-10 text-[var(--primary)] opacity-70" />
          </div>
        )}
        
        {/* Category Badge */}
        {courseData.category && (
          <div className="absolute top-3 left-3">
            <Badge variant="primary" size="sm" icon={<Tag className="w-3 h-3" />}>
              {courseData.category}
            </Badge>
          </div>
        )}

        {/* Price Badge */}
        {type === 'available' && (
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 bg-white/95 dark:bg-black/80 backdrop-blur-sm rounded-full text-[11px] font-bold uppercase tracking-wider text-[var(--color-foreground)] shadow-sm">
              {courseData.price === 0 ? t('courses.free') : `$${courseData.price}`}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col">
        <h3 className="text-sm sm:text-base font-bold text-[var(--color-foreground)] mb-1 line-clamp-1">
          {courseData.title}
        </h3>
        <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] mb-2.5 line-clamp-2 min-h-[32px]">
          {courseData.description || t('courses.noDescription')}
        </p>

        <div className="mt-auto space-y-2.5">
          {/* Instructor */}
          <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-muted-foreground)]">
            <div className="gradient-bg w-5 h-5 rounded-md flex items-center justify-center shadow-[var(--shadow-sm)] shrink-0">
              <User className="w-3 h-3 text-white" />
            </div>
            <span className="truncate">{courseData.instructor?.name || t('courses.unknown')}</span>
          </div>

          {/* Progress (for enrolled courses) */}
          {type === 'enrolled' && enrollment && (
            <div className="p-2.5 bg-[var(--color-surface-muted)] rounded-lg border border-[var(--border)]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">{t('courses.progress')}</span>
                <span className="text-xs font-bold tabular-nums text-[var(--primary)]">{enrollment.progress}%</span>
              </div>
              <div className="w-full bg-[var(--color-surface-muted-strong)] rounded-full h-1.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${enrollment.progress}%` }}
                  className="gradient-bg h-full rounded-full"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {type === 'available' ? (
              <>
                <button
                  onClick={handleEnroll}
                  disabled={isLoading}
                  className="btn-premium flex-1 group/btn min-h-[38px] text-xs sm:text-sm"
                >
                  {isLoading ? (
                    <Loader size="sm" />
                  ) : (
                    <>
                      {t('courses.enrollNow')}
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
                <CourseShareButton course={courseData} />
              </>
            ) : (
              <>
                <button
                  onClick={handleContinue}
                  className="btn-premium flex-1 group/btn min-h-[38px] text-xs sm:text-sm"
                >
                  {enrollment?.progress === 0 ? (
                    <><Play className="w-3.5 h-3.5 fill-current" /> {t('courses.start')}</>
                  ) : enrollment?.progress === 100 ? (
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
                    className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center border border-[var(--color-error)]/25 text-[var(--color-error)] rounded-lg hover:bg-[var(--color-error-light)] transition-all disabled:opacity-50"
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
