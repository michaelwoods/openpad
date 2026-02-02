import { describe, it, expect } from 'vitest';
import { generateCode, renderModel, getFilename, getProviders } from './api';
import { server } from './mocks/server';
import { http, HttpResponse } from 'msw';

describe('API Service', () => {
  // MSW server is already listening from setupTests.ts

  describe('generateCode', () => {
    it('sends correct request and returns data', async () => {
      let capturedBody: any;
      server.use(
        http.post('/api/generate', async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json({ code: 'cube(10);', stl: 'base64', generationInfo: {} });
        })
      );

      const result = await generateCode('prompt', 'gemini-pro', 'Default', null, 'gemini');

      expect(capturedBody).toEqual(expect.objectContaining({
        prompt: expect.stringContaining('prompt'),
        model: 'gemini-pro',
        style: 'Default',
        provider: 'gemini',
      }));
      expect(result.code).toBe('cube(10);');
    });

    it('throws error on failure', async () => {
      server.use(
        http.post('/api/generate', () => {
          return HttpResponse.json({ details: 'Server Error' }, { status: 500 });
        })
      );

      await expect(generateCode('prompt', 'model', 'style')).rejects.toThrow('Server Error');
    });
  });

  describe('renderModel', () => {
    it('sends correct request and returns data', async () => {
      let capturedBody: any;
      server.use(
        http.post('/api/render', async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json({ stl: 'base64' });
        })
      );

      const result = await renderModel('cube(10);');

      expect(capturedBody).toEqual({ code: 'cube(10);' });
      expect(result.stl).toBe('base64');
    });

    it('throws error on failure', async () => {
      server.use(
        http.post('/api/render', () => {
          return HttpResponse.json({ details: 'Render Error' }, { status: 400 });
        })
      );

      await expect(renderModel('bad code')).rejects.toThrow('Render Error');
    });
  });

  describe('getFilename', () => {
    it('returns filename on success', async () => {
      let capturedBody: any;
      server.use(
        http.post('/api/filename', async ({ request }) => {
            capturedBody = await request.json();
            return HttpResponse.json({ filename: 'cool-model' });
        })
      );

      const filename = await getFilename('prompt');
      expect(capturedBody).toEqual({ prompt: 'prompt' });
      expect(filename).toBe('cool-model');
    });

    it('throws error if filename missing', async () => {
        server.use(
            http.post('/api/filename', () => {
                return HttpResponse.json({});
            })
        );
  
        await expect(getFilename('prompt')).rejects.toThrow('Could not generate filename');
      });
  });

  describe('getProviders', () => {
    it('returns providers list on success', async () => {
      server.use(
        http.get('/api/models', () => {
          return HttpResponse.json({ 
            providers: [{ id: 'gemini', name: 'Gemini', models: ['gemini-pro'], configured: true }] 
          });
        })
      );

      const providers = await getProviders();
      expect(providers).toEqual([{ id: 'gemini', name: 'Gemini', models: ['gemini-pro'], configured: true }]);
    });

    it('returns empty array on failure', async () => {
      server.use(
        http.get('/api/models', () => {
          return HttpResponse.json({}, { status: 500 });
        })
      );

      const providers = await getProviders();
      expect(providers).toEqual([]);
    });
  });
});
