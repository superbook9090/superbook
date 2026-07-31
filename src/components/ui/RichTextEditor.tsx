'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Image from '@tiptap/extension-image';
import CharacterCount from '@tiptap/extension-character-count';
import Typography from '@tiptap/extension-typography';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';

import { Toolbar } from './editor/Toolbar';
import { MenuBubble } from './editor/MenuBubble';
import { MenuFloating } from './editor/MenuFloating';
import { PreserveTreePaste } from './editor/PreserveTreePaste';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

const lowlight = createLowlight(common);

type EditorVariant = 'default' | 'compact';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  theme?: 'student' | 'teacher';
  /** `compact` reduces padding and chrome — use in side panels and dense forms. */
  variant?: EditorVariant;
  /** Minimum editor body height in px. Defaults: 220 (default), 160 (compact). */
  minHeight?: number;
  showStatusBar?: boolean;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder,
  className,
  theme = 'teacher',
  variant = 'default',
  minHeight,
  showStatusBar = true,
}: RichTextEditorProps) {
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder ?? t('richTextEditor.placeholder');
  const isCompact = variant === 'compact';
  const resolvedMinHeight = minHeight ?? (isCompact ? 160 : 220);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        codeBlock: false,
      }),
      Underline,
      Typography,
      Link.configure({
        openOnClick: false,
        linkOnPaste: true,
        HTMLAttributes: {
          class: 'text-[var(--color-primary)] font-medium underline underline-offset-4 cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder: resolvedPlaceholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg border border-[var(--color-border)] max-w-full',
        },
      }),
      CodeBlockLowlight.configure({ lowlight }),
      CharacterCount.configure({ limit: 50000 }),
      PreserveTreePaste,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm dark:prose-invert max-w-none focus:outline-none',
          isCompact ? 'p-3' : 'p-4 sm:p-5',
          'prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-[var(--color-foreground)]',
          'prose-h1:text-2xl prose-h1:mb-3 prose-h1:mt-4',
          'prose-h2:text-xl prose-h2:mb-2 prose-h2:mt-3',
          'prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-2',
          'prose-p:leading-relaxed prose-p:text-[var(--color-foreground)] prose-p:mb-2',
          'prose-blockquote:border-l-4 prose-blockquote:border-[var(--color-primary)] prose-blockquote:bg-[var(--color-accent)]/20 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:italic prose-blockquote:my-3',
          'prose-code:text-[var(--color-primary)] prose-code:bg-[var(--color-accent)]/30 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none',
          'prose-pre:bg-[var(--color-surface-muted)] prose-pre:rounded-lg prose-pre:border prose-pre:border-[var(--color-border)] prose-pre:p-3 prose-pre:my-3',
          'prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5',
          'prose-img:rounded-lg prose-img:mx-auto prose-img:my-4',
          'selection:bg-[var(--color-accent)]'
        ),
        style: `min-height: ${resolvedMinHeight}px`,
      },
    },
  });

  const characterCount = editor?.storage.characterCount.characters() ?? 0;
  const wordCount = editor?.storage.characterCount.words() ?? 0;

  if (!editor) {
    return (
      <div
        className={cn(
          'w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl animate-pulse flex items-center justify-center',
          isCompact ? 'h-40' : 'h-52'
        )}
      >
        <div className="text-[var(--color-muted)] text-xs">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group relative w-full bg-[var(--card-solid)] border border-[var(--color-border)] overflow-hidden transition-colors',
        isCompact ? 'rounded-xl shadow-sm' : 'rounded-xl shadow-md hover:border-[var(--color-primary)]/20',
        className
      )}
    >
      <Toolbar editor={editor} theme={theme} compact={isCompact} />
      <MenuBubble editor={editor} theme={theme} />
      <MenuFloating editor={editor} theme={theme} />

      <div className="relative scrollbar-hide">
        <EditorContent editor={editor} />
        <style jsx global>{`
          .ProseMirror { outline: none !important; }
          .ProseMirror p.is-editor-empty:first-child::before {
            content: attr(data-placeholder);
            float: left;
            color: var(--muted-light);
            pointer-events: none;
            height: 0;
          }
          .ProseMirror h1 { font-size: 1.5rem; font-weight: 700; margin: 0.75rem 0 0.5rem; color: var(--color-foreground); }
          .ProseMirror h2 { font-size: 1.25rem; font-weight: 600; margin: 0.625rem 0 0.375rem; color: var(--color-foreground); }
          .ProseMirror h3 { font-size: 1.125rem; font-weight: 600; margin: 0.5rem 0 0.25rem; color: var(--color-foreground); }
          .ProseMirror ul { list-style-type: disc !important; padding-left: 1.5rem !important; margin: 0.5rem 0 !important; }
          .ProseMirror ol { list-style-type: decimal !important; padding-left: 1.5rem !important; margin: 0.5rem 0 !important; }
          .ProseMirror li { display: list-item !important; margin-bottom: 0.25rem !important; }
          .ProseMirror .taskList { list-style: none; padding: 0; }
          .ProseMirror .taskList li { display: flex; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.375rem; }
          .ProseMirror .taskList li > label { flex: 0 0 auto; user-select: none; margin-top: 0.125rem; }
          .ProseMirror .taskList li > div { flex: 1 1 auto; }
          .ProseMirror .taskList input[type="checkbox"] {
            cursor: pointer; width: 1rem; height: 1rem; border-radius: 0.25rem;
            border: 2px solid var(--border); appearance: none; position: relative;
            background: var(--card-solid); transition: all 0.2s;
          }
          .ProseMirror .taskList input[type="checkbox"]:checked {
            background-color: var(--color-primary); border-color: var(--color-primary);
          }
          .ProseMirror .taskList input[type="checkbox"]:checked::after {
            content: ""; position: absolute; left: 0.28rem; top: 0.05rem;
            width: 0.35rem; height: 0.6rem; border: solid white;
            border-width: 0 0.12rem 0.12rem 0; transform: rotate(45deg);
          }
          .ProseMirror pre {
            white-space: pre-wrap;
            overflow-x: auto;
            font-family: inherit;
            font-size: 0.875rem;
            line-height: 1.6;
            background: var(--color-surface-muted);
            border: 1px solid var(--color-border);
            border-radius: 0.5rem;
            padding: 0.75rem 1rem;
            margin: 0.5rem 0;
            tab-size: 2;
          }
          .ProseMirror pre code {
            white-space: inherit;
            background: none;
            padding: 0;
            font-family: inherit;
            font-size: inherit;
            color: var(--color-foreground);
          }
        `}</style>
      </div>

      {showStatusBar && (
        <div className="flex items-center justify-between px-3 py-1.5 border-t border-[var(--color-border)] bg-[var(--color-background)]/50 text-[10px] font-medium text-[var(--color-muted)]">
          <div className="flex items-center gap-4">
            <span>{characterCount} {t('richTextEditor.characters')}</span>
            <span>{wordCount} {t('richTextEditor.words')}</span>
          </div>
          <span className="hidden sm:inline opacity-60">{t('richTextEditor.treePasteHint')}</span>
        </div>
      )}
    </div>
  );
}
