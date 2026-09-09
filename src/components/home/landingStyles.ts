/**
 * Shared Tailwind class strings for the marketing home page.
 * Keep in `components/home` so Tailwind scans them; hero animation classes live in globals.css.
 */
export const landing = {
  section: 'py-20 sm:py-32',
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  sectionHeader: 'text-center mb-16',
  title: 'text-3xl sm:text-4xl font-bold text-[var(--color-foreground)] mb-4',
  subtitle: 'text-lg text-[var(--color-muted-foreground)] max-w-2xl mx-auto',
  featureGrid: 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8',
  featureCard:
    'group relative p-6 antigravity-glass rounded-2xl antigravity-card border border-[var(--border)] h-full overflow-hidden hover:border-[var(--primary)]/40',
  featureIconWrap:
    'w-12 h-12 bg-[var(--student-soft)] border border-[var(--student-border)]/60 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[var(--student-primary)] group-hover:scale-105 transition-all duration-300 shadow-sm',
  featureIcon:
    'w-6 h-6 text-[var(--student-primary)] group-hover:text-white transition-colors duration-300',
  highlightCard:
    'group relative flex flex-col items-center gap-2 rounded-2xl border border-[var(--border)] antigravity-glass px-4 py-5 hover:-translate-y-1.5 hover:shadow-xl hover:border-[var(--primary)]/50 transition-all duration-300',
  highlightIconWrap:
    'flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--student-soft)] border border-[var(--student-border)]/60 group-hover:scale-110 transition-transform duration-300',
  highlightIcon: 'h-5 w-5 text-[var(--student-primary)]',
} as const;
