'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { speakText, stopSpeaking, isSpeechSupported } from '@/lib/native/textToSpeech';

interface SpeechReadButtonProps {
  text: string;
  className?: string;
  title?: string;
}

export function SpeechReadButton({
  text,
  className = '',
  title = 'Read question aloud',
}: SpeechReadButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(isSpeechSupported());
    return () => {
      stopSpeaking();
    };
  }, []);

  if (!supported) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
    } else {
      speakText(text, {
        onStart: () => setSpeaking(true),
        onEnd: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={speaking ? 'Stop reading' : title}
      title={speaking ? 'Stop reading' : title}
      className={`inline-flex items-center justify-center p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-hover)] transition-all ${
        speaking ? 'text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/40 animate-pulse' : ''
      } ${className}`}
    >
      {speaking ? (
        <VolumeX className="w-4 h-4 text-[var(--color-primary)]" />
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
    </button>
  );
}
