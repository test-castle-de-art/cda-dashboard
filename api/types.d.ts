declare module "../dist/server.js" {
  import type { FastifyInstance } from "fastify";
  const app: FastifyInstance;
  export default app;
}