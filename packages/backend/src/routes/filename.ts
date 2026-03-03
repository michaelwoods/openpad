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
        tags: ["Utilities"],
        description:
          "Generate a descriptive, file-safe filename for an STL model based on the user's prompt",
        summary: "Generate Filename for Model",
        body: {
          type: "object",
          required: ["prompt"],
          properties: {
            prompt: {
              type: "string",
              minLength: 1,
              maxLength: 1000,
              description: "Natural language description of the 3D model",
              examples: ["A 20mm cube with a hole through the center"],
            },
          },
        },
        response: {
          200: {
            type: "object",
            description: "Successfully generated filename",
            properties: {
              filename: {
                type: "string",
                description: "AI-generated filename ending with .stl",
                examples: ["20mm_cube_with_hole.stl"],
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
