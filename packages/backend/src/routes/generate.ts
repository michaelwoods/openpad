import { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from 'fastify';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { execFile } from 'child_process';
import { writeFile, readFile, mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error('GEMINI_API_KEY is not set');
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const generateRequestBody = z.object({
  prompt: z.string().min(1).max(1000),
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

      const { prompt } = validation.data;

      // 1. Generate OpenSCAD code from Gemini
      const fullPrompt = `
        You are an expert in OpenSCAD, a script-only 3D modeling software.
        Your task is to generate clean, correct, and executable OpenSCAD code based on the user's request.
        
        **IMPORTANT RULES:**
        1.  **ONLY output the raw OpenSCAD code.**
        2.  Do NOT include any explanations, comments, or markdown formatting (like \'\'\'openscad).
        3.  The code should be complete and ready to execute.
        4.  Use common OpenSCAD modules and functions.

        **User Request:** "${prompt}"
      `;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const code = response.text();

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

      // 3. Send both code and STL back to the client
      return reply.send({ code, stl: stlBase64 });

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
