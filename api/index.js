// import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../server.js"

export default async function handler(request, response)
{
    await app.ready();
    app.server.emit("request", request, response);
};