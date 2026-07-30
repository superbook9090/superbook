'use client';

import React, { useState, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link as LinkIcon,
  Unlink,
} from 'lucide-react';
import { ToolbarButton } from './ToolbarButton';
import { LinkInput } from './LinkInput';

interface MenuBubbleProps {
  editor: Editor | null;
  theme?: 'student' | 'teacher';
}

export const MenuBubble = ({ editor, theme = 'teacher' }: MenuBubbleProps) => {
  const [isEditingLink, setIsEditingLink] = useState(false);

  const setLink = useCallback((url: string) => {
    if (!editor) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
    setIsEditingLink(false);
  }, [editor]);

  const removeLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setIsEditingLink(false);
  }, [editor]);

  if (!editor) return null;

  return (
    <BubbleMenu
      editor={editor}
      options={{ 
        placement: 'top',
        offset: 8,
        onHide: () => setIsEditingLink(false)
      }}
      shouldShow={({ from, to }) => {
        // Only show if there's a selection or we're on a link
        return from !== to || editor.isActive('link');
      }}
      className="flex items-center gap-0.5 p-1 bg-[var(--card-solid)] border border-[var(--color-border)] rounded-xl shadow-xl backdrop-blur-md"
    >
      {isEditingLink ? (
        <LinkInput
          initialUrl={editor.getAttributes('link').href}
          onSave={setLink}
          onCancel={() => setIsEditingLink(false)}
          onRemove={removeLink}
          theme={theme}
        />
      ) : (
        <>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
            theme={theme}
            className="p-1.5"
          >
            <Bold className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
            theme={theme}
            className="p-1.5"
          >
            <Italic className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline"
            theme={theme}
            className="p-1.5"
          >
            <Underline className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strike"
            theme={theme}
            className="p-1.5"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            title="Code"
            theme={theme}
            className="p-1.5"
          >
            <Code className="w-3.5 h-3.5" />
          </ToolbarButton>
          
          <div className="w-px h-4 bg-[var(--color-border)] mx-0.5" />

          <ToolbarButton
            onClick={() => setIsEditingLink(true)}
            isActive={editor.isActive('link')}
            title="Link"
            theme={theme}
            className="p-1.5"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </ToolbarButton>
          
          {editor.isActive('link') && (
            <ToolbarButton
              onClick={removeLink}
              title="Remove Link"
              theme={theme}
              className="p-1.5 text-[var(--color-error)] hover:text-[var(--color-error)]/80"
            >
              <Unlink className="w-3.5 h-3.5" />
            </ToolbarButton>
          )}
        </>
      )}
    </BubbleMenu>
  );
};
