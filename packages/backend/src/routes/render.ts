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
        tags: ["Rendering"],
        description:
          "Render OpenSCAD code to a 3D model format (STL, AMF, or 3MF)",
        summary: "Render OpenSCAD to 3D Model",
        body: {
          type: "object",
          required: ["code"],
          properties: {
            code: {
              type: "string",
              minLength: 1,
              description: "OpenSCAD code to render",
              examples: ["cube(20, center=true);"],
            },
            format: {
              type: "string",
              enum: ["stl", "amf", "3mf"],
              default: "stl",
              description: "Output format for the rendered model",
            },
          },
        },
        response: {
          200: {
            type: "object",
            description: "Successfully rendered 3D model",
            properties: {
              stl: {
                type: "string",
                description: "Base64-encoded 3D model data",
              },
            },
          },
          400: {
            type: "object",
            description: "Invalid request body",
            properties: {
              error: { type: "string" },
              details: { type: "array" },
            },
          },
          422: {
            type: "object",
            description: "OpenSCAD failed to compile the provided code",
            properties: {
              error: { type: "string" },
              details: { type: "string" },
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
