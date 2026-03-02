import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const getGenerativeAI = (apiKey: string) => new GoogleGenerativeAI(apiKey);

const filenameRequestBody = z.object({
  prompt: z.string().min(1).max(1000),
});

type FilenameRequest = FastifyRequest<{
  Body: z.infer<typeof filenameRequestBody>;
}>;

export default async function (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
) {
  fastify.post(
    "/filename",
    {
      schema: {
        description:
          "Generate a descriptive, file-safe filename for a 3D model based on a natural language prompt. Uses AI to create meaningful filenames.",
        summary: "Generate descriptive filename for 3D model",
        body: {
          type: "object",
          description: "Request body for filename generation",
          required: ["prompt"],
          properties: {
            prompt: {
              type: "string",
              minLength: 1,
              maxLength: 1000,
              description:
                "Natural language description of the model (same prompt used for generation)",
              example:
                "A 20mm cube with a 10mm cylindrical hole through the center",
            },
          },
        },
        response: {
          200: {
            description: "Successfully generated filename",
            type: "object",
            properties: {
              filename: {
                type: "string",
                description: "AI-generated filename ending with .stl",
                example: "cube_with_central_hole.stl",
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
                example: [{ path: "prompt", message: "Required" }],
              },
            },
          },
          500: {
            description:
              "Internal Server Error - AI model failed to generate filename",
            type: "object",
            properties: {
              error: {
                type: "string",
                example: "Failed to generate filename from AI model",
              },
            },
          },
        },
      },
    },
    async (request: FilenameRequest, reply: FastifyReply) => {
      try {
        const validation = filenameRequestBody.safeParse(request.body);
        if (!validation.success) {
          return reply.status(400).send({
            error: "Invalid request body",
            details: validation.error.issues,
          });
        }

        const { prompt } = validation.data;

        const API_KEY = process.env.GEMINI_API_KEY;
        if (!API_KEY) {
          throw new Error("GEMINI_API_KEY is not set");
        }
        const genAI = getGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash-lite",
        });

        const fullPrompt = `
        Based on the following user request, create a short, descriptive, file-safe name for an STL file.

        **IMPORTANT RULES:**
        1.  Your entire response MUST be only the filename.
        2.  The filename must end with ".stl".
        3.  Use underscores instead of spaces.
        4.  Do not include any other text, explanations, or markdown.

        **User Request:** "${prompt}"

        **Example Response:** "20mm_cube_with_hole.stl"
      `;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const filename = response.text().trim();

        return reply.send({ filename });
      } catch (error) {
        fastify.log.error(error, "Error generating filename");
        return reply
          .status(500)
          .send({ error: "Failed to generate filename from AI model" });
      }
    },
  );
}
