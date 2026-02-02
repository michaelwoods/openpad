import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

export interface GenerationResult {
  text: string;
  finishReason?: string;
  safetyRatings?: any;
}

export interface GenerateOptions {
  prompt: string;
  model: string;
  apiKey?: string; // For Gemini or OpenAI
  apiHost?: string; // For Ollama
}

export async function generateWithGemini(options: GenerateOptions): Promise<GenerationResult> {
  const { prompt, model: modelName, apiKey } = options;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  
  return {
    text: response.text(),
    finishReason: response.candidates?.[0]?.finishReason,
    safetyRatings: response.candidates?.[0]?.safetyRatings,
  };
}

export async function generateWithOpenAI(options: GenerateOptions): Promise<GenerationResult> {
  const { prompt, model: modelName, apiKey } = options;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const openai = new OpenAI({ apiKey });

  const completion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: modelName,
  });

  return {
    text: completion.choices[0].message.content || '',
    finishReason: completion.choices[0].finish_reason,
  };
}

export async function generateWithOllama(options: GenerateOptions): Promise<GenerationResult> {
  const { prompt, model, apiHost } = options;
  const host = apiHost || 'http://127.0.0.1:11434';
  
  // Use /api/generate for single prompt generation
  const response = await fetch(`${host}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      stream: false, // We wait for full response
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
  }

  const data: any = await response.json();
  
  return {
    text: data.response,
    finishReason: data.done_reason,
    // Ollama doesn't have safety ratings in the same way
  };
}
