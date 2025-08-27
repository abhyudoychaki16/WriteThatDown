import express from 'express';
import { Server } from 'socket.io'
import { createServer } from 'http';
import { frontendURL, port } from './config';
import cors from 'cors';
import { COMMENT_DOCUMENT, CREATE_DOCUMENT, CREATE_FOLDER, DELETE_DOCUMENT, DELETE_FOLDER, DISCONNECT, EDIT_DOCUMENT, EXIT_DOCUMENT, GET_ALL_FOLDERS, GET_DOCUMENT, GET_FOLDER, LOGIN, MODIFY_DOCUMENT, MODIFY_FOLDER, SAVE_DOCUMENT, SIGNUP } from './socketEventTypes';
import { connectToDatabase } from './db';
import createDocument from './DocumentUtils/CreateDocument';
import createFolder from './FolderUtils/CreateFolder';
import { addCommentToDocument, deleteDocument, editDocument, modifyDocument, viewDocument } from './DocumentUtils/DocumentUtilfns';
import { UserSocket } from './interfaces';
import { createUser } from './UserUtils/CreateUser';
import { deleteFolder, getFoldersForUser, modifyFolder, switchToFolder } from './FolderUtils/FolderUtilfns';
import { verifyJWTTokenAndConnect, verifyUserLogin } from './UserUtils/Login';
import { Role } from './types';
import { debouncedSaveChanges as saveChanges} from './DocumentUtils/DocumentUtilfns';

// express setup
const expressApp = express();
expressApp.use(cors());
expressApp.use(express.json());
expressApp.post('/' + SIGNUP, async (request, response) => {
    console.log(request.body);
    const { name, email, enterprise, password } = request.body;
    try{
        const user = await createUser(name, email, enterprise, password);
        response.send({
            type: "success",
            id: user._id
        });
    }
    catch (error) {
        response.send({
            type: "error",
            error: error
        })
    }
})
const httpServer = createServer(expressApp);

// Socket.IO setup
const io = new Server(httpServer,{
    cors: {
      origin: frontendURL,
      methods: ["GET", "POST"]
    }
});

const connections: {
    [key: string]: UserSocket[]
    // documentID mapped to socket
} = {}

// trying to simulate a reverse lookup here,
// to get the affected document in O(1).
// now, if the user is also connected from multiple
// browser tabs, this will be lead to different socket IDs.
const documentConnectedTo: {
    [socketID: string]: string;
    // socket ID mapped to document ID
} = {}

const updateConnectionsUponDisconnect = ( socketID: string ) => {
    // no socket.send because user disconnecting has nothing to do with informing
    const documentID = documentConnectedTo[socketID];
    if(documentID === undefined){
        return;
    }
    connections[documentID] = connections[documentID].filter(sock => sock.id !== socketID);
    if(connections[documentID].length === 0){
        delete connections[documentID];
    }
    delete documentConnectedTo[documentID];
}

const updateConnectionsUponDocumentDelete = ( documentID: string ) => {
    const sockets = connections[documentID];
    sockets.forEach((sock) => {
        sock.send({
            id: documentID,
            delete: true, // will trigger the frontend to show a delete layover on the frontend
        })
        delete documentConnectedTo[sock.id];
    })
    delete connections[documentID];
}

io.use(async (socket: UserSocket, next) => {
    const token = socket.handshake.auth.token;
    if(token){
        const user = await verifyJWTTokenAndConnect(token);
        if(user){
            // verification successful
            console.log("User validated from token!")
            socket.user = user;
            next();
        }
        else{
            // token expired, login
            socket.disconnect();
        }
    }
    else{
        next();
    }
})

