import { Schema, Types, model } from "mongoose";

interface IComment {
    content: string,
    user: string,
}

export interface IDocument extends Document{
    _id: Types.ObjectId,
    name: string,
    actorMap: {
        master: string[],
        editor: string[],
        commentator: string[],
        viewer: string[],
    },
    content: string,
    owner: string,
    parent: string,
    comments: IComment[]
}

const CommentSchema = new Schema<IComment>({
    content: {
        type: String,
        required: true,
    },
    user: {
        type: String,
        required: true,
    },
});

const DocumentSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    content: {
        type: String,
        default: "",
    },
    owner: {
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
    parent: {
        type: String,
        required: true,
    },
    comment: {
        type: [CommentSchema],
        required: true
    }
});

export const Document = model<IDocument>('Document', DocumentSchema, 'Documents');