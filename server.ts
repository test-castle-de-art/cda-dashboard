import "dotenv/config";
import fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { env } from "./server/env"; // done
import { authRoutes } from "./server/routes/auth"; // done
import { projectRoutes } from "./server/routes/projects"; // done
import { userRoutes } from "./server/routes/users" // done
import { workLogRoutes } from "./server/routes/work-logs"; // pending