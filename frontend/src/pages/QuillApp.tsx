import Quill from 'quill';
import React, { useEffect, useRef, useState } from 'react';
import Editor from '../components/Editor';
import Delta from 'quill-delta';
import { Range } from 'quill';
import { useParams } from 'react-router-dom';

const QuillApp: React.FC = () => {
    // const { socket, setSocket } = useContext(AppSocketContext);
    const { documentID } = useParams();
    const [range, setRange] = useState<Range | null>(null);
    const [lastChange, setLastChange] = useState<Delta | null>(null);
    const [readOnly, setReadOnly] = useState<boolean>(false);

    const quillRef = useRef<Quill | null>(null);

    useEffect(() => {
        console.log(range);
        setReadOnly(false);
    }, [range, lastChange]);
    return (
        <div>
            <div>Document: {documentID}</div>
            <div style={{ width: "1241px", height: "1754px", marginLeft: 'auto', marginRight: 'auto' }}>
                <Editor
                    ref={quillRef}
                    readOnly={readOnly}
                    defaultValue={
                        new Delta()
                            .insert('hello')
                    }
                    onSelectionChange={setRange}
                    onTextChange={setLastChange}
                />
            </div>
        </div>
    );
};

export default QuillApp;