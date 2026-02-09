import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { projects, users, workLogs } from "../db/schema";

const createWorkLogsSchema = z.object({
    userId: z.uuid(),
    projectId: z.uuid(),
    workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    hours: z.number().min(0.25).max(24),
    notes: z.string().max(500).optional().nullable()
});

export async function workLogsRoutes(app: FastifyInstance)
{
    app.get("/api/workLogs", { preHandler: [app.authenticate] }, async (request, reply) =>
    {
        const allWorkLogs = await db
            .select({
                id: workLogs.id,
                projectName: projects.name,
                username: users.username,
                hours: workLogs.hours,
                workDate: workLogs.workDate,
                notes: workLogs.notes // perhaps not this, will check performance
            })
            .from(workLogs)
            .innerJoin(users, eq(workLogs.userId, users.id))
            .innerJoin(projects, eq(workLogs.projectId, projects.id));
        return reply.send(allWorkLogs);
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

        const parsed = createWorkLogsSchema.safeParse(request.body);
        if(!parsed.success)
        {
            return reply.code(400).send({
                message: "Invalid request body",
                issues: z.treeifyError(parsed.error)
            });
        }

        const { userId, projectId, workDate, hours, notes } = parsed.data;

        const [userExists] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);
        const [projectExists] = await db
            .select({id: projects.id})
            .from(projects)
            .where(eq(projects.id, projectId))
            .limit(1);           
        if (!userExists || !projectExists)
        {
            return reply.code(400).send({
                message: "Invalid user or project",
            });
        }

        const [newLog] = await db
            .insert(workLogs)
            .values({ userId: userId, projectId: projectId, hours: hours.toFixed(2), workDate: workDate, notes: notes })
            .returning();
        return reply.code(201).send(newLog);
    });

    app.delete("/api/workLogs/:id", { preHandler: [app.authenticate] }, async (request, reply) =>
    {
        const authUser = request.user;
        if (!authUser.isAdmin)
        {
            return reply.code(403).send({
                message: "Forbidden"
            });
        }

        const paramsSchema = z.object({ id: z.uuid() });
        const parsed = paramsSchema.safeParse(request.params);
        if (!parsed.success)
        {
           return reply.code(400).send({
                message: "Invalid work log id format",
                issues: z.treeifyError(parsed.error)
            }); 
        }

        const [deleted] = await db
            .delete(workLogs)
            .where(eq(workLogs.id, parsed.data.id))
            .returning({ id: workLogs.id }); // or whole entry for easier testing
        if(!deleted)
        {
            return reply.code(404).send({
                message: "Work log not found"
            });
        }

        return reply.send(deleted); // inspect this
    });
}