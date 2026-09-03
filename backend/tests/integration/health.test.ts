import request from 'supertest';
import { createApp } from '../../src/app';

describe('Health & Global Routes Integration Tests', () => {
  const app = createApp();

  describe('GET /api/v1/health', () => {
    it('should return 200 OK with healthy service and database status', async () => {
      const response = await request(app).get('/api/v1/health');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('service', 'il-veliero-backend');
      expect(response.body).toHaveProperty('database', 'connected');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('404 Undefined Routes Handler', () => {
    it('should return standard 404 NOT_FOUND envelope for non-existent routes', async () => {
      const response = await request(app).get('/api/v1/non-existent-path');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
      expect(response.body.error.message).toMatch(/not found/i);
    });
  });
});
