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
        body: {
          type: "object",
          required: ["code"],
          properties: {
            code: { type: "string", minLength: 1 },
            format: { type: "string", enum: ["stl", "amf", "3mf"] },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              stl: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
              details: {},
            },
          },
          422: {
            type: "object",
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
