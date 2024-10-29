import { IUser } from "../interfaces";
import User from "../models/User";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JwtSecret } from "../config";

export const verifyUserLogin = async (email: string, password: string): Promise<{user: IUser, token: string} | undefined> => {
    const user = await User.findOne({ email: email });
    if(!user){
        return;
    }
    const isValid = await bcrypt.compare(password, user.password);
    if(!isValid){
        return;
    }
    const token = jwt.sign({ id: user._id, email: user.email }, JwtSecret, {
        expiresIn: '1h'
    });
    return {
        user: user,
        token: token,
    };
}

interface TokenInterface {
    id: string,
    email: string
}

export const verifyJWTTokenAndConnect = async (token: string): Promise<IUser | undefined> => {
    let decoded;
    try{
        decoded = jwt.verify(token, JwtSecret);
        console.log(decoded)
    }
    catch {
        console.log("Verify Error")
        return;
    }
    const user = await User.findOne({ email: (decoded as TokenInterface).email });
    if(!user){
        return;
    }
    return user;
}