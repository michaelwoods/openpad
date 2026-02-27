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
import { basePrompt, modularPrompt, attachmentPrompt } from "../prompts";
import {
  generateWithGemini,
  generateWithOllama,
  generateWithOpenAI,
} from "../llm";

const execFileAsync = promisify(execFile);

const generateRequestBody = z.object({
  prompt: z.string().min(1).max(5000),
  provider: z
    .enum(["gemini", "ollama", "openai", "openrouter", "custom"])
    .optional()
    .default("gemini"),
  model: z.string().optional(),
  style: z.enum(["Default", "Modular"]).optional(),
  attachment: z.string().optional(),
});

type GenerateRequest = FastifyRequest<{
  Body: z.infer<typeof generateRequestBody>;
}>;

const maskKey = (key?: string) =>
  key
    ? `${key.substring(0, 4)}...${key.substring(key.length - 4)}`
    : "undefined";

export const extractCode = (text: string): string => {
  // 1. Remove <think>...</think> tags (dotAll to handle newlines)
  const cleanText = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

  // 2. Extract from markdown code blocks if present
  // Matches ```[openscad|scad]? ... ```
  // We use [\s\S]*? to match across newlines non-greedily
  const match = cleanText.match(/```(?:openscad|scad)?\n?([\s\S]*?)```/i);
  if (match) {
    return match[1].trim();
  }

  // 3. If no code blocks, return the cleaned text
  return cleanText;
};

export default async function (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
) {
  fastify.post(
    "/generate",
    {
      schema: {
        body: {
          type: "object",
          required: ["prompt"],
          properties: {
            prompt: { type: "string", minLength: 1, maxLength: 5000 },
            provider: {
              type: "string",
              enum: ["gemini", "ollama", "openai", "openrouter", "custom"],
              default: "gemini",
            },
            model: { type: "string" },
            style: { type: "string", enum: ["Default", "Modular"] },
            attachment: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              code: { type: "string" },
              stl: { type: "string" },
            },
            additionalProperties: true,
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
              code: { type: ["string", "null"] },
              stl: { type: "null" },
              details: { type: "string" },
            },
          },
        },
      },
    },
    async (request: GenerateRequest, reply: FastifyReply) => {
      let tempDir: string | undefined;
      try {
        const validation = generateRequestBody.safeParse(request.body);
        if (!validation.success) {
          return reply.status(400).send({
            error: "Invalid request body",
            details: validation.error.issues,
          });
        }

        const {
          prompt,
          provider,
          model: selectedModel,
          style,
          attachment,
        } = validation.data;

        let fullPrompt = basePrompt;
        if (style === "Modular") {
          fullPrompt += modularPrompt;
        }
        if (attachment) {
          fullPrompt += `
${attachmentPrompt}
${attachment}
--- END ATTACHED FILE CONTENT ---
`;
        }
        fullPrompt += `
        **User Request:** "${prompt}"
      `;

        fastify.log.info(
          {
            reqId: request.id,
            provider,
            model: selectedModel,
            style,
            hasAttachment: !!attachment,
            config: {
              ollamaHost:
                provider === "ollama" ? process.env.OLLAMA_HOST : undefined,
              openaiBase:
                provider === "openai" ? process.env.OPENAI_BASE_URL : undefined,
              geminiKey:
                provider === "gemini"
                  ? maskKey(process.env.GEMINI_API_KEY)
                  : undefined,
              openaiKey:
                provider === "openai"
                  ? maskKey(process.env.OPENAI_API_KEY)
                  : undefined,
              ollamaKey:
                provider === "ollama"
                  ? maskKey(process.env.OLLAMA_API_KEY)
                  : undefined,
            },
          },
          `Generating code for prompt: ${prompt}`,
        );

        let code = "";
        let generationInfo = {};

        if (provider === "ollama") {
          const modelName = selectedModel || "codellama";
          const result = await generateWithOllama({
            prompt: fullPrompt,
            model: modelName,
            apiHost: process.env.OLLAMA_HOST,
            apiKey: process.env.OLLAMA_API_KEY,
          });
          code = result.text;
          generationInfo = {
            finishReason: result.finishReason,
          };
        } else if (
          provider === "openai" ||
          provider === "openrouter" ||
          provider === "custom"
        ) {
          let apiKey: string;
          let baseUrl: string;
          let extraHeaders: Record<string, string> = {};

          if (provider === "openrouter") {
            apiKey = process.env.OPENROUTER_API_KEY || "";
            baseUrl = "https://openrouter.ai/api/v1";
            extraHeaders = {
              "HTTP-Referer":
                process.env.OPENROUTER_REFERER || "http://localhost:5173",
              "X-Title": process.env.OPENROUTER_TITLE || "OpenPAD",
            };
          } else if (provider === "custom") {
            apiKey = process.env.CUSTOM_PROVIDER_API_KEY || "";
            baseUrl = process.env.CUSTOM_PROVIDER_BASE_URL || "";
            if (process.env.CUSTOM_PROVIDER_HEADERS) {
              try {
                extraHeaders = JSON.parse(process.env.CUSTOM_PROVIDER_HEADERS);
              } catch {
                // Ignore parse errors
              }
            }
          } else {
            apiKey = process.env.OPENAI_API_KEY || "";
            baseUrl =
              process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
          }

          const modelName = selectedModel || "gpt-4o";
          const result = await generateWithOpenAI({
            prompt: fullPrompt,
            model: modelName,
            extraHeaders,
            apiKey,
            baseUrl,
          });
          code = result.text;
          generationInfo = {
            finishReason: result.finishReason,
          };
        } else {
          // Default to Gemini
          const modelName = selectedModel || "gemini-2.5-flash";
          const result = await generateWithGemini({
            prompt: fullPrompt,
            model: modelName,
            apiKey: process.env.GEMINI_API_KEY,
          });
          code = result.text;
          generationInfo = {
            finishReason: result.finishReason,
            safetyRatings: result.safetyRatings,
          };
        }

        // Use the new extraction logic
        code = extractCode(code);

        fastify.log.info({ reqId: request.id }, `Generated code: ${code}`);

        // 2. Convert generated code to STL
        tempDir = await mkdtemp(join(tmpdir(), "openpad-"));
        const scadPath = join(tempDir, "model.scad");
        const stlPath = join(tempDir, "model.stl");

        await writeFile(scadPath, code);

        // Execute OpenSCAD CLI
        try {
          await execFileAsync("openscad", ["-o", stlPath, scadPath]);
        } catch (openscadError: any) {
          fastify.log.error(openscadError, "OpenSCAD execution failed");
          // Send a specific error response if OpenSCAD fails (e.g., due to bad code)
          return reply.status(422).send({
            error: "OpenSCAD failed to compile the generated code.",
            code, // Send the faulty code back for debugging
            stl: null,
            details: openscadError.stderr || openscadError.message,
          });
        }

        const stlData = await readFile(stlPath);
        const stlBase64 = stlData.toString("base64");

        return reply.send({ code, stl: stlBase64, generationInfo });
      } catch (error) {
        fastify.log.error(error, "Error in the generate process");
        return reply
          .status(500)
          .send({ error: "An internal server error occurred." });
      } finally {
        // 4. Clean up temporary files
        if (tempDir) {
          await rm(tempDir, { recursive: true, force: true });
        }
      }
    },
  );
}