io.on('connection', (socket: UserSocket) => {
    socket.on("hello", (content: string) => {
        console.log(content);
    })
    // 2. log in
    socket.on(LOGIN, async (loginInformation: {
        email: string,
        password: string,
    }, callback) => {
        const { email, password } = loginInformation
        // verify authentication
        const verifiedLogin = await verifyUserLogin(email, password);
        if(!verifiedLogin){
            callback({
                type: "error",
                error: "Invalid Credentials!"
            })
            socket.disconnect();
            return;
        }
        socket.user = verifiedLogin.user;
        // if connection cannot be verified,
        // terminate connection and send
        // disconnect from socket
        console.log(`Login received`)
        console.log(loginInformation);
        callback({
            type: "success",
            token: verifiedLogin.token
        });
        
    })

    // 3. create folder
    socket.on(CREATE_FOLDER, async (folderInformation: {
        name: string,
    }, callback) => {
        const { name } = folderInformation;
        if (!socket.user){
            callback({
                type: "error",
                message: "Login not validated!"
            })
            return;
        }
        const currentUser = socket.user;
        try{
            const folderID = await createFolder(name, String(currentUser._id));
            callback({
                type: "success",
                id: folderID
            });
        }
        catch(error){
            console.log("Error: ", error);
            callback({
                type: "error",
                error: error
            })
        }
    })

    // 4. get folder
    socket.on(GET_FOLDER, async (folderInformation: {
        id: string,
    }, callback) => {
        const { id } = folderInformation;
        if (!socket.user){
            callback({
                type: "error",
                message: "Login not validated!"
            })
            return;
        }
        try{
            const currentUser = socket.user;
            const folder = await switchToFolder(id, String(currentUser._id));
            callback({
                type: "success",
                folder: folder.name,
                documents: folder.documents
            })
        }
        catch(error){
            console.log("Error: ", error);
            callback({
                type: "error",
                error: error
            })
        }
    })

    // 4a. delete folder
    socket.on(DELETE_FOLDER, async (folderInformation: {
        id: string,
    }, callback) => {
        const { id } = folderInformation;
        if (!socket.user){
            callback({
                type: "error",
                message: "Login not validated!"
            })
            return;
        }
        try{
            const currentUser = socket.user;
            const documentIDsDeleted = await deleteFolder(id, String(currentUser._id));
            documentIDsDeleted.forEach(documentID => {
                updateConnectionsUponDocumentDelete(documentID);
            })
            callback({
                type: "success",
                message: "Folder deleted!"
            })
        }
        catch(error){
            console.log("Error: ", error);
            callback({
                type: "error",
                error: error
            })
        }
    })

    socket.on(MODIFY_FOLDER, async (permissions: {
        folderID: string,
        userID: string,
        role: Role
    }, callback) => {
        // verify the user
        // and update the document
        // if the user is allowed to modify the permissions
        console.log(`Modify document received`);

        if(!socket.user){
            callback({
                type: "error",
                message: "Login not validated!"
            })
            return;
        }
        const { folderID, userID, role } = permissions;
        try{
            await modifyFolder(folderID, String(socket.user._id), userID, role);
            callback({
                type: "success",
                message: "Folder modified!"
            })
        }
        catch(error) {
            console.log("Error: ", error);
            callback({
                type: "error",
                error: error
            })
        }
    })

    socket.on(GET_ALL_FOLDERS, async (callback) => {
        console.log(`Get all folders received`);

        if(!socket.user){
            callback({
                type: "error",
                message: "Login not validated!"
            })
            return;
        }
        const userID = String(socket.user?._id);
        try{
            const folders = await getFoldersForUser(userID);
            callback({
                type: "success",
                folders: folders
            })
        }
        catch(error) {
            console.log("Error: ", error);
            callback({
                type: "error",
                error: error
            })
        }
    })

    // 5. create document
    socket.on(CREATE_DOCUMENT, async (documentInformation: {
        name: string,
        parentFolderID: string, // id being sent here
    }, callback) => {
        const { name, parentFolderID } = documentInformation;
        if (!socket.user){
            callback({
                type: "error",
                message: "Login not validated!"
            })
            return;
        }
        const currentUser = socket.user;
        try{
            const documentID = await createDocument(name, String(currentUser._id), parentFolderID);
            callback({
                type: "success",
                id: documentID
            });

            if(connections[documentID] === undefined){
                connections[documentID] = [];
            }
            connections[documentID].push(socket);
        }
        catch(error){
            console.log("Error: ", error);
            callback({
                type: "error",
                error: error
            })
        }
    });

    // 6. get document
    socket.on(GET_DOCUMENT, async (documentInformation: {
        id: string
    }, callback) => {
        // send the document content
        // from the db
        const { id } = documentInformation;
        console.log(`Get document received for document id: ${id}`);
        if(!socket.user){
            callback({
                type: "error",
                message: "Login not validated!"
            })
            return;
        }
        if(documentConnectedTo[socket.id] === id){
            callback({
                type: "error",
                message: "Already Viewing Document!"
            })
            return;
        }
        try{
            const content = await viewDocument(id, String(socket.user._id));
            callback({
                type: "success",
                document: content
            });
            if(connections[id] === undefined){
                connections[id] = [];
            }
            connections[id].push(socket);
        }
        catch(error) {
            console.log("Error: ", error);
            callback({
                type: "error",
                error: error
            })
        }
    })

    socket.on(EXIT_DOCUMENT, (callback) => {
        console.log(`Exit document received`)
        if(!socket.user){
            callback({
                type: "error",
                message: "Login not validated!"
            })
            return;
        }
        if(!documentConnectedTo[socket.id]){
            callback({
                type: "error",
                message: "No document currently viewing!"
            })
            return;
        }
        try{
            updateConnectionsUponDisconnect(socket.id);
            callback({
                type: "success",
                message: "Exited Successfully!"
            })
        }
        catch(error) {
            console.log("Error: ", error);
            callback({
                type: "error",
                error: error
            })
        }
    })

    // 7. edit
    socket.on(EDIT_DOCUMENT, async (edits: {
        documentID: string,
        changes: {}[],
    }, callback) => {
        // verify the user
        // and update the document
        console.log(edits);
        console.log(`Edit document received for document id: ${edits.documentID}`);
        if(!socket.user){
            callback({
                type: "error",
                message: "Login not validated!"
            })
            return;
        }
        const { documentID, changes } = edits;
        try{
            await editDocument(documentID,String(socket.user?._id), changes);
            callback({
                type: "success",
                message: "Document edited successfully"
            })

            // broadcast the changes across
            console.log(connections[documentID].forEach(sock => console.log(sock)));
            connections[documentID].forEach(sock => {
                if(sock.connected && sock.id !== socket.id){
                    sock.emit("editDocument", {
                        id: documentID,
                        changes: changes,
                        userID: String(socket.user?.name),
                    })
                    console.log("Changes broadcasted to ", sock.user?.name);
                }
            })
        }
        catch(error) {
            console.log("Error: ", error);
            callback({
                type: "error",
                error: error
            })
        }
    })

    socket.on(SAVE_DOCUMENT, async (documentInformation: {
        documentID: string,
        newDocumentContent: string
    }, callback) => {
        // verify the user
        // and save the document
        console.log(`Save document received for document id: ${documentInformation.documentID}`);
        if(!socket.user){
            callback({
                type: "error",
                message: "Login not validated!"
            })
            return;
        }
        const { documentID, newDocumentContent } = documentInformation;
        try{
            await saveChanges(documentID,String(socket.user?._id), newDocumentContent);
            callback({
                type: "success",
                message: "Document saved successfully"
            })
        }
        catch(error) {
            console.log("Error: ", error);
            callback({
                type: "error",
                error: error
            })
        }
    })

    // 8. modify document
    socket.on(MODIFY_DOCUMENT, async (permissions: {
        documentID: string,
        userID: string,
        role: Role
    }, callback) => {
        // verify the user
        // and update the document
        // if the user is allowed to modify the permissions
        console.log(`Modify document received`);

        if(!socket.user){
            callback({
                type: "error",
                message: "Login not validated!"
            })
            return;
        }
        const { documentID, userID, role } = permissions;
        try{
            await modifyDocument(documentID, String(socket.user._id), userID, role);
            callback({
                type: "success",
                message: "Document modified successfully!"
            })
        }
        catch(error) {
            console.log("Error: ", error);
            callback({
                type: "error",
                error: error
            })
        }
    })

    // 8. delete document
    socket.on(DELETE_DOCUMENT, async (documentInformation: {
        documentID: string,
    }, callback) => {
        // verify the user
        // and delete the document
        console.log(`Delete document received`);

        if(! socket.user){
            callback({
                type: "error",
                message: "Login not validated!"
            })
            return;
        }
        const { documentID } = documentInformation;
        try{
            await deleteDocument(documentID, String(socket.user._id));

            // broadcast that the document has been deleted
            connections[documentID].forEach(sock => {
                if(sock !== socket){
                    sock.send({
                        type: "success",
                        id: documentID,
                        delete: true, // will trigger the frontend to show a delete layover on the frontend
                        userID: String(socket.user?.name),
                    })
                }
            })

            updateConnectionsUponDocumentDelete(documentID);
            callback({
                type: "success",
                "message": "Document deleted successfully!"
            });
        }
        catch(error) {
            console.log("Error: ", error);
            callback({
                type: "error",
                error: error
            })
        }
    })

    socket.on(COMMENT_DOCUMENT, async (commentInformation: {
        documentID: string,
        comment: string
    }, callback) => {
        // verify the user
        // and add comment to the document
        console.log(`Comment document received`);

        if(!socket.user){
            callback({
                type: "error",
                message: "Login not validated!"
            })
            return;
        }
        const { documentID, comment } = commentInformation;
        try{
            await addCommentToDocument(documentID, String(socket.user._id), comment);
            callback({
                type: "success",
                message: "Comment added successfully!"
            })

            // broadcast the changes across
            connections[documentID].forEach(sock => {
                if(sock !== socket){
                    sock.send({
                        id: documentID,
                        comments: comment,
                        userID: String(socket.user?.name),
                    })
                }
            })
        }
        catch(error) {
            console.log("Error: ", error);
            callback({
                type: "error",
                error: error
            })
        }
    })

    // 9. disconnect
    socket.on(DISCONNECT, () => {
        console.log(`Disconnect received!`);
        updateConnectionsUponDisconnect(socket.id);
    })
})

httpServer.listen(port, async () => {
    await connectToDatabase();
    console.log(`Server is running on port ${port}`);
});

// Todos:
// 1. Develop a way to authenticate users, and drop connections if they cannot be authenticated. (DONE)
// 2. Develop a way to send only authenticated and allowed users access to the required document content. (DONE)
// 3. Handle document edits (using recon, recon means that small commands will be sent to the backend, that will be handled by the frontend).

export { expressApp, io, httpServer }