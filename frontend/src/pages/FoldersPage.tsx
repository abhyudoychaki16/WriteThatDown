import React, { useContext, useEffect, useState } from "react";
import FolderCard from "../components/FolderCard";
import { connectToSocket, getFoldersForUser } from "../utils/api";
import { AppSocketContext } from "../utils/context";

const FoldersPage: React.FC = () => {
    const { socket, setSocket } = useContext(AppSocketContext);
    const [folders, setFolders] = useState<{id: string, name: string}[]>([]);
    useEffect(() => {
        if(socket === null){
            const token = localStorage.getItem('token');
            if(token){
                const currentSocket = connectToSocket(token);
                currentSocket.then((socket) => {
                    if(socket === null){
                        localStorage.removeItem('token');
                    }
                    else{
                        setSocket?.(socket);
                    }
                })
            }
        }
        else{
            getFoldersForUser(socket!).then(responseFolders => {
                setFolders(responseFolders);
            });
        }
    }, [socket])
    return (
        <div>
            <h1>Folder Page</h1>
            <div style={{display: 'flex', flexDirection: 'row', gap: '2%'}}>
                {folders.map(folder => <FolderCard key={folder.id} folder={folder}/>)}
            </div>
        </div>
    )
}

export default FoldersPage;