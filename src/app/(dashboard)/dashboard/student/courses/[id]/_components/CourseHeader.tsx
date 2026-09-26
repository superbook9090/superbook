'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowLeft, BookOpen, Clock, Target, CheckCircle2, Sparkles, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

type Props = {
  courseTitle: string;
  category: string;
  thumbnail?: string;
  chaptersCount?: number;
  lessonsCount: number;
  quizzesCount: number;
  progress: number;
  t: (key: string, params?: Record<string, string | number>) => string;
};

export function CourseHeader({
  courseTitle,
  category,
  thumbnail,
  chaptersCount,
  lessonsCount,
  quizzesCount,
  progress,
  t,
}: Props) {
  const router = useRouter();
  const isCompleted = progress === 100;
  const hasThumbnail = Boolean(thumbnail && thumbnail.trim().length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative rounded-2xl overflow-hidden p-3.5 sm:p-4.5 border border-[var(--border)] antigravity-glass shadow-md"
    >
      {/* Top luminous accent keyline */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] shadow-[0_0_10px_var(--student-primary)]"
        style={{ background: 'var(--student-gradient)' }}
        aria-hidden
      />

      {/* Subtle background glow */}
      <div className="absolute top-[-50%] right-[-5%] w-64 h-64 bg-[var(--student-primary)]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="flex flex-col gap-3 relative z-10">
        {/* Row 1: Back + Category + Status + Inline Milestones */}
        <div className="flex items-center justify-between gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => router.push(ROUTES.student.courses)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-[var(--color-muted-foreground)] hover:text-[var(--student-primary)] bg-[var(--surface-muted)]/70 hover:bg-[var(--surface-muted)] border border-[var(--border)] transition-all cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('courses.backToCourses')}</span>
            </button>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-[var(--student-primary)] to-[var(--student-accent)] text-white shadow-2xs">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{category || t('common.course')}</span>
            </span>

            {isCompleted && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                <Award className="w-3 h-3" />
                <span>{t('courses.completed')}</span>
              </span>
            )}
          </div>

          {/* Quick milestone chips */}
          <div className="flex items-center gap-2.5 text-xs font-semibold text-[var(--color-muted-foreground)]">
            {chaptersCount ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--surface-muted)]/60 border border-[var(--border)]/60">
                <BookOpen className="w-3.5 h-3.5 text-[var(--student-primary)]" />
                <strong className="text-[var(--color-foreground)]">{chaptersCount}</strong>
                <span>{chaptersCount === 1 ? t('common.chapter') : t('common.chapters')}</span>
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--surface-muted)]/60 border border-[var(--border)]/60">
              <Clock className="w-3.5 h-3.5 text-[var(--student-primary)]" />
              <strong className="text-[var(--color-foreground)]">{lessonsCount}</strong>
              <span>{lessonsCount === 1 ? t('common.lesson') : t('common.lessons')}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--surface-muted)]/60 border border-[var(--border)]/60">
              <Target className="w-3.5 h-3.5 text-[var(--student-primary)]" />
              <strong className="text-[var(--color-foreground)]">{quizzesCount}</strong>
              <span>{quizzesCount === 1 ? t('common.quiz') : t('common.quizzes')}</span>
            </span>
          </div>
        </div>

        {/* Row 2: Main Content (Image if available + Title on Left, Progress on Right) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-0.5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 flex-1 min-w-0">
            {/* Conditional Thumbnail Image: Only shown if image is available, otherwise zero space taken */}
            {hasThumbnail && (
              <div className="relative w-full sm:w-36 md:w-44 h-24 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-[var(--border)] shadow-xs bg-[var(--surface-muted)]">
                <Image
                  src={thumbnail!}
                  alt=""
                  fill
                  aria-hidden
                  unoptimized
                  className="object-cover blur-md opacity-25 scale-110"
                />
                <Image
                  src={thumbnail!}
                  alt={courseTitle}
                  fill
                  unoptimized
                  className="object-contain p-1"
                />
              </div>
            )}

            <h1 className="text-base sm:text-xl lg:text-2xl font-black tracking-tight text-[var(--color-foreground)] leading-snug">
              {courseTitle}
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto bg-[var(--surface-muted)]/60 border border-[var(--border)] px-3 py-1.5 rounded-xl shadow-2xs">
            <div className="w-24 sm:w-32 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="uppercase tracking-wider text-[var(--color-muted-foreground)]">{t('courses.progress')}</span>
                <span className="text-[var(--student-primary)] tabular-nums font-black">{progress}%</span>
              </div>
              <div className="w-full bg-[var(--border)]/70 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-[var(--student-primary)] to-[var(--student-accent)] shadow-[0_0_6px_var(--student-primary)]"
                />
              </div>
            </div>

            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs ${
                isCompleted
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                  : 'bg-gradient-to-br from-[var(--student-primary)] to-[var(--student-accent)]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
