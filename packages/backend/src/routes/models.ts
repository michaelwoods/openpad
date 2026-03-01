import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import { z } from "zod";
import OpenAI from "openai";

interface Provider {
  id: string;
  name: string;
  models: string[];
  configured: boolean;
  baseUrl?: string;
  headers?: Record<string, string>;
}

const maskKey = (key?: string) =>
  key
    ? `${key.substring(0, 4)}...${key.substring(key.length - 4)}`
    : "undefined";

export default async function (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
) {
  fastify.get(
    "/models",
    {
      schema: {
        tags: ["Models"],
        description: "List available AI models from all configured providers",
        summary: "List Available AI Models",
        response: {
          200: {
            type: "object",
            description: "List of available AI providers and their models",
            properties: {
              providers: {
                type: "array",
                description: "Array of configured AI providers",
                items: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      description: "Provider identifier",
                      examples: ["gemini", "openai", "ollama"],
                    },
                    name: {
                      type: "string",
                      description: "Display name of the provider",
                      examples: ["Google Gemini", "OpenAI", "Ollama (Local)"],
                    },
                    models: {
                      type: "array",
                      description: "Available models for this provider",
                      items: { type: "string" },
                    },
                    configured: {
                      type: "boolean",
                      description:
                        "Whether the provider is properly configured with API keys",
                    },
                    baseUrl: {
                      type: "string",
                      description: "Base URL for the provider's API",
                    },
                    headers: {
                      type: "object",
                      description:
                        "Additional headers required for the provider",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const providers: Provider[] = [];

      // 1. Gemini Provider
      const geminiKey = process.env.GEMINI_API_KEY;
      providers.push({
        id: "gemini",
        name: "Google Gemini",
        models: [
          "gemini-2.5-flash-lite",
          "gemini-2.5-flash",
          "gemini-2.5-pro",
          "gemini-3-pro-preview",
          "gemini-3-flash-preview",
        ],
        configured: !!geminiKey && geminiKey.length > 0,
      });

      // 2. OpenAI Provider
      const openaiKey = process.env.OPENAI_API_KEY;
      const openaiBase = process.env.OPENAI_BASE_URL;
      const isOpenAIConfigured =
        (!!openaiKey && openaiKey.length > 0) ||
        (!!openaiBase && openaiBase.length > 0);

      let openaiModels = ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"];

      if (isOpenAIConfigured) {
        try {
          const openai = new OpenAI({
            apiKey: openaiKey || "dummy-key",
            baseURL: openaiBase,
          });
          const list = await openai.models.list();
          if (list.data && list.data.length > 0) {
            openaiModels = list.data.map((m) => m.id).sort();
          }
        } catch (error: any) {
          fastify.log.error(
            error,
            `Failed to fetch OpenAI models (BaseURL: ${openaiBase || "default"}, Key: ${maskKey(openaiKey)}), using fallback.`,
          );
        }
      }

      providers.push({
        id: "openai",
        name: "OpenAI",
        models: openaiModels,
        configured: isOpenAIConfigured,
        baseUrl: openaiBase || "https://api.openai.com/v1",
      });

      // 3. Ollama Provider
      const ollamaHost = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
      const ollamaKey = process.env.OLLAMA_API_KEY;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const headers: Record<string, string> = {};
        if (ollamaKey) {
          headers["Authorization"] = `Bearer ${ollamaKey}`;
        }

        const response = await fetch(`${ollamaHost}/api/tags`, {
          signal: controller.signal,
          headers,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data: any = await response.json();
          const models = data.models?.map((m: any) => m.name) || [];
          providers.push({
            id: "ollama",
            name: "Ollama (Local)",
            models: models,
            configured: true,
            baseUrl: ollamaHost,
          });
        } else {
          fastify.log.warn(
            `Ollama reachable but returned ${response.status} (Host: ${ollamaHost})`,
          );
          providers.push({
            id: "ollama",
            name: "Ollama (Local)",
            models: [],
            configured: false,
            baseUrl: ollamaHost,
          });
        }
      } catch (error: any) {
        fastify.log.info(
          `Ollama not reachable or timed out (Host: ${ollamaHost}): ${error.message}, skipping.`,
        );
        providers.push({
          id: "ollama",
          name: "Ollama (Local)",
          models: [],
          configured: false,
          baseUrl: ollamaHost,
        });
      }

      // 4. OpenRouter Provider
      const openrouterKey = process.env.OPENROUTER_API_KEY;
      const isOpenRouterConfigured =
        !!openrouterKey && openrouterKey.length > 0;

      if (isOpenRouterConfigured) {
        providers.push({
          id: "openrouter",
          name: "OpenRouter",
          models: [
            "openrouter/anthropic/claude-3.5-sonnet",
            "openrouter/google/gemini-2.0-flash-001",
            "openrouter/google/gemini-pro-1.5",
            "openrouter/meta-llama/llama-3.1-70b-instruct",
            "openrouter/mistralai/mistral-7b-instruct",
            "openrouter/openai/gpt-4o",
            "openrouter/openai/gpt-4o-mini",
            "openrouter/deepseek/deepseek-chat",
          ],
          configured: true,
          baseUrl: "https://openrouter.ai/api/v1",
          headers: {
            "HTTP-Referer":
              process.env.OPENROUTER_REFERER || "http://localhost:5173",
            "X-Title": process.env.OPENROUTER_TITLE || "OpenPAD",
          },
        });
      }

      // 5. Custom Provider
      const customEnabled = process.env.CUSTOM_PROVIDER_ENABLED === "true";
      const customBaseUrl = process.env.CUSTOM_PROVIDER_BASE_URL?.trim();
      const isCustomConfigured = customEnabled && customBaseUrl;

      if (isCustomConfigured) {
        let customModels = ["custom-model"];
        const customKey = process.env.CUSTOM_PROVIDER_API_KEY;

        try {
          const openai = new OpenAI({
            apiKey: customKey || "dummy-key",
            baseURL: customBaseUrl,
          });
          const list = await openai.models.list();
          if (list.data && list.data.length > 0) {
            customModels = list.data.slice(0, 15).map((m) => m.id);
          }
        } catch (error: any) {
          fastify.log.warn(
            `Failed to fetch custom provider models: ${error.message}`,
          );
        }

        providers.push({
          id: "custom",
          name: process.env.CUSTOM_PROVIDER_NAME || "Custom Provider",
          models: customModels,
          configured: true,
          baseUrl: customBaseUrl,
        });
      }

      return { providers };
    },
  );
}
