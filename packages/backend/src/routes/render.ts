import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import { z } from "zod";
import { execFile } from "child_process";
import { writeFile, readFile, mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const renderRequestBody = z.object({
  code: z.string().min(1),
  format: z.enum(["stl", "amf", "3mf"]).optional(),
});

type RenderRequest = FastifyRequest<{
  Body: z.infer<typeof renderRequestBody>;
}>;

export default async function (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
) {
  fastify.post(
    "/render",
    {
      schema: {
        description:
          "Render OpenSCAD code to 3D model formats (STL, AMF, 3MF). Useful for re-rendering existing code or converting to different formats.",
        summary: "Render OpenSCAD code to 3D model",
        body: {
          type: "object",
          description: "Request body for rendering",
          required: ["code"],
          properties: {
            code: {
              type: "string",
              minLength: 1,
              description: "OpenSCAD code to render",
              example: "cube(20, center=true);",
            },
            format: {
              type: "string",
              enum: ["stl", "amf", "3mf"],
              description:
                "Output format for the rendered model. Defaults to STL if not specified.",
              example: "stl",
            },
          },
        },
        response: {
          200: {
            description:
              "Successful rendering - returns base64-encoded model data",
            type: "object",
            properties: {
              stl: {
                type: "string",
                description: "Base64-encoded 3D model data",
                example: "c29saWQgc3R1ZmYgc3RyaW5n...",
              },
            },
          },
          400: {
            description: "Bad Request - Invalid request parameters",
            type: "object",
            properties: {
              error: { type: "string", example: "Invalid request body" },
              details: {
                type: "array",
                description: "Validation error details",
                example: [{ path: "code", message: "Required" }],
              },
            },
          },
          422: {
            description:
              "Unprocessable Entity - OpenSCAD failed to compile the provided code",
            type: "object",
            properties: {
              error: {
                type: "string",
                example: "OpenSCAD failed to compile the provided code.",
              },
              details: {
                type: "string",
                description: "OpenSCAD error message",
              },
            },
          },
          500: {
            description: "Internal Server Error",
            type: "object",
            properties: {
              error: {
                type: "string",
                example: "An internal server error occurred.",
              },
            },
          },
        },
      },
    },
    async (request: RenderRequest, reply: FastifyReply) => {
      let tempDir: string | undefined;
      try {
        const validation = renderRequestBody.safeParse(request.body);
        if (!validation.success) {
          return reply.status(400).send({
            error: "Invalid request body",
            details: validation.error.issues,
          });
        }

        const { code, format } = validation.data;
        const outputFormat = format || "stl";

        tempDir = await mkdtemp(join(tmpdir(), "openpad-"));
        const scadPath = join(tempDir, "model.scad");
        const outputPath = join(tempDir, `model.${outputFormat}`);

        await writeFile(scadPath, code);

        try {
          await execFileAsync("openscad", [
            "-o",
            outputPath,
            "--export-format",
            outputFormat,
            scadPath,
          ]);
        } catch (openscadError: any) {
          return reply.status(422).send({
            error: "OpenSCAD failed to compile the provided code.",
            details: openscadError.stderr || openscadError.message,
          });
        }

        const outputData = await readFile(outputPath);
        const outputBase64 = outputData.toString("base64");

        return reply.send({ stl: outputBase64 });
      } catch (error) {
        fastify.log.error(error, "Error in the render process");
        return reply
          .status(500)
          .send({ error: "An internal server error occurred." });
      } finally {
        if (tempDir) {
          await rm(tempDir, { recursive: true, force: true });
        }
      }
    },
  );
}
