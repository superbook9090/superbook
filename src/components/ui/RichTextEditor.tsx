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
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

const lowlight = createLowlight(common);

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  theme?: 'indigo' | 'emerald';
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder,
  className,
  theme = 'emerald',
}: RichTextEditorProps) {
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder ?? t('richTextEditor.placeholder');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
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
      TaskItem.configure({
        nested: true,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-xl border border-[var(--color-border)] shadow-lg max-w-full',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      CharacterCount.configure({
        limit: 50000,
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-6 sm:p-8',
          'prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-[var(--color-foreground)]',
          'prose-h1:text-3xl sm:prose-h1:text-4xl prose-h1:mb-6',
          'prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-8',
          'prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-6',
          'prose-p:leading-relaxed prose-p:text-[var(--color-foreground)] prose-p:mb-4',
          'prose-blockquote:border-l-4 prose-blockquote:border-[var(--color-primary)] prose-blockquote:bg-[var(--color-accent)]/30 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:italic prose-blockquote:my-6',
          'prose-code:text-[var(--color-primary)] prose-code:bg-[var(--color-accent)]/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none',
          'prose-pre:bg-[var(--color-foreground)] dark:prose-pre:bg-black prose-pre:rounded-xl prose-pre:border prose-pre:border-[var(--color-border)] prose-pre:p-4 prose-pre:my-6',
          'prose-ul:list-disc prose-ol:list-decimal prose-ul:my-4 prose-ol:my-4',
          'prose-li:my-1',
          'prose-img:rounded-2xl prose-img:shadow-2xl prose-img:mx-auto prose-img:my-8',
          'selection:bg-[var(--color-accent)]'
        ),
      },
    },
  });

  const characterCount = editor?.storage.characterCount.characters() ?? 0;
  const wordCount = editor?.storage.characterCount.words() ?? 0;

  if (!editor) {
    return (
      <div className="w-full h-80 bg-[var(--color-background)] border border-[var(--color-border)] rounded-2xl animate-pulse flex items-center justify-center">
        <div className="text-[var(--color-muted)] text-sm">Initializing editor...</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group relative w-full bg-[var(--card-solid)] border border-[var(--color-border)] rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[var(--color-primary)]/5 hover:border-[var(--color-primary)]/20 shadow-xl',
        className
      )}
    >
      {/* Toolbar */}
      <Toolbar editor={editor} theme={theme} />

      {/* Menus */}
      <MenuBubble editor={editor} theme={theme} />
      <MenuFloating editor={editor} theme={theme} />

      {/* Editor Content */}
      <div className="relative scrollbar-hide">
        <EditorContent editor={editor} />
        
        {/* Placeholder styling is handled via editorProps class and CSS */}
        <style jsx global>{`
          .ProseMirror {
            outline: none !important;
          }
          .ProseMirror p.is-editor-empty:first-child::before {
            content: attr(data-placeholder);
            float: left;
            color: var(--muted-light);
            pointer-events: none;
            height: 0;
          }
          .ProseMirror h1 {
            font-size: 2.25rem;
            line-height: 2.5rem;
            font-weight: 800;
            margin-top: 1.5rem;
            margin-bottom: 1rem;
            color: var(--foreground);
          }
          .ProseMirror h2 {
            font-size: 1.875rem;
            line-height: 2.25rem;
            font-weight: 700;
            margin-top: 1.25rem;
            margin-bottom: 0.75rem;
            color: var(--foreground);
          }
          .ProseMirror h3 {
            font-size: 1.5rem;
            line-height: 2rem;
            font-weight: 600;
            margin-top: 1rem;
            margin-bottom: 0.5rem;
            color: var(--foreground);
          }
          .ProseMirror .taskList {
            list-style: none;
            padding: 0;
          }
          .ProseMirror .taskList li {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            margin-bottom: 0.5rem;
          }
          .ProseMirror .taskList li > label {
            flex: 0 0 auto;
            user-select: none;
            margin-top: 0.25rem;
          }
          .ProseMirror .taskList li > div {
            flex: 1 1 auto;
          }
          .ProseMirror .taskList input[type="checkbox"] {
            cursor: pointer;
            width: 1.25rem;
            height: 1.25rem;
            border-radius: 0.375rem;
            border: 2px solid var(--border);
            appearance: none;
            position: relative;
            background: var(--card-solid);
            transition: all 0.2s;
          }
          .ProseMirror .taskList input[type="checkbox"]:checked {
            background-color: var(--color-primary);
            border-color: var(--color-primary);
          }
          .ProseMirror .taskList input[type="checkbox"]:checked::after {
            content: "";
            position: absolute;
            left: 0.35rem;
            top: 0.1rem;
            width: 0.4rem;
            height: 0.7rem;
            border: solid white;
            border-width: 0 0.15rem 0.15rem 0;
            transform: rotate(45deg);
          }
        `}</style>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--color-border)] bg-[var(--color-background)]/50 text-[10px] font-medium tracking-wider uppercase text-[var(--color-muted)] transition-colors">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-[var(--color-success)] animate-pulse" />
            <span>{characterCount} Characters</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-[var(--color-info)]" />
            <span>{wordCount} Words</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded border border-[var(--color-border)] bg-[var(--card-solid)] text-[9px]">⌘</kbd>
            <span>Markdown Ready</span>
          </span>
        </div>
      </div>
    </div>
  );
}

