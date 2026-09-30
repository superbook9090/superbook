'use client';

import { useMemo } from 'react';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FolderPlus, Sparkles } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { Chapter, Lesson } from '@/lib/react-query/hooks';
import { countTopicLessons, type CurriculumChapterNode, type CurriculumQuiz } from '@/lib/curriculum/tree';
import { CurriculumQuizBlock } from './CurriculumQuizBlock';
import { sortableId } from '@/lib/curriculum/sortable';
import { cn } from '@/lib/utils';
import { ChapterRowHeader } from './ChapterRowHeader';
import { LessonList } from './LessonList';
import { SortableSubTopic } from './SortableSubTopic';
import type { AiActionType } from '@/app/(dashboard)/dashboard/student/courses/[id]/_components/AiCourseActionModal';

export function SortableTopic({
  topic,
  courseId,
  expanded,
  onToggle,
  editingId,
  setEditingId,
  isExpanded,
  toggleExpanded,
  onDelete,
  onDeleteSub,
  onAddSubTopic,
  onEditLesson,
  onDeleteLesson,
  onAddLesson,
  onDeleteQuiz,
  onOpenAiModal,
}: {
  topic: Chapter & Pick<CurriculumChapterNode, 'quizzes'>;
  courseId: string;
  expanded: boolean;
  onToggle: () => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  isExpanded: (id: string) => boolean;
  toggleExpanded: (id: string) => void;
  onDelete: () => void;
  onDeleteSub: (subId: string) => void;
  onAddSubTopic: (topicId: string) => void;
  onEditLesson: (lesson: Lesson) => void;
  onDeleteLesson: (id: string) => void;
  onAddLesson: (chapterId: string) => void;
  onDeleteQuiz: (quiz: CurriculumQuiz) => void;
  onOpenAiModal?: (
    action: AiActionType,
    chapter?: { _id: string; title: string } | null,
    lesson?: { _id: string; title: string } | null
  ) => void;
}) {
  const { t } = useTranslation();
  const id = sortableId('topic', topic._id);
  const { setNodeRef, transform, transition, isDragging, attributes, listeners } = useSortable({ id });
  const subIds = useMemo(
    () => (topic.subChapters ?? []).map((s) => sortableId('subtopic', s._id)),
    [topic.subChapters]
  );

  return (
    <div
      className={cn(
        'bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all',
        isDragging && 'opacity-50 ring-2 ring-[var(--color-primary)]/30'
      )}
    >
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        className="p-3 sm:p-4 flex items-center gap-2"
      >
        <ChapterRowHeader
          chapter={topic}
          courseId={courseId}
          editingId={editingId}
          setEditingId={setEditingId}
          expanded={expanded}
          onToggle={onToggle}
          onDelete={onDelete}
          dragLabel={t('curriculum.dragTopic')}
          lessonCount={countTopicLessons(topic)}
          attributes={attributes}
          listeners={listeners}
          variant="topic"
          onOpenAiModal={onOpenAiModal}
        />
      </div>

      {expanded && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-background)]/30">
          <div className="p-3 sm:p-4 space-y-4">
            {onOpenAiModal && (
              <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/25 flex-wrap">
                <span className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  AI Chapter Tools:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => onOpenAiModal('add-lesson', topic)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/40 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    add lesson using AI
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenAiModal('add-chapter', topic)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/40 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    add chapter using AI
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenAiModal('add-quiz', topic)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/40 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    add quiz using AI
                  </button>
                </div>
              </div>
            )}

            <LessonList
              chapterId={topic._id}
              courseId={courseId}
              lessons={topic.lessons ?? []}
              onEditLesson={onEditLesson}
              onDeleteLesson={onDeleteLesson}
              onAddLesson={onAddLesson}
              onDeleteQuiz={onDeleteQuiz}
              onOpenAiModal={onOpenAiModal}
            />

            <CurriculumQuizBlock
              courseId={courseId}
              quizzes={topic.quizzes ?? []}
              placement="chapter"
              chapterId={topic._id}
              onDeleteQuiz={onDeleteQuiz}
            />

            <SortableContext items={subIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {(topic.subChapters ?? []).map((sub) => (
                  <SortableSubTopic
                    key={sub._id}
                    sub={sub as Chapter & Pick<CurriculumChapterNode, 'quizzes' | 'lessons'>}
                    courseId={courseId}
                    expanded={isExpanded(sub._id)}
                    onToggle={() => toggleExpanded(sub._id)}
                    editingId={editingId}
                    setEditingId={setEditingId}
                    onDelete={() => onDeleteSub(sub._id)}
                    onEditLesson={onEditLesson}
                    onDeleteLesson={onDeleteLesson}
                    onAddLesson={onAddLesson}
                    onDeleteQuiz={onDeleteQuiz}
                    onOpenAiModal={onOpenAiModal}
                  />
                ))}
              </div>
            </SortableContext>

            <button
              type="button"
              onClick={() => onAddSubTopic(topic._id)}
              className="w-full flex items-center justify-center gap-2 p-3 min-h-[44px] border border-[var(--color-border)] rounded-xl text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary)]/5 transition-all"
            >
              <FolderPlus className="w-4 h-4" />
              <span className="text-sm font-medium">{t('curriculum.addSubTopic')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
