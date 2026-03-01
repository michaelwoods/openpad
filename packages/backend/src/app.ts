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
          "API for generating OpenSCAD 3D models from natural language prompts. \n\n## Authentication\nMost endpoints do not require authentication. However, AI providers must be configured via environment variables (e.g., GEMINI_API_KEY, OPENAI_API_KEY). \n\n## Rate Limits\nRate limits vary by configured AI provider.\n\n## Errors\nAll endpoints may return 500 Internal Server Error for unexpected issues.",
        contact: {
          name: "OpenPAD Support",
          url: "https://github.com/anomalyco/openpad/issues",
        },
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "Local development server",
        },
      ],
      tags: [
        { name: "Generation", description: "Code generation endpoints" },
        { name: "Rendering", description: "3D model rendering endpoints" },
        { name: "Models", description: "AI model management endpoints" },
        { name: "Utilities", description: "Helper endpoints" },
        { name: "Health", description: "Health check endpoints" },
      ],
    },
  });

  fastify.register(fastifySwaggerUi, { routePrefix: "/docs" });

  // Register API routes
  fastify.register(generateRoute, { prefix: "/api" });
  fastify.register(renderRoute, { prefix: "/api" });
  fastify.register(filenameRoute, { prefix: "/api" });
  fastify.register(modelsRoute, { prefix: "/api" });

  fastify.get(
    "/health",
    {
      schema: {
        tags: ["Health"],
        description: "Health check endpoint with timestamp",
        summary: "Health Check",
        response: {
          200: {
            type: "object",
            properties: {
              status: { type: "string", examples: ["ok"] },
              timestamp: {
                type: "string",
                examples: ["2026-02-28T12:00:00.000Z"],
              },
            },
          },
        },
      },
    },
    async (request: any, reply: any) => {
      return { status: "ok", timestamp: new Date().toISOString() };
    },
  );

  // Health check route
  fastify.get(
    "/",
    {
      schema: {
        tags: ["Health"],
        description: "Root endpoint returning service status",
        summary: "Root Status",
        response: {
          200: {
            type: "object",
            properties: {
              status: { type: "string", examples: ["ok"] },
            },
          },
        },
      },
    },
    async (request: any, reply: any) => {
      return { status: "ok" };
    },
  );
}
