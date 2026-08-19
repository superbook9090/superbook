'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Clock, Target, CheckCircle2, Sparkles, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

type Props = {
  courseTitle: string;
  category: string;
  chaptersCount?: number;
  lessonsCount: number;
  quizzesCount: number;
  progress: number;
  t: (key: string, params?: Record<string, string | number>) => string;
};

export function CourseHeader({
  courseTitle,
  category,
  chaptersCount,
  lessonsCount,
  quizzesCount,
  progress,
  t,
}: Props) {
  const router = useRouter();
  const isCompleted = progress === 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[var(--student-soft)]/90 via-[var(--card-solid)] to-[var(--teacher-soft)]/50 border border-[var(--border)] p-6 sm:p-8 shadow-[var(--shadow-sm)]"
    >
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[var(--student-primary)]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="flex flex-col gap-6">
        {/* Back Link */}
        <button
          onClick={() => router.push(ROUTES.student.courses)}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] hover:text-[var(--student-primary)] transition-colors group w-fit"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{t('courses.backToCourses')}</span>
        </button>

        {/* Header Main Content */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--student-primary)] text-white shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{category || 'Course'}</span>
              </span>
              {isCompleted && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-success)] text-white shadow-sm">
                  <Award className="w-3.5 h-3.5" />
                  <span>{t('courses.completed')}</span>
                </span>
              )}
            </div>

            {/* Course Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[var(--color-foreground)] leading-tight">
              {courseTitle}
            </h1>

            {/* Milestones Stats */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm font-semibold text-[var(--color-muted-foreground)] pt-1">
              {chaptersCount ? (
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[var(--student-primary)]" />
                  <span>{chaptersCount} {chaptersCount === 1 ? 'Chapter' : 'Chapters'}</span>
                </span>
              ) : null}
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[var(--student-primary)]" />
                <span>{lessonsCount} {lessonsCount === 1 ? 'Lesson' : 'Lessons'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-[var(--student-primary)]" />
                <span>{quizzesCount} {quizzesCount === 1 ? 'Quiz' : 'Quizzes'}</span>
              </span>
            </div>
          </div>

          {/* Progress Card */}
          <div className="flex items-center gap-4 bg-[var(--card-solid)] border border-[var(--border)] rounded-2xl p-5 shadow-sm min-w-[240px]">
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="uppercase tracking-wider text-[var(--color-muted-foreground)]">
                  {t('courses.progress')}
                </span>
                <span className="text-[var(--student-primary)] tabular-nums text-sm font-black">
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-[var(--border)] rounded-full h-2.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-[var(--student-primary)] to-[var(--student-accent)]"
                />
              </div>
              <p className="text-[11px] text-[var(--color-muted-foreground)] font-medium pt-0.5">
                {isCompleted ? 'Course completed! 🎉' : `${progress}% completed`}
              </p>
            </div>

            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0 ${
              isCompleted
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                : 'bg-gradient-to-br from-[var(--student-primary)] to-[var(--student-accent)]'
            }`}>
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
