import express from 'express';
import { Server } from 'socket.io'
import { createServer } from 'http';
import { port } from './config';
import cors from 'cors';
import bodyParser from 'body-parser';
import { COMMENT_DOCUMENT, CREATE_DOCUMENT, CREATE_FOLDER, DELETE_DOCUMENT, DELETE_FOLDER, DISCONNECT, EDIT_DOCUMENT, EXIT_DOCUMENT, GET_DOCUMENT, GET_FOLDER, LOGIN, MODIFY_DOCUMENT, MODIFY_FOLDER, SIGNUP } from './socketEventTypes';
import { connectToDatabase } from './db';
import createDocument from './DocumentUtils/CreateDocument';
import createFolder from './FolderUtils/CreateFolder';
import { addCommentToDocument, deleteDocument, editDocument, modifyDocument, viewDocument } from './DocumentUtils/DocumentUtilfns';
import { UserSocket } from './interfaces';
import { createUser } from './UserUtils/CreateUser';
import { deleteFolder, modifyFolder, switchToFolder } from './FolderUtils/FolderUtilfns';
import { verifyUserLogin } from './UserUtils/Login';
import { Role } from './types';

// express setup
const expressApp = express();
expressApp.use(cors());
expressApp.use(bodyParser);
expressApp.use(express.json());
const httpServer = createServer(expressApp);

// Socket.IO setup
const io = new Server(httpServer);

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
    sockets.forEach((socket) => {
        socket.send({
            id: documentID,
            delete: true, // will trigger the frontend to show a delete layover on the frontend
        })
        delete documentConnectedTo[socket.id];
    })
    delete connections[documentID];
}

