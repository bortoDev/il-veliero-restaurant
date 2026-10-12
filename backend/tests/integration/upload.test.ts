import request from 'supertest';
import { createApp } from '../../src/app';
import { User } from '../../src/models/User';
import { jwtService } from '../../src/services/jwt.service';

describe('Media Upload & Static Serving Integration Tests', () => {
  const app = createApp();

  let gestoreToken: string;
  let adminToken: string;
  let clientToken: string;

  beforeEach(async () => {
    const gestore = await User.create({
      name: 'Gestore Upload',
      email: 'gestore.upload@ilveliero.it',
      password: 'Password123!',
      role: 'gestore',
      isActive: true,
    });
    gestoreToken = jwtService.generateToken({
      id: gestore._id.toString(),
      email: gestore.email,
      role: gestore.role,
      name: gestore.name,
    });

    const admin = await User.create({
      name: 'Admin Upload',
      email: 'admin.upload@ilveliero.it',
      password: 'Password123!',
      role: 'admin',
      isActive: true,
    });
    adminToken = jwtService.generateToken({
      id: admin._id.toString(),
      email: admin.email,
      role: admin.role,
      name: admin.name,
    });

    const client = await User.create({
      name: 'Client User',
      email: 'client.upload@ilveliero.it',
      password: 'Password123!',
      role: 'client',
      isActive: true,
    });
    clientToken = jwtService.generateToken({
      id: client._id.toString(),
      email: client.email,
      role: client.role,
      name: client.name,
    });
  });

  describe('POST /api/v1/uploads Authentication & Authorization', () => {
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    it('should reject anonymous upload requests with 401 Unauthorized', async () => {
      const response = await request(app)
        .post('/api/v1/uploads')
        .attach('image', pngBuffer, 'test-dish.png');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject client role upload requests with 403 Forbidden', async () => {
      const response = await request(app)
        .post('/api/v1/uploads')
        .set('Authorization', `Bearer ${clientToken}`)
        .attach('image', pngBuffer, 'test-dish.png');

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should allow gestore role to upload media files', async () => {
      const response = await request(app)
        .post('/api/v1/uploads')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .attach('image', pngBuffer, 'test-gestore.png');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.url).toMatch(/^\/uploads\/media-\d+-[a-f0-9]+\.png$/);
    });

    it('should allow admin role to upload media files', async () => {
      const response = await request(app)
        .post('/api/v1/uploads')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('image', pngBuffer, 'test-admin.png');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.url).toMatch(/^\/uploads\/media-\d+-[a-f0-9]+\.png$/);
    });
  });

  describe('POST /api/v1/uploads Validation', () => {
    it('should successfully upload a valid PNG image and return static URL', async () => {
      // 1x1 transparent PNG buffer
      const pngBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );

      const response = await request(app)
        .post('/api/v1/uploads')
        .set('Authorization', `Bearer ${gestoreToken}`)
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
      const response = await request(app)
        .post('/api/v1/uploads')
        .set('Authorization', `Bearer ${gestoreToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'BAD_REQUEST');
      expect(response.body.error.message).toMatch(/No file uploaded/i);
    });

    it('should reject upload of non-image file (e.g. text/plain)', async () => {
      const textBuffer = Buffer.from('console.log("malicious");');

      const response = await request(app)
        .post('/api/v1/uploads')
        .set('Authorization', `Bearer ${gestoreToken}`)
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
        .set('Authorization', `Bearer ${gestoreToken}`)
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
