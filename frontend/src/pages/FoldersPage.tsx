import React, { useContext, useEffect, useState } from "react";
import FolderCard from "../components/FolderCard";
import { connectToSocket, createNewFolder, getFoldersForUser } from "../utils/api";
import { AppSocketContext } from "../utils/context";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Fab, TextField, Typography } from "@mui/material";
import Logout from "../components/Logout";
import AddIcon from '@mui/icons-material/Add';

const FoldersPage: React.FC = () => {
    const { socket, setSocket } = useContext(AppSocketContext);
    const [folders, setFolders] = useState<{ id: string, name: string }[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [newFolderName, setNewFolderName] = useState<string>('');
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
        else {
            getFoldersForUser(socket!).then(responseFolders => {
                setFolders(responseFolders);
            });
        }
    }, [socket])

    const handleOpenDialog = () => {
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
    };

    return (
        <div>
            <Box display="flex" alignItems="center" gap={2} justifyContent='space-between'>
                <Typography variant="h1" style={{ width: 'fit-content', fontSize: '2rem' }}>
                    Folder Page
                </Typography>
                <Logout />
            </Box>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '2%', marginTop: '2%' }}>
                {folders.map(folder => <FolderCard key={folder.id} folder={folder} />)}
                {folders.length === 0 &&
                    <div style={{width: '100vw', height: '50vh', display:'flex', justifyContent:'center', alignItems:'center'}}>
                        <Typography variant="overline" gutterBottom sx={{ display: 'block' }}>
                            NO FOLDERS TO SHOW!
                        </Typography>
                    </div>
                }
            </div>
            <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: '1000' }}>
                <Fab color="primary" aria-label="add" onClick={handleOpenDialog}>
                    <AddIcon />
                </Fab>
            </div>
            <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
                <DialogTitle>Add New Folder</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Folder Name"
                        fullWidth
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={async () => {
                        const { type, folderID } = await createNewFolder(socket!, newFolderName);
                        if (type === "error") {
                            alert("Failed to create document!");
                        }
                        else {
                            setFolders([...folders, { id: folderID!, name: newFolderName }]);
                        }
                        handleCloseDialog();
                    }} color="primary">
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default FoldersPage;