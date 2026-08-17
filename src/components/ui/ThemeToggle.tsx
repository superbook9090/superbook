'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

type Theme = 'dark' | 'light';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme');
    if (current === 'light' || current === 'dark') setTheme(current);
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch {
      /* private mode — theme just won't persist */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`inline-flex h-8.5 w-8.5 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card-solid)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-colors shadow-sm ${className}`}
    >
      {theme === 'dark' ? <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5" /> : <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
    </button>
  );
}
