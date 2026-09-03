import request from 'supertest';
import { createApp } from '../../src/app';

describe('Media Upload & Static Serving Integration Tests', () => {
  const app = createApp();

  describe('POST /api/v1/uploads', () => {
    it('should successfully upload a valid PNG image and return static URL', async () => {
      // 1x1 transparent PNG buffer
      const pngBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );

      const response = await request(app)
        .post('/api/v1/uploads')
        .attach('image', pngBuffer, 'test-dish.png');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('url');
      expect(response.body.url).toMatch(/^\/uploads\/media-\d+-[a-f0-9]+\.png$/);
      expect(response.body).toHaveProperty('originalName', 'test-dish.png');

      // Verify static route serves the uploaded media
      const staticResponse = await request(app).get(response.body.url);
      expect(staticResponse.status).toBe(200);
      expect(staticResponse.headers['content-type']).toMatch(/image\/png/);
    });

    it('should reject upload when no file is attached in image field', async () => {
      const response = await request(app).post('/api/v1/uploads');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'BAD_REQUEST');
      expect(response.body.error.message).toMatch(/No file uploaded/i);
    });

    it('should reject upload of non-image file (e.g. text/plain)', async () => {
      const textBuffer = Buffer.from('console.log("malicious");');

      const response = await request(app)
        .post('/api/v1/uploads')
        .attach('image', textBuffer, 'script.txt');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'BAD_REQUEST');
      expect(response.body.error.message).toMatch(/Invalid file type/i);
    });

    it('should reject upload exceeding 5MB size limit', async () => {
      // Create a 5.5MB dummy buffer
      const largeBuffer = Buffer.alloc(5.5 * 1024 * 1024);

      const response = await request(app)
        .post('/api/v1/uploads')
        .attach('image', largeBuffer, {
          filename: 'oversized.png',
          contentType: 'image/png',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'FILE_TOO_LARGE');
    });
  });
});
