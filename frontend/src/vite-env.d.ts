/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly HTTP_ENDPOINT : string;
    readonly SOCKET_ENDPOINT : string;
    readonly JWT_SECRET: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}