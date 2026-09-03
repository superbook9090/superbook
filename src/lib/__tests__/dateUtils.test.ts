import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatShortDate,
  formatTime,
  formatDuration,
  getRelativeTime
} from '../dateUtils';

describe('dateUtils', () => {
  beforeEach(() => {
    // Mock the current date to a fixed point in time for relative time tests
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatDate', () => {
    it('returns N/A for null or undefined', () => {
      expect(formatDate(null)).toBe('N/A');
      expect(formatDate(undefined)).toBe('N/A');
      expect(formatDate('')).toBe('N/A');
    });

    it('formats string dates correctly', () => {
      expect(formatDate('2024-01-15')).toMatch(/Jan 1[45], 2024/); // Timezone resilient check
    });

    it('formats Date objects correctly', () => {
      expect(formatDate(new Date('2024-01-15T00:00:00Z'))).toMatch(/Jan 1[45], 2024/);
    });
  });

  describe('formatDuration', () => {
    it('returns N/A for null, undefined, or <= 0', () => {
      expect(formatDuration(null)).toBe('N/A');
      expect(formatDuration(undefined)).toBe('N/A');
      expect(formatDuration(0)).toBe('N/A');
      expect(formatDuration(-10)).toBe('N/A');
    });

    it('formats seconds only', () => {
      expect(formatDuration(45)).toBe('45s');
    });

    it('formats minutes and seconds', () => {
      expect(formatDuration(150)).toBe('2m 30s');
      expect(formatDuration(65)).toBe('1m 5s');
    });
  });

  describe('getRelativeTime', () => {
    it('returns "just now" for dates within the last 60 seconds', () => {
      expect(getRelativeTime(new Date('2024-01-15T11:59:30Z'))).toBe('just now');
    });

    it('returns minutes ago for dates within the last hour', () => {
      expect(getRelativeTime(new Date('2024-01-15T11:50:00Z'))).toBe('10m ago');
    });

    it('returns hours ago for dates within the last day', () => {
      expect(getRelativeTime(new Date('2024-01-15T09:00:00Z'))).toBe('3h ago');
    });

    it('returns days ago for dates within the last week', () => {
      expect(getRelativeTime(new Date('2024-01-12T12:00:00Z'))).toBe('3d ago');
    });

    it('falls back to formatDate for older dates', () => {
      const oldDate = new Date('2023-12-01T12:00:00Z');
      expect(getRelativeTime(oldDate)).toBe(formatDate(oldDate));
    });
  });
});
