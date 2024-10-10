// provide utilities to setup new users when they join in,
// provide authentication for users

import User, { IUser } from "../models/User";
import bcrypt from 'bcrypt';
import { saltRounds } from "../config";

export const createUser = async (name: string, email: string, enterprise: string, password: string): Promise<IUser> => {
    const hashPassword = await bcrypt.hash(password, Number(saltRounds))
    const user = new User({
        name: name,
        email: email,
        enterprise: enterprise,
        password: hashPassword
    })
    await user.save();
    return user;
}

export const verifyUserLogin = async (email: string, password: string): Promise<IUser | undefined> => {
    const user = await User.findOne({ email: email });
    if(!user){
        return;
    }
    const isValid = await bcrypt.compare(password, user.password);
    if(!isValid){
        return;
    }
    return user;
}