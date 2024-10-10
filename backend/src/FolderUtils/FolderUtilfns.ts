// provide utilities to manage folders, provide and check access

import Folder, { IFolder } from "../models/Folder"

export const switchToFolder = async (folderID: string, userID: string): Promise<IFolder> => {
    const folder = await Folder.findById(folderID);
    if(!folder){
        throw new Error("Folder does not exist");
    }
    if(folder.actorMap.master.find(ID => ID === userID) === undefined &&
    folder.actorMap.editor.find(ID => ID === userID) === undefined &&
    folder.actorMap.commentator.find(ID => ID === userID) === undefined && 
    folder.actorMap.viewer.find(ID => ID === userID) === undefined){
        throw new Error("Access not allowed");
    }
    return folder;
}

export const deleteFolder = () => {
    return;
}