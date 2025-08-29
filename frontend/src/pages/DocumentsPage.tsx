import React, { useContext, useEffect, useState } from "react";
import { connectToSocket, createDocumentInFolder, getFolderContents } from "../utils/api";
import { AppSocketContext } from "../utils/context";
import { useNavigate, useParams } from "react-router-dom";
import DocumentCard from "../components/DocumentCard";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Fab, TextField, Typography } from "@mui/material";
import Logout from "../components/Logout";
import AddIcon from '@mui/icons-material/Add';

const DocumentsPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { socket, setSocket } = useContext(AppSocketContext);
    const [documents, setDocuments] = useState<string[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [newDocumentName, setNewDocumentName] = useState<string>('');
    useEffect(() => {
        if (socket === null) {
            const token = localStorage.getItem('token');
            console.log("Token: ", token);
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
            getFolderContents(socket!, id!).then(response => {
                if (response.type === "error") {
                    alert("Access to folder not allowed");
                    navigate("/folders");
                }
                else {
                    console.log(response.documents)
                    setDocuments(response.documents!);
                }
            })
        }
    }, [socket]);
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
                    Documents Page
                </Typography>
                <Logout />
            </Box>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '2%', marginTop:'2%'}}>
                {documents.map((document, index) => <DocumentCard key={index} document={document} />)}
                {documents.length === 0 &&
                    <div style={{width: '100vw', height: '50vh', display:'flex', justifyContent:'center', alignItems:'center'}}>
                        <Typography variant="overline" gutterBottom sx={{ display: 'block' }}>
                            NO DOCUMENTS TO SHOW!
                        </Typography>
                    </div>
                }
            </div>
            <div style={{position: 'fixed', bottom: '2rem', right: '2rem', zIndex: '1000'}}>
                <Fab color="primary" aria-label="add" onClick={handleOpenDialog}>
                    <AddIcon />
                </Fab>
            </div>
            <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
                <DialogTitle>Add New Document</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Document Name"
                        fullWidth
                        value={newDocumentName}
                        onChange={(e) => setNewDocumentName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={async () => {
                        const {type, documentID} = await createDocumentInFolder(socket!, newDocumentName, id!);
                        if(type === "error"){
                            alert("Failed to create document!");
                        }
                        else {
                            setDocuments([...documents, documentID!]);
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

export default DocumentsPage;