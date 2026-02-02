import { z } from "zod";

const envSchema = z.object(
    {
        DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
        JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
        NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
        PORT: z.coerce.number().default(3000)
    }
);

export const env = envSchema.parse(
    {
        DATABASE_URL: process.env.DATABASE_URL,
        JWT_SECRET: process.env.JWT_SECRET,
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT ?? "3000"
    }
);