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
          "OpenPAD (Open Prompt Aided Design) API for generating OpenSCAD 3D models from natural language prompts.\n\n## Authentication\nMost endpoints do not require authentication. The AI providers are configured server-side via environment variables.\n\n## Rate Limits\nRate limits are enforced by the underlying AI providers.\n\n## Available Endpoints\n- **POST /api/generate** - Generate OpenSCAD code and 3D STL model from text prompt\n- **POST /api/render** - Render existing OpenSCAD code to STL/AMF/3MF formats\n- **POST /api/filename** - Generate descriptive filename for a 3D model\n- **GET /api/models** - List available AI models from all configured providers\n\n## Error Codes\n- **400** - Bad Request (invalid parameters)\n- **422** - Unprocessable Entity (OpenSCAD compilation failure)\n- **500** - Internal Server Error\n\n## Formats\n- STL responses are base64-encoded binary data\n- All request/response bodies are JSON",
        contact: {
          name: "OpenPAD Repository",
          url: "https://github.com/anomalyco/openpad",
        },
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "Local development server",
        },
      ],
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
