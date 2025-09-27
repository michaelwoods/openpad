import { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { execFile } from 'child_process';
import { writeFile, readFile, mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const renderRequestBody = z.object({
  code: z.string().min(1),
});

type RenderRequest = FastifyRequest<{ Body: z.infer<typeof renderRequestBody> }>;

export default async function (fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.post('/render', async (request: RenderRequest, reply: FastifyReply) => {
    let tempDir: string | undefined;
    try {
      const validation = renderRequestBody.safeParse(request.body);
      if (!validation.success) {
        return reply.status(400).send({ error: 'Invalid request body', details: validation.error.issues });
      }

      const { code } = validation.data;

      fastify.log.info({ reqId: request.id }, `Rendering code: ${code}`);

      tempDir = await mkdtemp(join(tmpdir(), 'openpad-'));
      const scadPath = join(tempDir, 'model.scad');
      const stlPath = join(tempDir, 'model.stl');

      await writeFile(scadPath, code);

      try {
        await execFileAsync('openscad', ['-o', stlPath, scadPath]);
      } catch (openscadError: any) {
        fastify.log.error(openscadError, 'OpenSCAD execution failed');
        return reply.status(422).send({ 
          error: 'OpenSCAD failed to compile the provided code.',
          details: openscadError.stderr || openscadError.message,
        });
      }
      
      const stlData = await readFile(stlPath);
      const stlBase64 = stlData.toString('base64');

      return reply.send({ stl: stlBase64 });

    } catch (error) {
      fastify.log.error(error, 'Error in the render process');
      return reply.status(500).send({ error: 'An internal server error occurred.' });
    } finally {
      if (tempDir) {
        await rm(tempDir, { recursive: true, force: true });
      }
    }
  });
}
