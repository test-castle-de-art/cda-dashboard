import "dotenv/config";
import fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { env } from "./server/env";
import { authRoutes } from "./server/routes/auth";
import { userRoutes } from "./server/routes/users";
import { projectRoutes } from "./server/routes/projects";
import { workLogsRoutes } from "./server/routes/workLogs";

import path from "path";
import { fileURLToPath } from "url";
import fastifyStatic from "@fastify/static";

const app = fastify({ logger: true });

await app.register(cors, {
    origin: process.env.VERCEL_URL
        ? [`https://${process.env.VERCEL_URL}`, /\.vercel\.app$/]
        : true,
    credentials: true,
    methods: ["GET", "POST", "DELETE"]
});

await app.register(jwt, {
    secret: env.JWT_SECRET,
});

app.decorate("authenticate", async (request, reply) =>
{
    try
    {
        await request.jwtVerify();
    }
    catch (error)
    {
        reply.code(401).send({
            message: "Unauthorized"
        });
    }
});

app.get("/health", async (request, reply) =>
{
    reply.send({ status: "ok" });
});

await app.register(authRoutes);
await app.register(userRoutes);
await app.register(projectRoutes);
await app.register(workLogsRoutes);

// Only register static files and start server in local development
if (process.env.VERCEL !== "1") {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    await app.register(fastifyStatic, {
        root: path.join(__dirname, "./src"),
        prefix: "/"
    });

    app.setNotFoundHandler((request, reply) => {
        if (request.url.startsWith("/api")) {
            return reply.code(404).send({ error: "Not found" });
        }
        return reply.sendFile("index.html");
    });

    await app.listen({ port: env.PORT, host: "0.0.0.0" });
}

export default app;