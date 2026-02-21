import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

export interface GenerationResult {
  text: string;
  finishReason?: string;
  safetyRatings?: any;
}

export interface GenerateOptions {
  prompt: string;
  model: string;
  apiKey?: string; // For Gemini, OpenAI, or Ollama
  apiHost?: string; // For Ollama
  baseUrl?: string; // For OpenAI
  extraHeaders?: Record<string, string>; // For OpenRouter and custom providers
}

export async function generateWithGemini(
  options: GenerateOptions,
): Promise<GenerationResult> {
  const { prompt, model: modelName, apiKey } = options;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return {
      text: response.text(),
      finishReason: response.candidates?.[0]?.finishReason,
      safetyRatings: response.candidates?.[0]?.safetyRatings,
    };
  } catch (error: any) {
    throw new Error(`Gemini API Error: ${error.message}`);
  }
}

export async function generateWithOpenAI(
  options: GenerateOptions,
): Promise<GenerationResult> {
  const { prompt, model: modelName, apiKey, baseUrl, extraHeaders } = options;
  if (!apiKey && !baseUrl) {
    throw new Error("OPENAI_API_KEY or OPENAI_BASE_URL must be set");
  }

  const openai = new OpenAI({
    apiKey: apiKey || "dummy-key",
    baseURL: baseUrl,
    defaultHeaders: extraHeaders,
  });

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: modelName,
    });

    return {
      text: completion.choices[0].message.content || "",
      finishReason: completion.choices[0].finish_reason,
    };
  } catch (error: any) {
    throw new Error(
      `OpenAI Error (BaseURL: ${baseUrl || "default"}): ${error.message}`,
    );
  }
}

export async function generateWithOllama(
  options: GenerateOptions,
): Promise<GenerationResult> {
  const { prompt, model, apiHost, apiKey } = options;
  const host = apiHost || "http://127.0.0.1:11434";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  try {
    // Use /api/generate for single prompt generation
    const response = await fetch(`${host}/api/generate`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        prompt,
        stream: false, // We wait for full response
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Ollama API error: ${response.status} ${response.statusText}`,
      );
    }

    const data: any = await response.json();

    return {
      text: data.response,
      finishReason: data.done_reason,
      // Ollama doesn't have safety ratings in the same way
    };
  } catch (error: any) {
    throw new Error(`Ollama Error (Host: ${host}): ${error.message}`);
  }
}
