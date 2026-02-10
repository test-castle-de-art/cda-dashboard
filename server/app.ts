import "dotenv/config";
import fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { env } from "./env.js";
import { authRoutes } from "./routes/auth.js";
import { userRoutes } from "./routes/users.js";
import { projectRoutes } from "./routes/projects.js";
import { workLogsRoutes } from "./routes/workLogs.js";

import path from 'path';
import { fileURLToPath } from 'url';
import fastifyStatic from '@fastify/static';

export async function buildApp() {
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

    // Only register static files in non-serverless mode
    if (process.env.VERCEL !== '1') {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        
        await app.register(fastifyStatic, {
            root: path.join(__dirname, '../dist/src'),
            prefix: '/'
        });

        app.setNotFoundHandler((request, reply) => {
            if (request.url.startsWith('/api')) {
                return reply.code(404).send({ error: 'Not found' });
            }
            return reply.sendFile('index.html');
        });
    }

    return app;
}
