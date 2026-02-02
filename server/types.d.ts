import "fastify";
import "@fastify/jwt";

declare module "@fastify/jwt"
{

    type JWTPayload = {
        userId: string;
        username: string;
        isAdmin: boolean;
    }

    interface FastifyJWT
    {
        payload: JWTPayload;
        user: JWTPayload;
    }
}

declare module "fastify"
{
    interface FastifyInstance
    {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
}