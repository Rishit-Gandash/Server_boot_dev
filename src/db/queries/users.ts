import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewUser, users } from "../schema.js";

export async function createUser(user: NewUser) {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function reset() {
    await db.delete(users);
}

export async function getHashPwdByMail(email: string) {
    const [result] = await db.select().from(users).where(eq(users.email, email))
    return result.hashedPassword;
}

export async function getUserByMail(email: string){
    const [result] = await db.select().from(users).where(eq(users.email, email))
    return result;
}


export async function updateUserMailPassword (email: string, hashedPassword: string, userId: string){
    const [result] = await db.update(users).set({
        hashedPassword: hashedPassword,
        email: email,
    }).where(eq(users.id, userId)).returning({updatedEmail: users.email});
    return result;
}
