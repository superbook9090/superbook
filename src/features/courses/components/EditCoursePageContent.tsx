'use client';

import { useState } from 'react';
import CreateCourseForm from '@/features/courses/components/CreateCourseForm';
import CurriculumEditor from '@/features/courses/components/CurriculumEditor';
import { useTranslation } from '@/hooks/useTranslation';
import { Settings, Layout } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EditCoursePageContent({ courseId }: { courseId: string }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'basic' | 'curriculum'>('curriculum');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-foreground)]">
          {t('createCoursePage.editTitle')}
        </h1>
        <p className="mt-2 text-[var(--color-muted-foreground)]">
          {t('createCoursePage.editDescription')}
        </p>
      </div>

      <div className="flex gap-1 mb-8 bg-[var(--color-surface-muted)] p-1 rounded-2xl w-fit border border-[var(--color-border)]">
        <button
          onClick={() => setActiveTab('basic')}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all",
            activeTab === 'basic' 
              ? "bg-[var(--card-solid)] text-[var(--color-foreground)] shadow-sm" 
              : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
          )}
        >
          <Settings className="w-4 h-4" />
          {t('courseEdit.basicInfo')}
        </button>
        <button
          onClick={() => setActiveTab('curriculum')}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all",
            activeTab === 'curriculum' 
              ? "bg-[var(--card-solid)] text-[var(--color-foreground)] shadow-sm" 
              : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
          )}
        >
          <Layout className="w-4 h-4" />
          {t('courseEdit.curriculum')}
        </button>
      </div>

      <div className={cn(
        "bg-[var(--card-solid)] shadow-xl rounded-3xl border border-[var(--color-border)] overflow-hidden",
        activeTab === 'curriculum' ? "p-0" : "p-6 md:p-10"
      )}>
        {activeTab === 'basic' ? (
          <CreateCourseForm courseId={courseId} />
        ) : (
          <div className="p-6 md:p-10">
            <CurriculumEditor courseId={courseId} />
          </div>
        )}
      </div>
    </div>
  );
}
