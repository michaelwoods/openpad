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
          "API for generating OpenSCAD 3D models from natural language prompts using AI.\n\n## Authentication\nMost endpoints require API keys configured via environment variables:\n- `GEMINI_API_KEY` - Google Gemini API key\n- `OPENAI_API_KEY` - OpenAI API key\n- `OLLAMA_HOST` - Local Ollama instance URL (default: http://127.0.0.1:11434)\n- `OPENROUTER_API_KEY` - OpenRouter API key\n\n## Base URL\n`/api`\n\n## Response Format\nAll responses are JSON objects. Error responses include:\n- `error`: Human-readable error message\n- `details`: Additional error information\n\n## Rate Limits\nRate limits vary by provider.",
        contact: {
          name: "OpenPAD Support",
          url: "https://github.com/anomalyco/openpad",
        },
        license: {
          name: "MIT",
          url: "https://opensource.org/licenses/MIT",
        },
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "Local development server",
        },
      ],
      tags: [
        {
          name: "Generation",
          description: "AI-powered code generation endpoints",
        },
        {
          name: "Rendering",
          description: "3D model rendering and export endpoints",
        },
        { name: "Utilities", description: "Helper endpoints" },
        { name: "System", description: "Health and status endpoints" },
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
        description:
          "Health check endpoint that returns the service status and current timestamp.",
        summary: "Health Check",
        tags: ["System"],
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
        description: "Root endpoint that returns basic service status.",
        summary: "Root Status",
        tags: ["System"],
      },
    },
    async (request: any, reply: any) => {
      return { status: "ok" };
    },
  );
}
