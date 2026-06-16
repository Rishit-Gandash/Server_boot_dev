import { Request, Response } from "express";
import { getBearerToken } from "../auth.js";
import { updateRefreshToken } from "../db/queries/refreshTokens.js";

export async function handlerRevokeTokens(req: Request, res: Response) {
    let bearerToken: string;
    try {
        bearerToken = getBearerToken(req);
    } catch (error) {
        res.status(401);
        res.send();
        return;
    }
    const revokedToken = await updateRefreshToken(bearerToken);
    if(!revokedToken) {
        res.status(401);
        res.send();
        return;
    }
    res.status(204);
    res.send();
}
