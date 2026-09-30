'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAddLesson, useUpdateLesson, type Lesson } from '@/lib/react-query/hooks';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { LessonForm } from './curriculum/LessonForm';
import { AiCourseActionModal, type AiActionType } from '@/app/(dashboard)/dashboard/student/courses/[id]/_components/AiCourseActionModal';
import { getCourseById } from '@/lib/api/courses';
import { useSessionStore } from '@/store/useSessionStore';
import { isSuperAdmin } from '@/lib/roles';
import { useAlert } from '@/components/ui/AlertContainer';

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
  const queryClient = useQueryClient();
  const { addAlert } = useAlert();

  const session = useSessionStore((s) => s.session);
  const isSuperAdminUser =
    isSuperAdmin(session?.user?.role) ||
    (session?.user as { role?: string } | undefined)?.role === 'superadmin';

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourseById(courseId),
    enabled: !!courseId,
  });

  const [aiModal, setAiModal] = useState<{
    isOpen: boolean;
    actionType: AiActionType | null;
    chapter?: { _id: string; title: string } | null;
    lesson?: { _id: string; title: string } | null;
  }>({
    isOpen: false,
    actionType: null,
    chapter: null,
    lesson: null,
  });

  const handleOpenAiModal = (
    actionType: AiActionType,
    chapter?: { _id: string; title: string } | null,
    lesson?: { _id: string; title: string } | null
  ) => {
    setAiModal({
      isOpen: true,
      actionType,
      chapter: chapter || null,
      lesson: lesson || null,
    });
  };

  return (
    <>
      <CurriculumTreeEditor
        courseId={courseId}
        onEditLesson={setEditingLesson}
        onAddLesson={(chapterId) => setIsAddingLesson({ chapterId })}
        onOpenAiModal={isSuperAdminUser ? handleOpenAiModal : undefined}
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

      {aiModal.isOpen && (
        <AiCourseActionModal
          isOpen={aiModal.isOpen}
          onClose={() => setAiModal((prev) => ({ ...prev, isOpen: false }))}
          actionType={aiModal.actionType}
          courseId={courseId}
          courseTitle={course?.title || 'Course'}
          chapter={aiModal.chapter}
          lesson={aiModal.lesson}
          onSuccess={(message) => {
            queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'curriculum'] });
            queryClient.invalidateQueries({ queryKey: ['course', courseId] });
            queryClient.invalidateQueries({ queryKey: ['quizzes', courseId] });
            addAlert({ type: 'success', message });
          }}
          onError={(message) => {
            addAlert({ type: 'error', message });
          }}
        />
      )}
    </>
  );
}
