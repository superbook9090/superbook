'use client';
import { ROUTES } from '@/constants/routes';

import { useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { flattenCurriculumLessons } from '@/lib/curriculum/tree';
import { useLesson, useCourseCurriculum } from '@/lib/react-query/hooks';
import { ChevronLeft, ChevronRight, BookOpen, PlayCircle, Clock, Layout } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import { LazySecurePlayer } from '@/lib/lazy';

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

  // Browser back: return to course (not previous lessons). Direct links seed course in history.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const lessonPathPrefix = `${coursePath}/lessons/`;

    const handlePopState = () => {
      // Run after the browser updates the URL from the history entry.
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
          className="px-6 py-3 bg-[var(--student-primary)] text-white rounded-xl font-bold hover:shadow-lg transition-all"
        />
      </div>
    );
  }

  // Helper to extract YouTube ID
  const getYouTubeID = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = lesson.videoUrl ? getYouTubeID(lesson.videoUrl) : null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goToCourse}
          className="flex items-center gap-2 text-sm font-bold text-[var(--color-muted-foreground)] hover:text-[var(--student-primary)] transition-colors group"
        >
          <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-muted)]/20 flex items-center justify-center group-hover:bg-[var(--student-soft)] transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </div>
          {t('courses.backToCourse')}
        </button>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[var(--color-success-light)] text-[var(--color-success)] rounded-lg border border-[var(--color-success)]/20 text-[10px] font-bold uppercase tracking-wider">
            <Layout className="w-3.5 h-3.5" />
            {t('courses.readingMode')}
          </div>
        </div>
      </div>

      {/* Lesson Header */}
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-foreground)] tracking-tight">
          {lesson.title}
        </h1>
        <div className="flex flex-wrap items-center gap-6 text-sm text-[var(--color-muted-foreground)] font-medium">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--color-warning)]" />
            <span>{t('courses.minutesRead', { count: lesson.duration || 10 })}</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[var(--color-info)]" />
            <span>{t('courses.educationalContent')}</span>
          </div>
        </div>
      </div>

      {/* Video Content */}
      {(lesson.youtubeVideoId || lesson.videoUrl) && (
        <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-[var(--card-solid)] bg-black">
          {lesson.youtubeVideoId ? (
            <LazySecurePlayer
              youtubeVideoId={lesson.youtubeVideoId}
              lessonId={lessonId}
              courseId={courseId}
              onCompleted={() => {
                if (navigation.next) {
                  goToLesson(navigation.next.id);
                }
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
                className="px-6 py-3 bg-[var(--student-primary)] rounded-xl font-bold hover:scale-105 transition-transform"
              >
                {t('courses.watchExternally')}
              </a>
            </div>
          )}
        </div>
      )}

      {/* Resources & Notes PDF Downloads */}
      {(lesson.notesPdf || (lesson.attachments && lesson.attachments.length > 0)) && (
        <div className="bg-[var(--card-solid)] p-6 rounded-3xl border border-[var(--border)] space-y-4">
          <h3 className="text-base font-bold text-[var(--color-foreground)] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[var(--student-primary)]" />
            Lesson Resources & Attachments
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {lesson.notesPdf && (
              <a
                href={lesson.notesPdf}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-4 bg-[var(--color-surface-muted)]/40 hover:bg-[var(--student-soft)]/20 border border-[var(--border)] rounded-2xl group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-warning-light)] text-[var(--color-warning)] flex items-center justify-center font-bold">
                    PDF
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-semibold text-[var(--color-foreground)] group-hover:text-[var(--student-primary)] transition-colors">Lecture Notes</span>
                    <span className="block text-xs text-[var(--color-muted-foreground)]">Download reference notes</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[var(--color-muted)] group-hover:text-[var(--student-primary)] transition-colors" />
              </a>
            )}

            {lesson.attachments && lesson.attachments.map((attach, idx) => (
              <a
                key={idx}
                href={attach}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-4 bg-[var(--color-surface-muted)]/40 hover:bg-[var(--student-soft)]/20 border border-[var(--border)] rounded-2xl group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-info-light)] text-[var(--color-info)] flex items-center justify-center font-bold">
                    ZIP
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-semibold text-[var(--color-foreground)] group-hover:text-[var(--student-primary)] transition-colors">Attachment #{idx + 1}</span>
                    <span className="block text-xs text-[var(--color-muted-foreground)] truncate max-w-[150px]">{attach}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[var(--color-muted)] group-hover:text-[var(--student-primary)] transition-colors" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Text Content */}
      <div className="bg-[var(--card-solid)] rounded-[2.5rem] shadow-xl border border-[var(--border)] overflow-hidden">
        <div className="p-8 sm:p-12">
          <article className="prose dark:prose-invert max-w-none">
            {lesson.content ? (
              <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
            ) : (
              <div className="text-center py-20 text-[var(--color-muted-foreground)]">
                <BookOpen className="w-16 h-16 mx-auto mb-6 opacity-10" />
                <p className="text-xl font-medium">{t('courses.visualLearning')}</p>
                <p className="text-sm opacity-60 mt-2">{t('courses.checkVideoNotes')}</p>
              </div>
            )}
          </article>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-center gap-4 pt-8 border-t border-[var(--border)]">
        {navigation.prev ? (
          <button
            onClick={() => goToLesson(navigation.prev!.id)}
            className="w-full sm:w-auto flex-1 flex items-center justify-between p-6 bg-[var(--card-solid)] border border-[var(--border)] rounded-2xl hover:border-[var(--student-primary)]/30 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--student-soft)] text-[var(--student-primary)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <ChevronLeft className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-1">{t('courses.previousLesson')}</span>
                <span className="block text-sm font-bold text-[var(--color-foreground)] line-clamp-1">{navigation.prev.title}</span>
              </div>
            </div>
          </button>
        ) : <div className="hidden sm:block flex-1" />}

        {navigation.next ? (
          <button
            onClick={() => goToLesson(navigation.next!.id)}
            className="w-full sm:w-auto flex-1 flex items-center justify-between p-6 bg-[var(--card-solid)] border border-[var(--border)] rounded-2xl hover:border-[var(--student-primary)]/30 hover:shadow-lg transition-all group text-right"
          >
            <div className="flex-1 mr-4">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-1">{t('courses.nextLesson')}</span>
              <span className="block text-sm font-bold text-[var(--color-foreground)] line-clamp-1">{navigation.next.title}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[var(--student-primary)] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <ChevronRight className="w-6 h-6" />
            </div>
          </button>
        ) : (
          <button
            onClick={goToCourse}
            className="w-full sm:w-auto flex-1 p-6 bg-gradient-to-r from-[var(--student-primary)] to-[var(--student-primary-light)] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all text-center font-bold"
          >
            {t('courses.finishCourse')}
          </button>
        )}
      </div>
    </div>
  );
}
