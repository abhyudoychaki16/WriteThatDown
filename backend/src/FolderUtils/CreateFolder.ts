// provide a utility to create a folder

import Folder from "../models/Folder";

const createFolder = async (name: string, creator: string) => {
    const folder = new Folder({
        name: name,

        // for folder, the master is removable.
        // if a person is removed from master,
        // all the documents that this person owns
        // need to be transferred to a different owner
        
        // this is made so that in case someone leaves
        // the company or joins a different team / lob,
        // their file ownership can be
        // transferred to someone else

        // however, the id is not removable from a document,
        // if the person still exists in the folder group

        actorMap: {
            'master': [creator],
            'editor': [],
            'commentator': [],
            'viewer': [],
        },
        documents: [],
    })
    await folder.save();
    console.log('New folder created!');
    return folder._id;
}

export default createFolder;