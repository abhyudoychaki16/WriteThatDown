import React, { useContext, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { AppSocketContext } from "../utils/context";
import { LogoutOutlined } from '@mui/icons-material';

const Logout: React.FC = () => {
    const { socket, setSocket } = useContext(AppSocketContext);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleLogout = () => {
        if (socket) {
            socket.disconnect();
            setSocket?.(null);
        }
        localStorage.removeItem('token');
        setIsDialogOpen(false);
        window.location.href = "/login";
    };

    const openDialog = () => setIsDialogOpen(true);
    const closeDialog = () => setIsDialogOpen(false);

    return (
        <>
            <Button onClick={openDialog}>
                <LogoutOutlined />
            </Button>
            <Dialog open={isDialogOpen} onClose={closeDialog}>
                <DialogTitle>Confirm Logout</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to log out?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} color="primary">
                        No
                    </Button>
                    <Button onClick={handleLogout} color="secondary">
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Logout;
