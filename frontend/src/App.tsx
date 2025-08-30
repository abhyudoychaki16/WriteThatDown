import React from "react";
import QuillApp from "./pages/QuillApp";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthPage from "./pages/AuthPage";

import { AppSocketProvider } from "./utils/context";
import FolderPage from "./pages/FoldersPage";
import DocumentsPage from "./pages/DocumentsPage";

const App: React.FC = () => {
    return (
        <AppSocketProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<AuthPage />} />
                    <Route path="/folders" element={<FolderPage />} />
                    <Route path="/folders/:id" element={<DocumentsPage />} />
                    <Route path="/document/:documentID/:documentName" element={<QuillApp />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </AppSocketProvider>
    );
};

export default App;
