
import { build } from '../../test/helper';

test('POST /api/render should return STL data', async () => {
  const app = await build();

  const response = await app.inject({
    method: 'POST',
    url: '/api/render',
    payload: {
      code: 'cube(10);',
    },
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toHaveProperty('stl');
});
