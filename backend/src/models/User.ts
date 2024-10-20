import { Schema, model } from "mongoose";
import { IUser } from "../interfaces";

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