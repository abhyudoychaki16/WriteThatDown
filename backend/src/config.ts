import dotenv from 'dotenv';
dotenv.config();

export const assertEnv = (variable: string | undefined, name: string): string => {
    if (variable === undefined) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return variable;
};

export const dbUrl: string = assertEnv(process.env.MONGODB_URL, 'MONGODB_URL');
export const JwtSecret: string = assertEnv(process.env.JWT_SECRET, 'JWT_SECRET');
export const saltRounds: string = assertEnv(process.env.SALT_ROUNDS, 'SALT_ROUNDS');
export const port: string = assertEnv(process.env.PORT, 'PORT');
export const frontendURL: string = assertEnv(process.env.FRONTEND_URL, 'FRONTEND_URL');
export const SAVE_TIMEOUT: number = 1000; // in ms