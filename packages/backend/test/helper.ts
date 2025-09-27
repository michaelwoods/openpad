import Fastify from 'fastify';
import app from '../src/app';

export async function build() {
  const fastify = Fastify();
  fastify.register(app);
  await fastify.ready();
  return fastify;
}
