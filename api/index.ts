import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../server.js"

export default async function handler(request: VercelRequest, response: VercelResponse)
{
    await app.ready();
    app.server.emit("request", request, response);
};