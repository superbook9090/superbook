'use client';

import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Minus,
  Undo2,
  Redo2,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react';
import { ToolbarButton } from './ToolbarButton';
import { LinkInput } from './LinkInput';
import { AnimatePresence, motion } from 'framer-motion';

interface ToolbarProps {
  editor: Editor | null;
  theme?: 'indigo' | 'emerald';
}

export const Toolbar = ({ editor, theme = 'emerald' }: ToolbarProps) => {
  const [showLinkInput, setShowLinkInput] = useState(false);

  if (!editor) return null;

  const onSaveLink = (url: string) => {
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
    setShowLinkInput(false);
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL'); // Keep prompt for image for now or simplify
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 p-2 bg-[var(--card-solid)]/80 backdrop-blur-md border-b border-[var(--color-border)] transition-all min-h-[52px]">
      <AnimatePresence mode="wait">
        {showLinkInput ? (
          <motion.div
            key="link-input"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1"
          >
            <LinkInput
              initialUrl={editor.getAttributes('link').href}
              onSave={onSaveLink}
              onCancel={() => setShowLinkInput(false)}
              onRemove={() => {
                editor.chain().focus().unsetLink().run();
                setShowLinkInput(false);
              }}
              theme={theme}
            />
          </motion.div>
        ) : (
          <motion.div
            key="toolbar-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap items-center gap-1 w-full"
          >
            {/* History */}
            <div className="flex items-center gap-0.5">
              <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                title="Undo"
                theme={theme}
              >
                <Undo2 className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                title="Redo"
                theme={theme}
              >
                <Redo2 className="w-4 h-4" />
              </ToolbarButton>
            </div>

            <Separator />

            {/* Formatting */}
            <div className="flex items-center gap-0.5">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                title="Bold"
                theme={theme}
              >
                <Bold className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                title="Italic"
                theme={theme}
              >
                <Italic className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive('underline')}
                title="Underline"
                theme={theme}
              >
                <Underline className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive('strike')}
                title="Strike"
                theme={theme}
              >
                <Strikethrough className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleCode().run()}
                isActive={editor.isActive('code')}
                title="Inline Code"
                theme={theme}
              >
                <Code className="w-4 h-4" />
              </ToolbarButton>
            </div>

            <Separator />

            {/* Headings */}
            <div className="flex items-center gap-0.5">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive('heading', { level: 1 })}
                title="Heading 1"
                theme={theme}
              >
                <Heading1 className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
                title="Heading 2"
                theme={theme}
              >
                <Heading2 className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive('heading', { level: 3 })}
                title="Heading 3"
                theme={theme}
              >
                <Heading3 className="w-4 h-4" />
              </ToolbarButton>
            </div>

            <Separator />

            {/* Lists */}
            <div className="flex items-center gap-0.5">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                title="Bullet List"
                theme={theme}
              >
                <List className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                title="Ordered List"
                theme={theme}
              >
                <ListOrdered className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                isActive={editor.isActive('taskList')}
                title="Task List"
                theme={theme}
              >
                <CheckSquare className="w-4 h-4" />
              </ToolbarButton>
            </div>

            <Separator />

            {/* Blocks */}
            <div className="flex items-center gap-0.5">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive('blockquote')}
                title="Quote"
                theme={theme}
              >
                <Quote className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                title="Horizontal Rule"
                theme={theme}
              >
                <Minus className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                isActive={editor.isActive('codeBlock')}
                title="Code Block"
                theme={theme}
              >
                <span className="text-xs font-bold font-mono">JS</span>
              </ToolbarButton>
            </div>

            <Separator />

            {/* Inserts */}
            <div className="flex items-center gap-0.5">
              <ToolbarButton
                onClick={() => setShowLinkInput(true)}
                isActive={editor.isActive('link')}
                title="Add Link"
                theme={theme}
              >
                <LinkIcon className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={addImage}
                title="Add Image"
                theme={theme}
              >
                <ImageIcon className="w-4 h-4" />
              </ToolbarButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Separator = () => (
  <div className="w-px h-6 bg-[var(--color-border)] mx-1 flex-shrink-0" />
);

