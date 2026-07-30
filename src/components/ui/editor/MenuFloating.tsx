'use client';

import React from 'react';
import { Editor } from '@tiptap/react';
import { FloatingMenu } from '@tiptap/react/menus';
import {
  Heading1,
  Heading2,
  List,
  CheckSquare,
} from 'lucide-react';
import { ToolbarButton } from './ToolbarButton';

interface MenuFloatingProps {
  editor: Editor | null;
  theme?: 'student' | 'teacher';
}

export const MenuFloating = ({ editor, theme = 'teacher' }: MenuFloatingProps) => {
  if (!editor) return null;

  return (
    <FloatingMenu
      editor={editor}
      options={{ 
        offset: 12,
        placement: 'right-start'
      }}
      className="flex items-center gap-1 p-1 bg-[var(--card-solid)]/90 border border-[var(--color-border)] rounded-xl shadow-lg backdrop-blur-md"
    >
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
        theme={theme}
        className="p-1.5"
      >
        <Heading1 className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
        theme={theme}
        className="p-1.5"
      >
        <Heading2 className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet List"
        theme={theme}
        className="p-1.5"
      >
        <List className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        isActive={editor.isActive('taskList')}
        title="Task List"
        theme={theme}
        className="p-1.5"
      >
        <CheckSquare className="w-4 h-4" />
      </ToolbarButton>
    </FloatingMenu>
  );
};
