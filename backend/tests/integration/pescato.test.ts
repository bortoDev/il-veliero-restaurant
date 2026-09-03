import request from 'supertest';
import { createApp } from '../../src/app';
import { User } from '../../src/models/User';
import { Pescato } from '../../src/models/Pescato';
import { jwtService } from '../../src/services/jwt.service';

describe('Pescato del Giorno REST API Integration Tests', () => {
  const app = createApp();

  let adminToken: string;
  let gestoreToken: string;
  let clientToken: string;

  beforeEach(async () => {
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin.pescato@ilveliero.it',
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
      name: 'Gestore Pescatore',
      email: 'gestore.pescatore@ilveliero.it',
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
      name: 'Client Guest',
      email: 'client.guest@ilveliero.it',
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

    // Seed test catches
    await Pescato.create([
      {
        title: 'Branzino di Mare Pescato all Amo',
        description: 'Splendido esemplare pescato nella notte al largo delle coste di Pellestrina.',
        price: 35.0,
        isAvailable: true,
        catchDate: new Date(),
        marketLocation: 'Mercato Ittico di Chioggia',
        kilogramsAvailable: 4.5,
      },
      {
        title: 'Cicale di Mare (Canocchie) Vive',
        description: 'Canocchie adriatiche freschissime ideali per antipasto o brodetto.',
        price: 24.0,
        isAvailable: true,
        catchDate: new Date(),
        marketLocation: 'Mercato Ittico di Chioggia',
        kilogramsAvailable: 6.0,
      },
      {
        title: 'Orata Reale Pescata Ieri',
        description: 'Orata fresca del giorno precedente.',
        price: 28.0,
        isAvailable: false,
        catchDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        marketLocation: 'Mercato Ittico di Chioggia',
      },
    ]);
  });

  describe('GET /api/v1/pescato (Public)', () => {
    it('should list active daily catches by default', async () => {
      const response = await request(app).get('/api/v1/pescato');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.count).toBe(2); // Only available ones by default
      expect(response.body.data.every((c: any) => c.isAvailable === true)).toBe(true);
    });

    it('should list all catches including unavailable when all=true', async () => {
      const response = await request(app).get('/api/v1/pescato?all=true');

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(3);
    });

    it('should retrieve single catch by ID', async () => {
      const catchItem = await Pescato.findOne({ title: 'Branzino di Mare Pescato all Amo' });
      const id = catchItem!._id.toString();

      const response = await request(app).get(`/api/v1/pescato/${id}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(id);
      expect(response.body.data.title).toBe('Branzino di Mare Pescato all Amo');
    });

    it('should search catches by query keyword', async () => {
      const response = await request(app).get('/api/v1/pescato?search=canocchie&all=true');

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].title).toContain('Canocchie');
    });
  });

  describe('POST /api/v1/pescato (Gestore / Admin)', () => {
    it('should allow gestore to record fresh morning catch', async () => {
      const payload = {
        title: 'Rombo Chiodato Nostrano',
        description: 'Rombo chiodato selvaggio da 2.8 kg, ideale al forno con patate e olive taggiasche.',
        price: 45.0,
        isAvailable: true,
        marketLocation: 'Banchina Pescatori Chioggia',
        kilogramsAvailable: 2.8,
      };

      const response = await request(app)
        .post('/api/v1/pescato')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.title).toBe('Rombo Chiodato Nostrano');
      expect(response.body.data.kilogramsAvailable).toBe(2.8);

      const dbCatch = await Pescato.findOne({ title: 'Rombo Chiodato Nostrano' });
      expect(dbCatch).not.toBeNull();
    });

    it('should forbid client role from creating catch records (403 Forbidden)', async () => {
      const response = await request(app)
        .post('/api/v1/pescato')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          title: 'Unauthorized Catch',
          description: 'Desc',
          price: 20,
        });

      expect(response.status).toBe(403);
    });

    it('should reject catch record with negative kilograms or price', async () => {
      const response = await request(app)
        .post('/api/v1/pescato')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .send({
          title: 'Bad Quantities',
          description: 'Desc',
          price: -10,
          kilogramsAvailable: -2,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/v1/pescato/:id (Gestore / Admin)', () => {
    it('should allow gestore to update catch availability when sold out', async () => {
      const catchItem = await Pescato.findOne({ title: 'Cicale di Mare (Canocchie) Vive' });
      const id = catchItem!._id.toString();

      const response = await request(app)
        .put(`/api/v1/pescato/${id}`)
        .set('Authorization', `Bearer ${gestoreToken}`)
        .send({
          isAvailable: false,
          kilogramsAvailable: 0,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.isAvailable).toBe(false);
      expect(response.body.data.kilogramsAvailable).toBe(0);

      const updated = await Pescato.findById(id);
      expect(updated?.isAvailable).toBe(false);
    });
  });

  describe('DELETE /api/v1/pescato/:id (Gestore / Admin)', () => {
    it('should allow gestore to delete catch record', async () => {
      const catchItem = await Pescato.findOne({ title: 'Orata Reale Pescata Ieri' });
      const id = catchItem!._id.toString();

      const response = await request(app)
        .delete(`/api/v1/pescato/${id}`)
        .set('Authorization', `Bearer ${gestoreToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/deleted/i);

      const check = await Pescato.findById(id);
      expect(check).toBeNull();
    });
  });
});
