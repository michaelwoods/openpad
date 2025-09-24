import Fastify from 'fastify';
import supertest from 'supertest';
const mockGenerateContent = jest.fn();

describe('Filename Route', () => {
  let fastify: any;
  let filenameRoute: any;

  beforeAll(() => {
    jest.doMock('@google/generative-ai', () => ({
      GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: mockGenerateContent,
        }),
      })),
    }));
    filenameRoute = jest.requireActual('./filename').default;
  });

  beforeEach(async () => {
    fastify = Fastify();
    fastify.register(filenameRoute);
    await fastify.ready();

    // Reset mocks before each test
    mockGenerateContent.mockClear();

    // Mock process.env.GEMINI_API_KEY
    process.env.GEMINI_API_KEY = 'test-api-key';
  });

  afterEach(async () => {
    await fastify.close();
    jest.restoreAllMocks();
  });

  it('should return a generated filename for a valid prompt', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => 'my_awesome_model.stl',
      },
    });

    const response = await supertest(fastify.server)
      .post('/filename')
      .send({ prompt: 'create a model of an awesome thing' })
      .expect(200);

    expect(response.body).toEqual({ filename: 'my_awesome_model.stl' });
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(mockGenerateContent).toHaveBeenCalledWith(expect.stringContaining('create a model of an awesome thing'));
  });

  it('should return 400 if prompt is missing', async () => {
    const response = await supertest(fastify.server)
      .post('/filename')
      .send({})
      .expect(400);

    expect(response.body.error).toBe('Invalid request body');
    expect(response.body.details).toBeInstanceOf(Array);
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it('should return 400 if prompt is an empty string', async () => {
    const response = await supertest(fastify.server)
      .post('/filename')
      .send({ prompt: '' })
      .expect(400);

    expect(response.body.error).toBe('Invalid request body');
    expect(response.body.details).toBeInstanceOf(Array);
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it('should return 400 if prompt is too long', async () => {
    const longPrompt = 'a'.repeat(1001); // 1001 characters
    const response = await supertest(fastify.server)
      .post('/filename')
      .send({ prompt: longPrompt })
      .expect(400);

    expect(response.body.error).toBe('Invalid request body');
    expect(response.body.details).toBeInstanceOf(Array);
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it('should return 500 if AI model generation fails', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('AI model error'));

    const response = await supertest(fastify.server)
      .post('/filename')
      .send({ prompt: 'some prompt' })
      .expect(500);

    expect(response.body).toEqual({ error: 'Failed to generate filename from AI model' });
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });

  it('should handle AI response with leading/trailing whitespace', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => '  another_model.stl  ',
      },
    });

    const response = await supertest(fastify.server)
      .post('/filename')
      .send({ prompt: 'another model' })
      .expect(200);

    expect(response.body).toEqual({ filename: 'another_model.stl' });
  });
});
