// provide a centralized way to manage access,
// easy for organizations to change this
// according to requirements

export const SWITCH: ('master' | 'editor' | 'viewer' | 'commentator')[] = ["master", "editor", "viewer", "commentator"];
export const DELETE: ('master' | 'editor' | 'viewer' | 'commentator')[] = ["master"];
export const MODIFY: ('master' | 'editor' | 'viewer' | 'commentator')[] = ["master"];