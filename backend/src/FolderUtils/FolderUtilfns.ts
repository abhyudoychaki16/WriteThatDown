// provide utilities to manage folders, provide and check access

import Folder from "../models/Folder"
import { IFolder } from "../interfaces";
import { DELETE, MODIFY, SWITCH } from "../ActionMapUtils/FolderActorSpecifications";
import { accessVerifier } from "../ActionMapUtils/ActorAccessVerification";
import { Document } from "../models/Document";
import { Role } from "../types";

export const findFolder = async (folderID: string): Promise<IFolder> => {
    const folder = await Folder.findById(folderID);
    if(!folder) {
        throw new Error("Folder does not exist!");
    }
    return folder;
}

export const switchToFolder = async (folderID: string, userID: string): Promise<IFolder> => {
    const folder = await findFolder(folderID);
    if(!accessVerifier(folder, userID, SWITCH)){
        throw new Error("Access not allowed");
    }
    return folder;
}

export const modifyFolder = async (folderID: string, userID: string, userIDToAdd: string, roleToAdd: Role): Promise<void> => {
    const folder = await findFolder(folderID);

    if(!accessVerifier(folder, userID, MODIFY)){
        throw new Error("User Unauthorized to modify folder permissions! ");
    }

    const folderActorMap = folder.actorMap;
    const roles: Role[] = ["master", "editor", "viewer", "commentator"];
    roles.forEach(role => {
        if(role !== roleToAdd) {
            // remove all existing roles, if any
            folderActorMap[role] = folderActorMap[role].filter(id => id !== userIDToAdd);
        }
    })
    folderActorMap[roleToAdd] = [...folderActorMap[roleToAdd], userIDToAdd]
    await Folder.findByIdAndUpdate(folderID,{
        actorMap: folderActorMap
    })
    console.log(`Updated actor map for folder: `);
    console.log(folderActorMap);
}

export const deleteFolder = async (folderID: string, userID: string): Promise<string[]> => {
    const folder = await findFolder(folderID);
    if(!accessVerifier(folder, userID, DELETE)){
        throw new Error("Access not allowed");
    }
    const documentIDs = folder.documents;
    // recursively delete all documents in the folder
    folder.documents.forEach(async (documentID) => {
        await Document.findByIdAndDelete(documentID);
    })

    // ws.broadcast({folderID: folderID, delete: true})
    await Folder.findByIdAndDelete(folder._id);
    return documentIDs;
}

export const getFoldersForUser = async (userID: string): Promise <{id:string, name: string}[]> => { 
    const roles = ["master", "editor", "viewer", "commentator"]
    const query = {
        $or: roles.map(role => ({ [`actorMap.${role}`]: userID }))
    };
    
    const folders = await Folder.find(query);
    const folderMap: {id:string, name: string}[] = [];
    folders.map(folder => {
        folderMap.push({id: String(folder._id), name: folder.name})
    });
    return folderMap;
}