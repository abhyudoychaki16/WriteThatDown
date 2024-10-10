import { Color } from '@tiptap/extension-color'
import ListItem from '@tiptap/extension-list-item'
import Underline from '@tiptap/extension-underline'
import { EditorProvider, EditorContextValue } from '@tiptap/react'
import FontFamily from '@tiptap/extension-font-family'
import TextStyle from '@tiptap/extension-text-style'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'
import MenuBar from '../components/MenuBar'


const extensions = [
    Color.configure({ types: [TextStyle.name, ListItem.name] }),
    TextStyle.configure({ types: [ListItem.name] }),
    StarterKit.configure({
        bulletList: {
            keepMarks: true,
            keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
        },
        orderedList: {
            keepMarks: true,
            keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
        },
    }),
    Underline,
    FontFamily
]

const content = ``
const editorProps = {
    attributes: {
        class: 'w-[95vw] mx-auto py-6 px-8 bg-white shadow-lg border rounded-sm focus:outline-none text-lg leading-relaxed h-screen',

    },
}
const TipTap: React.FC = () => {
    const handleUpdate = ({ editor }: EditorContextValue) => {
        console.log('Content updated:', editor?.getHTML())
    }

    return (
        <div className=''>
            <EditorProvider
                slotBefore={<MenuBar />}
                extensions={extensions}
                content={content}
                editorProps={editorProps}
                onUpdate={handleUpdate}
            >
            </EditorProvider>
        </div>
    )
}

export default TipTap;
