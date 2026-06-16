import type { MigrationConfig } from "drizzle-orm/migrator";
import { resolve } from "path";

const envPath = resolve(".env");
process.loadEnvFile(envPath);

function requireEnv(name: string): string {
    const value = process.env[name];
    if(!value){
        throw new Error(`config.ts/requireEnv: Missing Env var ${name}`);
    }

    return value;
}

export type APIConfig = {
    fileserverHits: number;
    platform: string; 
};
export type DBConfig = {
    migrationConfig: MigrationConfig;
    url: string;
};

export type ConfigObj = {
    api: APIConfig;
    db: DBConfig;
    secret: string;
}

const migrationConfig: MigrationConfig = {
    migrationsFolder: "/home/splitzerr/Coding/Projects/ServerBootDev/src/db/migrations/",
}

const apiConfig: APIConfig = {
    fileserverHits: 0,
    platform: requireEnv("PLATFORM"),
}

const dbConfig: DBConfig = {
    migrationConfig: migrationConfig,
    url: requireEnv("DB_URL"),
}

export let config: ConfigObj = {
    api: apiConfig,
    db: dbConfig,
    secret: requireEnv("SECRET"), 
};


