import type { NextFunction, Request, Response } from "express";
import { config } from "../config.js";
import { notFoundError, unauthorizedError, forbiddenError, badRequestError} from "./errors.js";
import { reset, createUser, getHashPwdByMail, getUserByMail } from "../db/queries/users.js";
import { createChirp, getAllChirps, getChirpById} from "../db/queries/chirps.js";
import { validateChirp } from "./validateChirp.js";
import { hashPassword, checkPasswordHash, makeJWT, getBearerToken, validateJWT } from "../auth.js";

export async function handlerReadiness(_: Request, res: Response){
    res.set('Content-Type','text/plain; charset=utf-8');
    res.status(200);
    res.send('OK');
}

export async function handlerDisplayHits(_: Request, res: Response){

    const html_obj = `
<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${config.api.fileserverHits} times!</p>
  </body>
</html>
`;
    res.set('Content-Type','text/html; charset=utf-8');
    res.status(200);
    res.send(html_obj);
}

export async function handlerResetHitsAndUsers(req : Request, res: Response){
    if(config.api.platform != "dev"){
        console.log(config.api.platform);
        throw new forbiddenError("Reset is only allowed in dev environment");
    }
    if(req.method != "POST"){
        res.status(400);
        res.send("Invalid request method");
    }

    await reset();

    res.status(200);
    config.api.fileserverHits = 0;
    res.send("OK");
}



export async function errorHandler(err: Error, req : Request, res: Response, next: NextFunction){
    console.log(err)
    if(err instanceof notFoundError){
        res.status(404).send("404: Not found");
    }
    if(err instanceof forbiddenError){
        res.status(403).send("403: Forbidden");
    }
    if(err instanceof unauthorizedError){
        res.status(401).send("401: Unauthorized");
    }
    if(err instanceof badRequestError){
        res.status(400).json({
            error: "Chirp is too long. Max length is 140"
        });
    }
    res.status(500).json({
        error: "Something went wrong on our end"
    });
}

export async function handlerCreateUser(req: Request, res: Response){
    try {
        const userMail = req.body.email;
        const userPwd = req.body.password;

        if(!userMail || !userPwd){
            throw new badRequestError("Missing required Fields");
        }

        const hashedPwd = await hashPassword(userPwd);

        const user = await createUser({ 
            email: userMail,
            hashedPassword: hashedPwd,
        });

        if(!user){
            throw new Error("Could not create user")
        }

        const resBody = {
            "id": user.id,
            "email": user.email,
            "createdAt": user.createdAt,
            "updatedAt": user.updatedAt,
        }

        res.status(201);
        res.send(JSON.stringify(resBody));
        return;
    } catch (err) {
        throw err;
    }
}


export async function handlerCreateChirp(req: Request, res: Response) {
    const reqBody = req.body;
    if (!reqBody.body){
        res.send(400);
        throw new Error("Chirp has no body");
    }

    let token: string;
    let userId: string;
    try {
        token = getBearerToken(req);
        userId = validateJWT(token, config.secret);
    } catch (err) {
        res.status(401);
        res.send();
        return;
    }

    const validChirp = await validateChirp(reqBody.body);
    if(!validChirp){
        res.status(400);
        res.send("Invalid Chirp");
    }

    const chirp = await createChirp({
        userId: userId,
        body: validChirp,
    });

    if(!chirp){
        res.send(400);
        throw new Error("Could not write chirp into database");
    }


    const resBody = {
        "id": chirp.id,
        "createdAt": chirp.createdAt,
        "updatedAt": chirp.updatedAt,
        "body": chirp.body,
        "userId": chirp.userId,
    }

    res.status(201);
    res.send(JSON.stringify(resBody));

}

export async function handlerGetChirps(_: Request, res: Response) {
    const chirps = await getAllChirps();
    if(!chirps){
        res.send(400);
        throw new Error("Could not get chirps");
    }
    res.status(200);
    res.send(chirps);
}

export async function handlerGetChirpById(req: Request, res: Response) {
    const id = req.params.chirpId;
    const chirps = await getChirpById(Array.isArray(id) ? id[0]: id);
    if(!chirps){
        res.send(404);
        throw new notFoundError("Could not get chirp by id");
    }

    const resBody = {
        "id": chirps[0].id,
        "createdAt": chirps[0].createdAt,
        "updatedAt": chirps[0].updatedAt,
        "body": chirps[0].body,
        "userId": chirps[0].userId,
    }
    res.send(JSON.stringify(resBody));

}

