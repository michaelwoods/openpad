import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import generateRoute from './routes/generate';
import filenameRoute from './routes/filename';
import renderRoute from './routes/render';

export default async function (fastify: any, opts: any) {
  // Register plugins
  fastify.register(helmet);

  // Register API routes
  fastify.register(generateRoute, { prefix: '/api' });
  fastify.register(renderRoute, { prefix: '/api' });
  fastify.register(filenameRoute, { prefix: '/api' });

  fastify.get('/health', async (request: any, reply: any) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Health check route
  fastify.get('/', async (request: any, reply: any) => {
    return { status: 'ok' };
  });
}
