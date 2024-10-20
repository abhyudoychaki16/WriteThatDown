import { Socket } from "socket.io";
import { Types } from "mongoose";

export interface IUser extends Document {
    _id: Types.ObjectId,
    name: string;
    email: string;
    enterprise: string;
    password: string;
}

export interface UserSocket extends Socket {
    user?: IUser;
}

export interface IComment {
    content: string,
    user: string,
}

export interface IActorMap {
    master: string[],
    editor: string[],
    commentator: string[],
    viewer: string[],
}

export interface IFolder extends Document {
    _id: Types.ObjectId,
    name: string,
    actorMap: IActorMap,
    documents: string[]
}

export interface IDocument extends Document {
    _id: Types.ObjectId,
    name: string,
    actorMap: IActorMap,
    content: string,
    owner: string,
    parent: string,
    comments: IComment[]
}