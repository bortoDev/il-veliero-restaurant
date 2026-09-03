import request from 'supertest';
import { createApp } from '../../src/app';
import { User } from '../../src/models/User';
import { TokenBlacklist } from '../../src/models/TokenBlacklist';
import { jwtService } from '../../src/services/jwt.service';

describe('Token Blacklist Integration Tests', () => {
  const app = createApp();

  let adminToken: string;
  let gestoreToken: string;
  let clientToken: string;
  let clientUserToken: string;

  beforeEach(async () => {
    const admin = await User.create({
      name: 'Admin User',
      email: 'bortolatofilippo05@gmail.com',
      password: 'Password123!',
      role: 'admin',
      isMasterAdmin: true,
      isActive: true,
    });
    adminToken = jwtService.generateToken({
      id: admin._id.toString(),
      email: admin.email,
      role: admin.role,
      name: admin.name,
    });

    const gestore = await User.create({
      name: 'Gestore User',
      email: 'gestore@ilveliero.it',
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

    const client = await User.create({
      name: 'Client User',
      email: 'client@ilveliero.it',
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

  describe('GET /api/v1/admin/blacklist', () => {
    beforeEach(async () => {
      await TokenBlacklist.create([
        {
          token: 'token_one_sample_1234567890abcdef',
          expiresAt: new Date(Date.now() + 1000 * 60 * 60),
          reason: 'suspicious_activity',
        },
        {
          token: 'token_two_sample_1234567890abcdef',
          expiresAt: new Date(Date.now() - 1000 * 60 * 60), // expired
          reason: 'user_logout',
        },
      ]);
    });

    it('should allow admin to view blacklisted tokens with pagination and metadata', async () => {
      const response = await request(app)
        .get('/api/v1/admin/blacklist')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('count', 2);
      expect(response.body.data[0]).toHaveProperty('tokenSnippet');
      expect(response.body.data[0]).toHaveProperty('isExpired');
      expect(response.body.data[0]).toHaveProperty('ttlRemainingSeconds');
    });

    it('should filter active only tokens when activeOnly=true', async () => {
      const response = await request(app)
        .get('/api/v1/admin/blacklist?activeOnly=true')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].reason).toBe('suspicious_activity');
    });

    it('should search tokens by reason or token string', async () => {
      const response = await request(app)
        .get('/api/v1/admin/blacklist?search=suspicious')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].reason).toBe('suspicious_activity');
    });

    it('should forbid non-admin roles (gestore, client) from accessing blacklist', async () => {
      const gestoreRes = await request(app)
        .get('/api/v1/admin/blacklist')
        .set('Authorization', `Bearer ${gestoreToken}`);
      expect(gestoreRes.status).toBe(403);

      const clientRes = await request(app)
        .get('/api/v1/admin/blacklist')
        .set('Authorization', `Bearer ${clientToken}`);
      expect(clientRes.status).toBe(403);
    });

    it('should reject unauthenticated request with 401', async () => {
      const response = await request(app).get('/api/v1/admin/blacklist');
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/admin/blacklist', () => {
    it('should allow admin to manually blacklist a token and compute expiration from JWT', async () => {
      const targetToken = clientToken;

      const response = await request(app)
        .post('/api/v1/admin/blacklist')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          token: targetToken,
          reason: 'Admin manual revocation',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.token).toBe(targetToken);
      expect(response.body.data.reason).toBe('Admin manual revocation');

      // Verify that target token can no longer access /api/v1/auth/me
      const meResponse = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${targetToken}`);
      expect(meResponse.status).toBe(401);
      expect(meResponse.body.error.message).toMatch(/revoked/i);
    });

    it('should be idempotent when blacklisting the same token multiple times', async () => {
      const payload = {
        token: 'repeat_token_1234567890',
        reason: 'First attempt',
      };

      const res1 = await request(app)
        .post('/api/v1/admin/blacklist')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);
      expect(res1.status).toBe(201);

      const res2 = await request(app)
        .post('/api/v1/admin/blacklist')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          token: 'repeat_token_1234567890',
          reason: 'Second attempt updated',
        });
      expect(res2.status).toBe(201);
      expect(res2.body.data.reason).toBe('Second attempt updated');
    });

    it('should reject when token body is missing (400 Bad Request)', async () => {
      const response = await request(app)
        .post('/api/v1/admin/blacklist')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'No token' });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/v1/admin/blacklist/:token', () => {
    let blacklistedRecord: any;

    beforeEach(async () => {
      blacklistedRecord = await TokenBlacklist.create({
        token: clientToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        reason: 'temporary_lock',
      });
    });

    it('should allow admin to remove a token by raw token string, restoring access', async () => {
      // First verify access is blocked
      const blockedRes = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${clientToken}`);
      expect(blockedRes.status).toBe(401);

      // Remove token from blacklist
      const deleteRes = await request(app)
        .delete(`/api/v1/admin/blacklist/${encodeURIComponent(clientToken)}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body).toHaveProperty('success', true);

      // Verify access is restored
      const restoredRes = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${clientToken}`);
      expect(restoredRes.status).toBe(200);
    });

    it('should allow admin to remove a token by MongoDB ObjectId', async () => {
      const recordId = blacklistedRecord._id.toString();

      const deleteRes = await request(app)
        .delete(`/api/v1/admin/blacklist/${recordId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(200);
    });

    it('should return 404 when trying to delete non-existent blacklisted token', async () => {
      const response = await request(app)
        .delete('/api/v1/admin/blacklist/non_existent_token_123')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});
