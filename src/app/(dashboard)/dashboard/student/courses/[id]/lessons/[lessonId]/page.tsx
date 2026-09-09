'use client';

import { ROUTES } from '@/constants/routes';
import { useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { flattenCurriculumLessons } from '@/lib/curriculum/tree';
import { useLesson, useCourseCurriculum } from '@/lib/react-query/hooks';
import { ChevronLeft, BookOpen, PlayCircle, Clock, Layout } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import { LazySecurePlayer } from '@/lib/lazy';
import { LessonResourcesCard } from './_components/LessonResourcesCard';
import { LessonViewerFooter } from './_components/LessonViewerFooter';

const lessonSessionKey = (courseId: string) => `lesson-active:${courseId}`;

export default function LessonViewerPage() {
  const { status } = useSessionStore();
  const router = useRouter();
  const params = useParams();
  const { t } = useTranslation();

  const courseId = params.id as string;
  const lessonId = params.lessonId as string;
  const coursePath = ROUTES.student.course(courseId);

  const goToCourse = useCallback(() => {
    router.replace(coursePath);
  }, [router, coursePath]);

  const goToLesson = useCallback(
    (targetLessonId: string) => {
      router.replace(ROUTES.student.lesson(courseId, targetLessonId));
    },
    [router, courseId]
  );

  const { data: lesson, isLoading: lessonLoading } = useLesson(lessonId);
  const { data: curriculum = [], isLoading: curriculumLoading } = useCourseCurriculum(courseId);

  // Find current position in curriculum
  const navigation = (() => {
    if (!curriculum.length || !lesson) return { prev: null, next: null };

    const allLessons = flattenCurriculumLessons(curriculum).map((l) => ({
      id: l._id,
      title: l.title,
    }));

    const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
    return {
      prev: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
      next: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null,
    };
  })();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(ROUTES.login);
    }
  }, [status, router]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const lessonPathPrefix = `${coursePath}/lessons/`;

    const handlePopState = () => {
      window.setTimeout(() => {
        if (window.location.pathname.startsWith(lessonPathPrefix)) {
          router.replace(coursePath);
        }
      }, 0);
    };

    window.addEventListener('popstate', handlePopState);
    const sessionKey = lessonSessionKey(courseId);
    if (!sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, '1');
      window.history.replaceState(window.history.state, '', coursePath);
      window.history.pushState(window.history.state, '', window.location.pathname);
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, [courseId, coursePath, router]);

  if (status === 'loading' || lessonLoading || curriculumLoading) {
    return <PageSkeleton />;
  }

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-20 h-20 bg-[var(--color-error-light)] text-[var(--color-error)] rounded-full flex items-center justify-center mb-6">
          <BookOpen className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-2">{t('courses.lessonNotFound')}</h2>
        <p className="text-[var(--color-muted-foreground)] mb-8">{t('courses.lessonNotFoundDesc')}</p>
        <BackButton
          onClick={goToCourse}
          label={t('courses.backToCourse')}
          variant="button"
          className="btn-premium px-6 py-3 font-bold"
        />
      </div>
    );
  }

  const getYouTubeID = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = lesson.videoUrl ? getYouTubeID(lesson.videoUrl) : null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Button
          onClick={goToCourse}
          variant="ghost"
          className="flex items-center gap-2 text-sm font-bold text-[var(--color-muted-foreground)] hover:text-[var(--student-primary)] transition-colors group"
        >
          <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-muted)]/50 flex items-center justify-center group-hover:bg-[var(--student-soft)] transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </div>
          {t('courses.backToCourse')}
        </Button>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[var(--color-success-light)] text-[var(--color-success)] rounded-xl border border-[var(--color-success)]/20 text-[10px] font-bold uppercase tracking-wider shadow-xs">
            <Layout className="w-3.5 h-3.5" />
            {t('courses.readingMode')}
          </div>
        </div>
      </div>

      {/* Lesson Header */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-foreground)] tracking-tight">
          {lesson.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-[var(--color-muted-foreground)] font-medium">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface-muted)]/60 border border-[var(--border)]">
            <Clock className="w-3.5 h-3.5 text-[var(--color-warning)]" />
            <span>{t('courses.minutesRead', { count: lesson.duration || 10 })}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface-muted)]/60 border border-[var(--border)]">
            <BookOpen className="w-3.5 h-3.5 text-[var(--color-info)]" />
            <span>{t('courses.educationalContent')}</span>
          </div>
        </div>
      </div>

      {/* Video Cinema Container */}
      {(lesson.youtubeVideoId || lesson.videoUrl) && (
        <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-[var(--border)] bg-black ring-1 ring-white/10">
          {lesson.youtubeVideoId ? (
            <LazySecurePlayer
              youtubeVideoId={lesson.youtubeVideoId}
              lessonId={lessonId}
              courseId={courseId}
              onCompleted={() => {
                if (navigation.next) goToLesson(navigation.next.id);
              }}
            />
          ) : videoId ? (
            <div className="aspect-video relative">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                title={lesson.title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="aspect-video relative flex flex-col items-center justify-center text-white bg-gradient-to-br from-gray-900 to-black p-8">
              <PlayCircle className="w-16 h-16 text-[var(--student-primary)] mb-4 animate-pulse" />
              <p className="text-lg font-bold mb-2">{t('courses.educationalContent')}</p>
              <a
                href={lesson.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-premium px-6 py-3 font-bold"
              >
                {t('courses.watchExternally')}
              </a>
            </div>
          )}
        </div>
      )}

      {/* Resources and Attachments */}
      <LessonResourcesCard notesPdf={lesson.notesPdf} attachments={lesson.attachments} />

      {/* Reading Canvas */}
      <div className="antigravity-glass rounded-[2.5rem] shadow-xl border border-[var(--border)] overflow-hidden">
        <div className="p-8 sm:p-12">
          <article className="prose dark:prose-invert max-w-none">
            {lesson.content ? (
              <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
            ) : (
              <div className="text-center py-16 text-[var(--color-muted-foreground)]">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-semibold">{t('courses.visualLearning')}</p>
                <p className="text-xs opacity-70 mt-1">{t('courses.checkVideoNotes')}</p>
              </div>
            )}
          </article>
        </div>
      </div>

      {/* Navigation Footer */}
      <LessonViewerFooter
        prev={navigation.prev}
        next={navigation.next}
        onGoToLesson={goToLesson}
        onFinishCourse={goToCourse}
        t={t}
      />
    </div>
  );
}
