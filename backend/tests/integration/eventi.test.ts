import request from 'supertest';
import { createApp } from '../../src/app';
import { User } from '../../src/models/User';
import { Evento } from '../../src/models/Evento';
import { jwtService } from '../../src/services/jwt.service';

describe('Eventi REST API Integration Tests', () => {
  const app = createApp();

  let adminToken: string;
  let gestoreToken: string;
  let clientToken: string;

  beforeEach(async () => {
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin.eventi@ilveliero.it',
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
      name: 'Gestore Eventi',
      email: 'gestore.eventi@ilveliero.it',
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
      name: 'Client Eventi',
      email: 'client.eventi@ilveliero.it',
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

    // Seed test events
    await Evento.create([
      {
        title: 'Serata Degustazione Crudi & Bollicine',
        description: 'Un viaggio sensoriale attraverso le migliori selezioni di crudi adriatici abbinati a Franciacorta DOCG.',
        eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // in 7 days
        price: 65.0,
        maxSeats: 40,
        reservedSeats: 15,
        isActive: true,
      },
      {
        title: 'Cena a Tema: I Sapori della Laguna Veneta',
        description: 'Menu dedicato alle ricette storiche di Chioggia e Venezia.',
        eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // in 14 days
        price: 55.0,
        maxSeats: 50,
        reservedSeats: 20,
        isActive: true,
      },
      {
        title: 'Festa di Mezzestate Passata',
        description: 'Cena sulla terrazza panoramica.',
        eventDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
        price: 50.0,
        maxSeats: 60,
        reservedSeats: 60,
        isActive: true,
      },
    ]);
  });

  describe('GET /api/v1/eventi/upcoming (Public)', () => {
    it('should return upcoming active events sorted by date ascending', async () => {
      const response = await request(app).get('/api/v1/eventi/upcoming');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.count).toBe(2); // Crudi & Bollicine (in 7d) + Laguna Veneta (in 14d)
      expect(response.body.data[0].title).toBe('Serata Degustazione Crudi & Bollicine');
    });
  });

  describe('GET /api/v1/eventi', () => {
    it('should return all events with optional timeframe filter', async () => {
      const allRes = await request(app).get('/api/v1/eventi');
      expect(allRes.status).toBe(200);
      expect(allRes.body.count).toBe(3);

      const pastRes = await request(app).get('/api/v1/eventi?timeframe=past');
      expect(pastRes.status).toBe(200);
      expect(pastRes.body.count).toBe(1);
      expect(pastRes.body.data[0].title).toBe('Festa di Mezzestate Passata');
    });
  });

  describe('POST /api/v1/eventi (Gestore / Admin)', () => {
    it('should allow gestore to schedule a new culinary event', async () => {
      const payload = {
        title: 'Cena di Capodanno sul Mare',
        description: 'Gran cenone di San Silvestro con menu a base di astice blu e champagne.',
        eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
        price: 120.0,
        maxSeats: 70,
        reservedSeats: 0,
        isActive: true,
      };

      const response = await request(app)
        .post('/api/v1/eventi')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.title).toBe('Cena di Capodanno sul Mare');
      expect(response.body.data.price).toBe(120.0);

      const dbEvent = await Evento.findOne({ title: 'Cena di Capodanno sul Mare' });
      expect(dbEvent).not.toBeNull();
    });

    it('should reject event creation without title or eventDate', async () => {
      const response = await request(app)
        .post('/api/v1/eventi')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .send({
          description: 'No title or date',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/v1/eventi/:id (Gestore / Admin)', () => {
    it('should allow gestore to update event reservations and price', async () => {
      const event = await Evento.findOne({ title: 'Serata Degustazione Crudi & Bollicine' });
      const id = event!._id.toString();

      const response = await request(app)
        .put(`/api/v1/eventi/${id}`)
        .set('Authorization', `Bearer ${gestoreToken}`)
        .send({
          reservedSeats: 35,
          price: 70.0,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.reservedSeats).toBe(35);
      expect(response.body.data.price).toBe(70.0);
    });
  });

  describe('DELETE /api/v1/eventi/:id (Gestore / Admin)', () => {
    it('should allow gestore to delete past event', async () => {
      const event = await Evento.findOne({ title: 'Festa di Mezzestate Passata' });
      const id = event!._id.toString();

      const response = await request(app)
        .delete(`/api/v1/eventi/${id}`)
        .set('Authorization', `Bearer ${gestoreToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/deleted/i);

      const check = await Evento.findById(id);
      expect(check).toBeNull();
    });
  });
});
