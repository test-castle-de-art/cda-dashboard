import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { projects } from "../db/schema";

const createProjectSchema = z.object({
    name: z.string().min(2).max(120)
});

export async function projectRoutes(app: FastifyInstance)
{
    app.get("/api/projects", { preHandler: [app.authenticate] }, async (request, reply) =>
    {
        const allProjects = await db.select().from(projects);
        reply.send(allProjects);
    });

    app.post("/api/projects", { preHandler: [app.authenticate] }, async (request, reply) =>
    {
        const authUser = request.user;
        if (!authUser.isAdmin) {
            return reply.code(403).send({
                message: "Forbidden"
            });
        }

        const parsed = createProjectSchema.safeParse(request.body);
        if (!parsed.success)
        {
            return reply.code(400).send({
                message: "Invalid request body",
                issues: z.treeifyError(parsed.error)
            });
        }

        const { name } = parsed.data;
        const [projectExists] = await db
            .select({ id: projects.id })
            .from(projects)
            .where(eq(projects.name, name))
            .limit(1);
        if (projectExists)
        {
            return reply.code(409).send({
                message: "Project already exists"
            });
        }

        const [newProject] = await db
            .insert(projects)
            .values({ name: name })
            .returning({ id: projects.id, name: projects.name });

        return reply.code(201).send(newProject);
    });
}
