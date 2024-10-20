declare namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      MONGODB_URL: string;
      SALT_ROUNDS: string;
    }
}
