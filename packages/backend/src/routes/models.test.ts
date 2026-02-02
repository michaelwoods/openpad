import { build } from '../../test/helper';

// Mock fetch for Ollama
global.fetch = jest.fn();

// Mock OpenAI
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => {
    return {
      models: {
        list: jest.fn().mockResolvedValue({
          data: [{ id: 'gpt-dynamic-1' }, { id: 'gpt-dynamic-2' }]
        })
      },
      chat: {
        completions: {
          create: jest.fn()
        }
      }
    };
  });
});

describe('GET /api/models', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return Gemini provider if API key is set', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    
    // Mock Ollama failure to isolate Gemini test
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Connection failed'));

    const app = await build();
    const res = await app.inject({
      method: 'GET',
      url: '/api/models',
    });

    expect(res.statusCode).toBe(200);
    const payload = JSON.parse(res.payload);
    
    const gemini = payload.providers.find((p: any) => p.id === 'gemini');
    expect(gemini).toBeDefined();
    expect(gemini.configured).toBe(true);
    expect(gemini.models.length).toBeGreaterThan(0);
    
    const ollama = payload.providers.find((p: any) => p.id === 'ollama');
    expect(ollama).toBeDefined();
    expect(ollama.configured).toBe(false);
  });

  it('should return Gemini provider as unconfigured if API key is missing', async () => {
    delete process.env.GEMINI_API_KEY;
    
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Connection failed'));

    const app = await build();
    const res = await app.inject({
      method: 'GET',
      url: '/api/models',
    });

    const payload = JSON.parse(res.payload);
    const gemini = payload.providers.find((p: any) => p.id === 'gemini');
    expect(gemini).toBeDefined();
    expect(gemini.configured).toBe(false);
  });

  it('should return OpenAI provider if API key is set', async () => {
    process.env.OPENAI_API_KEY = 'test-openai-key';
    
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Connection failed'));

    const app = await build();
    const res = await app.inject({
      method: 'GET',
      url: '/api/models',
    });

    const payload = JSON.parse(res.payload);
    const openai = payload.providers.find((p: any) => p.id === 'openai');
    expect(openai).toBeDefined();
    expect(openai.configured).toBe(true);
    expect(openai.models).toEqual(['gpt-dynamic-1', 'gpt-dynamic-2']);
  });

  it('should return Ollama provider with models if fetch succeeds', async () => {
    delete process.env.GEMINI_API_KEY;
    
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

    const payload = JSON.parse(res.payload);
    const ollama = payload.providers.find((p: any) => p.id === 'ollama');
    expect(ollama.configured).toBe(true);
    expect(ollama.models).toEqual(['llama3:latest', 'codellama:latest']);
  });

  it('should use OLLAMA_HOST and OLLAMA_API_KEY for fetching models', async () => {
    process.env.OLLAMA_HOST = 'http://custom-ollama:11434';
    process.env.OLLAMA_API_KEY = 'ollama-secret';

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        models: [{ name: 'custom-model' }],
      }),
    });

    const app = await build();
    await app.inject({
      method: 'GET',
      url: '/api/models',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://custom-ollama:11434/api/tags',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer ollama-secret'
        })
      })
    );

    delete process.env.OLLAMA_HOST;
    delete process.env.OLLAMA_API_KEY;
  });

  it('should handle Ollama fetch errors gracefully', async () => {
    delete process.env.GEMINI_API_KEY;
    
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    const app = await build();
    const res = await app.inject({
      method: 'GET',
      url: '/api/models',
    });

    expect(res.statusCode).toBe(200);
    const payload = JSON.parse(res.payload);
    const ollama = payload.providers.find((p: any) => p.id === 'ollama');
    expect(ollama.configured).toBe(false);
    expect(ollama.models).toEqual([]);
  });
});