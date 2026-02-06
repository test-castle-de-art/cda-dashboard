import type { FastifyInstance } from "fastify";
import { z } from "zod";
import argon2 from "argon2";
import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { users } from "../db/schema";
import { loginSchema } from "../../shared/zodSchemas";

export async function authRoutes(app: FastifyInstance)
{
    app.post("/api/auth/login", async (request, reply) =>
    {
        const parsed = loginSchema.safeParse(request.body);
        if (!parsed.success)
        {
            return reply.code(400).send({
                message: "Invalid request body",
                issues: z.treeifyError(parsed.error)
            });
        }

        const { username, password } = parsed.data;

        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.username, username))
            .limit(1);
        if (!user)
        {
            return reply.code(401).send({
                message: "Invalid credentials"
            });
        }

        const passIsValid = await argon2.verify(user.passwordHashed, password);
        if (!passIsValid)
        {
            return reply.code(401).send({
                message: "Invalid password"
            });
        }

        const token = app.jwt.sign({
            userId: user.id,
            username: user.username,
            isAdmin: user.isAdmin
        });

        return reply.send({token});
    });
}