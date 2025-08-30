import styled from '@emotion/styled';
import { Box, Typography } from '@mui/material';
import React from 'react'
import { useNavigate } from 'react-router-dom';

interface FolderCardProps {
    folder: {
        name: string,
        id: string,
    }
}

const FolderContainer = styled(Box)({
    width: 'fit-content',
    minWidth: '220px',
    height: '115px',
    backgroundColor: '#1976d2', // Main folder color
    color: '#ffffff', // Text color
    borderRadius: '4px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '20px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
});

const FolderTab = styled(Box)({
    position: 'absolute',
    top: '-15px',
    left: '0',
    width: '60px',
    height: '30px',
    backgroundColor: '#2196f3', // Tab color
    borderRadius: '4px 4px 0 0',
});

const FolderCard: React.FC<FolderCardProps> = ({ folder }) => {
    const navigate = useNavigate();

    const handleFolderClick = () => {
        navigate(`/folders/${folder.id}`);
    }

    return (
        <div onClick={handleFolderClick} style={{cursor: 'pointer'}}>
            <Box position="relative" display="inline-block">
                <FolderTab />
                <FolderContainer>
                    <Typography variant="h6">{folder.name}</Typography>
                </FolderContainer>
            </Box>
        </div>
    )
}

export default FolderCard
