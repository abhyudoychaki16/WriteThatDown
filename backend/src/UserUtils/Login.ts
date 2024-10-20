import { IUser } from "../interfaces";
import User from "../models/User";
import bcrypt from 'bcrypt';

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