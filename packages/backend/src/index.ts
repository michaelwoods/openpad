import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import generateRoute from './routes/generate';
import filenameRoute from './routes/filename';

const fastify = Fastify({
  logger: true
});

// Register plugins
fastify.register(helmet);

// Register API routes
fastify.register(generateRoute, { prefix: '/api' });
fastify.register(filenameRoute, { prefix: '/api' });

fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Health check route
fastify.get('/', async (request, reply) => {
  return { status: 'ok' };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
