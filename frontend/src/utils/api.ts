import axios from "axios";
import { io, Socket } from "socket.io-client";

export const sendSignupData = async (name: string, email: string, enterprise: string, password: string): Promise<boolean> => {
    const response: {
        type: string,
        error?: string,
        id?: string,
    } = await axios.post("http://localhost:5050/signup", {
        name: name,
        email: email,
        enterprise: enterprise,
        password: password
    });

    if(response.type === "error"){
        return false;
    }
    return true;
}

export const connectToSocket = (token? : string): Promise<Socket | null> => {
    return new Promise((resolve) => {
        if(token) {
            const socket = io("http://localhost:5050", {
                autoConnect: true,
                auth: {
                    token: token
                }
            },);
            socket.on("disconnect", () => {
                window.location.href = "/login";
                localStorage.removeItem("token");
                resolve(null);
            })
            socket.on("connect", () => {
                resolve(socket);
            })
        }
        else{
            resolve(null);
        }
    })
}

export const sendLoginData = async (email: string, password: string): Promise<{
    token?: string,
    socket?: Socket,
    type: string,
}> => {
    return new Promise(( resolve ) => {
        const socket = io("http://localhost:5050", {
            autoConnect: true,
        });
        socket.connect();
        socket.emit("login", {
            email: email,
            password: password
        }, (response: {
            type: string,
            token?: string,
            error?: string,
        }) => {
            resolve({
                token: response.token,
                socket:  socket,
                type: response.type
            })
        })
    })
}

export const getFoldersForUser = async (socket: Socket): Promise<{id: string, name: string}[]> => {
    return new Promise(( resolve ) => {
        socket.emit("getAllFolders", (response: {
            type: string,
            folders: {id: string, name: string}[]
        }) => {
            resolve(response.folders);
        })
    })
}

export const getFolderContents = async (socket: Socket, folderID: string): Promise<{type: string, documents?: string[]}> => {
    console.log(folderID);
    return new Promise(( resolve ) => {
        socket.emit("getFolder", ({ id: folderID }), (response: {
            type: string,
            folder?: string,
            documents?: string[],
            error?: string
        }) => {
            if(response.type === "error"){
                resolve({type:"error"})
            }
            resolve({type:"success", documents: response.documents});
        })
    })
}

export const createDocumentInFolder = async (socket: Socket, name: string, folderID: string): Promise<{type: string, documentID?: string}> => {
    return new Promise(( resolve ) => {
        socket.emit("createDocument", ({ name: name, parentFolderID: folderID }), (response: {
            type: string,
            message?: string,
            id?: string
        }) => {
            if(response.type === "error"){
                resolve({type:"error"})
            }
            resolve({type:"success", documentID: response.id});
        })
    })
}

export const cleanUp = (socket: Socket) => {
    socket.disconnect();
}