import express from 'express';
import { Server } from 'socket.io'
import { createServer } from 'http';
import { port } from './config';
import cors from 'cors';
import bodyParser from 'body-parser';
import { CREATE_DOCUMENT, CREATE_FOLDER, DISCONNECT, EDIT_DOCUMENT, GET_DOCUMENT, GET_FOLDER, LOGIN, SIGNUP } from './socketEventTypes';
import { connectToDatabase } from './db';
import createDocument from './DocumentUtils/CreateDocument';
import createFolder from './FolderUtils/CreateFolder';
import { editDocument, viewDocument } from './DocumentUtils/DocumentUtilfns';
import { UserSocket } from './interfaces';
import { createUser, verifyUserLogin } from './UserUtils/login';
import { switchToFolder } from './FolderUtils/FolderUtilfns';

// express setup
const expressApp = express();
expressApp.use(cors());
expressApp.use(bodyParser);
expressApp.use(express.json());
const httpServer = createServer(expressApp);

// Socket.IO setup
const io = new Server(httpServer);

io.on('connection', (socket: UserSocket) => {
    console.log(`User connected: ${socket.id}`)
    socket.on('hello', (something: any) => {
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
            socket.send('Login cannot be verified. Disconnecting')
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
        try{
            const content = await viewDocument(id, socket.user.id);
            socket.send({
                message: 'you have gotten the document',
                document: content,
            });
        }
        catch(error) {
            console.log("Error: ", error);
            socket.send("Failed to get document!");
        }
    })

    // 7. edit
    socket.on(EDIT_DOCUMENT, async (edits: {
        documentID: string,
        userID: string,
        changes: string
    }) => {
        // verify the user
        // and update the document
        // socket.send(changes, userID) if userID can edit, where userID in document.canEdit
        console.log(`Edit document received`);
        const { documentID, userID, changes } = edits;
        try{
            await editDocument(documentID,String(socket.user?._id), changes);
            socket.send("Document edited successfully!");
        }
        catch(error) {
            console.log("Error: ", error);
            socket.send("Failed to edit the document");
        }
    })
    // 8. delete document

    // 9. disconnect
    socket.on(DISCONNECT, () => {
        socket.send('Disconnecting...');
        socket.disconnect()
        console.log(`Disconnect received!`);
    })
})

httpServer.listen(port, async () => {
    await connectToDatabase();
    console.log(`Server is running on port ${port}`);
});

// TODOS:
// 1. Develop a way to authenticate users, and drop connections if they cannot be authenticated. (DONE)
// 2. Develop a way to send only authenticated and allowed users access to the required document content. (DONE)
// 3. Handle document edits (using recon, recon means that small commands will be sent to the backend, that will be handled by the frontend).