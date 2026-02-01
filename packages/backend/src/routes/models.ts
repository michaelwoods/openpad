import { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from 'fastify';

export default async function (fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.get('/models', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const ollamaHost = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
      const response = await fetch(`${ollamaHost}/api/tags`);
      
      if (!response.ok) {
         // If Ollama is not running or unreachable, return empty list instead of erroring out completely?
         // Or strictly error? Let's return error so frontend knows.
         fastify.log.error(`Ollama /api/tags failed with ${response.status}`);
         return reply.status(502).send({ error: 'Failed to fetch models from Ollama' });
      }

      const data: any = await response.json();
      // Ollama returns { models: [ { name: 'llama3:latest', ... } ] }
      const models = data.models?.map((m: any) => m.name) || [];
      
      return { models };
    } catch (error) {
      fastify.log.error(error, 'Error fetching Ollama models');
      // Return empty list if Ollama is down, so the UI doesn't crash?
      // Better to signal error.
      return reply.status(502).send({ error: 'Could not connect to Ollama' });
    }
  });
}
