import app from "../server.js"

export default async (request: any, response: any) =>
{
    await app.ready();
    app.server.emit("request", request, response);
};