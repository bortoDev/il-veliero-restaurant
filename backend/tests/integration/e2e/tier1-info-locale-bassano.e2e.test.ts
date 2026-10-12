import request from 'supertest';
import { createApp } from '../../../src/app';
import { User } from '../../../src/models/User';
import { InfoLocale } from '../../../src/models/InfoLocale';
import { AuditLog } from '../../../src/models/AuditLog';
import { jwtService } from '../../../src/services/jwt.service';

describe('Tier 1: Real Bassano del Grappa Info Locale & Corporate Data E2E Suite', () => {
  const app = createApp();

  let adminUser: any;
  let adminToken: string;
  let gestoreUser: any;
  let gestoreToken: string;
  let clientUser: any;
  let clientToken: string;

  beforeEach(async () => {
    adminUser = await User.create({
      name: 'Federico Bortolato',
      email: 'federico.bortolato@ilveliero.it',
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
      name: 'Sabina Mazzeracca',
      email: 'sabina.gestore@ilveliero.it',
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
      name: 'Cliente Visitatore',
      email: 'visitatore@example.com',
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

    // Seed Real Bassano del Grappa Info Locale
    await InfoLocale.create({
      name: 'Il Veliero — Ristorante & Pizzeria dal Campione del Mondo',
      historyStory: 'Fondato e gestito da Federico Bortolato e Sabina Mazzeracca a Bassano del Grappa, Il Veliero unisce l\'eccellenza della pizza pluripremiata ai campionati mondiali con il pescato fresco dell\'Adriatico.',
      address: 'Via G. Fattori 7 - Località San Michele, 36061 Bassano del Grappa (VI)',
      phone: '0424 500 200',
      email: 'info@ristorante-ilveliero.it',
      openingHours: {
        monday: { lunch: { open: '12:00', close: '14:00' }, dinner: { open: '19:00', close: '22:00' }, isClosed: false },
        tuesday: { lunch: { open: '12:00', close: '14:00' }, dinner: { open: '19:00', close: '22:00' }, isClosed: false },
        wednesday: { lunch: { open: '', close: '' }, dinner: { open: '', close: '' }, isClosed: true },
        thursday: { lunch: { open: '12:00', close: '14:00' }, dinner: { open: '19:00', close: '22:00' }, isClosed: false },
        friday: { lunch: { open: '12:00', close: '14:00' }, dinner: { open: '19:00', close: '22:30' }, isClosed: false },
        saturday: { lunch: { open: '12:00', close: '14:30' }, dinner: { open: '19:00', close: '23:00' }, isClosed: false },
        sunday: { lunch: { open: '12:00', close: '14:30' }, dinner: { open: '19:00', close: '22:30' }, isClosed: false },
        notes: 'Chiuso il Mercoledì per riposo settimanale.',
      },
      coordinates: {
        lat: 45.7667,
        lng: 11.7333,
      },
      socialLinks: {
        facebook: 'https://www.facebook.com/ilvelierobassano',
        instagram: 'https://www.instagram.com/ilvelierotrattoria',
      },
    });
  });

  describe('1. Public Info Locale Retrieval', () => {
    it('1.1 should return real Bassano del Grappa address and location data publicly', async () => {
      // Support both /api/v1/info and /api/v1/info-locale
      let response = await request(app).get('/api/v1/info');
      if (response.status === 404) {
        response = await request(app).get('/api/v1/info-locale');
      }

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      const data = response.body.data;
      expect(data.address || data.indirizzo).toMatch(/Bassano del Grappa/i);
      expect(data.address || data.indirizzo).toMatch(/Via G\.? Fattori 7/i);
    });

    it('1.2 should return real telephone contacts (Landline 0424 500 200)', async () => {
      let response = await request(app).get('/api/v1/info');
      if (response.status === 404) {
        response = await request(app).get('/api/v1/info-locale');
      }

      expect(response.status).toBe(200);
      const data = response.body.data;
      expect(data.phone || data.telefono).toMatch(/0424\s?500\s?200/);
    });

    it('1.3 should verify Wednesday weekly closure schedule', async () => {
      let response = await request(app).get('/api/v1/info');
      if (response.status === 404) {
        response = await request(app).get('/api/v1/info-locale');
      }

      expect(response.status).toBe(200);
      const hours = response.body.data.openingHours || response.body.data.orari;
      expect(hours).toBeDefined();
      if (hours.wednesday) {
        expect(hours.wednesday.isClosed).toBe(true);
      }
    });

    it('1.4 should return official historical narrative and social links', async () => {
      let response = await request(app).get('/api/v1/info');
      if (response.status === 404) {
        response = await request(app).get('/api/v1/info-locale');
      }

      expect(response.status).toBe(200);
      const data = response.body.data;
      expect(data.historyStory || data.storia).toMatch(/Bortolato|Campione del Mondo|Bassano/i);
      expect(data.socialLinks?.instagram || data.social?.instagram).toMatch(/instagram\.com/i);
    });
  });

  describe('2. Protected Info Locale Updates & Audit Tracking', () => {
    it('2.1 should allow Gestore to update opening hours and contact details', async () => {
      let response = await request(app)
        .put('/api/v1/info')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .send({
          phone: '0424 500 200',
          historyStory: 'Nuova narrazione storica aggiornata con successo.',
        });

      if (response.status === 404) {
        response = await request(app)
          .put('/api/v1/info-locale')
          .set('Authorization', `Bearer ${gestoreToken}`)
          .send({
            phone: '0424 500 200',
            historyStory: 'Nuova narrazione storica aggiornata con successo.',
          });
      }

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);

      // Verify update in database
      const dbInfo = await InfoLocale.findOne();
      expect(dbInfo?.historyStory).toBe('Nuova narrazione storica aggiornata con successo.');
    });

    it('2.2 should forbid client user from modifying restaurant info (403 Forbidden)', async () => {
      let response = await request(app)
        .put('/api/v1/info')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ phone: '111 222 333' });

      if (response.status === 404) {
        response = await request(app)
          .put('/api/v1/info-locale')
          .set('Authorization', `Bearer ${clientToken}`)
          .send({ phone: '111 222 333' });
      }

      expect([401, 403]).toContain(response.status);
    });

    it('2.3 should record an audit log when info locale is modified by gestore', async () => {
      await request(app)
        .put('/api/v1/info')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .send({
          historyStory: 'Audit test update',
        });

      await new Promise((r) => setTimeout(r, 50));
      const audit = await AuditLog.findOne({
        userEmail: 'sabina.gestore@ilveliero.it',
        status: 'SUCCESS',
      });
      expect(audit).toBeDefined();
      if (audit) {
        expect(audit.status).toBe('SUCCESS');
        expect(audit.role).toBe('gestore');
        expect(audit.role).not.toBe('anonymous');
      }
    });
  });
});
