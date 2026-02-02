import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { workLogs } from "../db/schema";

const createWorkLogsSchema = z.object({
    userId: z.uuid(),
    projectId: z.uuid(),
    workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    hours: z.number().min(0.25).max(24),
    notes: z.string().max(500).optional()
});

export async function workLogsRoutes(app: FastifyInstance)
{
    app.get("/api/workLogs", { preHandler: [app.authenticate] }, async (request, reply) =>
    {
        const allWorkLogs = await db
            .select({
                id: workLogs.id,
                userId: workLogs.userid,
                projectId: workLogs.projectId,
                hours: workLogs.hours
            })
            .from(workLogs);
        reply.send(allWorkLogs);
    });

    app.post("/api/workLogs", { preHandler: [app.authenticate] }, async (request, reply) =>
    {
        const authUser = request.user;
        if (!authUser.isAdmin)
        {
            return reply.code(403).send({
                message: "Forbidden"
            });
        }

        
    })
}