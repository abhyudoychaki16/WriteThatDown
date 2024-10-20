// provide utilities to setup new users when they join in,
// provide authentication for users

import User from "../models/User";
import bcrypt from 'bcrypt';
import { saltRounds } from "../config";
import { IUser } from "../interfaces";

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