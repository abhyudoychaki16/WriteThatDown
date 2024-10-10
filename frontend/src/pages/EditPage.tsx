import React from 'react';
import DocumentEditor from '../components/DocumentEditor';

const EditPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <DocumentEditor/>
        </div>
    )
}

export default EditPage;