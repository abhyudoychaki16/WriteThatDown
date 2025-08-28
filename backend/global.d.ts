declare namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      JWT_SECRET: string,
      MONGODB_URL: string;
      SALT_ROUNDS: string;
      FRONTEND_URL: string;
    }
}
