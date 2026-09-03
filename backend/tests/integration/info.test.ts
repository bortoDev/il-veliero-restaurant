import request from 'supertest';
import { createApp } from '../../src/app';
import { User } from '../../src/models/User';
import { InfoLocale } from '../../src/models/InfoLocale';
import { jwtService } from '../../src/services/jwt.service';

describe('InfoLocale REST API Integration Tests', () => {
  const app = createApp();

  let adminToken: string;
  let gestoreToken: string;
  let clientToken: string;

  beforeEach(async () => {
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin.info@ilveliero.it',
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
      name: 'Gestore Info',
      email: 'gestore.info@ilveliero.it',
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
      name: 'Client Info',
      email: 'client.info@ilveliero.it',
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

  describe('GET /api/v1/info & /api/v1/info-locale (Public)', () => {
    it('should return singleton restaurant info, automatically seeding Bassano del Grappa defaults if none exists', async () => {
      const response = await request(app).get('/api/v1/info');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.name).toContain('Il Veliero');
      expect(response.body.data.phone).toBe('0424 500 200');
      expect(response.body.data.pIva).toBe('03450720242');
      expect(response.body.data.sdi).toBe('P62QHVQ');
      expect(response.body.data.email).toBe('info@ristorante-ilveliero.it');
      expect(response.body.data.historyStory).toContain('Federico Bortolato');
      expect(response.body.data.openingHours.wednesday.isClosed).toBe(true);
      expect(response.body.data.openingHours.monday.isClosed).toBe(false);

      // Verify /api/v1/info-locale alias
      const responseLocale = await request(app).get('/api/v1/info-locale');
      expect(responseLocale.status).toBe(200);
      expect(responseLocale.body.data.pIva).toBe('03450720242');
    });
  });

  describe('PUT /api/v1/info (Gestore / Admin)', () => {
    it('should allow gestore to update restaurant contacts, hours, and story', async () => {
      const payload = {
        phone: '+39 041 400999',
        email: 'prenotazioni@ilveliero.it',
        address: 'Riva Vena, 12, Chioggia (VE)',
        historyStory: 'Una tradizione di tre generazioni di pescatori chioggiotti che si rinnova ogni giorno.',
        openingHours: {
          notes: 'Apertura estiva continua tutti i giorni tranne il lunedì.',
        },
      };

      const response = await request(app)
        .put('/api/v1/info')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.phone).toBe('+39 041 400999');
      expect(response.body.data.email).toBe('prenotazioni@ilveliero.it');
      expect(response.body.data.historyStory).toContain('tre generazioni');
      expect(response.body.data.openingHours.notes).toContain('Apertura estiva');

      // Verify public GET returns updated values
      const getRes = await request(app).get('/api/v1/info');
      expect(getRes.body.data.phone).toBe('+39 041 400999');
    });

    it('should forbid client from modifying restaurant info (403 Forbidden)', async () => {
      const response = await request(app)
        .put('/api/v1/info')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ phone: '+39 000 000000' });

      expect(response.status).toBe(403);
    });

    it('should reject invalid email format on update', async () => {
      const response = await request(app)
        .put('/api/v1/info')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .send({ email: 'not-a-valid-email' });

      expect(response.status).toBe(400);
    });
  });
});
