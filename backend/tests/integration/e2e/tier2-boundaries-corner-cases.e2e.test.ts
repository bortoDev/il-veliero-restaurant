import request from 'supertest';
import { createApp } from '../../../src/app';
import { User } from '../../../src/models/User';
import { MenuItem } from '../../../src/models/MenuItem';
import { Avviso } from '../../../src/models/Avviso';
import { jwtService } from '../../../src/services/jwt.service';

describe('Tier 2: Boundary, Corner Cases & Input Validation E2E Suite', () => {
  const app = createApp();

  let adminToken: string;
  let gestoreToken: string;

  beforeEach(async () => {
    const admin = await User.create({
      name: 'Admin Boundary',
      email: 'admin.boundary@ilveliero.it',
      password: 'AdminPassword123!',
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
      name: 'Gestore Boundary',
      email: 'gestore.boundary@ilveliero.it',
      password: 'GestorePassword123!',
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

  // =========================================================================
  // 1. CREDENTIALS & LOGIN BOUNDARIES
  // =========================================================================
  describe('1. Credentials & Auth Boundaries', () => {
    it('1.1 should reject empty JSON object in login payload', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({});
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('1.2 should handle case-insensitive email authentication smoothly', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'GESTORE.BOUNDARY@ILVELIERO.IT',
          password: 'GestorePassword123!',
        });

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('gestore.boundary@ilveliero.it');
    });

    it('1.3 should reject malformed email with missing domain or @ symbol', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Invalid Email User',
          email: 'not-an-email-format',
          password: 'Password123!',
        });

      expect(response.status).toBe(400);
    });

    it('1.4 should reject corrupted JWT authorization token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid.corrupted.token.signature');

      expect(response.status).toBe(401);
    });

    it('1.5 should handle rapid consecutive logout requests gracefully without crashing', async () => {
      const res1 = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${gestoreToken}`);
      expect(res1.status).toBe(200);

      // Second logout attempt with same token
      const res2 = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${gestoreToken}`);
      expect([200, 401]).toContain(res2.status);
    });
  });

  // =========================================================================
  // 2. NUMERIC & DATA TYPE BOUNDARIES
  // =========================================================================
  describe('2. Numeric & Data Type Boundaries', () => {
    it('2.1 should reject negative dish prices', async () => {
      const response = await request(app)
        .post('/api/v1/menu')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .send({
          title: 'Negative Price Dish',
          description: 'Valid description',
          price: -0.01,
          category: 'pesce',
        });

      expect(response.status).toBe(400);
    });

    it('2.2 should accept zero price for complementary/free items (price: 0)', async () => {
      const response = await request(app)
        .post('/api/v1/menu')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .send({
          title: 'Coperto e Cestino del Pane',
          description: 'Pane fresco di nostra produzione e grissini artigianali.',
          price: 0,
          category: 'contorni',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.price).toBe(0);
    });

    it('2.3 should reject non-numeric price string values', async () => {
      const response = await request(app)
        .post('/api/v1/menu')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .send({
          title: 'Non-numeric price dish',
          description: 'Desc',
          price: 'ten_euros',
          category: 'pesce',
        });

      expect(response.status).toBe(400);
    });
  });

  // =========================================================================
  // 3. UNICODE, SPECIAL CHARACTERS & STRING LENGTHS
  // =========================================================================
  describe('3. Unicode & Special Character Integrity', () => {
    it('3.1 should handle authentic Venetian dialect and emoji characters without corruption', async () => {
      const response = await request(app)
        .post('/api/v1/menu')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .send({
          title: '⚓ Gran Frittura "Venéxia" & Folpetti 🐟',
          description: 'Polpi di laguna "folpetti" lessati con alloro e pepe, e fritto de paranza.',
          price: 21.5,
          category: 'pesce',
          allergens: ['molluschi', 'glutine'],
        });

      expect(response.status).toBe(201);
      expect(response.body.data.title).toContain('⚓');
      expect(response.body.data.title).toContain('🐟');
      expect(response.body.data.title).toContain('Venéxia');
    });

    it('3.2 should reject titles exceeding max length boundary (>120 chars)', async () => {
      const longTitle = 'Piatto Speciale '.repeat(15);
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
  });

  // =========================================================================
  // 4. DATE WINDOW & NOTICE BOUNDARIES
  // =========================================================================
  describe('4. Notice Date Window Boundaries', () => {
    it('4.1 should correctly identify active notice right at start boundary', async () => {
      const notice = await Avviso.create({
        title: 'Avviso Inizio Immediato',
        message: 'Valido da adesso',
        severity: 'info',
        startDate: new Date(Date.now() - 500),
        endDate: new Date(Date.now() + 1000 * 60 * 60),
        isActive: true,
      });

      const response = await request(app).get('/api/v1/avvisi/active');
      expect(response.status).toBe(200);
      const ids = response.body.data.map((a: any) => a._id?.toString() || a.id?.toString());
      expect(ids).toContain(notice._id.toString());
    });

    it('4.2 should exclude future notices where startDate has not yet arrived', async () => {
      const futureNotice = await Avviso.create({
        title: 'Avviso Futuro Programmato',
        message: 'Valido tra 2 giorni',
        severity: 'info',
        startDate: new Date(Date.now() + 1000 * 60 * 60 * 48), // in 2 days
        isActive: true,
      });

      const response = await request(app).get('/api/v1/avvisi/active');
      expect(response.status).toBe(200);
      const ids = response.body.data.map((a: any) => a._id?.toString() || a.id?.toString());
      expect(ids).not.toContain(futureNotice._id.toString());
    });
  });
});
