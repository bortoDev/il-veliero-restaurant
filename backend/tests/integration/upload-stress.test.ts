import request from 'supertest';
import path from 'path';
import fs from 'fs';
import { createApp } from '../../src/app';
import { User } from '../../src/models/User';
import { jwtService } from '../../src/services/jwt.service';
import { UPLOAD_DIR, MAX_FILE_SIZE_BYTES } from '../../src/middleware/upload.middleware';

describe('Adversarial Upload & Static Serving Stress Test Suite', () => {
  const app = createApp();

  let gestoreToken: string;

  beforeEach(async () => {
    const gestore = await User.create({
      name: 'Gestore Stress Test',
      email: 'gestore.stress@ilveliero.it',
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
  });

  // Valid 1x1 base64 transparent PNG buffer
  const validPngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  // Valid 1x1 JPEG buffer
  const validJpgBuffer = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x60, 0x00, 0x60, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
    0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20,
    0x24, 0x2e, 0x27, 0x20, 0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29,
    0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d, 0x38, 0x32,
    0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00,
    0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
    0x09, 0x0a, 0x0b, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f,
    0x00, 0xbf, 0x00, 0xff, 0xd9,
  ]);

  describe('1. File Size Limits & Boundary Stress Tests', () => {
    it('should allow upload of file exactly within 5MB limit', async () => {
      // 1MB buffer with image/png MIME
      const oneMbBuffer = Buffer.alloc(1024 * 1024);
      const res = await request(app)
        .post('/api/v1/uploads')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .attach('image', oneMbBuffer, {
          filename: 'valid-1mb.png',
          contentType: 'image/png',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.size).toBe(1024 * 1024);
      expect(res.body.url).toMatch(/^\/uploads\/media-\d+-[a-f0-9]+\.png$/);
    });

    it('should reject upload slightly exceeding 5MB limit (5MB + 1 byte)', async () => {
      const oversizedBuffer = Buffer.alloc(MAX_FILE_SIZE_BYTES + 1);
      const res = await request(app)
        .post('/api/v1/uploads')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .attach('image', oversizedBuffer, {
          filename: 'oversized-boundary.png',
          contentType: 'image/png',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FILE_TOO_LARGE');
      expect(res.body.error.message).toMatch(/exceeds maximum allowed limit/i);
    });

    it('should reject massive file payload (15MB)', async () => {
      const massiveBuffer = Buffer.alloc(15 * 1024 * 1024);
      const res = await request(app)
        .post('/api/v1/uploads')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .attach('image', massiveBuffer, {
          filename: 'massive-payload.jpg',
          contentType: 'image/jpeg',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FILE_TOO_LARGE');
    });
  });

  describe('2. MIME Type & Extension Attack Scenarios', () => {
    it('should reject executable file (.exe) with application/octet-stream', async () => {
      const exeBuffer = Buffer.from('MZ\x90\x00\x03\x00\x00\x00\x04\x00');
      const res = await request(app)
        .post('/api/v1/uploads')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .attach('image', exeBuffer, {
          filename: 'malware.exe',
          contentType: 'application/x-msdownload',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('BAD_REQUEST');
      expect(res.body.error.message).toMatch(/Invalid file type/i);
    });

    it('should reject shell script (.sh) with text/x-sh', async () => {
      const shBuffer = Buffer.from('#!/bin/bash\nrm -rf /');
      const res = await request(app)
        .post('/api/v1/uploads')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .attach('image', shBuffer, {
          filename: 'script.sh',
          contentType: 'text/x-sh',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('BAD_REQUEST');
    });

    it('should reject HTML/SVG files to prevent Stored XSS', async () => {
      const svgBuffer = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
      const res = await request(app)
        .post('/api/v1/uploads')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .attach('image', svgBuffer, {
          filename: 'xss.svg',
          contentType: 'image/svg+xml',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('BAD_REQUEST');
      expect(res.body.error.message).toMatch(/Invalid file type/i);
    });

    it('should reject PDF document disguised as image form field', async () => {
      const pdfBuffer = Buffer.from('%PDF-1.4 ...');
      const res = await request(app)
        .post('/api/v1/uploads')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .attach('image', pdfBuffer, {
          filename: 'document.pdf',
          contentType: 'application/pdf',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('BAD_REQUEST');
    });

    it('should accept valid WEBP image', async () => {
      const webpBuffer = Buffer.from('RIFF....WEBPVP8 ...');
      const res = await request(app)
        .post('/api/v1/uploads')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .attach('image', webpBuffer, {
          filename: 'dish.webp',
          contentType: 'image/webp',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.mimetype).toBe('image/webp');
    });

    it('should accept valid GIF image', async () => {
      const gifBuffer = Buffer.from('GIF89a...');
      const res = await request(app)
        .post('/api/v1/uploads')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .attach('image', gifBuffer, {
          filename: 'animation.gif',
          contentType: 'image/gif',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.mimetype).toBe('image/gif');
    });
  });

  describe('3. Form Field Name & Payload Anomalies', () => {
    it('should reject when wrong form field name is used (e.g. "file" instead of "image")', async () => {
      const res = await request(app)
        .post('/api/v1/uploads')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .attach('file', validPngBuffer, 'photo.png');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNEXPECTED_FIELD');
      expect(res.body.error.message).toMatch(/Unexpected upload field/i);
    });

    it('should reject when field name is "avatar"', async () => {
      const res = await request(app)
        .post('/api/v1/uploads')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .attach('avatar', validPngBuffer, 'avatar.png');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNEXPECTED_FIELD');
    });

    it('should reject empty POST request without multipart payload', async () => {
      const res = await request(app)
        .post('/api/v1/uploads')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('BAD_REQUEST');
      expect(res.body.error.message).toMatch(/No file uploaded/i);
    });
  });

  describe('4. Filename Sanitization & Directory Traversal Resistance', () => {
    it('should neutralize directory traversal in original filename (e.g. ../../etc/passwd.png)', async () => {
      const res = await request(app)
        .post('/api/v1/uploads')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .attach('image', validPngBuffer, {
          filename: '../../../../etc/passwd.png',
          contentType: 'image/png',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      // Generated filename must start with media- and be stored directly in UPLOAD_DIR
      expect(res.body.filename).toMatch(/^media-\d+-[a-f0-9]+\.png$/);
      expect(res.body.filename).not.toContain('..');
      expect(res.body.filename).not.toContain('/');
      expect(res.body.filename).not.toContain('\\');

      // Verify physical disk file is inside UPLOAD_DIR
      const filePath = path.join(UPLOAD_DIR, res.body.filename);
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should handle filenames with spaces and UTF-8 characters safely', async () => {
      const res = await request(app)
        .post('/api/v1/uploads')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .attach('image', validPngBuffer, {
          filename: 'pescato del giorno 🐟 & crostacei #1.png',
          contentType: 'image/png',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.filename).toMatch(/^media-\d+-[a-f0-9]+\.png$/);
      expect(res.body.originalName).toBe('pescato del giorno 🐟 & crostacei #1.png');
    });

    it('should handle filenames without extension safely', async () => {
      const res = await request(app)
        .post('/api/v1/uploads')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .attach('image', validPngBuffer, {
          filename: 'noextensionfile',
          contentType: 'image/png',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.filename).toMatch(/^media-\d+-[a-f0-9]+$/);
    });
  });

  describe('5. Static Serving & HTTP Delivery Verification', () => {
    it('should serve uploaded image with correct content-type and cache headers', async () => {
      const uploadRes = await request(app)
        .post('/api/v1/uploads')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .attach('image', validPngBuffer, 'serve-test.png');

      expect(uploadRes.status).toBe(201);
      const url = uploadRes.body.url;

      const staticRes = await request(app).get(url);
      expect(staticRes.status).toBe(200);
      expect(staticRes.headers['content-type']).toMatch(/image\/png/);
      expect(staticRes.headers['cache-control']).toBeDefined();
      expect(staticRes.headers['cross-origin-resource-policy']).toBe('cross-origin');
    });

    it('should return 404 for non-existent static image requests', async () => {
      const res = await request(app).get('/uploads/non-existent-image-12345.jpg');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should block directory traversal on static files route', async () => {
      const res = await request(app).get('/uploads/../../package.json');
      // Express static blocks traversal and sends 404 or 403
      expect([403, 404]).toContain(res.status);
    });
  });
});
