import dotenv from 'dotenv';
dotenv.config();

const assertEnv = (variable: string | undefined, name: string): string => {
    if (variable === undefined) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return variable;
};

const dbUrl: string = assertEnv(process.env.MONGODB_URL, 'MONGODB_URL');
const JwtSecret: string = assertEnv(process.env.JWT_SECRET, 'JWT_SECRET');
const saltRounds: string = assertEnv(process.env.SALT_ROUNDS, 'SALT_ROUNDS');
const port: string = assertEnv(process.env.PORT, 'PORT');
const frontendURL: string = "http://localhost:5173";

export { dbUrl, JwtSecret, saltRounds, port, frontendURL }