import { IUser } from "./src/models/User";
import { Socket } from "socket.io";
declare namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      HMAC_SECRET: string;
      MONGODB_URL: string;
      SALT_ROUNDS: string;
    }
}
