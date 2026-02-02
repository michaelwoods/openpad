import { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from 'fastify';
import OpenAI from 'openai';

interface Provider {
  id: string;
  name: string;
  models: string[];
  configured: boolean;
}

const maskKey = (key?: string) => key ? `${key.substring(0, 4)}...${key.substring(key.length - 4)}` : 'undefined';

export default async function (fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.get('/models', async (request: FastifyRequest, reply: FastifyReply) => {
    const providers: Provider[] = [];

    // 1. Gemini Provider
    const geminiKey = process.env.GEMINI_API_KEY;
    providers.push({
      id: 'gemini',
      name: 'Google Gemini',
      models: [
        'gemini-2.5-flash-lite',
        'gemini-2.5-flash',
        'gemini-2.5-pro',
        'gemini-3-pro-preview',
        'gemini-3-flash-preview'
      ],
      configured: !!geminiKey && geminiKey.length > 0
    });

    // 2. OpenAI Provider
    const openaiKey = process.env.OPENAI_API_KEY;
    const openaiBase = process.env.OPENAI_BASE_URL;
    const isOpenAIConfigured = (!!openaiKey && openaiKey.length > 0) || (!!openaiBase && openaiBase.length > 0);
    
    let openaiModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo']; // Default fallback

    if (isOpenAIConfigured) {
      try {
        const openai = new OpenAI({
          apiKey: openaiKey || 'dummy-key',
          baseURL: openaiBase,
        });
        const list = await openai.models.list();
        // Filter for chat models or just return all? OpenAI returns many.
        // Let's filter for commonly used ones or those containing 'gpt' or 'o1' to reduce noise, 
        // but user might use localAI with arbitrary names.
        // Let's return all ID's sorted.
        if (list.data && list.data.length > 0) {
            openaiModels = list.data.map(m => m.id).sort();
        }
      } catch (error: any) {
        fastify.log.error(error, `Failed to fetch OpenAI models (BaseURL: ${openaiBase || 'default'}, Key: ${maskKey(openaiKey)}), using fallback.`);
      }
    }

    providers.push({
      id: 'openai',
      name: 'OpenAI',
      models: openaiModels,
      configured: isOpenAIConfigured
    });

    // 3. Ollama Provider
    const ollamaHost = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
    const ollamaKey = process.env.OLLAMA_API_KEY;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout for local check

      const headers: Record<string, string> = {};
      if (ollamaKey) {
        headers['Authorization'] = `Bearer ${ollamaKey}`;
      }

      const response = await fetch(`${ollamaHost}/api/tags`, { 
        signal: controller.signal,
        headers 
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data: any = await response.json();
        const models = data.models?.map((m: any) => m.name) || [];
        providers.push({
          id: 'ollama',
          name: 'Ollama (Local)',
          models: models,
          configured: true
        });
      } else {
        fastify.log.warn(`Ollama reachable but returned ${response.status} (Host: ${ollamaHost})`);
        providers.push({
          id: 'ollama',
          name: 'Ollama (Local)',
          models: [],
          configured: false
        });
      }
    } catch (error: any) {
      fastify.log.info(`Ollama not reachable or timed out (Host: ${ollamaHost}): ${error.message}, skipping.`);
      providers.push({
        id: 'ollama',
        name: 'Ollama (Local)',
        models: [],
        configured: false
      });
    }

    return { providers };
  });
}
