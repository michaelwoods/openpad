import { build } from '../../test/helper';
import { basePrompt, modularPrompt } from '../../src/prompts';

process.env.GEMINI_API_KEY = 'test-key';

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn(() => ({
      generateContent: jest.fn(() => Promise.resolve({
        response: {
          text: () => 'cube(10);',
        },
      })),
    })),
  })),
}));

test('POST /api/generate should use the default prompt', async () => {
  const app = await build();
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const mockGenerate = jest.fn(() => Promise.resolve({
    response: {
      text: () => 'cube(10);',
    },
  }));
  (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
    getGenerativeModel: () => ({
      generateContent: mockGenerate,
    }),
  }));

  await app.inject({
    method: 'POST',
    url: '/api/generate',
    payload: {
      prompt: 'a 20mm cube',
    },
  });

  const expectedPrompt = `${basePrompt}\n        **User Request:** "a 20mm cube"\n      `;
  expect(mockGenerate).toHaveBeenCalledWith(expect.stringContaining(expectedPrompt));
});

test('POST /api/generate should use the modular prompt', async () => {
  const app = await build();
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const mockGenerate = jest.fn(() => Promise.resolve({
    response: {
      text: () => 'cube(10);',
    },
  }));
  (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
    getGenerativeModel: () => ({
      generateContent: mockGenerate,
    }),
  }));

  await app.inject({
    method: 'POST',
    url: '/api/generate',
    payload: {
      prompt: 'a 20mm cube',
      style: 'Modular',
    },
  });

  const expectedPrompt = `${basePrompt}${modularPrompt}\n        **User Request:** "a 20mm cube"\n      `;
  expect(mockGenerate).toHaveBeenCalledWith(expect.stringContaining(expectedPrompt));
});

test('POST /api/generate should use the specified model', async () => {
  const app = await build();
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const mockGetGenerativeModel = jest.fn(() => ({
    generateContent: jest.fn(() => Promise.resolve({
      response: {
        text: () => 'cube(10);',
      },
    })),
  }));
  (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
    getGenerativeModel: mockGetGenerativeModel,
  }));

  await app.inject({
    method: 'POST',
    url: '/api/generate',
    payload: {
      prompt: 'test',
      model: 'gemini-3-flash-preview',
    },
  });

  expect(mockGetGenerativeModel).toHaveBeenCalledWith({ model: 'gemini-3-flash-preview' });
});