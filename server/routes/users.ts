import type { FastifyInstance } from "fastify";
import { z } from "zod";
import argon2 from "argon2";
import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { users } from "../db/schema";

const createUserSchema = z.object({
    username: z.string()
        .min(3)
        .max(50)
        .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, underscore, hyphen"),
    password: z.string()
        .min(8)
        .max(128)
        .regex(/^\S+$/, "Password cannot contain spaces")
        .regex(/[A-Z]/, "Must contain uppercase letter")
        .regex(/[a-z]/, "Must contain lowercase letter")
        .regex(/[0-9]/, "Must contain number")
        .regex(/[!@#$%^&*]/, "Must contain special character"),
    isAdmin: z.boolean().optional().default(false)
});

export async function userRoutes(app: FastifyInstance)
{
    app.post("/api/users", { preHandler: [app.authenticate] }, async (request, reply) =>
    {
        const authUser = request.user;
        if (!authUser?.isAdmin)
        {
            return reply.code(403).send({
                message: "Forbidden"
            });
        }

        const parsed = createUserSchema.safeParse(request.body);
        if (!parsed.success)
        {
            return reply.code(400).send({
                message: "Invalid request body",
                issues: z.treeifyError(parsed.error)
            });
        }

        const { username, password, isAdmin } = parsed.data;

        const userExists = await db
            .select({ id: users.id})
            .from(users)
            .where(eq(users.username, username))
            .limit(1);
        if(!userExists)
        {
            return reply.code(409).send({
                message: "Username already exists"
            });
        }

        const passwordHashed = await argon2.hash(password);
        const [newUser] = await db
            .insert(users)
            .values({ username: username, passwordHashed: passwordHashed, isAdmin: isAdmin })
            .returning({id: users.id, username: users.username, isAdmin: users.isAdmin});
        
        return reply.code(201).send(newUser);
    });
}
