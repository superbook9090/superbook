import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { isTreeLikeText, normalizePasteText } from '@/lib/editor/treePaste';

/**
 * When pasting syllabus-style tree text (│ ├── └──), insert a code block
 * so whitespace and box-drawing characters are preserved.
 */
export const PreserveTreePaste = Extension.create({
  name: 'preserveTreePaste',

  addProseMirrorPlugins() {
    const editor = this.editor;

    return [
      new Plugin({
        key: new PluginKey('preserveTreePaste'),
        props: {
          handlePaste: (_view, event) => {
            const text = event.clipboardData?.getData('text/plain');
            if (!text || !isTreeLikeText(text)) return false;

            event.preventDefault();

            const normalized = normalizePasteText(text);
            editor
              .chain()
              .focus()
              .insertContent({
                type: 'codeBlock',
                attrs: { language: 'plaintext' },
                content: [{ type: 'text', text: normalized }],
              })
              .run();

            return true;
          },
        },
      }),
    ];
  },
});
