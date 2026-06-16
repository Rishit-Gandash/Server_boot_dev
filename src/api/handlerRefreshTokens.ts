import { Request, Response } from "express";
import { getBearerToken, makeJWT } from "../auth.js";
import { getRefreshToken } from "../db/queries/refreshTokens.js";
import { config } from "../config.js";


export async function handlerRefreshTokens(req: Request, res: Response){
    const bearerToken = getBearerToken(req);
    const refreshToken = await getRefreshToken(bearerToken);
    if(!refreshToken){
        res.status(401);
        res.send();
        return;
    }

    if(refreshToken.revokedAt !== null){
        res.status(401);
        res.send();
        return;
    }

    const userId = refreshToken.userId;
    const accessToken = makeJWT(userId, 3600, config.secret);

    res.status(200);
    res.send({
        token: accessToken,
    });

}
