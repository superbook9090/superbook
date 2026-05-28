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
    'group relative p-6 bg-[var(--color-surface-muted)] rounded-2xl hover:bg-[var(--card-solid)] hover:shadow-xl transition-all duration-300 border border-[var(--color-border)] h-full',
  featureIconWrap:
    'w-12 h-12 bg-[var(--student-soft)] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[var(--student-primary)] transition-colors duration-300',
  featureIcon:
    'w-6 h-6 text-[var(--student-primary)] group-hover:text-white transition-colors duration-300',
  highlightCard:
    'flex flex-col items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-5 backdrop-blur-sm',
  highlightIconWrap: 'flex h-10 w-10 items-center justify-center rounded-xl bg-white/15',
  highlightIcon: 'h-5 w-5 text-white',
} as const;
