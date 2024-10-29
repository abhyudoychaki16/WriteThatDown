// provide a centralized way to manage access,
// easy for organizations to change this
// according to requirements

import { Role } from "../types";

export const SWITCH: Role[] = ["master", "editor", "viewer", "commentator"];
export const DELETE: Role[] = ["master"];
export const MODIFY: Role[] = ["master"];