import "dotenv/config";
import { buildApp } from "./server/app.js";

// For local development
const start = async () =>
{
    try
    {
        const app = await buildApp();
        await app.listen({ port: Number(process.env.PORT) || 3000, host: "0.0.0.0" });
    }
    catch (error)
    {
        console.error(error);
        process.exit(1);
    }
};

// Only start server if not in serverless mode
if (process.env.VERCEL !== '1') {
    start();
}