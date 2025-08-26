import Quill from 'quill';
import React, { useContext, useEffect, useRef, useState } from 'react';
import Editor from '../components/Editor';
import Delta from 'quill-delta';
import { Range } from 'quill';
import { useParams } from 'react-router-dom';
import { AppSocketContext } from '../utils/context';
import { connectToSocket, getDocumentContent, sendChangesInData } from '../utils/api';

const QuillApp: React.FC = () => {
    const { socket, setSocket } = useContext(AppSocketContext);
    console.log("Socket: ", socket);
    const { documentID } = useParams();
    const [content, setContent] = useState<string>('');
    const [range, setRange] = useState<Range | null>(null);
    const [lastChange, setLastChange] = useState<{"Delta": Delta, "Source": "Broadcast" | undefined} | null>(null);
    const [readOnly, setReadOnly] = useState<boolean>(false);

    const quillRef = useRef<Quill | null>(null);

    useEffect(() => {
        if(lastChange?.Source === "Broadcast"){
            quillRef.current?.updateContents(lastChange.Delta);
        }
        else {
            sendChangesInData(socket!, documentID!, ((lastChange?.Delta as Delta)?.ops));
        }
    }, [lastChange]);

    useEffect(() => {
        if (socket === null) {
            const token = localStorage.getItem('token');
            if (token) {
                const currentSocket = connectToSocket(token);
                currentSocket.then((socket) => {
                    if (socket === null) {
                        localStorage.removeItem('token');
                    }
                    else {
                        setSocket?.(socket);
                    }
                })
            }
        }
        else{
            getDocumentContent(socket, documentID!).then(response => {
                if(response.type === "error"){
                    alert("An error occured!");
                }
                else{
                    setContent(response.content !);
                }
            });
            socket.on("editDocument", (request) => {
                console.log("Changes received: ", request);
                setLastChange({Delta: new Delta(request.changes), Source: "Broadcast"});
            })
        }
    }, [socket]);

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
                            .insert(content)
                    }
                    onSelectionChange={setRange}
                    onTextChange={(delta) => {
                        if(lastChange?.Source === "Broadcast"){
                            return;
                        }
                        setLastChange({Delta: delta as Delta, Source: undefined});
                    }}
                />
            </div>
        </div>
    );
};

export default QuillApp;