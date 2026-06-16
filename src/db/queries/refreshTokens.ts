import { asc, eq } from 'drizzle-orm';
import { db } from "../index.js";
import { NewRefreshToken , refresh_tokens } from "../schema.js";

export async function createRefreshToken(refreshToken: NewRefreshToken) {
  const [result] = await db
    .insert(refresh_tokens)
    .values(refreshToken)
    .onConflictDoNothing()
    .returning();
  return result;
}

// export async function getAllChirps() {
//     const result = await db.select().from(chirps).orderBy(asc(chirps.createdAt));
//     return result;
// }
//


export async function getRefreshToken(token: string) {
    const [result] = await db.select().from(refresh_tokens).where(eq(refresh_tokens.token, token))
    return result;
}

export async function updateRefreshToken(token: string){
    const now = new Date();
    const [refreshToken] = await db.update(refresh_tokens).set({
        updatedAt: now,
        revokedAt: now,
    }).where(eq(refresh_tokens.token, token)).returning({ newRevokedAt: refresh_tokens.revokedAt});
    return refreshToken;
}
