import { Schema, model, Document, Types } from "mongoose";

export interface IFolder extends Document{
    _id: Types.ObjectId,
    name: string,
    actorMap: {
        master: string[],
        editor: string[],
        commentator: string[],
        viewer: string[],
    },
    documents: string[]
}

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
        type: [String],
        required: true,
        default: [],
    }
});

const Folder = model<IFolder>('Folder', FolderSchema, 'Folders');
export default Folder;