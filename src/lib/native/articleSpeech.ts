/**
 * Long Article Speech Controller
 * Handles sequential sentence chunking for long-form educational articles and guides,
 * preventing browser speech synthesis 15-second timeouts and enabling play/pause/scrub.
 */

export interface SpeechPlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  currentChunk: number;
  totalChunks: number;
  progressPercent: number;
  rate: number;
}

export function stripHtmlToText(html: string): string {
  if (typeof window === 'undefined') {
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  const div = document.createElement('div');
  div.innerHTML = html;
  return (div.textContent || div.innerText || '').replace(/\s+/g, ' ').trim();
}

export function splitTextIntoSpeechChunks(text: string): string[] {
  if (!text) return [];

  // Match sentence delimiters in English and Hindi (. ! ? । or double line break)
  const rawChunks = text
    .split(/(?<=[.?!।\n])\s+/)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 2);

  const consolidated: string[] = [];
  let buffer = '';

  for (const part of rawChunks) {
    if ((buffer + ' ' + part).length < 220) {
      buffer = buffer ? `${buffer} ${part}` : part;
    } else {
      if (buffer) consolidated.push(buffer);
      buffer = part;
    }
  }
  if (buffer) consolidated.push(buffer);

  return consolidated;
}

export class ArticleSpeechPlayer {
  private chunks: string[] = [];
  private currentIndex: number = 0;
  private isPlaying: boolean = false;
  private isPaused: boolean = false;
  private rate: number = 1.0;
  private language: string = 'en';
  private onStateChange: (state: SpeechPlayerState) => void;
  private activeUtterance: SpeechSynthesisUtterance | null = null;

  constructor(
    content: string,
    language: string = 'en',
    onStateChange: (state: SpeechPlayerState) => void
  ) {
    const plain = content.includes('<') ? stripHtmlToText(content) : content;
    this.chunks = splitTextIntoSpeechChunks(plain);
    this.language = language;
    this.onStateChange = onStateChange;
  }

  public getSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  private notify() {
    const total = this.chunks.length;
    const current = Math.min(this.currentIndex, total);
    const progressPercent = total > 0 ? Math.round((current / total) * 100) : 0;

    this.onStateChange({
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      currentChunk: current,
      totalChunks: total,
      progressPercent,
      rate: this.rate,
    });
  }

  public play(startIndex?: number) {
    if (!this.getSupported() || this.chunks.length === 0) return;

    if (startIndex !== undefined) {
      this.currentIndex = Math.max(0, Math.min(startIndex, this.chunks.length - 1));
    }

    this.isPlaying = true;
    this.isPaused = false;
    this.speakCurrent();
  }

  private speakCurrent() {
    if (!this.isPlaying || this.isPaused) return;

    if (this.currentIndex >= this.chunks.length) {
      this.stop();
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const text = this.chunks[this.currentIndex];
      const utterance = new SpeechSynthesisUtterance(text);
      this.activeUtterance = utterance;

      const isHindi = this.language === 'hi' || /[\u0900-\u097F]/.test(text);
      utterance.lang = isHindi ? 'hi-IN' : 'en-US';
      utterance.rate = this.rate;

      const voices = window.speechSynthesis.getVoices?.() || [];
      const matchedVoice = voices.find((v) =>
        isHindi ? v.lang.startsWith('hi') : v.lang.startsWith('en')
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onend = () => {
        if (!this.isPlaying || this.isPaused) return;
        this.currentIndex++;
        this.notify();
        this.speakCurrent();
      };

      utterance.onerror = (e) => {
        if (e.error === 'interrupted' || e.error === 'canceled') return;
        console.debug('[ArticleSpeech] Error speaking chunk:', e);
        this.currentIndex++;
        this.notify();
        this.speakCurrent();
      };

      this.notify();
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.debug('[ArticleSpeech] Synthesizer error:', err);
      this.stop();
    }
  }

  public pause() {
    if (!this.isPlaying) return;
    this.isPaused = true;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignored
    }
    this.notify();
  }

  public resume() {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.isPlaying = true;
    this.speakCurrent();
  }

  public stop() {
    this.isPlaying = false;
    this.isPaused = false;
    this.currentIndex = 0;
    this.activeUtterance = null;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignored
    }
    this.notify();
  }

  public setRate(newRate: number) {
    this.rate = newRate;
    if (this.isPlaying && !this.isPaused) {
      this.speakCurrent();
    } else {
      this.notify();
    }
  }

  public seek(percent: number) {
    const target = Math.floor((percent / 100) * this.chunks.length);
    this.currentIndex = Math.max(0, Math.min(target, this.chunks.length - 1));
    if (this.isPlaying && !this.isPaused) {
      this.speakCurrent();
    } else {
      this.notify();
    }
  }

  public skipSeconds(forward: boolean) {
    const delta = forward ? 3 : -3;
    const target = Math.max(0, Math.min(this.currentIndex + delta, this.chunks.length - 1));
    this.currentIndex = target;
    if (this.isPlaying && !this.isPaused) {
      this.speakCurrent();
    } else {
      this.notify();
    }
  }

  public destroy() {
    this.stop();
  }
}
