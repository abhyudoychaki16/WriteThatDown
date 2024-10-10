import { Schema, model, Document, Types } from "mongoose";

export interface IUser extends Document {
    _id: Types.ObjectId,
    name: string;
    email: string;
    enterprise: string;
    password: string;
}

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    enterprise: {
        type: String,
        required: true,
    }
});

const User = model<IUser>('User', UserSchema, 'Users');
export default User;