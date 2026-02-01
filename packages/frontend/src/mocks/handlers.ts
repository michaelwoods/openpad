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
      models: ['llama3', 'codellama'],
    });
  }),
];
