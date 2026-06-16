import { Request, Response } from "express";
import { getBearerToken, validateJWT, hashPassword } from "../auth.js";
import { getUserByMail, updateUserMailPassword } from "../db/queries/users.js";
import { config } from "../config.js";


export async function handlerUpdateEmailPassword(req: Request, res: Response){

    const userMail = req.body.email;
    const userPwd = req.body.password;

    if(!userMail || !userPwd){
        console.log(`api/handlerUpdateEmailPassword.ts: Missing Required Fields`);
        res.status(401);
        res.send();
        return;
    }


    let token: string;
    let userId: string;


    try {
        token = getBearerToken(req);
        userId = validateJWT(token, config.secret);
    } catch (err) {
        console.log(`api/handlerUpdateEmailPassword.ts: ${err}`);
        res.status(401);
        res.send();
        return;
    }


    try {
        const hashedPwd = await hashPassword(userPwd);

        const updatedUserMail = await updateUserMailPassword( 
            userMail,
            hashedPwd,
            userId,
        );

        if(!updatedUserMail){
            res.status(401)
            res.send();
            return;
        }

        const user = await getUserByMail(userMail);

        const resBody = {
            "id": user.id,
            "email": user.email,
            "createdAt": user.createdAt,
            "updatedAt": user.updatedAt,
        };

        res.status(200);
        res.send(JSON.stringify(resBody));
        return;
    } catch (err) {
        throw err;
    }
}