io.on('connection', (socket: UserSocket) => {
    console.log(`User connected: ${socket.id}`)
    socket.on('hello', (something: string) => {
        socket.send("I received your hello");
        console.log(`Hello received! This is ${something}`);
    })

    // 1. sign up
    socket.on(SIGNUP, async (userInformation: {
        name: string,
        email: string,
        enterprise: string,
        password: string
    }) => {
        // create an account with the user information
        console.log(`Signup received`)
        console.log(userInformation);
        const { name, email, enterprise, password } = userInformation;
        try{
            const user = await createUser(name, email, enterprise, password);
            socket.send(`you have signed up, your id is: ${user._id}`);
        }
        catch (error) {
            console.log("Error: ", error);
            socket.send('Failed to create user');
        }

    })

    // 2. log in
    socket.on(LOGIN, async (loginInformation: {
        email: string,
        password: string,
    }) => {
        const { email, password } = loginInformation
        // verify authentication
        const user = await verifyUserLogin(email, password);
        if(!user){
            socket.send('Login cannot be verified. Disconnecting Connection.');
            socket.disconnect();
            return;
        }
        socket.user = user;
        // if connection cannot be verified,
        // terminate connection and send
        // disconnect from socket
        console.log(`Login received`)
        console.log(loginInformation);
        socket.send('you have logged in');
    })

    // 3. create folder
    socket.on(CREATE_FOLDER, async (folderInformation: {
        name: string,
    }) => {
        const { name } = folderInformation;
        if (!socket.user){
            socket.send("User is not validated!");
            return;
        }
        const currentUser = socket.user;
        try{
            const folderID = await createFolder(name, String(currentUser._id));
            socket.send(`Folder created with id: ${folderID}`);
        }
        catch(error){
            console.log("Error: ", error);
            socket.send("Failed to create folder!");
        }
    })

    // 4. get folder
    socket.on(GET_FOLDER, async (folderInformation: {
        id: string,
    }) => {
        const { id } = folderInformation;
        if (!socket.user){
            socket.send("User is not validated!");
            return;
        }
        try{
            const currentUser = socket.user;
            const folder = await switchToFolder(id, String(currentUser._id));
            socket.send(`Welcome to folder: ${folder.name}`)
        }
        catch(error){
            console.log("Error: ", error);
            socket.send("Failed to get folder");
        }
    })

    // 4a. delete folder
    socket.on(DELETE_FOLDER, async (folderInformation: {
        id: string,
    }) => {
        const { id } = folderInformation;
        if (!socket.user){
            socket.send("User is not validated!");
            return;
        }
        try{
            const currentUser = socket.user;
            const documentIDsDeleted = await deleteFolder(id, String(currentUser._id));
            documentIDsDeleted.forEach(documentID => {
                updateConnectionsUponDocumentDelete(documentID);
            })
            socket.send(`Folder deleted!`)
        }
        catch(error){
            console.log("Error: ", error);
            socket.send("Failed to delete folder");
        }
    })

    socket.on(MODIFY_FOLDER, async (permissions: {
        folderID: string,
        userID: string,
        role: Role
    }) => {
        // verify the user
        // and update the document
        // if the user is allowed to modify the permissions
        console.log(`Modify document received`);

        if(!socket.user){
            socket.send("User is not validated! Disconnecting...");
            return;
        }
        const { folderID, userID, role } = permissions;
        try{
            await modifyFolder(folderID, String(socket.user._id), userID, role);
            socket.send("Folder modified successfully!");
        }
        catch(error) {
            console.log("Error: ", error);
            socket.send("Failed to modify the folder");
        }
    })

    // 5. create document
    socket.on(CREATE_DOCUMENT, async (documentInformation: {
        name: string,
        parentFolderID: string, // id being sent here
    }) => {
        const { name, parentFolderID } = documentInformation;
        if (!socket.user){
            socket.send("User is not validated!");
            return;
        }
        const currentUser = socket.user;
        try{
            const documentID = await createDocument(name, String(currentUser._id), parentFolderID);
            socket.send(`Document created with id: ${documentID}`);

            if(connections[documentID] === undefined){
                connections[documentID] = [];
            }
            connections[documentID].push(socket);
        }
        catch(error){
            console.log("Error: ", error);
            socket.send("Failed to create document");
        }
    });

    // 6. get document
    socket.on(GET_DOCUMENT, async (documentInformation: {
        id: string
    }) => {
        // send the document content
        // from the db
        const { id } = documentInformation;
        console.log(`Get document received`)
        if(!socket.user){
            socket.send("User is not validated! Disconnecting...");
            return;
        }
        if(documentConnectedTo[socket.id] === id){
            socket.send("Already have document");
            return;
        }
        try{
            const content = await viewDocument(id, String(socket.user._id));
            socket.send({
                message: 'you have gotten the document',
                document: content,
            });
            if(connections[id] === undefined){
                connections[id] = [];
            }
            connections[id].push(socket);
        }
        catch(error) {
            console.log("Error: ", error);
            socket.send("Failed to get document!");
        }
    })

    socket.on(EXIT_DOCUMENT, () => {
        console.log(`Exit document received`)
        if(!socket.user){
            socket.send("User is not validated! Disconnecting...");
            return;
        }
        if(!documentConnectedTo[socket.id]){
            socket.send("No document to exit from");
            return;
        }
        try{
            updateConnectionsUponDisconnect(socket.id);
            socket.send('Exited!');
        }
        catch(error) {
            console.log("Error: ", error);
            socket.send("Failed to exit document!");
        }
    })

    // 7. edit
    socket.on(EDIT_DOCUMENT, async (edits: {
        documentID: string,
        changes: string
    }) => {
        // verify the user
        // and update the document
        console.log(`Edit document received`);

        if(!socket.user){
            socket.send("User is not validated! Disconnecting...");
            return;
        }
        const { documentID, changes } = edits;
        try{
            await editDocument(documentID,String(socket.user?._id), changes);
            socket.send("Document edited successfully!");

            // broadcast the changes across
            connections[documentID].forEach(sock => {
                if(sock !== socket){
                    sock.send({
                        id: documentID,
                        changes: changes,
                        userID: String(socket.user?.name),
                    })
                }
            })
        }
        catch(error) {
            console.log("Error: ", error);
            socket.send("Failed to edit the document");
        }
    })

    // 8. modify document
    socket.on(MODIFY_DOCUMENT, async (permissions: {
        documentID: string,
        userID: string,
        role: Role
    }) => {
        // verify the user
        // and update the document
        // if the user is allowed to modify the permissions
        console.log(`Modify document received`);

        if(!socket.user){
            socket.send("User is not validated! Disconnecting...");
            return;
        }
        const { documentID, userID, role } = permissions;
        try{
            await modifyDocument(documentID, String(socket.user._id), userID, role);
            socket.send("Document modified successfully!");
        }
        catch(error) {
            console.log("Error: ", error);
            socket.send("Failed to modify the document");
        }
    })

    // 8. delete document
    socket.on(DELETE_DOCUMENT, async (documentInformation: {
        documentID: string,
    }) => {
        // verify the user
        // and delete the document
        console.log(`Delete document received`);

        if(! socket.user){
            socket.send("User is not validated! Disconnecting...");
            return;
        }
        const { documentID } = documentInformation;
        try{
            await deleteDocument(documentID, String(socket.user._id));

            // broadcast that the document has been deleted
            connections[documentID].forEach(sock => {
                if(sock !== socket){
                    sock.send({
                        id: documentID,
                        delete: true, // will trigger the frontend to show a delete layover on the frontend
                        userID: String(socket.user?.name),
                    })
                }
            })

            updateConnectionsUponDocumentDelete(documentID);
            socket.send("Document deleted successfully!");
        }
        catch(error) {
            console.log("Error: ", error);
            socket.send("Failed to delete the document");
        }
    })

    socket.on(COMMENT_DOCUMENT, async (commentInformation: {
        documentID: string,
        comment: string
    }) => {
        // verify the user
        // and add comment to the document
        console.log(`Comment document received`);

        if(!socket.user){
            socket.send("User is not validated! Disconnecting...");
            return;
        }
        const { documentID, comment } = commentInformation;
        try{
            await addCommentToDocument(documentID, String(socket.user._id), comment);
            socket.send("Comment added successfully!");

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
            socket.send("Failed to edit the document");
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