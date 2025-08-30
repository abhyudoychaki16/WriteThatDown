import { Schema, model } from "mongoose";
import { IFolder } from "../interfaces";

const FolderSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    actorMap: {
        type: Object,
        required: true,
        default: {
            master: [],
            editor: [],
            commentator: [],
            viewer: [],
        },
    },
    documents: {
        type: [],
        required: true,
        default: []
    }
});

const Folder = model<IFolder>('Folder', FolderSchema, 'Folders');
export default Folder;