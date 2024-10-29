import styled from '@emotion/styled';
import { Box, Typography } from '@mui/material';
import React from 'react'
import { useNavigate } from 'react-router-dom';

interface DocumentCardProps {
    document: string,
}

const FolderContainer = styled(Box)({
    width: 'fit-content',
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

const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
    const navigate = useNavigate();

    const handleFolderClick = () => {
        navigate(`/document/${document}`);
    }

    return (
        <div onClick={handleFolderClick} style={{cursor: 'pointer'}}>
            <Box position="relative" display="inline-block">
                <FolderTab />
                <FolderContainer>
                    <Typography variant="h6">{document}</Typography>
                </FolderContainer>
            </Box>
        </div>
    )
}

export default DocumentCard
