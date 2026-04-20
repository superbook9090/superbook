'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import {
  BookOpen,
  Clock,
  User,
  Tag,
  ArrowRight,
  CheckCircle,
  Play,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import Loader from '@/components/ui/Loader';

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  category?: string;
  price: number;
  instructor: { name: string; email: string };
  isPublished: boolean;
}

interface Enrollment {
  _id: string;
  course: Course;
  progress: number;
  status: string;
  enrolledAt: string;
}

interface CourseCardProps {
  course: Course | Enrollment;
  type: 'enrolled' | 'available';
  onEnroll?: (courseId: string) => Promise<void>;
  onDrop?: (enrollmentId: string) => Promise<void>;
}

export default function CourseCard({ course, type, onEnroll, onDrop }: CourseCardProps) {
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
    router.push(`/dashboard/student/courses/${courseData._id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'active': return 'primary';
      default: return 'default';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden">
        {courseData.thumbnail ? (
          <img
            src={courseData.thumbnail}
            alt={courseData.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${theme.gradient} flex items-center justify-center`}>
            <BookOpen className="w-16 h-16 text-white/80" />
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
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-sm font-bold text-gray-900">
            {courseData.price === 0 ? t('courses.free') : `$${courseData.price}`}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title & Description */}
        <h3 className={`text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:${theme.text} transition-colors`}>
          {courseData.title}
        </h3>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
          {courseData.description || t('courses.noDescription')}
        </p>

        {/* Instructor */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${theme.gradient} flex items-center justify-center`}>
            <User className="w-3 h-3 text-white" />
          </div>
          <span>{courseData.instructor?.name || t('courses.unknown')}</span>
        </div>

        {/* Progress (for enrolled courses) */}
        {type === 'enrolled' && enrollment && (
          <div className="mb-4 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">{t('courses.progress')}</span>
              <span className={`text-sm font-bold ${theme.text}`}>{enrollment.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${theme.gradient} transition-all duration-500`}
                style={{ width: `${enrollment.progress}%` }}
              />
            </div>
            <Badge variant={getStatusColor(enrollment.status)} size="sm">
              {enrollment.status}
            </Badge>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {type === 'available' ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleEnroll}
              disabled={isLoading}
              className={`flex-1 flex items-center justify-center gap-2 bg-gradient-to-r ${theme.gradient} text-white py-3 px-4 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <Loader variant="button" size="sm" />
              ) : (
                <>
                  {t('courses.enrollNow')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleContinue}
                className={`flex-1 flex items-center justify-center gap-2 bg-gradient-to-r ${theme.gradient} text-white py-3 px-4 rounded-xl font-semibold hover:opacity-90 transition-all`}
              >
                {enrollment?.progress === 0 ? (
                  <><Play className="w-4 h-4" /> {t('courses.start')}</>
                ) : enrollment?.progress === 100 ? (
                  <><RotateCcw className="w-4 h-4" /> {t('courses.review')}</>
                ) : (
                  <><ArrowRight className="w-4 h-4" /> {t('courses.continue')}</>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDrop}
                disabled={isLoading}
                className="p-3 border-2 border-red-100 text-red-500 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all disabled:opacity-50"
              >
                {isLoading ? <Loader variant="button" size="sm" /> : <Trash2 className="w-5 h-5" />}
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
