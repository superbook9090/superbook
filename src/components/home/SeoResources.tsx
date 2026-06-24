import Link from 'next/link';
import { PRIMARY_SEO_LANDINGS } from '@/lib/seo/landing-routes';
import { ROUTES } from '@/constants/routes';

const EXTRA_LINKS = [
  { href: '/tools', label: 'All Education Tools' },
  { href: ROUTES.blogs, label: 'Educational Blogs' },
  { href: '/courses', label: 'Free Online Courses' },
  { href: ROUTES.howItWorks, label: 'How It Works' },
];

export default function SeoResources() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-10 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-[var(--color-foreground)]">Free Tools for Educators</h2>
          <p className="mt-3 text-[var(--color-muted-foreground)]">
            Create quizzes, courses, test series, and practice exams — all free on Quiz-Do.
            Built for teachers, coaching institutes, and competitive exam aspirants.
          </p>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
          {PRIMARY_SEO_LANDINGS.map((landing) => (
            <Link
              key={landing.path}
              href={landing.path}
              className="rounded-xl border border-[var(--border)] bg-[var(--card-solid)] px-4 py-3 text-sm font-medium text-[var(--color-foreground)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors text-center"
            >
              {landing.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-4 text-sm">
          {EXTRA_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[var(--color-primary)] font-semibold hover:underline"
            >
              {link.label} →
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
