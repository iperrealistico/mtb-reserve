"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold, Italic, Underline as UnderlineIcon,
    List, ListOrdered, Link as LinkIcon,
    Undo, Redo, Code, Heading1, Heading2
} from 'lucide-react';

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) return null;

    const btnClass = (active: boolean) => `p-2 rounded-md transition-colors ${active ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'
        }`;

    return (
        <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50/50 sticky top-0 z-10 backdrop-blur-sm">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={btnClass(editor.isActive('bold'))}
                title="Bold"
            >
                <Bold className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={btnClass(editor.isActive('italic'))}
                title="Italic"
            >
                <Italic className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={btnClass(editor.isActive('underline'))}
                title="Underline"
            >
                <UnderlineIcon className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1 self-center" />
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={btnClass(editor.isActive('heading', { level: 1 }))}
                title="H1"
            >
                <Heading1 className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={btnClass(editor.isActive('heading', { level: 2 }))}
                title="H2"
            >
                <Heading2 className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1 self-center" />
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={btnClass(editor.isActive('bulletList'))}
                title="Bullet List"
            >
                <List className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={btnClass(editor.isActive('orderedList'))}
                title="Ordered List"
            >
                <ListOrdered className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1 self-center" />
            <button
                type="button"
                onClick={() => {
                    const url = window.prompt('URL');
                    if (url) editor.chain().focus().setLink({ href: url }).run();
                }}
                className={btnClass(editor.isActive('link'))}
                title="Link"
            >
                <LinkIcon className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={btnClass(editor.isActive('code'))}
                title="Code"
            >
                <Code className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1 self-center" />
            <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                className={btnClass(false)}
                title="Undo"
            >
                <Undo className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                className={btnClass(false)}
                title="Redo"
            >
                <Redo className="w-4 h-4" />
            </button>
        </div>
    );
};

export default function RichTextEditor({ content, onChange, placeholder }: { content: string, onChange: (html: string) => void, placeholder?: string }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({ openOnClick: false }),
            Underline,
            Placeholder.configure({ placeholder: placeholder || 'Type something...' }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none min-h-[300px] max-w-none p-4',
            },
        },
    });

    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}
