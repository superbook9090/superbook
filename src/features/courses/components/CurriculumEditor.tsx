'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useAddLesson, useUpdateLesson, type Lesson } from '@/lib/react-query/hooks';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { LessonForm } from './curriculum/LessonForm';

const CurriculumTreeEditor = dynamic(() => import('./curriculum/CurriculumTreeEditor'), {
  loading: () => <PageSkeleton variant="embed" />,
});

interface CurriculumEditorProps {
  courseId: string;
}

export default function CurriculumEditor({ courseId }: CurriculumEditorProps) {
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [isAddingLesson, setIsAddingLesson] = useState<{ chapterId: string } | null>(null);
  const addLesson = useAddLesson();
  const updateLesson = useUpdateLesson();

  return (
    <>
      <CurriculumTreeEditor
        courseId={courseId}
        onEditLesson={setEditingLesson}
        onAddLesson={(chapterId) => setIsAddingLesson({ chapterId })}
      />

      {(editingLesson || isAddingLesson) && (
        <LessonForm
          key={editingLesson?._id ?? isAddingLesson?.chapterId ?? 'new'}
          lesson={editingLesson}
          chapterId={isAddingLesson?.chapterId}
          onClose={() => {
            setEditingLesson(null);
            setIsAddingLesson(null);
          }}
          onSave={(data: Partial<Lesson>) => {
            if (editingLesson) {
              updateLesson.mutate({ lessonId: editingLesson._id, data });
            } else if (isAddingLesson) {
              addLesson.mutate({ chapterId: isAddingLesson.chapterId, data });
            }
            setEditingLesson(null);
            setIsAddingLesson(null);
          }}
          isSaving={updateLesson.isPending || addLesson.isPending}
        />
      )}
    </>
  );
}
