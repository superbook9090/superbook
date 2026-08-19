'use client';

import Link from 'next/link';
import BrandLogo from '@/components/ui/BrandLogo';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { ROUTES } from '@/constants/routes';

export default function AuthHeader() {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 bg-transparent">
      {/* Brand Logo */}
      <Link
        href={ROUTES.home}
        className="group inline-flex items-center gap-2 transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-xl p-1"
        aria-label="Back to home"
      >
        <BrandLogo size="md" className="transition-opacity group-hover:opacity-90" />
      </Link>

      {/* Utilities: Language + Theme */}
      <div className="flex items-center gap-2 sm:gap-3">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}
