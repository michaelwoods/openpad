import Fastify from "fastify";
import helmet from "@fastify/helmet";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import generateRoute from "./routes/generate";
import filenameRoute from "./routes/filename";
import renderRoute from "./routes/render";
import modelsRoute from "./routes/models";

export default async function (fastify: any, opts: any) {
  // Register plugins
  fastify.register(helmet);

  // Register Swagger
  fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: "OpenPAD API",
        version: "1.0.0",
        description:
          "API for generating OpenSCAD 3D models from natural language prompts",
      },
    },
  });

  fastify.register(fastifySwaggerUi, { routePrefix: "/docs" });

  // Register API routes
  fastify.register(generateRoute, { prefix: "/api" });
  fastify.register(renderRoute, { prefix: "/api" });
  fastify.register(filenameRoute, { prefix: "/api" });
  fastify.register(modelsRoute, { prefix: "/api" });

  fastify.get("/health", async (request: any, reply: any) => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  // Health check route
  fastify.get("/", async (request: any, reply: any) => {
    return { status: "ok" };
  });
}
