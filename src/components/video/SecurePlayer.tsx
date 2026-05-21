'use client';

import React, { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });
import { AlertCircle } from 'lucide-react';
import { useSessionStore } from '@/store/useSessionStore';
import { useLanguage } from '@/contexts/LanguageContext';

interface SecurePlayerProps {
  youtubeVideoId: string;
  lessonId: string;
  courseId: string;
  onCompleted?: () => void;
}

export default function SecurePlayer({
  youtubeVideoId,
  lessonId,
  courseId,
  onCompleted
}: SecurePlayerProps) {
  const { session } = useSessionStore();
  const { t } = useLanguage();

  const playerRef = useRef<HTMLVideoElement | null>(null);
  const lastSavedTimeRef = useRef<number>(0);
  const [duration, setDuration] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [initialSeekDone, setInitialSeekDone] = useState(false);



  // Block right-clicks and copy hotkeys (Only in production)
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (process.env.NODE_ENV !== 'development') {
        e.preventDefault();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (process.env.NODE_ENV === 'development') return;

      // Block Ctrl+C, Ctrl+Shift+I, F12, Command+Option+I, etc.
      if (
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.metaKey && e.altKey && e.key === 'i') ||
        e.key === 'F12' ||
        (e.ctrlKey && e.key === 'c') ||
        (e.metaKey && e.key === 'c')
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Fetch initial progress to resume from the last saved state
  useEffect(() => {
    async function loadProgress() {
      try {
        const res = await fetch(`/api/video/progress?lessonId=${lessonId}&courseId=${courseId}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.progress?.watchTime) {
            setPlayedSeconds(data.progress.watchTime);
            lastSavedTimeRef.current = data.progress.watchTime;
          }
        }
      } catch (err) {
        console.error('Failed to load playback progress:', err);
      }
    }
    loadProgress();
  }, [lessonId, courseId]);

  // Heartbeat is now handled purely by onProgress intervals

  const handleReady = () => {
    // Seek to the previously saved location once the video is ready
    if (!initialSeekDone && playedSeconds > 0 && playerRef.current) {
      playerRef.current.currentTime = playedSeconds;
      setInitialSeekDone(true);
    }
  };

  const handleDurationChange = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    setDuration(e.currentTarget.duration);
  };

  const handleTimeUpdate = async (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const currentTime = e.currentTarget.currentTime;
    setPlayedSeconds(currentTime);
    
    const currentDuration = e.currentTarget.duration || duration;

    // Fire heartbeat to server
    if (currentDuration > 0) {
      const timeDiff = Math.abs(currentTime - lastSavedTimeRef.current);
      const watchPercentage = currentTime / currentDuration;
      const isFinished = watchPercentage >= 0.9;

      if (timeDiff >= 5 || (isFinished && !lastSavedTimeRef.current)) {
        lastSavedTimeRef.current = currentTime;
        try {
          await fetch('/api/video/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lessonId,
              courseId,
              watchTime: Math.round(currentTime),
              duration: Math.round(currentDuration),
              completed: isFinished,
            }),
          });

          if (isFinished && onCompleted) {
            onCompleted();
          }
        } catch (err) {
          console.error('Progress sync failed:', err);
        }
      }
    }
  };

  const handleEnded = async () => {
    // Mark as completely finished
    try {
      await fetch('/api/video/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          courseId,
          watchTime: Math.round(duration),
          duration: Math.round(duration),
          completed: true,
        }),
      });
      if (onCompleted) {
        onCompleted();
      }
    } catch (err) {
      console.error('Playback completion trigger failure:', err);
    }
  };

  if (hasError) {
    return (
      <div className="aspect-video w-full rounded-2xl bg-[var(--color-surface-muted)] border border-[var(--border)] flex flex-col items-center justify-center text-center p-6 space-y-3">
        <AlertCircle className="w-12 h-12 text-[var(--error)] animate-bounce" />
        <h3 className="text-base font-semibold text-[var(--color-foreground)]">{t('courses.playbackError')}</h3>
        <p className="text-xs text-[var(--color-muted-foreground)] max-w-sm">
          {t('courses.playbackErrorDesc')}
        </p>
      </div>
    );
  }

  // Construct secure, unlisted YouTube video URL
  const videoUrl = `https://www.youtube.com/watch?v=${youtubeVideoId}`;

  return (
    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-[var(--border)] shadow-lg group select-none">
      {/* Player Frame */}
      <ReactPlayer
        ref={playerRef}
        src={videoUrl}
        muted={false}
        controls={true}
        playbackRate={1}
        width="100%"
        height="100%"
        onReady={handleReady}
        onDurationChange={handleDurationChange}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={() => setHasError(true)}
        config={{
          youtube: {
            playerVars: {
              modestbranding: 1,
              rel: 0,
              showinfo: 0,
              controls: 1,
              fs: 1,
              iv_load_policy: 3,
              disablekb: 1, // Disable keyboard controls to prevent shortcut inspection
            },
          } as Record<string, unknown>,
        }}
      />

      {/* Invisible security overlay blocking click jacks inside the video element */}
      <div 
        className="absolute inset-0 pointer-events-none z-10 select-none border-4 border-transparent active:border-[var(--primary)]/20 transition-all"
        style={{ pointerEvents: 'none' }}
      >
        {/* Anti-piracy dynamic email overlay matching top-tier LMS standards */}
        <div className="absolute top-4 left-4 pointer-events-none opacity-[0.15] text-[10px] font-mono text-white select-none drop-shadow-md">
          {session?.user?.email 
            ? t('courses.watchedBy', { email: session.user.email }) 
            : t('courses.secureStreamId', { id: youtubeVideoId })}
        </div>
      </div>


    </div>
  );
}
