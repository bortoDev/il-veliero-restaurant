import request from 'supertest';
import { createApp } from '../../src/app';
import { User } from '../../src/models/User';
import { Avviso } from '../../src/models/Avviso';
import { jwtService } from '../../src/services/jwt.service';

describe('Avvisi REST API Integration Tests', () => {
  const app = createApp();

  let adminToken: string;
  let gestoreToken: string;
  let clientToken: string;

  beforeEach(async () => {
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin.avvisi@ilveliero.it',
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
      name: 'Gestore Avvisi',
      email: 'gestore.avvisi@ilveliero.it',
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
      email: 'client.avvisi@ilveliero.it',
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

    // Seed test notices
    await Avviso.create([
      {
        title: 'Chiusura Straordinaria per Maltempo',
        message: 'A causa dell allerta meteo adriatica, il ristorante resterà chiuso per pranzo.',
        severity: 'danger',
        isActive: true,
        startDate: new Date(Date.now() - 1000 * 60 * 60), // started 1h ago
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24), // ends tomorrow
      },
      {
        title: 'Nuovo Menù Degustazione Autunno',
        message: 'Disponibile da questo venerdì il nuovo percorso degustazione a base di crostacei e tartufo di mare.',
        severity: 'info',
        isActive: true,
        startDate: new Date(Date.now() - 1000 * 60 * 60 * 24), // started yesterday
      },
      {
        title: 'Avviso Passato Scaduto',
        message: 'Chiusura per ferie estive passata.',
        severity: 'warning',
        isActive: true,
        startDate: new Date(Date.now() - 1000 * 60 * 60 * 48),
        endDate: new Date(Date.now() - 1000 * 60 * 60 * 24), // ended yesterday
      },
      {
        title: 'Avviso Disattivato',
        message: 'Questo avviso è stato disattivato manualmente.',
        severity: 'warning',
        isActive: false,
        startDate: new Date(Date.now() - 1000 * 60 * 60),
      },
    ]);
  });

  describe('GET /api/v1/avvisi/active (Public Banner)', () => {
    it('should return only active, currently valid notices sorted by severity', async () => {
      const response = await request(app).get('/api/v1/avvisi/active');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.count).toBe(2); // Maltempo (danger) + Degustazione (info)
      expect(response.body.data[0].title).toBe('Chiusura Straordinaria per Maltempo');
    });
  });

  describe('GET /api/v1/avvisi', () => {
    it('should return all notices with metadata', async () => {
      const response = await request(app).get('/api/v1/avvisi');

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(4);
    });

    it('should filter notices by severity', async () => {
      const response = await request(app).get('/api/v1/avvisi?severity=danger');

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].severity).toBe('danger');
    });
  });

  describe('POST /api/v1/avvisi (Gestore / Admin)', () => {
    it('should allow gestore to publish an active notice banner', async () => {
      const payload = {
        title: 'Ferie Stagionali di Novembre',
        message: 'Il Veliero rimarrà chiuso dal 10 al 20 Novembre per lavori di manutenzione locali.',
        severity: 'warning',
        startDate: new Date(),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
        isActive: true,
      };

      const response = await request(app)
        .post('/api/v1/avvisi')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.title).toBe('Ferie Stagionali di Novembre');
      expect(response.body.data.severity).toBe('warning');

      const dbNotice = await Avviso.findOne({ title: 'Ferie Stagionali di Novembre' });
      expect(dbNotice).not.toBeNull();
    });

    it('should reject notice creation when endDate is before startDate', async () => {
      const payload = {
        title: 'Invalid Date Banner',
        message: 'Message',
        severity: 'info',
        startDate: new Date(Date.now() + 1000 * 60 * 60 * 24), // tomorrow
        endDate: new Date(Date.now() - 1000 * 60 * 60 * 24), // yesterday
      };

      const response = await request(app)
        .post('/api/v1/avvisi')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.message).toMatch(/endDate must be later than startDate/i);
    });

    it('should reject invalid severity level', async () => {
      const payload = {
        title: 'Invalid Severity Banner',
        message: 'Message',
        severity: 'critical_emergency',
      };

      const response = await request(app)
        .post('/api/v1/avvisi')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.message).toMatch(/invalid severity/i);
    });
  });

  describe('PUT /api/v1/avvisi/:id (Gestore / Admin)', () => {
    it('should allow gestore to update notice message and severity', async () => {
      const notice = await Avviso.findOne({ title: 'Nuovo Menù Degustazione Autunno' });
      const id = notice!._id.toString();

      const response = await request(app)
        .put(`/api/v1/avvisi/${id}`)
        .set('Authorization', `Bearer ${gestoreToken}`)
        .send({
          severity: 'warning',
          message: 'Posti limitati per la serata inaugurale.',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.severity).toBe('warning');
      expect(response.body.data.message).toBe('Posti limitati per la serata inaugurale.');
    });
  });

  describe('DELETE /api/v1/avvisi/:id (Gestore / Admin)', () => {
    it('should allow gestore to delete notice', async () => {
      const notice = await Avviso.findOne({ title: 'Avviso Disattivato' });
      const id = notice!._id.toString();

      const response = await request(app)
        .delete(`/api/v1/avvisi/${id}`)
        .set('Authorization', `Bearer ${gestoreToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/deleted/i);

      const check = await Avviso.findById(id);
      expect(check).toBeNull();
    });
  });
});
