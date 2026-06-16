import type { Request, Response } from "express";
import { config } from "../config.js";
import { badRequestError} from "./errors.js";
import { getHashPwdByMail, getUserByMail } from "../db/queries/users.js";
import { createRefreshToken } from "../db/queries/refreshTokens.js";
import { checkPasswordHash, makeJWT, makeRefreshToken } from "../auth.js";
import { NewUser } from "../db/schema.js";


export async function handlerUserLogin (req: Request, res: Response) {
    const userMail = req.body.email;
    const userPwd = req.body.password;

    if(!userMail || !userPwd){
        throw new badRequestError("Missing required Fields");
    }



    const hashPwd = await getHashPwdByMail(userMail);
    const valid = await checkPasswordHash(userPwd, hashPwd);

    if(valid) {
        const user = await getUserByMail(userMail);
        const token = makeJWT(user.id, 3600, config.secret);
        const refreshToken = await createRefreshToken({
            userId: user.id,
            token: makeRefreshToken(),
            expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        });
        const resBody = {
            "id": user.id,
            "createdAt": user.createdAt,
            "updatedAt": user.updatedAt,
            "email": user.email,
            "token": token,
            "refreshToken": refreshToken.token,
        }

        res.status(200); 
        res.send(JSON.stringify(resBody));

    } else {
        res.status(401)
        res.send("Invalid password entered")
    }
}
