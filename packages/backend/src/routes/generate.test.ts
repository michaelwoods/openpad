import Fastify from 'fastify';
import supertest from 'supertest';
const mockGenerateContent = jest.fn();
const mockExecFile = jest.fn();
const mockMkdtemp = jest.fn();
const mockWriteFile = jest.fn();
const mockReadFile = jest.fn();
const mockRm = jest.fn();

describe('Generate Route', () => {
  let fastify: any;
  let generateRoute: any;

  beforeAll(() => {
    jest.doMock('@google/generative-ai', () => ({
      GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: mockGenerateContent,
        }),
      })),
    }));

    jest.doMock('child_process', () => ({
      execFile: mockExecFile,
    }));

    jest.doMock('fs/promises', () => ({
      mkdtemp: mockMkdtemp,
      writeFile: mockWriteFile,
      readFile: mockReadFile,
      rm: mockRm,
    }));

    jest.doMock('os', () => ({
      tmpdir: jest.fn(() => '/tmp'),
    }));

    generateRoute = jest.requireActual('./generate').default;
  });

  beforeEach(async () => {
    fastify = Fastify();
    fastify.register(generateRoute);
    await fastify.ready();

    // Reset mocks before each test
    mockGenerateContent.mockClear();
    mockExecFile.mockClear();
    mockMkdtemp.mockClear();
    mockWriteFile.mockClear();
    mockReadFile.mockClear();
    mockRm.mockClear();

    // Mock process.env.GEMINI_API_KEY
    process.env.GEMINI_API_KEY = 'test-api-key';

    // Default mock implementations for fs/promises
    mockMkdtemp.mockResolvedValue('/tmp/test-dir');
    mockWriteFile.mockResolvedValue(undefined);
    mockReadFile.mockResolvedValue(Buffer.from('mock stl content'));
    mockRm.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    await fastify.close();
    jest.restoreAllMocks();
  });

  it('should generate OpenSCAD code and return STL for a valid prompt', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => 'cube();',
        candidates: [{ finishReason: 'STOP', safetyRatings: [] }],
      },
    });
    mockExecFile.mockImplementation((command, args, callback) => {
      // Simulate successful openscad execution
      callback(null, { stdout: '', stderr: '' });
    });

    const response = await supertest(fastify.server)
      .post('/generate')
      .send({ prompt: 'create a simple cube' })
      .expect(200);

    expect(response.body.code).toBe('cube();');
    expect(response.body.stl).toBe(Buffer.from('mock stl content').toString('base64'));
    expect(response.body.generationInfo).toEqual({
      finishReason: 'STOP',
      safetyRatings: [],
    });
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(mockExecFile).toHaveBeenCalledTimes(1);
    expect(mockMkdtemp).toHaveBeenCalledTimes(1);
    expect(mockWriteFile).toHaveBeenCalledTimes(1);
    expect(mockReadFile).toHaveBeenCalledTimes(1);
    expect(mockRm).toHaveBeenCalledTimes(1);
  });

  it('should return 400 if prompt is missing', async () => {
    const response = await supertest(fastify.server)
      .post('/generate')
      .send({}) // Missing prompt
      .expect(400);

    expect(response.body.error).toBe('Invalid request body');
    expect(response.body.details).toBeInstanceOf(Array);
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it('should return 400 if prompt is an empty string', async () => {
    const response = await supertest(fastify.server)
      .post('/generate')
      .send({ prompt: '' }) // Empty prompt
      .expect(400);

    expect(response.body.error).toBe('Invalid request body');
    expect(response.body.details).toBeInstanceOf(Array);
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it('should return 400 if prompt is too long', async () => {
    const longPrompt = 'a'.repeat(1001); // 1001 characters
    const response = await supertest(fastify.server)
      .post('/generate')
      .send({ prompt: longPrompt })
      .expect(400);

    expect(response.body.error).toBe('Invalid request body');
    expect(response.body.details).toBeInstanceOf(Array);
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it('should return 500 if AI model generation fails', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('AI model error'));

    const response = await supertest(fastify.server)
      .post('/generate')
      .send({ prompt: 'some prompt' })
      .expect(500);

    expect(response.body).toEqual({ error: 'An internal server error occurred.' });
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(mockExecFile).not.toHaveBeenCalled();
  });

  it('should return 422 if OpenSCAD execution fails', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => 'invalid_code();',
        candidates: [{ finishReason: 'STOP', safetyRatings: [] }],
      },
    });
    mockExecFile.mockImplementation((command, args, callback) => {
      // Simulate openscad execution failure
      const error = new Error('OpenSCAD error');
      (error as any).stderr = 'OpenSCAD compilation failed';
      callback(error, { stdout: '', stderr: 'OpenSCAD compilation failed' });
    });

    const response = await supertest(fastify.server)
      .post('/generate')
      .send({ prompt: 'create invalid code' })
      .expect(422);

    expect(response.body.error).toBe('OpenSCAD failed to compile the generated code.');
    expect(response.body.code).toBe('invalid_code();');
    expect(response.body.stl).toBeNull();
    expect(response.body.details).toBe('OpenSCAD compilation failed');
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(mockExecFile).toHaveBeenCalledTimes(1);
    expect(mockMkdtemp).toHaveBeenCalledTimes(1);
    expect(mockWriteFile).toHaveBeenCalledTimes(1);
    expect(mockReadFile).not.toHaveBeenCalled(); // Should not read STL if openscad fails
    expect(mockRm).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if GEMINI_API_KEY is not set at module load time', () => {
    // This test needs to be isolated to ensure the module is loaded without the API key
    const originalGeminiApiKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    jest.resetModules(); // Clear module cache

    expect(() => {
      jest.isolateModules(() => {
        require('./generate');
      });
    }).toThrow('GEMINI_API_KEY is not set');

    process.env.GEMINI_API_KEY = originalGeminiApiKey;
  });
});
