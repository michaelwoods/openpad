import { build } from '../../test/helper';

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

test('POST /api/generate should return OpenSCAD code', async () => {
  const app = await build();

  const response = await app.inject({
    method: 'POST',
    url: '/api/generate',
    payload: {
      prompt: 'a 20mm cube',
    },
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toHaveProperty('code');
});

test('POST /api/generate should handle markdown code blocks', async () => {
  const app = await build();

  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const mockGenerate = jest.fn(() => Promise.resolve({
    response: {
      text: () => '```openscad\n$fn = 50;\ncube(10);\n```',
    },
  }));
  (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
    getGenerativeModel: () => ({
      generateContent: mockGenerate,
    }),
  }));

  const response = await app.inject({
    method: 'POST',
    url: '/api/generate',
    payload: {
      prompt: 'a 20mm cube',
    },
  });

  expect(response.statusCode).toBe(200);
  expect(response.json().code).toBe('$fn = 50;\ncube(10);\n');
});