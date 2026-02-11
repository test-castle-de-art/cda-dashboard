import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../dist/server.js";

export default async function handler(request: VercelRequest, response: VercelResponse)
{
    try {
        await app.ready();
        app.server.emit("request", request, response);
    } catch (error) {
        console.error("Handler error:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        response.status(500).json({ error: "Internal server error", message });
    }
}