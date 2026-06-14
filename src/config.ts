process.loadEnvFile("/home/splitzerr/Coding/Projects/Servers/.env");
import type { MigrationConfig } from "drizzle-orm/migrator";

function requireEnv(name: string): string {
    const value = process.env[name];
    if(!value){
        throw new Error(`Missing Env var ${name}`);
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
}

const migrationConfig: MigrationConfig = {
    migrationsFolder: "/home/splitzerr/Coding/Projects/Servers/src/db/migrations",
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
};


