import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Target, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

type Props = {
  courseTitle: string;
  category: string;
  lessonsCount: number;
  quizzesCount: number;
  progress: number;
  t: (key: string) => string;
};

export function CourseHeader({
  courseTitle,
  category,
  lessonsCount,
  quizzesCount,
  progress,
  t,
}: Props) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="hero-banner"
    >
      <div className="space-y-4">
        <button
          onClick={() => router.push(ROUTES.student.courses)}
          className="flex items-center gap-2 text-xs font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {t('courses.backToCourses')}
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-foreground)]">
              {courseTitle}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-muted-foreground)]">
              <span className="px-2.5 py-0.5 bg-[var(--primary-soft)] text-[var(--primary)] rounded-lg text-xs font-medium">
                {category || t('courses.course')}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> {lessonsCount} {t('dashboard.lessons')}
              </span>
              <span className="flex items-center gap-1.5">
                <Target className="w-4 h-4" /> {quizzesCount} {t('nav.quizzes')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-[var(--card-solid)] p-4 rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">
                {t('courses.progress')}
              </p>
              <p className="text-2xl font-bold leading-none mt-1 tabular-nums text-[var(--color-foreground)]">
                {progress}%
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg gradient-bg text-white flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
