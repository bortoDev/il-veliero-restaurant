import request from 'supertest';
import { createApp } from '../../src/app';
import { User } from '../../src/models/User';
import { jwtService } from '../../src/services/jwt.service';

describe('RBAC Authorization Matrix Integration Tests', () => {
  const app = createApp();

  let adminToken: string;
  let gestoreToken: string;
  let clientToken: string;
  let deactivatedToken: string;

  beforeEach(async () => {
    const admin = await User.create({
      name: 'Admin RBAC',
      email: 'admin.rbac@ilveliero.it',
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

    const gestore = await User.create({
      name: 'Gestore RBAC',
      email: 'gestore.rbac@ilveliero.it',
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
      name: 'Client RBAC',
      email: 'client.rbac@ilveliero.it',
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

    const deactivated = await User.create({
      name: 'Deactivated RBAC',
      email: 'deactivated.rbac@ilveliero.it',
      password: 'Password123!',
      role: 'client',
      isActive: false,
    });
    deactivatedToken = jwtService.generateToken({
      id: deactivated._id.toString(),
      email: deactivated.email,
      role: deactivated.role,
      name: deactivated.name,
    });
  });

  describe('Public Endpoints Access', () => {
    it('should allow anonymous access to public health check', async () => {
      const response = await request(app).get('/api/v1/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });
  });

  describe('Client Role Boundaries', () => {
    it('should allow client to access own profile at /api/v1/auth/me', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user.role).toBe('client');
    });

    it('should forbid client from accessing admin users API (403 Forbidden)', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
      expect(response.body.error.message).toMatch(/not authorized/i);
    });

    it('should forbid client from accessing admin blacklist API (403 Forbidden)', async () => {
      const response = await request(app)
        .get('/api/v1/admin/blacklist')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should forbid client from accessing admin audit logs API (403 Forbidden)', async () => {
      const response = await request(app)
        .get('/api/v1/admin/audit-logs')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('Gestore Role Boundaries', () => {
    it('should allow gestore to access own profile', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${gestoreToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user.role).toBe('gestore');
    });

    it('should forbid gestore from accessing admin users API (403 Forbidden)', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${gestoreToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should forbid gestore from accessing admin blacklist API (403 Forbidden)', async () => {
      const response = await request(app)
        .get('/api/v1/admin/blacklist')
        .set('Authorization', `Bearer ${gestoreToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should forbid gestore from accessing admin audit logs API (403 Forbidden)', async () => {
      const response = await request(app)
        .get('/api/v1/admin/audit-logs')
        .set('Authorization', `Bearer ${gestoreToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('Admin Role Full Privileges', () => {
    it('should allow admin to access user management endpoints', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should allow admin to access blacklist management endpoints', async () => {
      const response = await request(app)
        .get('/api/v1/admin/blacklist')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    it('should allow admin to access audit log query endpoints', async () => {
      const response = await request(app)
        .get('/api/v1/admin/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Header Format and Deactivation Boundaries', () => {
    it('should reject requests with malformed header prefix (e.g. Basic instead of Bearer)', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Basic ${clientToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error.message).toMatch(/Bearer/i);
    });

    it('should reject requests with empty Bearer token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer ');

      expect(response.status).toBe(401);
    });

    it('should reject requests from deactivated accounts even with cryptographically valid JWT', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${deactivatedToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error.message).toMatch(/deactivated/i);
    });
  });
});
