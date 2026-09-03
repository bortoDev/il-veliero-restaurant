import request from 'supertest';
import { createApp } from '../../src/app';
import { User } from '../../src/models/User';
import { MenuItem } from '../../src/models/MenuItem';
import { TokenBlacklist } from '../../src/models/TokenBlacklist';
import { jwtService } from '../../src/services/jwt.service';

describe('Tier 5: Adversarial Hardening & White-Box Robustness Suite', () => {
  const app = createApp();

  let adminUser: any;
  let adminToken: string;
  let gestoreUser: any;
  let gestoreToken: string;
  let clientUser: any;
  let clientToken: string;

  beforeEach(async () => {
    adminUser = await User.create({
      name: 'Super Admin',
      email: 'super.admin@ilveliero.it',
      password: 'AdminPassword123!',
      role: 'admin',
      isActive: true,
    });
    adminToken = jwtService.generateToken({
      id: adminUser._id.toString(),
      email: adminUser.email,
      role: adminUser.role,
      name: adminUser.name,
    });

    gestoreUser = await User.create({
      name: 'Gestore Test',
      email: 'gestore.test@ilveliero.it',
      password: 'GestorePassword123!',
      role: 'gestore',
      isActive: true,
    });
    gestoreToken = jwtService.generateToken({
      id: gestoreUser._id.toString(),
      email: gestoreUser.email,
      role: gestoreUser.role,
      name: gestoreUser.name,
    });

    clientUser = await User.create({
      name: 'Client Test',
      email: 'client.test@ilveliero.it',
      password: 'ClientPassword123!',
      role: 'client',
      isActive: true,
    });
    clientToken = jwtService.generateToken({
      id: clientUser._id.toString(),
      email: clientUser.email,
      role: clientUser.role,
      name: clientUser.name,
    });
  });

  describe('1. NoSQL Injection & Query Sanitization Defense', () => {
    it('should reject NoSQL object injection in login email or password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: { $gt: '' },
          password: { $ne: null },
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should safely handle regex injection in search queries without DOS', async () => {
      const complexRegex = '((((((((((a+)+)+)+)+)+)+)+)+)+$';
      const response = await request(app).get(`/api/v1/menu?search=${encodeURIComponent(complexRegex)}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    it('should safely handle malicious MongoDB projection or filter operators in allergen exclusion', async () => {
      const injectionPayload = '$where,function(){return true;},$ne,null';
      const response = await request(app).get(
        `/api/v1/menu?excludeAllergens=${encodeURIComponent(injectionPayload)}`
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('2. JWT Cryptographic & Header Tampering Defense', () => {
    it('should reject token with forged header alg="none"', async () => {
      // Craft unsigned token with alg=none
      const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
      const payload = Buffer.from(
        JSON.stringify({ id: adminUser._id.toString(), email: adminUser.email, role: 'admin', name: 'Forged' })
      ).toString('base64url');
      const forgedToken = `${header}.${payload}.`;

      const response = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${forgedToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error.message).toMatch(/invalid authentication token/i);
    });

    it('should reject token signed with a different secret', async () => {
      const jwt = require('jsonwebtoken');
      const badToken = jwt.sign(
        { id: adminUser._id.toString(), role: 'admin', email: adminUser.email, name: 'Admin' },
        'wrong-secret-key-1234567890'
      );

      const response = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${badToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error.message).toMatch(/invalid authentication token/i);
    });

    it('should reject malformed Authorization headers (single token without Bearer prefix)', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', adminToken); // missing Bearer prefix

      expect(response.status).toBe(401);
      expect(response.body.error.message).toMatch(/Bearer/i);
    });

    it('should reject Authorization headers with excess parts (e.g. Bearer token extra)', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${adminToken} extra_garbage_token`);

      expect(response.status).toBe(401);
      expect(response.body.error.message).toMatch(/Bearer/i);
    });
  });

  describe('3. Prototype Pollution & Parameter Fuzzing Defense', () => {
    it('should safely reject or sanitize prototype pollution payloads (__proto__, constructor)', async () => {
      const response = await request(app)
        .post('/api/v1/menu')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .send({
          title: 'Pollution Test Dish',
          description: 'Desc',
          price: 15.0,
          category: 'pesce',
          __proto__: { isAdmin: true },
          constructor: { prototype: { poll: 'polluted' } },
        });

      expect(response.status).toBe(201);
      expect((Object.prototype as any).isAdmin).toBeUndefined();
      expect((Object.prototype as any).poll).toBeUndefined();
    });

    it('should handle numeric boundary fuzzing (NaN, Infinity, negative numbers in price)', async () => {
      const resNaN = await request(app)
        .post('/api/v1/menu')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .send({
          title: 'NaN Price Dish',
          description: 'Desc',
          price: 'not-a-number',
          category: 'pesce',
        });
      expect(resNaN.status).toBe(400);

      const resNegative = await request(app)
        .post('/api/v1/menu')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .send({
          title: 'Negative Price Dish',
          description: 'Desc',
          price: -999.99,
          category: 'pesce',
        });
      expect(resNegative.status).toBe(400);
    });
  });

  describe('4. Administrative Self-Lockout Invariants', () => {
    it('should prevent administrator from demoting own role to gestore or client', async () => {
      const response = await request(app)
        .patch(`/api/v1/admin/users/${adminUser._id.toString()}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'gestore' });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toMatch(/cannot demote your own/i);

      // Verify admin role is preserved
      const check = await User.findById(adminUser._id);
      expect(check?.role).toBe('admin');
    });

    it('should prevent administrator from deactivating own active status', async () => {
      const response = await request(app)
        .patch(`/api/v1/admin/users/${adminUser._id.toString()}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toMatch(/cannot deactivate your own/i);

      const check = await User.findById(adminUser._id);
      expect(check?.isActive).toBe(true);
    });

    it('should prevent administrator from deleting own account', async () => {
      const response = await request(app)
        .delete(`/api/v1/admin/users/${adminUser._id.toString()}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error.message).toMatch(/cannot delete your own/i);

      const check = await User.findById(adminUser._id);
      expect(check).not.toBeNull();
    });
  });

  describe('5. Large Payload & String Boundary Handling', () => {
    it('should reject titles exceeding maximum length boundary', async () => {
      const longTitle = 'A'.repeat(150); // max is 120
      const response = await request(app)
        .post('/api/v1/menu')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .send({
          title: longTitle,
          description: 'Valid description',
          price: 15.0,
          category: 'pesce',
        });

      expect(response.status).toBe(400);
    });

    it('should safely process maximum allowed descriptions without memory leak', async () => {
      const maxDesc = 'Cucina tipica marinara. '.repeat(40); // ~960 chars, under 1000
      const response = await request(app)
        .post('/api/v1/menu')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .send({
          title: 'Piattone dell Adriatico',
          description: maxDesc,
          price: 25.0,
          category: 'pesce',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.description.length).toBeGreaterThan(900);
    });
  });
});
