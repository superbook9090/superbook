'use client';
import { ROUTES } from '@/constants/routes';

import { useState, memo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import {
  BookOpen,
  User,
  Tag,
  ArrowRight,
  Play,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Loader } from '@/components/ui/Loader';
import Tooltip from '@/components/ui/Tooltip';
import type { Course } from '@/types';
import type { Enrollment } from '@/lib/react-query/hooks';
import { cn } from '@/lib/utils';

interface CourseCardProps {
  course: Course | Enrollment;
  type: 'enrolled' | 'available';
  onEnroll?: (courseId: string) => Promise<void>;
  onDrop?: (enrollmentId: string) => Promise<void>;
}

function CourseCard({ course, type, onEnroll, onDrop }: CourseCardProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useRoleTheme();
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
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="card-premium group h-full flex flex-col"
    >
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden rounded-t-2xl">
        {(courseData.thumbnail || courseData.thumbnailUrl) ? (
          <Image
            src={courseData.thumbnail || courseData.thumbnailUrl || ''}
            alt={courseData.title}
            fill
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={cn("w-full h-full flex items-center justify-center bg-gradient-to-br", theme.gradient)}>
            <BookOpen className="w-12 h-12 text-white/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Category Badge */}
        {courseData.category && (
          <div className="absolute top-4 left-4">
            <Badge variant="primary" size="sm" icon={<Tag className="w-3 h-3" />}>
              {courseData.category}
            </Badge>
          </div>
        )}

        {/* Price Badge */}
        {type === 'available' && (
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-black uppercase tracking-widest text-gray-900 shadow-sm">
              {courseData.price === 0 ? t('courses.free') : `$${courseData.price}`}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col">
        <h3 className="heading-md mb-2 line-clamp-1">
          {courseData.title}
        </h3>
        <p className="text-body text-sm mb-4 line-clamp-2 min-h-[40px]">
          {courseData.description || t('courses.noDescription')}
        </p>

        <div className="mt-auto space-y-4">
          {/* Instructor */}
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-muted-foreground)]">
            <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center bg-gradient-to-br shadow-sm", theme.gradient)}>
              <User className="w-3 h-3 text-white" />
            </div>
            <span>{courseData.instructor?.name || t('courses.unknown')}</span>
          </div>

          {/* Progress (for enrolled courses) */}
          {type === 'enrolled' && enrollment && (
            <div className="p-3.5 bg-gray-50/50 rounded-xl border border-[var(--border)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted-foreground)]">{t('courses.progress')}</span>
                <span className={cn("text-xs font-black", theme.text)}>{enrollment.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${enrollment.progress}%` }}
                  className={cn("h-full rounded-full bg-gradient-to-r", theme.gradient)}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {type === 'available' ? (
              <button
                onClick={handleEnroll}
                disabled={isLoading}
                className="btn-premium flex-1 group/btn"
              >
                {isLoading ? (
                  <Loader size="sm" />
                ) : (
                  <>
                    {t('courses.enrollNow')}
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={handleContinue}
                  className="btn-premium flex-1 group/btn"
                >
                  {enrollment?.progress === 0 ? (
                    <><Play className="w-4 h-4 fill-current" /> {t('courses.start')}</>
                  ) : enrollment?.progress === 100 ? (
                    <><RotateCcw className="w-4 h-4" /> {t('courses.review')}</>
                  ) : (
                    <><ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" /> {t('courses.continue')}</>
                  )}
                </button>
                <Tooltip label={t('courses.dropCourse')}>
                  <button
                    onClick={handleDrop}
                    disabled={isLoading}
                    className="p-3 border-2 border-red-50 text-red-400 rounded-xl hover:bg-red-50 hover:border-red-100 transition-all disabled:opacity-50"
                    aria-label={t('courses.dropCourse')}
                  >
                    {isLoading ? <Loader size="sm" /> : <Trash2 className="w-5 h-5" />}
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
