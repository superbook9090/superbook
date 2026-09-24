/**
 * Web Speech Synthesis API utility for question Text-To-Speech (TTS).
 * Provides voice read-aloud for accessibility in English and Hindi.
 */

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function stopSpeaking(): void {
  if (isSpeechSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignored
    }
  }
}

export function isSpeaking(): boolean {
  if (!isSpeechSupported()) return false;
  return window.speechSynthesis.speaking;
}

export function speakText(
  text: string,
  options?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
  }
): void {
  if (!isSpeechSupported() || !text.trim()) return;

  try {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const isHindi = /[\u0900-\u097F]/.test(text);
    utterance.lang = isHindi ? 'hi-IN' : 'en-US';
    utterance.rate = 0.95; // Slightly slower for clear comprehension

    const voices = window.speechSynthesis.getVoices?.() || [];
    const matchedVoice = voices.find((v) =>
      isHindi ? v.lang.startsWith('hi') : v.lang.startsWith('en')
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    if (options?.onStart) utterance.onstart = options.onStart;
    if (options?.onEnd) utterance.onend = options.onEnd;
    if (options?.onError) utterance.onerror = options.onError;

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.debug('[TTS] Speech synthesis error:', err);
    options?.onError?.();
  }
}
