import { NextFunction, Request, Response } from "express";
import { config } from "../config.js"; 

export async function middlewareLogResponses(req: Request, res: Response, next: NextFunction){
    /* All this function here is doing is 
     * checking if the *response* gave a 
     * proper status code, if not it logs
     * info about the *request* which may be
     * relevant */

    res.on("finish", () => {
        const status_code = res.statusCode;
        if(status_code >= 300){
            console.log(`[NON-OK] ${req.body, req.path} ${req.method} ${req.url} - Status: ${status_code}`);
        }
    });


    next();
}

export async function increaseHits(req: Request, res: Response, next: NextFunction){

    config.api.fileserverHits += 1;
    next();
}


