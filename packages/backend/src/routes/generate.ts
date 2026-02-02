import { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { execFile } from 'child_process';
import { writeFile, readFile, mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { promisify } from 'util';
import { basePrompt, modularPrompt, attachmentPrompt } from '../prompts';
import { generateWithGemini, generateWithOllama, generateWithOpenAI } from '../llm';

const execFileAsync = promisify(execFile);

const generateRequestBody = z.object({
  prompt: z.string().min(1).max(5000),
  provider: z.enum(['gemini', 'ollama', 'openai']).optional().default('gemini'),
  model: z.string().optional(),
  style: z.enum(['Default', 'Modular']).optional(),
  attachment: z.string().optional(),
});

type GenerateRequest = FastifyRequest<{ Body: z.infer<typeof generateRequestBody> }>;

export default async function (fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.post('/generate', async (request: GenerateRequest, reply: FastifyReply) => {
    let tempDir: string | undefined;
    try {
      const validation = generateRequestBody.safeParse(request.body);
      if (!validation.success) {
        return reply.status(400).send({ error: 'Invalid request body', details: validation.error.issues });
      }

      const { prompt, provider, model: selectedModel, style, attachment } = validation.data;
      
      let fullPrompt = basePrompt;
      if (style === 'Modular') {
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

      fastify.log.info({ reqId: request.id }, `Generating code for prompt: ${prompt} using ${provider}`);

      let code = '';
      let generationInfo = {};

      if (provider === 'ollama') {
        const modelName = selectedModel || 'codellama';
        const result = await generateWithOllama({
          prompt: fullPrompt,
          model: modelName,
          apiHost: process.env.OLLAMA_HOST
        });
        code = result.text;
        generationInfo = {
          finishReason: result.finishReason,
        };
      } else if (provider === 'openai') {
        const modelName = selectedModel || 'gpt-4o';
        const result = await generateWithOpenAI({
          prompt: fullPrompt,
          model: modelName,
          apiKey: process.env.OPENAI_API_KEY
        });
        code = result.text;
        generationInfo = {
          finishReason: result.finishReason,
        };
      } else {
        // Default to Gemini
        const modelName = selectedModel || 'gemini-2.5-flash';
        const result = await generateWithGemini({
          prompt: fullPrompt,
          model: modelName,
          apiKey: process.env.GEMINI_API_KEY
        });
        code = result.text;
        generationInfo = {
          finishReason: result.finishReason,
          safetyRatings: result.safetyRatings,
        };
      }

      const match = code.match(/```openscad\n([\s\S]*?)```/);
      if (match) {
        code = match[1];
      }

      fastify.log.info({ reqId: request.id }, `Generated code: ${code}`);

      // 2. Convert generated code to STL
      tempDir = await mkdtemp(join(tmpdir(), 'openpad-'));
      const scadPath = join(tempDir, 'model.scad');
      const stlPath = join(tempDir, 'model.stl');

      await writeFile(scadPath, code);

      // Execute OpenSCAD CLI
      try {
        await execFileAsync('openscad', ['-o', stlPath, scadPath]);
      } catch (openscadError: any) {
        fastify.log.error(openscadError, 'OpenSCAD execution failed');
        // Send a specific error response if OpenSCAD fails (e.g., due to bad code)
        return reply.status(422).send({
          error: 'OpenSCAD failed to compile the generated code.',
          code, // Send the faulty code back for debugging
          stl: null,
          details: openscadError.stderr || openscadError.message,
        });
      }
      
      const stlData = await readFile(stlPath);
      const stlBase64 = stlData.toString('base64');

      return reply.send({ code, stl: stlBase64, generationInfo });

    } catch (error) {
      fastify.log.error(error, 'Error in the generate process');
      return reply.status(500).send({ error: 'An internal server error occurred.' });
    } finally {
      // 4. Clean up temporary files
      if (tempDir) {
        await rm(tempDir, { recursive: true, force: true });
      }
    }
  });
}
