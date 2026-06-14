import type { NextFunction, Request, Response } from "express";
import { config } from "../config.js";
import { notFoundError, unauthorizedError, forbiddenError, badRequestError} from "./errors.js";
import { reset, createUser } from "../db/queries/users.js";


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


export async function handlerValidate(req : Request, res: Response){
    type JSONbody = {
        body: string;
    }
    type JSONresp = {
        error?: string;
        valid?: boolean;
        cleanedBody?: string;
    }
    const JSONobj: JSONbody = req.body;
    res.header("Content-Type", "application/json");

    if(JSONobj.body.length > 140){
        throw new badRequestError("Chirp is too long!");
    }

    const lowerBody = JSONobj.body.toLowerCase();
    const regArr = JSONobj.body.split(" ");
    const lowerArr = lowerBody.split(" ");
    const profaneArr = ["kerfuffle", "sharbert", "fornax"];
    let isProfane = false;
    for(let word of profaneArr){
        if(lowerArr.includes(word)){
            isProfane = true;
            break;
        }
    }
    if(isProfane){
        let retArr = [];
        for(let i = 0; i < regArr.length; i++){
            if(profaneArr.includes(lowerArr[i])){
                retArr.push("****");
            } else {
                retArr.push(regArr[i]);
            }
        }
        const respObj: JSONresp = {
            cleanedBody: retArr.join(" "),
        }
        res.status(200).send(respObj);
        return;
    }
    const respObj: JSONresp = {
        cleanedBody: JSONobj.body,
    }
    res.status(200).send(respObj);
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

        if(!userMail){
            throw new badRequestError("Missing required Fields");
        }

        const user = await createUser({ email: userMail});

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
