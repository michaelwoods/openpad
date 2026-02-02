import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/api/generate', () => {
    return HttpResponse.json({
      code: 'cube(10);',
      generationInfo: {},
    });
  }),
  http.post('/api/render', () => {
    return HttpResponse.json({
      stl: 'test stl',
    });
  }),
  http.post('/api/filename', () => {
    return HttpResponse.json({
      filename: 'test.stl',
    });
  }),
  http.get('/api/models', () => {
    return HttpResponse.json({
      providers: [
        { 
            id: 'gemini', 
            name: 'Gemini', 
            models: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-3-pro-preview', 'gemini-3-flash-preview'], 
            configured: true 
        },
        { 
            id: 'ollama', 
            name: 'Ollama (Local)', 
            models: ['llama3', 'codellama'], 
            configured: true 
        }
      ]
    });
  }),
];
