import { build } from '../../test/helper';

// Mock fetch for Ollama
global.fetch = jest.fn();

describe('GET /api/models', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return list of models from Ollama', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        models: [
          { name: 'llama3:latest' },
          { name: 'codellama:latest' },
        ],
      }),
    });

    const app = await build();
    const res = await app.inject({
      method: 'GET',
      url: '/api/models',
    });

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.payload)).toEqual({
      models: ['llama3:latest', 'codellama:latest'],
    });
  });

  it('should return 502 if Ollama returns error', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    const app = await build();
    const res = await app.inject({
      method: 'GET',
      url: '/api/models',
    });

    expect(res.statusCode).toBe(502);
    expect(JSON.parse(res.payload)).toEqual({
      error: 'Failed to fetch models from Ollama',
    });
  });

  it('should return 502 if fetch fails (network error)', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Connection failed'));

    const app = await build();
    const res = await app.inject({
      method: 'GET',
      url: '/api/models',
    });

    expect(res.statusCode).toBe(502);
    expect(JSON.parse(res.payload)).toEqual({
      error: 'Could not connect to Ollama',
    });
  });
});
