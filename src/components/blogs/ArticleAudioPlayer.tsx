'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Rewind,
  Volume2,
} from 'lucide-react';
import { ArticleSpeechPlayer, type SpeechPlayerState } from '@/lib/native/articleSpeech';

interface ArticleAudioPlayerProps {
  title: string;
  htmlContent: string;
  readingTimeMinutes?: number;
  language?: string;
  className?: string;
}

const SPEED_OPTIONS = [1.0, 1.25, 1.5];

export default function ArticleAudioPlayer({
  title,
  htmlContent,
  readingTimeMinutes = 8,
  language = 'en',
  className = '',
}: ArticleAudioPlayerProps) {
  const [playerState, setPlayerState] = useState<SpeechPlayerState>({
    isPlaying: false,
    isPaused: false,
    currentChunk: 0,
    totalChunks: 0,
    progressPercent: 0,
    rate: 1.0,
  });
  const [supported, setSupported] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(0);
  const playerRef = useRef<ArticleSpeechPlayer | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);
      const fullText = `${title}. ${htmlContent}`;
      playerRef.current = new ArticleSpeechPlayer(fullText, language, setPlayerState);
    }

    return () => {
      playerRef.current?.destroy();
    };
  }, [title, htmlContent, language]);

  if (!supported) return null;

  const { isPlaying, isPaused, progressPercent, rate } = playerState;

  const handlePlayPause = () => {
    if (!isPlaying) {
      playerRef.current?.play();
    } else if (isPaused) {
      playerRef.current?.resume();
    } else {
      playerRef.current?.pause();
    }
  };

  const handleStop = () => {
    playerRef.current?.stop();
  };

  const handleCycleSpeed = () => {
    const nextIdx = (speedIndex + 1) % SPEED_OPTIONS.length;
    setSpeedIndex(nextIdx);
    const newRate = SPEED_OPTIONS[nextIdx];
    playerRef.current?.setRate(newRate);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    playerRef.current?.seek(val);
  };

  const remainingMins = Math.max(
    1,
    Math.round(((100 - progressPercent) / 100) * readingTimeMinutes)
  );

  return (
    <div
      className={`rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/40 p-4 sm:p-5 backdrop-blur-md transition-all shadow-xs ${className}`}
      role="region"
      aria-label="Article Audio Reader"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* Left Info */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              isPlaying && !isPaused
                ? 'bg-[var(--primary)] text-white shadow-md animate-pulse'
                : 'bg-[var(--color-surface-muted)] text-[var(--color-primary)]'
            }`}
          >
            {isPlaying && !isPaused ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <Headphones className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
                {language === 'hi' ? 'ऑडियो गाइड' : 'Listen to Article'}
              </span>
              <span className="text-[11px] text-[var(--color-muted-foreground)]">
                • {isPlaying ? `${remainingMins} min left` : `~${readingTimeMinutes} min audio`}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-[var(--color-foreground)] truncate max-w-sm sm:max-w-md">
              {isPlaying ? (isPaused ? 'Paused' : 'Playing narrated guide...') : 'Listen hands-free while studying'}
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {/* Rewind */}
          {isPlaying && (
            <button
              type="button"
              onClick={() => playerRef.current?.skipSeconds(false)}
              className="p-2 rounded-xl text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)] transition-all"
              title="Rewind sentence"
              aria-label="Rewind sentence"
            >
              <Rewind className="w-4 h-4" />
            </button>
          )}

          {/* Main Play / Pause Button */}
          <button
            type="button"
            onClick={handlePlayPause}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[var(--primary)] text-white hover:opacity-90 active:scale-95 transition-all shadow-xs"
            aria-label={isPlaying && !isPaused ? 'Pause narration' : 'Start narration'}
          >
            {isPlaying && !isPaused ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isPaused ? 'Resume' : 'Listen Now'}</span>
              </>
            )}
          </button>

          {/* Fast Forward */}
          {isPlaying && (
            <button
              type="button"
              onClick={() => playerRef.current?.skipSeconds(true)}
              className="p-2 rounded-xl text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)] transition-all"
              title="Skip forward sentence"
              aria-label="Skip forward sentence"
            >
              <FastForward className="w-4 h-4" />
            </button>
          )}

          {/* Stop / Reset */}
          {isPlaying && (
            <button
              type="button"
              onClick={handleStop}
              className="p-2 rounded-xl text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)] transition-all"
              title="Stop listening"
              aria-label="Stop listening"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Speed Selector */}
          <button
            type="button"
            onClick={handleCycleSpeed}
            className="px-2.5 py-1.5 rounded-lg border border-[var(--border)] text-xs font-mono font-bold text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)] transition-all"
            title="Narration Speed"
          >
            {rate}x
          </button>
        </div>
      </div>

      {/* Scrubbable Progress Bar */}
      {isPlaying && (
        <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="100"
            value={progressPercent}
            onChange={handleSeek}
            className="w-full h-1.5 bg-[var(--color-surface-muted)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
            aria-label="Audio progress scrub"
          />
          <span className="text-[11px] font-mono text-[var(--color-muted-foreground)] shrink-0 w-9 text-right">
            {progressPercent}%
          </span>
        </div>
      )}
    </div>
  );
}
