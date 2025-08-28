/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly VITE_HTTP_ENDPOINT : string;
    readonly VITE_SOCKET_ENDPOINT : string;
    readonly VITE_JWT_SECRET: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}