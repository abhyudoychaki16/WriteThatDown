// provide all event types that
// the backend and frontend will use

// login and auth (USER)
export const LOGIN = 'login';
export const SIGNUP = 'signup';
export const DISCONNECT = 'disconnect';

// document level (DOCUMENT)
export const CREATE_DOCUMENT = 'createDocument' // create
export const GET_DOCUMENT = 'getDocument'; // read
export const EDIT_DOCUMENT = 'editDocument'; // edit
export const MODIFY_DOCUMENT = 'modifyDocument' // modify document information, permissions
export const DELETE_DOCUMENT = 'deleteDocument'; // delete
export const COMMENT_DOCUMENT = 'commentDocument' // comment
export const EXIT_DOCUMENT = 'exitDocument' // unsub from changes in current doc

// folder level (FOLDER)
export const CREATE_FOLDER = 'createFolder' // create
export const GET_FOLDER = 'getFolder'; // read
export const MODIFY_FOLDER = 'modifyFolder'; // modify folder information, permissions
export const DELETE_FOLDER = 'deleteFolder'; // delete

// interfacing events (when two entities are used together)