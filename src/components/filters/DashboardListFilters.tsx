'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

export type SegmentedFilterOption = {
  id: string;
  label: string;
  icon?: ReactNode;
};

export type FilterChipOption = {
  id: string;
  label: string;
};

export type FilterChipGroup = {
  label: string;
  icon?: ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: FilterChipOption[];
  neutralValue?: string;
  minOptions?: number;
};

interface DashboardListFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClear: () => void;
  searchPlaceholder?: string;
  segmentedFilter?: {
    value: string;
    onChange: (value: string) => void;
    options: SegmentedFilterOption[];
    neutralValue?: string;
  };
  chipGroups?: FilterChipGroup[];
  headerAside?: ReactNode;
  className?: string;
}

function isGroupActive(group: FilterChipGroup): boolean {
  const neutral = group.neutralValue ?? 'all';
  return group.value.toLowerCase() !== neutral.toLowerCase() && group.value !== 'All';
}

export default function DashboardListFilters({
  searchQuery,
  onSearchChange,
  onClear,
  searchPlaceholder,
  segmentedFilter,
  chipGroups = [],
  headerAside,
  className,
}: DashboardListFiltersProps) {
  const { t } = useTranslation();
  const [mobileChipsOpen, setMobileChipsOpen] = useState(false);

  const segmentedNeutral = segmentedFilter?.neutralValue ?? 'all';
  const hasActiveSegmented =
    segmentedFilter != null && segmentedFilter.value !== segmentedNeutral;

  const visibleChipGroups = chipGroups.filter((group) => {
    const min = group.minOptions ?? 1;
    return group.options.length >= min;
  });

  const hasActiveChips = visibleChipGroups.some(isGroupActive);
  const hasActiveFilters =
    Boolean(searchQuery.trim()) || hasActiveSegmented || hasActiveChips;

  const activeChipCount = visibleChipGroups.filter(isGroupActive).length;
  const hasCollapsibleChips = visibleChipGroups.length > 0;

  useEffect(() => {
    if (hasActiveChips) {
      setMobileChipsOpen(true);
    }
  }, [hasActiveChips]);

  const searchInput = (
    <div className="relative flex-1 min-w-0 group">
      <div className="absolute inset-y-0 left-3 md:left-5 flex items-center pointer-events-none">
        <Search
          className="w-4 h-4 md:w-5 md:h-5 text-[var(--color-muted-foreground)] group-focus-within:text-[var(--primary)] transition-colors"
          aria-hidden
        />
      </div>
      <input
        type="search"
        placeholder={searchPlaceholder ?? t('common.search')}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label={searchPlaceholder ?? t('common.search')}
        className="w-full bg-[var(--card-solid)] border border-[var(--border)] rounded-xl pl-9 md:pl-12 pr-3 md:pr-6 py-2.5 md:py-3.5 min-h-[42px] md:min-h-[44px] text-base md:text-sm font-medium md:font-bold focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] outline-none transition-all shadow-sm"
      />
    </div>
  );

  const segmentedControl = segmentedFilter ? (
    <div
      className="filter-segmented"
      role="group"
      aria-label={t('common.filter')}
    >
      {segmentedFilter.options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => segmentedFilter.onChange(option.id)}
          aria-pressed={segmentedFilter.value === option.id}
          aria-label={option.label}
          title={option.label}
          className={cn(
            'filter-segmented__btn',
            segmentedFilter.value === option.id && 'filter-segmented__btn--active'
          )}
        >
          {option.icon}
          <span className="hidden sm:inline">{option.label}</span>
        </button>
      ))}
    </div>
  ) : null;

  const chipGroupsUI = (compact: boolean) =>
    visibleChipGroups.map((group, index) => (
      <div
        key={group.label}
        className={cn(
          compact ? 'filter-chip-group filter-chip-group--compact' : 'flex flex-wrap items-center gap-3',
          !compact && index > 0 && 'border-t sm:border-t-0 sm:border-l border-[var(--border)] pt-4 sm:pt-0 sm:pl-6'
        )}
      >
        <div
          className={cn(
            compact
              ? 'sr-only'
              : 'text-[10px] font-black uppercase tracking-widest text-[var(--color-muted-foreground)] mr-2 flex items-center gap-2 shrink-0 w-full sm:w-auto'
          )}
        >
          {group.icon ?? <Filter className="w-3.5 h-3.5" aria-hidden />}
          {group.label}:
        </div>
        <div className={cn(compact ? 'filter-chip-scroll' : 'flex flex-wrap items-center gap-2')}>
          {group.options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => group.onChange(option.id)}
              aria-pressed={group.value === option.id}
              className={cn(
                'filter-chip',
                compact && 'filter-chip--compact',
                group.value === option.id && 'filter-chip--active'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    ));

  const resetButton = (compact: boolean) =>
    hasActiveFilters ? (
      <button
        type="button"
        onClick={onClear}
        aria-label={t('common.reset')}
        className={cn(
          'filter-reset',
          compact && 'filter-reset--compact'
        )}
      >
        <X className="w-3.5 h-3.5 shrink-0" aria-hidden />
        <span className={cn(compact && 'sr-only sm:not-sr-only')}>{t('common.reset')}</span>
      </button>
    ) : null;

  return (
    <div className={cn('filter-bar', className)}>
      {/* ——— Mobile ——— */}
      <div className="flex flex-col gap-2 md:hidden">
        <div className="flex items-center gap-2">
          {searchInput}
          {hasCollapsibleChips && (
            <button
              type="button"
              onClick={() => setMobileChipsOpen((open) => !open)}
              aria-expanded={mobileChipsOpen}
              className={cn(
                'filter-toggle shrink-0',
                mobileChipsOpen && 'filter-toggle--open',
                hasActiveChips && 'filter-toggle--active'
              )}
            >
              <Filter className="w-4 h-4" aria-hidden />
              <span className="hidden min-[400px]:inline">{t('common.filter')}</span>
              {activeChipCount > 0 && (
                <span className="filter-toggle__badge">{activeChipCount}</span>
              )}
              <ChevronDown
                className={cn('w-3.5 h-3.5 transition-transform', mobileChipsOpen && 'rotate-180')}
                aria-hidden
              />
            </button>
          )}
          {resetButton(true)}
        </div>

        {segmentedControl}

        {hasCollapsibleChips && mobileChipsOpen && (
          <div className="filter-mobile-panel">{chipGroupsUI(true)}</div>
        )}
      </div>

      {/* ——— Desktop ——— */}
      <div className="hidden md:flex md:flex-col md:gap-5">
        <div className="flex flex-row items-center justify-between gap-5">
          <div className="relative flex-1 max-w-2xl group min-w-0">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search
                className="w-5 h-5 text-[var(--color-muted-foreground)] group-focus-within:text-[var(--primary)] transition-colors"
                aria-hidden
              />
            </div>
            <input
              type="search"
              placeholder={searchPlaceholder ?? t('common.search')}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label={searchPlaceholder ?? t('common.search')}
              className="w-full bg-[var(--card-solid)] border border-[var(--border)] rounded-xl pl-12 pr-6 py-3.5 text-sm font-bold focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] outline-none transition-all shadow-sm group-hover:shadow-md"
            />
          </div>

          {segmentedControl}
          {!segmentedFilter && headerAside}
        </div>

        {visibleChipGroups.length > 0 && (
          <div className="flex flex-row flex-wrap items-center gap-5">
            {chipGroupsUI(false)}
            {resetButton(false)}
          </div>
        )}

        {visibleChipGroups.length === 0 && resetButton(false) && (
          <div className="flex justify-end">{resetButton(false)}</div>
        )}
      </div>
    </div>
  );
}

/** Standard card wrapper — tighter padding on mobile */
export function FilterPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('card-surface filter-panel', className)}>{children}</div>
  );
}
