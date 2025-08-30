import { Schema, model } from "mongoose";
import { IComment, IDocument } from "../interfaces";

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

export const DocumentSchema = new Schema({
    name: {
        type: String,
        required: true,
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

DocumentSchema.index({ name: 1, folderID: 1 }, { unique: true });

export const Document = model<IDocument>('Document', DocumentSchema, 'Documents');