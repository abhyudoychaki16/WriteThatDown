// provide utilities that will help edit the document
// and also perform validation if the user performing 
// the edits is authorized to do so.

import { accessVerifier } from "../ActionMapUtils/ActorAccessVerification";
import { COMMENT, DELETE, EDIT, MODIFY, VIEW } from "../ActionMapUtils/DocumentActorSpecifications";
import { findFolder } from "../FolderUtils/FolderUtilfns";
import { IDocument } from "../interfaces";
import { Document } from "../models/Document";
import { Role } from "../types";


export const findDocument = async (documentID: string): Promise<IDocument> => {
    const document = await Document.findById(documentID);
    if(!document){
        throw new Error("Document doesn't exist!");
    }
    return document;
}


export const viewDocument = async (documentID: string, userID: string): Promise<string> => {
    const document = await findDocument(documentID);
    const folder = await findFolder(document.parent);
    
    if(document.owner !== userID && !accessVerifier(document, userID, VIEW) && !accessVerifier(folder, userID, VIEW)){
        throw new Error("User Unauthorized to view document! ");
    }
    
    return document.content;
}

export const addCommentToDocument = async (documentID: string, userID: string, commentToAdd: string): Promise<void> => {
    const document = await findDocument(documentID);
    const folder = await findFolder(document.parent);
    
    if(document.owner !== userID && !accessVerifier(document, userID, COMMENT) && !accessVerifier(folder, userID, COMMENT)){
        throw new Error("User Unauthorized to add Comments to the document!");
    }

    if(document.comments.find(comment => (comment.user ===  userID && comment.content === commentToAdd))){
        throw new Error("Comment already present");
    }
    
    // ws.broadcast({comments: comments})
    try {
        await Document.findByIdAndUpdate(documentID, {comments:
            [...document.comments, {
                user: userID,
                comment: commentToAdd
            }]
        });
    }
    catch (error){
        console.log("Failed to add edit to db!", error);
    }
}

const saveChanges = async (documentID: string, changes: {}[]): Promise<void> => {
    return new Promise(resolve => {
        console.log(changes);
        resolve();
    })
    // await Document.findByIdAndUpdate(documentID, {
    //     content: changes // this line should be changed
    // })
}

type F = typeof saveChanges
let timerId: NodeJS.Timeout | null = null;

const debounce = (func: F, timeToWait: number): F => {
    return async (...args: Parameters<typeof saveChanges>) => {
        if (timerId !== null) {
            clearTimeout(timerId);
        }

        timerId = setTimeout(async () => {
            console.log("db called");
            await func(...args);
        }, timeToWait);
    };
}

export const editDocument = async (documentID: string, userID: string, changes: {}[]): Promise<void> => {
    const document = await findDocument(documentID);
    const folder = await findFolder(document.parent);

    if(document.owner !== userID && !accessVerifier(document, userID, EDIT) && !accessVerifier(folder, userID, EDIT)){
        throw new Error("User Unauthorized to edit document!");
    }

    // const document = editorFlags.documentFlags.doc;
    // this would be required when we perform recon based changes
    
    const debouncedSaveChanges = debounce(saveChanges, 1000);
    // logic behind 1 second delay:
    // average typing speed of a person: 200 characters per minute.
    // this means 0.3 seconds per character
    // or 300 ms per character
    // autosave happens for every 3.33 characters best

    // even if the person sends a save request to the backend,
    // we can use this for now to avoid overwhelming the backend
    // only con: max 1 second delay on pressing save,
    // but that much is normal, also on apps like Notion, Google Docs
    // will help to avoid overwhelming the backend.

    await debouncedSaveChanges(documentID, changes);
}

export const deleteDocument = async (documentID: string, userID: string): Promise<void> => {
    const document = await findDocument(documentID);
    const folder = await findFolder(document.parent);

    if(document.owner !== userID && !accessVerifier(document, userID, DELETE) && !accessVerifier(folder, userID, DELETE)){
        throw new Error("User Unauthorized to delete document! ");
    }
    
    // ws.broadcast({delete: true})
    await Document.findByIdAndDelete(documentID);
}

export const modifyDocument = async (documentID: string, userID: string, userIDToAdd: string, roleToAdd: Role): Promise<void> => {
    const document = await findDocument(documentID);
    const folder = await findFolder(document.parent);

    if(document.owner !== userID && !accessVerifier(document, userID, MODIFY) && !accessVerifier(folder, userID, MODIFY)){
        throw new Error("User Unauthorized to modify document permissions! ");
    }

    const documentActorMap = document.actorMap;
    const roles: Role[] = ["master", "editor", "viewer", "commentator"];
    roles.forEach(role => {
        if(role !== roleToAdd) {
            // remove all existing roles, if any
            documentActorMap[role] = documentActorMap[role].filter(id => id !== userIDToAdd);
        }
    })
    documentActorMap[roleToAdd] = [...documentActorMap[roleToAdd], userIDToAdd]
    await Document.findByIdAndUpdate(documentID,{
        actorMap: documentActorMap
    })
    console.log(`Updated actor map for document: `);
    console.log(documentActorMap);
}