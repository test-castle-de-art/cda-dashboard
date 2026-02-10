import type { VercelRequest, VercelResponse } from "@vercel/node";
import buildApp from "../server.js"

export default async function handler(request: VercelRequest, response: VercelResponse)
{
    const app = await buildApp;
    await app.ready();
    app.server.emit("request", request, response);
};