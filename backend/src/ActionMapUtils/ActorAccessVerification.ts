import { IDocument, IFolder } from "../interfaces";
import { Role } from "../types";

export const accessVerifier = (dataType: IFolder | IDocument, userID: string, actors: Role[]): boolean => {
    for(let i = 0; i < actors.length; i++){
        const role = actors[i];
        if(dataType.actorMap[role].find(id => id === userID)){
            return true;
        }
    }
    return false;
}