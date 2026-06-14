import express from "express";
import { handlerReadiness, handlerDisplayHits, handlerCreateChirp, errorHandler, handlerCreateUser, handlerResetHitsAndUsers } from "./api/handlers.js";
import { increaseHits, middlewareLogResponses } from "./api/middleware.js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "./config.js";
const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);
const app = express();
const PORT = 8080;
app.use(express.json());
app.use("/app", middlewareLogResponses);
app.use("/app", increaseHits, express.static("./src/app/"));
app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerDisplayHits);
app.post("/admin/reset", handlerResetHitsAndUsers);
// app.post("/api/validate_chirp", async(req, res, next) => {
//     try {
//         await handlerValidate(req, res);
//     } catch(err) {
//         next(err);
//     }
// });
app.post("/api/users", async (req, res, next) => {
    try {
        await handlerCreateUser(req, res);
    }
    catch (err) {
        next(err);
    }
});
app.post("/api/chirps", async (req, res, next) => {
    try {
        await handlerCreateChirp(req, res);
    }
    catch (err) {
        next(err);
    }
});
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
