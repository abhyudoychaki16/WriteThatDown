// provide a centralized way to manage access,
// easy for organizations to change this
// according to requirements

import { Role } from "../types";

export const VIEW: Role[] = ["master", "editor", "viewer", "commentator"];
export const COMMENT: Role[] = ["master", "editor", "commentator"];
export const EDIT: Role[] = ["master", "editor"];
export const DELETE: Role[] = ["master"];

export const MODIFY: Role[] = ["master"];