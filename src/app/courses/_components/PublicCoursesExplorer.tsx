'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, SlidersHorizontal, BookOpen } from 'lucide-react';
import type { PublicCourseSummary } from './types';
import PublicCourseCard from './PublicCourseCard';
import { useTranslation } from '@/hooks/useTranslation';

interface PublicCoursesExplorerProps {
  initialCourses: PublicCourseSummary[];
  categories: string[];
}

type SortOption = 'popular' | 'newest' | 'title';

export default function PublicCoursesExplorer({
  initialCourses,
  categories,
}: PublicCoursesExplorerProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('popular');

  const allCategories = useMemo(() => ['All', ...categories], [categories]);

  const filteredCourses = useMemo(() => {
    let result = initialCourses.filter((course) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        course.title.toLowerCase().includes(q) ||
        course.description.toLowerCase().includes(q) ||
        (course.instructor?.name && course.instructor.name.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === 'All' ||
        course.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });

    if (sortBy === 'popular') {
      result = [...result].sort((a, b) => b.enrolledCount - a.enrolledCount);
    } else if (sortBy === 'newest') {
      result = [...result].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortBy === 'title') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [initialCourses, search, selectedCategory, sortBy]);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
  };

  return (
    <div className="space-y-8">
      {/* Controls Bar */}
      <div className="bg-[var(--card-solid)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-[var(--shadow-sm)] space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('courses.searchCoursesPlaceholder')}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--border)] text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--student-primary)]"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-[var(--color-muted-foreground)]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="py-2.5 px-3 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--border)] text-xs sm:text-sm font-semibold text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--student-primary)]"
            >
              <option value="popular">{t('courses.sortPopular')}</option>
              <option value="newest">{t('courses.sortNewest')}</option>
              <option value="title">{t('courses.sortTitle')}</option>
            </select>
          </div>
        </div>

        {/* Category Chips */}
        {allCategories.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {allCategories.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    isSelected
                      ? 'bg-[var(--student-primary)] text-white shadow-sm'
                      : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted-strong)]'
                  }`}
                >
                  {category === 'All' ? t('courses.allCategories') : category}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Course Count / Active Filters Info */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-[var(--color-muted-foreground)] px-1">
        <span>
          Showing <strong className="text-[var(--color-foreground)]">{filteredCourses.length}</strong> {filteredCourses.length === 1 ? 'course' : 'courses'}
        </span>
        {(search || selectedCategory !== 'All') && (
          <button
            onClick={clearFilters}
            className="font-bold text-[var(--student-primary)] hover:underline"
          >
            {t('common.reset')}
          </button>
        )}
      </div>

      {/* Course Grid / Empty state */}
      {filteredCourses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-[var(--card-solid)] border border-dashed border-[var(--border)] rounded-2xl p-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-[var(--student-soft)] text-[var(--student-primary)] flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 opacity-60" />
          </div>
          <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-2">
            {t('courses.noFilteredResults')}
          </h3>
          <p className="text-sm text-[var(--color-muted-foreground)] max-w-md mx-auto mb-6">
            {t('courses.noFilteredResultsDesc')}
          </p>
          <button
            onClick={clearFilters}
            className="px-6 py-2.5 rounded-xl bg-[var(--student-primary)] text-white text-xs sm:text-sm font-bold hover:bg-[var(--student-hover)] transition-colors shadow-sm"
          >
            {t('common.reset')}
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredCourses.map((course) => (
              <PublicCourseCard key={course._id} course={course} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
