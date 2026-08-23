'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { LazyCreateCourseForm, LazyCurriculumEditor } from '@/lib/lazy';
import { Settings, Layout, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import CourseActionBar from './CourseActionBar';
import { TeacherDoubtsTab } from '@/app/(dashboard)/dashboard/teacher/courses/[id]/_components/TeacherDoubtsTab';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function EditCoursePageContent({ courseId }: { courseId: string }) {
  const { t } = useTranslation();
  const { isFeatureEnabled } = useSettingsStore();
  const doubtsEnabled = isFeatureEnabled('enableCourseDoubts');
  
  const [activeTab, setActiveTab] = useState<'basic' | 'curriculum' | 'doubts'>('curriculum');

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">
            {t('createCoursePage.editTitle')}
          </h1>
          <p className="mt-2 text-[var(--color-muted-foreground)]">
            {t('createCoursePage.editDescription')}
          </p>
        </div>
        <CourseActionBar courseId={courseId} />
      </div>

      <div className="flex gap-1 mb-8 bg-[var(--color-surface-muted)] p-1 rounded-2xl w-fit border border-[var(--color-border)]">
        <button
          type="button"
          onClick={() => setActiveTab('basic')}
          className={cn(
            'flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all',
            activeTab === 'basic'
              ? 'bg-[var(--card-solid)] text-[var(--color-foreground)] shadow-sm'
              : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
          )}
        >
          <Settings className="w-4 h-4" />
          {t('courseEdit.basicInfo')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('curriculum')}
          className={cn(
            'flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all',
            activeTab === 'curriculum'
              ? 'bg-[var(--card-solid)] text-[var(--color-foreground)] shadow-sm'
              : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
          )}
        >
          <Layout className="w-4 h-4" />
          {t('courseEdit.curriculum')}
        </button>
        {doubtsEnabled && (
          <button
            type="button"
            onClick={() => setActiveTab('doubts')}
            className={cn(
              'flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all',
              activeTab === 'doubts'
                ? 'bg-[var(--card-solid)] text-[var(--color-foreground)] shadow-sm'
                : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
            )}
          >
            <MessageCircle className="w-4 h-4" />
            {t('courseDoubts.tabDoubts')}
          </button>
        )}
      </div>

      <div
        className={cn(
          'bg-[var(--card-solid)] shadow-xl rounded-3xl border border-[var(--color-border)] overflow-hidden',
          activeTab === 'curriculum' ? 'p-0' : 'p-6 md:p-10'
        )}
      >
        {activeTab === 'basic' && (
          <LazyCreateCourseForm courseId={courseId} />
        )}
        {activeTab === 'curriculum' && (
          <div className="p-6 md:p-10">
            <LazyCurriculumEditor courseId={courseId} />
          </div>
        )}
        {activeTab === 'doubts' && doubtsEnabled && (
          <div className="p-6 md:p-10">
            <TeacherDoubtsTab courseId={courseId} />
          </div>
        )}
      </div>
    </div>
  );
}
