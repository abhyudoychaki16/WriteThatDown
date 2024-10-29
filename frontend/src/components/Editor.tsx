import Quill from 'quill';
import { Dispatch, forwardRef, MutableRefObject, SetStateAction, useEffect, useLayoutEffect, useRef } from 'react';
import { Delta, EmitterSource, QuillOptions, Range } from 'quill/core';
import 'quill/dist/quill.snow.css';

interface IEditorProps {
    readOnly: boolean;
    defaultValue: Delta;
    onTextChange: Dispatch<SetStateAction<Delta | null>>;
    onSelectionChange: Dispatch<SetStateAction<Range | null>>;
}

const Editor = forwardRef<Quill, IEditorProps>(({ readOnly, defaultValue, onTextChange, onSelectionChange }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const defaultValueRef = useRef<Delta>(defaultValue);
    const onTextChangeRef = useRef<(delta: Delta, oldContent: Delta, source: EmitterSource) => void>(onTextChange);
    const onSelectionChangeRef = useRef<(range: Range, oldRange: Range, source: EmitterSource) => void>(onSelectionChange);

    useLayoutEffect(() => {
        onTextChangeRef.current = onTextChange;
        onSelectionChangeRef.current = onSelectionChange;
    });

    useEffect(() => {
        (ref as MutableRefObject<Quill | null>).current?.enable(!readOnly);
    }, [ref, readOnly]);

    useEffect(() => {
        const container = containerRef.current !;
        const editorContainer: HTMLDivElement = container?.appendChild(
            container.ownerDocument.createElement('div'),
        );
        editorContainer.style.minHeight = '1754px'
        editorContainer.style.width = '1241px'
        const toolbarOptions = [
            [{ 'font': [] }],
            [{ 'size': [] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'color': [] }, { 'background': [] }],
            ['blockquote', 'code-block'],
            [{ 'header': 1 }, { 'header': 2 }],
            [{ 'align': [] }],
            ['link', 'image'],
            ['clean'],
        ];

        const quillOptions: QuillOptions = {
            theme: 'snow',
            modules: {
                toolbar: toolbarOptions,
            },
        };

        const quill = new Quill(editorContainer, quillOptions);

        (ref as MutableRefObject<Quill | null>).current = quill;

        if (defaultValueRef.current) {
            quill.setContents(defaultValueRef.current);
        }

        quill.on(Quill.events.TEXT_CHANGE, (...args) => {
            onTextChangeRef.current?.(...args);
        });

        quill.on(Quill.events.SELECTION_CHANGE, (...args) => {
            onSelectionChangeRef.current?.(...args);
        });

        return () => {
            (ref as MutableRefObject<Quill | null>).current = null;
            container.innerHTML = '';
        };
    }, [ref]);

    return <div ref={containerRef}></div>;
  },
);

Editor.displayName = 'Editor';

export default Editor;