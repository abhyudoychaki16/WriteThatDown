import { Socket } from "socket.io";
import { IUser } from "./models/User";

export interface UserSocket extends Socket {
    user?: IUser;
}