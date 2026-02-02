import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { projects, users, workLogs } from "../db/schema";

const createWorkLogSchema = z.object({
  userId: z.string().uuid(),
  projectId: z.string().uuid(),
  workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hours: z.number().min(0.25).max(24),
  notes: z.string().max(500).optional(),
});

export async function workLogRoutes(app: FastifyInstance) {
  app.get("/api/work-logs", { preHandler: [app.authenticate] }, async () => {
    return db
      .select({
        id: workLogs.id,
        workDate: workLogs.workDate,
        hours: workLogs.hours,
        notes: workLogs.notes,
        userId: users.id,
        username: users.username,
        projectId: projects.id,
        projectName: projects.name,
      })
      .from(workLogs)
      .innerJoin(users, eq(workLogs.userId, users.id))
      .innerJoin(projects, eq(workLogs.projectId, projects.id))
      .orderBy(workLogs.workDate);
  });

  app.post(
    "/api/work-logs",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parsed = createWorkLogSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          message: "Invalid request body",
          issues: parsed.error.flatten(),
        });
      }

      const { userId, projectId, workDate, hours, notes } = parsed.data;

      const [userExists] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      const [projectExists] = await db
        .select({ id: projects.id })
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1);

      if (!userExists || !projectExists) {
        return reply.code(400).send({ message: "Invalid user or project" });
      }

      const [created] = await db
        .insert(workLogs)
        .values({
          userId,
          projectId,
          workDate,
          hours: hours.toFixed(2),
          notes,
        })
        .returning();

      return reply.code(201).send(created);
    },
  );

  app.delete(
    "/api/work-logs/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const paramsSchema = z.object({ id: z.string().uuid() });
      const parsedParams = paramsSchema.safeParse(request.params);
      if (!parsedParams.success) {
        return reply.code(400).send({ message: "Invalid work log id" });
      }

      const [deleted] = await db
        .delete(workLogs)
        .where(eq(workLogs.id, parsedParams.data.id))
        .returning({ id: workLogs.id });

      if (!deleted) {
        return reply.code(404).send({ message: "Work log not found" });
      }

      return reply.send({ id: deleted.id });
    },
  );
}
