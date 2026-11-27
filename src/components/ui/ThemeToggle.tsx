'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { setThemePreference } from '@/lib/theme';

type Theme = 'dark' | 'light';

export default function ThemeToggle({
  className = '',
  variant = 'default',
}: {
  className?: string;
  variant?: 'default' | 'ghost';
}) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme');
    if (current === 'light' || current === 'dark') setTheme(current);
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setThemePreference(next);
  };

  const baseStyle =
    variant === 'ghost'
      ? 'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--card-solid)] transition-all active:scale-95 focus-ring cursor-pointer'
      : 'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[var(--border)]/85 bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--surface-muted)] transition-all active:scale-95 shadow-xs focus-ring cursor-pointer';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`${baseStyle} ${className}`}
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
