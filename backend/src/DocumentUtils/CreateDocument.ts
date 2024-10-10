// provide a utility to create a document

import { Document } from "../models/Document";
import Folder from "../models/Folder";

const createDocument = async (
    name: string,
    creator: string, // creator id
    parentFolder: string // folder id
): Promise<string> => {

    // all files will have only ONE owner.

    // document owners are non removable.
    // document owners can only be replaced,
    // and this happens when they are removed
    // from their parent folder

    const folder = await Folder.findById(parentFolder);
    if(folder?.actorMap.master.find(userID => userID === creator) === undefined){
        throw new Error("Unauthorized access to folder not allowed");
    }
    const document = new Document({
        name: name,
        actorMap: {
            'master': [creator],
            'editor': [],
            'commentator': [],
            'viewer': [],
        },
        owner: creator,
        parent: parentFolder
    });
    await document.save();
    await Folder.findById(parentFolder, {
        documents: [...folder.documents, document._id]
    });
    console.log('A new document created!');
    return String(document._id);
}

export default createDocument;