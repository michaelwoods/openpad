import Fastify from 'fastify';
import supertest from 'supertest';
import helmet from '@fastify/helmet';
import generateRoute from './routes/generate';
import filenameRoute from './routes/filename';

// Helper function to build a fresh Fastify app for each test
const buildApp = () => {
  const app = Fastify({
    logger: false, // Disable logger for tests
  });

  app.register(helmet);
  app.register(generateRoute, { prefix: '/api' });
  app.register(filenameRoute, { prefix: '/api' });

  app.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  app.get('/', async (request, reply) => {
    return { status: 'ok' };
  });

  return app;
};

describe('Server Initialization and Basic Routes', () => {
  let app: ReturnType<typeof buildApp>;

  beforeEach(async () => {
    app = buildApp();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  test('should start the server without errors', async () => {
    await app.ready();
    expect(app).toBeDefined();
  });

  test('GET / should return { status: \'ok\' }', async () => {
    const response = await supertest(app.server).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  test('GET /health should return { status: \'ok\' } and a timestamp', async () => {
    const response = await supertest(app.server).get('/health');
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.timestamp).toBeDefined();
    expect(typeof response.body.timestamp).toBe('string');
  });

  test('should register /api/generate route', async () => {
    // Expect 400 because no body is sent, but the route should exist
    const response = await supertest(app.server).post('/api/generate').send({});
    expect(response.statusCode).toBe(400); // Zod validation will catch empty body
    expect(response.body.error).toBe('Invalid request body');
  });

  test('should register /api/filename route', async () => {
    // Expect 400 because no body is sent, but the route should exist
    const response = await supertest(app.server).post('/api/filename').send({});
    expect(response.statusCode).toBe(400); // Zod validation will catch empty body
    expect(response.body.error).toBe('Invalid request body');
  });
});