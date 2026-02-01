import { generateWithGemini, generateWithOllama } from './llm';

// Mock GoogleGenerativeAI
const mockGenerateContent = jest.fn();
jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: mockGenerateContent,
      }),
    })),
  };
});

// Mock fetch for Ollama
global.fetch = jest.fn();

describe('LLM Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateWithGemini', () => {
    it('should generate text using Gemini', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => 'Gemini response',
          candidates: [{ finishReason: 'STOP', safetyRatings: [] }],
        },
      });

      const result = await generateWithGemini({
        prompt: 'test prompt',
        model: 'gemini-pro',
        apiKey: 'test-key',
      });

      expect(result.text).toBe('Gemini response');
      expect(result.finishReason).toBe('STOP');
    });

    it('should throw error if API key is missing', async () => {
      await expect(generateWithGemini({
        prompt: 'test',
        model: 'gemini-pro',
      })).rejects.toThrow('GEMINI_API_KEY is not set');
    });
  });

  describe('generateWithOllama', () => {
    it('should generate text using Ollama', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ response: 'Ollama response', done_reason: 'stop' }),
      });

      const result = await generateWithOllama({
        prompt: 'test prompt',
        model: 'llama2',
      });

      expect(result.text).toBe('Ollama response');
      expect(result.finishReason).toBe('stop');
      expect(global.fetch).toHaveBeenCalledWith(
        'http://127.0.0.1:11434/api/generate',
        expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('llama2')
        })
      );
    });

    it('should use provided apiHost', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: async () => ({ response: 'Ollama response', done_reason: 'stop' }),
        });
  
        await generateWithOllama({
          prompt: 'test',
          model: 'llama2',
          apiHost: 'http://custom-host:11434',
        });
  
        expect(global.fetch).toHaveBeenCalledWith(
          'http://custom-host:11434/api/generate',
          expect.any(Object)
        );
      });

    it('should throw error on failed Ollama response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(generateWithOllama({
        prompt: 'test',
        model: 'llama2',
      })).rejects.toThrow('Ollama API error: 500 Internal Server Error');
    });
  });
});
