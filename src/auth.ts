import { hash, verify } from "argon2";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";


type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;


export async function hashPassword(password: string): Promise<string> {
    return hash(password);
}

export async function checkPasswordHash(password: string, hash: string): Promise<Boolean> {
    return verify(hash, password)
}

export function makeJWT(userID: string, expiresIn: number, secret: string): string {
    const userPayLoad: payload = {
         "iss": "chirpy",
         "sub": userID,
         "iat": Math.floor(Date.now() / 1000),
         "exp": Math.floor(Date.now() / 1000) + expiresIn,
    };

    return jwt.sign(userPayLoad, secret);
}

export function validateJWT(tokenString: string, secret: string): string {
    try {
        const userPayLoad = jwt.verify(tokenString, secret);
        const userId = typeof(userPayLoad) === 'string' ? userPayLoad : userPayLoad["sub"];
        if(typeof(userId) === 'undefined') {
            throw new Error("undefined payload error");
        }
        return userId;
    }
    catch (err) {
        throw new Error(`auth.ts/validateJwt: ${err}, authentication failed`);
    }
}
