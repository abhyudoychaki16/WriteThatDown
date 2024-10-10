// provide utilities that will help edit the document
// and also perform validation if the user performing 
// the edits is authorized to do so.

import { Document } from "../models/Document";
import Folder from "../models/Folder";


// ideally, move all checks, in all functions to a common validator function somewhat similar to this:
// const validator = (function: ['edit' | 'view' | ...], userID, docActorMap) => {
//     return check(function, userID, docID);
// }
// which will be called by other functions


export const editDocument = async (documentID: string, userID: string, changes: string): Promise<void> => {
    const document = await Document.findById(documentID);
    if(!document){
        throw new Error("Document doesn't exist!");
    }
    const folder = await Folder.findById(document.parent);
    if(!folder){
        throw new Error("Folder has been deleted!");
    }
    const actorMap = document.actorMap;
    const folderActorMap = folder.actorMap;
    if(document.owner !== userID && !actorMap.master.find(id => id === userID) && !actorMap.editor.find(id => id === userID)){
        throw new Error("User Unauthorized to edit document!");
    }

    if(!folderActorMap.master.find(id => id === userID) && !folderActorMap.editor.find(id => id === userID)){
        throw new Error("User Unauthorized to edit document!");
    }

    // const document = editorFlags.documentFlags.doc;
    // this would be required when we perform recon based changes
    
    // ws.broadcast(document, {changes: changes})
    await Document.findByIdAndUpdate(documentID, {
        content: changes // this line should be changed
    })
}

export const deleteDocument = async (documentID: string, userID: string): Promise<void> => {
    const document = await Document.findOne({_id: documentID});
    if(!document){
        throw new Error("Document doesn't exist!");
    }

    const folder = await Folder.findById(document.parent);
    if(!folder){
        throw new Error("Folder has been deleted!");
    }

    const actorMap = document.actorMap;
    const folderActorMap = folder.actorMap;

    if(document.owner !== userID && !actorMap.master.find(id => id === userID)){
        throw new Error("User Unauthorized to delete document! ");
    }

    if(!folderActorMap.master.find(id => id === userID)){
        throw new Error("User Unauthorized to delete document! ");
    }
    
    // ws.broadcast({delete: true})
    await Document.findByIdAndDelete(documentID);
}

export const viewDocument = async (documentID: string, userID: string): Promise<string> => {
    const document = await Document.findOne({_id: documentID});
    if(!document){
        throw new Error("Document doesn't exist!");
    }
    const folder = await Folder.findById(document.parent);
    if(!folder){
        throw new Error("Folder has been deleted!");
    }

    const actorMap = document.actorMap;
    const folderActorMap = folder.actorMap;

    if(document.owner !== userID && !actorMap.master.find(id => id === userID) && !actorMap.editor.find(id => id === userID) && !actorMap.commentator.find(id => id === userID) && !actorMap.viewer.find(id => id === userID)){
        throw new Error("User Unauthorized to view document! ");
    }

    if(!folderActorMap.master.find(id => id === userID) && !folderActorMap.editor.find(id => id === userID) && !folderActorMap.commentator.find(id => id === userID) && !folderActorMap.viewer.find(id => id === userID)){
        throw new Error("User Unauthorized to view document! ");
    }
    
    return document.content;
}

export const addCommentToDocument = async (documentID: string, userID: string, commentToAdd: string): Promise<void> => {
    const document = await Document.findOne({_id: documentID});
    if(!document){
        throw new Error("Document doesn't exist!");
    }
    
    const folder = await Folder.findById(document.parent);
    if(!folder){
        throw new Error("Folder has been deleted!");
    }

    const actorMap = document.actorMap;
    const folderActorMap = folder.actorMap;

    if(document.owner !== userID && !actorMap.master.find(id => id === userID) && !actorMap.editor.find(id => id === userID) && !actorMap.commentator.find(id => id === userID)){
        throw new Error("User Unauthorized to add Comments to the document!");
    }
    if(!folderActorMap.master.find(id => id === userID) && !folderActorMap.editor.find(id => id === userID) && !folderActorMap.commentator.find(id => id === userID)){
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