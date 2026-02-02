import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { env } from "./server/env";
import { authRoutes } from "./server/routes/auth";
import { projectRoutes } from "./server/routes/projects";
import { userRoutes } from "./server/routes/users";
import { workLogRoutes } from "./server/routes/work-logs";

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: true,
  credentials: true,
});

await app.register(jwt, {
  secret: env.JWT_SECRET,
});

app.decorate("authenticate", async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ message: "Unauthorized" });
  }
});

app.get("/health", async () => ({ status: "ok" }));

await app.register(authRoutes);
await app.register(userRoutes);
await app.register(projectRoutes);
await app.register(workLogRoutes);

const start = async () => {
  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

export default app;
