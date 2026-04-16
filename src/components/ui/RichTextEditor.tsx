'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Quote,
  Undo,
  Redo,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  placeholder = 'Write something...',
  className,
  theme = 'emerald',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Link.configure({
        openOnClick: false,
        linkOnPaste: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return (
      <div className="w-full h-64 bg-gray-50 border border-gray-200 rounded-xl animate-pulse" />
    );
  }

  const themeColors = {
    indigo: {
      active: 'bg-indigo-100 text-indigo-700',
      hover: 'hover:bg-gray-100',
      ring: 'focus-visible:ring-indigo-500',
    },
    emerald: {
      active: 'bg-emerald-100 text-emerald-700',
      hover: 'hover:bg-gray-100',
      ring: 'focus-visible:ring-emerald-500',
    },
  };

  const colors = themeColors[theme];

  const ToolbarButton = ({
    onClick,
    isActive,
    disabled,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'p-2 rounded-lg transition-all duration-200',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        colors.hover,
        isActive && colors.active,
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
        colors.ring
      )}
    >
      {children}
    </button>
  );

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div
      className={cn(
        'w-full bg-gray-50 text-gray-900 border border-gray-200 rounded-xl overflow-hidden',
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-3 border-b border-gray-100 bg-gray-50/50">
        {/* Text Style */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Headings */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Lists */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Link & Quote */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={setLink}
            isActive={editor.isActive('link')}
            title="Add Link"
          >
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <div className="flex-1" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative">
        <EditorContent
          editor={editor}
          className={cn(
            'prose prose-sm sm:prose-base max-w-none',
            'min-h-[300px] max-h-[500px] overflow-y-auto',
            'p-4 focus:outline-none',
            'prose-headings:font-semibold prose-headings:text-gray-900',
            'prose-p:text-gray-700 prose-p:leading-relaxed',
            'prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline',
            'prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic',
            'prose-ul:list-disc prose-ol:list-decimal',
            '[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[300px]',
            '[&_.ProseMirror_p.is-empty]:before:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-empty]:before:text-gray-400 [&_.ProseMirror_p.is-empty]:before:float-left [&_.ProseMirror_p.is-empty]:before:pointer-events-none',
            theme === 'emerald' && 'prose-a:text-emerald-600'
          )}
        />
      </div>

      {/* Character Count */}
      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-500 flex justify-between">
        <span>
          {editor.storage.characterCount?.characters?.() || editor.getText().length} characters
        </span>
        <span className="text-gray-400">
          Use toolbar to format text
        </span>
      </div>
    </div>
  );
}
