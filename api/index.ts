import type { VercelRequest, VercelResponse } from "@vercel/node";
import { buildApp } from "../server/app.js"

let cachedApp: any = null;

export default async function handler(request: VercelRequest, response: VercelResponse)
{
    try {
        if (!cachedApp) {
            cachedApp = await buildApp();
            await cachedApp.ready();
        }
        cachedApp.server.emit("request", request, response);
    } catch (error) {
        console.error('Handler error:', error);
        const message = error instanceof Error ? error.message : "Unknown error";
        response.status(500).json({ error: 'Internal server error', message });
    }
};