import React, { createContext, useState } from "react";
import { Socket } from "socket.io-client";

interface AppSocketContextType {
    socket: Socket | null;
    setSocket?: React.Dispatch<React.SetStateAction<Socket | null>>;
    user?: string | null,
    setUser?: React.Dispatch<React.SetStateAction<string | null>>,
}

export const AppSocketContext = createContext<AppSocketContextType>({ socket: null });

export const AppSocketProvider = ({ children } : {children: React.ReactNode}) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [user, setUser] = useState<null | string>(null);
    return (
        <AppSocketContext.Provider value={{ socket: socket, setSocket: setSocket, user: user, setUser: setUser }}>
            {children}
        </AppSocketContext.Provider>
    )
}