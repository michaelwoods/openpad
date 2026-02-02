import { build } from '../../test/helper';
import { basePrompt, modularPrompt, attachmentPrompt } from '../../src/prompts';
import * as llm from '../../src/llm';

// Mock LLM service
jest.mock('../../src/llm');

// Mock child_process for OpenSCAD
jest.mock('child_process', () => ({
  execFile: jest.fn((cmd, args, cb) => {
    if (cmd === 'openscad') {
       // Simulate success by default
       cb(null, 'stdout', ''); 
    } else {
       cb(new Error('Unknown command'), '', '');
    }
  }),
}));

// Mock fs/promises to avoid actual file system writes?
// The actual code uses real fs with mkdtemp in tmpdir, which is fine for tests usually.
// But we might want to ensure stl file exists for the read to succeed.
// In integration tests, usually better to let it write to temp.
// But openSCAD is mocked, so it won't actually write the STL file.
// So we must mock fs/promises readFile to return something.

jest.mock('fs/promises', () => {
  const actual = jest.requireActual('fs/promises');
  return {
    ...actual,
    readFile: jest.fn().mockImplementation((path) => {
       if (path.endsWith('.stl')) {
         return Buffer.from('mock-stl-data');
       }
       return actual.readFile(path);
    }),
    // We let writeFile and mkdtemp run for real (or mock them too if needed)
    // For now let's keep it simple. If we mock readFile, we control the output.
  };
});

describe('POST /api/generate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (llm.generateWithGemini as jest.Mock).mockResolvedValue({
      text: 'cube(10);',
      finishReason: 'STOP',
      safetyRatings: [],
    });
    (llm.generateWithOllama as jest.Mock).mockResolvedValue({
      text: 'sphere(10);',
      finishReason: 'stop',
    });
    (llm.generateWithOpenAI as jest.Mock).mockResolvedValue({
        text: 'cylinder(10);',
        finishReason: 'stop',
    });
  });

  test('should use Gemini by default', async () => {
    const app = await build();

    const res = await app.inject({
      method: 'POST',
      url: '/api/generate',
      payload: {
        prompt: 'a 20mm cube',
      },
    });

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.payload)).toEqual({
      code: 'cube(10);',
      stl: Buffer.from('mock-stl-data').toString('base64'), // 'bW9jay1zdGwtZGF0YQ=='
      generationInfo: {
        finishReason: 'STOP',
        safetyRatings: [],
      },
    });

    expect(llm.generateWithGemini).toHaveBeenCalledWith(expect.objectContaining({
      prompt: expect.stringContaining('a 20mm cube'),
      model: 'gemini-2.5-flash',
    }));
  });

  test('should use Ollama when provider is ollama', async () => {
    const app = await build();

    const res = await app.inject({
      method: 'POST',
      url: '/api/generate',
      payload: {
        prompt: 'a 20mm sphere',
        provider: 'ollama',
        model: 'codellama',
      },
    });

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.payload)).toEqual({
      code: 'sphere(10);',
      stl: Buffer.from('mock-stl-data').toString('base64'),
      generationInfo: {
        finishReason: 'stop',
      },
    });

    expect(llm.generateWithOllama).toHaveBeenCalledWith(expect.objectContaining({
      prompt: expect.stringContaining('a 20mm sphere'),
      model: 'codellama',
    }));
  });

  test('should use OpenAI when provider is openai', async () => {
    const app = await build();

    const res = await app.inject({
      method: 'POST',
      url: '/api/generate',
      payload: {
        prompt: 'a cylinder',
        provider: 'openai',
        model: 'gpt-4o',
      },
    });

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.payload)).toEqual({
      code: 'cylinder(10);',
      stl: Buffer.from('mock-stl-data').toString('base64'),
      generationInfo: {
        finishReason: 'stop',
      },
    });

    expect(llm.generateWithOpenAI).toHaveBeenCalledWith(expect.objectContaining({
      prompt: expect.stringContaining('a cylinder'),
      model: 'gpt-4o',
    }));
  });

  test('should pass custom base URL to OpenAI if configured', async () => {
    process.env.OPENAI_BASE_URL = 'http://my-local-ai:8080/v1';
    
    const app = await build();
    await app.inject({
      method: 'POST',
      url: '/api/generate',
      payload: { prompt: 'test', provider: 'openai' },
    });
    
    expect(llm.generateWithOpenAI).toHaveBeenCalledWith(expect.objectContaining({
      baseUrl: 'http://my-local-ai:8080/v1',
    }));
    
    delete process.env.OPENAI_BASE_URL;
  });

  test('should pass custom API key to Ollama if configured', async () => {
    process.env.OLLAMA_API_KEY = 'ollama-secret';
    
    const app = await build();
    await app.inject({
      method: 'POST',
      url: '/api/generate',
      payload: { prompt: 'test', provider: 'ollama' },
    });
    
    expect(llm.generateWithOllama).toHaveBeenCalledWith(expect.objectContaining({
      apiKey: 'ollama-secret',
    }));
    
    delete process.env.OLLAMA_API_KEY;
  });

  test('should handle OpenSCAD failure', async () => {
    const app = await build();
    
    // Mock execFile to fail
    const { execFile } = require('child_process');
    (execFile as unknown as jest.Mock).mockImplementation((cmd, args, cb) => {
        const err: any = new Error('Compilation failed');
        err.stderr = 'Syntax error in file';
        cb(err, '', 'Syntax error in file');
    });

    const res = await app.inject({
      method: 'POST',
      url: '/api/generate',
      payload: {
        prompt: 'bad code',
      },
    });

    expect(res.statusCode).toBe(422);
    const body = JSON.parse(res.payload);
    expect(body.error).toContain('OpenSCAD failed');
    expect(body.details).toContain('Syntax error');
  });
  
  test('should use Modular prompt style', async () => {
      const app = await build();
      
      await app.inject({
          method: 'POST',
          url: '/api/generate',
          payload: { prompt: 'test', style: 'Modular' },
      });
      
      expect(llm.generateWithGemini).toHaveBeenCalledWith(expect.objectContaining({
          prompt: expect.stringContaining(modularPrompt.trim()),
      }));
  });

  test('should include attachment', async () => {
      const app = await build();
      
      await app.inject({
          method: 'POST',
          url: '/api/generate',
          payload: { prompt: 'test', attachment: 'import("base.stl");' },
      });
      
      expect(llm.generateWithGemini).toHaveBeenCalledWith(expect.objectContaining({
          prompt: expect.stringContaining('import("base.stl");'),
      }));
  });
});
