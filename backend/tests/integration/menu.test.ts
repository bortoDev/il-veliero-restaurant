import request from 'supertest';
import { createApp } from '../../src/app';
import { User } from '../../src/models/User';
import { MenuItem } from '../../src/models/MenuItem';
import { jwtService } from '../../src/services/jwt.service';

describe('Menu REST API Integration Tests', () => {
  const app = createApp();

  let adminToken: string;
  let gestoreToken: string;
  let clientToken: string;

  beforeEach(async () => {
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin.menu@ilveliero.it',
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
      name: 'Chef Gestore',
      email: 'chef.gestore@ilveliero.it',
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
      name: 'Client Dining',
      email: 'client.dining@ilveliero.it',
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

    // Seed test menu items
    await MenuItem.create([
      {
        title: 'Spaghetti alle Vongole Veraci',
        description: 'Spaghetti trafilati al bronzo con vongole veraci di Chioggia, aglio, olio EVO e prezzemolo fresco.',
        price: 18.5,
        category: 'pesce',
        subcategory: 'primi',
        allergens: ['glutine', 'molluschi'],
        isAvailable: true,
        isChefSpecial: true,
      },
      {
        title: 'Gran Fritto Misto dell Adriatico',
        description: 'Calamari, gamberi rosa, triglie e sarde con verdurine croccanti in pastella leggera.',
        price: 22.0,
        category: 'pesce',
        subcategory: 'secondi',
        allergens: ['glutine', 'crostacei', 'pesce', 'molluschi'],
        isAvailable: true,
      },
      {
        title: 'Carpaccio di Tonno Rosso',
        description: 'Tonno rosso con emulsione di agrumi e pepe rosa.',
        price: 19.0,
        category: 'pesce',
        subcategory: 'crudo',
        allergens: ['pesce'],
        isAvailable: true,
      },
      {
        title: 'Filetto di Manzo al Pepe Verde',
        description: 'Pregiato filetto di manzo con crema al pepe verde e sfumatura al cognac.',
        price: 26.0,
        category: 'carne',
        subcategory: 'secondi',
        allergens: ['latte'],
        isAvailable: true,
      },
      {
        title: 'Pizza Marinara Speciale',
        description: 'Pomodoro San Marzano DOP, aglio di Voghiera, origano di Pantelleria e acciughe del Cantabrico.',
        price: 10.0,
        category: 'pizze',
        subcategory: 'speciali',
        allergens: ['glutine', 'pesce'],
        isAvailable: false, // out of stock
      },
    ]);
  });

  describe('GET /api/v1/menu (Public)', () => {
    it('should retrieve all menu items publicly without authentication', async () => {
      const response = await request(app).get('/api/v1/menu');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.count).toBe(5);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter menu items by category (e.g. pesce)', async () => {
      const response = await request(app).get('/api/v1/menu?category=pesce');

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(3);
      expect(response.body.data.every((item: any) => item.category === 'pesce')).toBe(true);
    });

    it('should filter menu items by category and subcategory', async () => {
      const response = await request(app).get('/api/v1/menu?category=pesce&subcategory=crudo');

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].title).toBe('Carpaccio di Tonno Rosso');
    });

    it('should filter menu items by availability', async () => {
      const response = await request(app).get('/api/v1/menu?available=true');

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(4);
      expect(response.body.data.every((item: any) => item.isAvailable === true)).toBe(true);
    });

    it('should exclude dishes containing specified allergens (excludeAllergens=glutine)', async () => {
      const response = await request(app).get('/api/v1/menu?excludeAllergens=glutine');

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(2); // Carpaccio di Tonno Rosso (pesce), Filetto di Manzo (latte)
      expect(
        response.body.data.every((item: any) => !item.allergens.includes('glutine'))
      ).toBe(true);
    });

    it('should exclude dishes containing multiple comma-separated allergens', async () => {
      const response = await request(app).get('/api/v1/menu?excludeAllergens=glutine,pesce');

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1); // Only Filetto di Manzo
      expect(response.body.data[0].title).toBe('Filetto di Manzo al Pepe Verde');
    });

    it('should search dishes by keyword query', async () => {
      const response = await request(app).get('/api/v1/menu?search=vongole');

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].title).toContain('Vongole');
    });

    it('should support pagination params (page & limit)', async () => {
      const response = await request(app).get('/api/v1/menu?page=1&limit=2');

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(2);
      expect(response.body.total).toBe(5);
      expect(response.body.totalPages).toBe(3);
    });
  });

  describe('GET /api/v1/menu/categories', () => {
    it('should return aggregated category breakdown', async () => {
      const response = await request(app).get('/api/v1/menu/categories');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('categories');
      expect(response.body).toHaveProperty('summary');
      expect(response.body.summary.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('GET /api/v1/menu/:id', () => {
    it('should retrieve single dish by valid ID', async () => {
      const item = await MenuItem.findOne({ title: 'Spaghetti alle Vongole Veraci' });
      const id = item!._id.toString();

      const response = await request(app).get(`/api/v1/menu/${id}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(id);
      expect(response.body.data.title).toBe('Spaghetti alle Vongole Veraci');
    });

    it('should return 400 for invalid ObjectId format', async () => {
      const response = await request(app).get('/api/v1/menu/invalid-id');
      expect(response.status).toBe(400);
    });

    it('should return 404 for non-existent ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app).get(`/api/v1/menu/${fakeId}`);
      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/v1/menu (Gestore / Admin)', () => {
    it('should allow gestore to create a new dish', async () => {
      const payload = {
        title: 'Risotto ai Frutti di Mare',
        description: 'Riso Carnaroli mantecato con scampi, cozze, calamari e fumetto di crostacei.',
        price: 20.0,
        category: 'pesce',
        subcategory: 'primi',
        allergens: ['crostacei', 'molluschi', 'pesce'],
        isAvailable: true,
        isChefSpecial: true,
      };

      const response = await request(app)
        .post('/api/v1/menu')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toMatchObject({
        title: 'Risotto ai Frutti di Mare',
        category: 'pesce',
        price: 20.0,
      });

      const dbDish = await MenuItem.findOne({ title: 'Risotto ai Frutti di Mare' });
      expect(dbDish).not.toBeNull();
      expect(dbDish?.isChefSpecial).toBe(true);
    });

    it('should forbid client from creating dish (403 Forbidden)', async () => {
      const response = await request(app)
        .post('/api/v1/menu')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          title: 'Unauthorized Dish',
          description: 'Desc',
          price: 10,
          category: 'pesce',
        });

      expect(response.status).toBe(403);
    });

    it('should reject unauthenticated request with 401', async () => {
      const response = await request(app)
        .post('/api/v1/menu')
        .send({
          title: 'No Auth Dish',
          description: 'Desc',
          price: 10,
          category: 'pesce',
        });

      expect(response.status).toBe(401);
    });

    it('should reject dish creation with negative price', async () => {
      const response = await request(app)
        .post('/api/v1/menu')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .send({
          title: 'Negative Price Dish',
          description: 'Desc',
          price: -5,
          category: 'pesce',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toMatch(/non-negative/i);
    });

    it('should reject dish creation with invalid category', async () => {
      const response = await request(app)
        .post('/api/v1/menu')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .send({
          title: 'Invalid Category Dish',
          description: 'Desc',
          price: 15,
          category: 'fastfood',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toMatch(/invalid category/i);
    });
  });

  describe('PUT /api/v1/menu/:id (Gestore / Admin)', () => {
    it('should allow gestore to update dish details and availability', async () => {
      const item = await MenuItem.findOne({ title: 'Gran Fritto Misto dell Adriatico' });
      const id = item!._id.toString();

      const response = await request(app)
        .put(`/api/v1/menu/${id}`)
        .set('Authorization', `Bearer ${gestoreToken}`)
        .send({
          price: 24.5,
          isAvailable: false,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.price).toBe(24.5);
      expect(response.body.data.isAvailable).toBe(false);

      const updated = await MenuItem.findById(id);
      expect(updated?.price).toBe(24.5);
      expect(updated?.isAvailable).toBe(false);
    });
  });

  describe('DELETE /api/v1/menu/:id (Gestore / Admin)', () => {
    it('should allow gestore to delete a dish', async () => {
      const item = await MenuItem.findOne({ title: 'Filetto di Manzo al Pepe Verde' });
      const id = item!._id.toString();

      const response = await request(app)
        .delete(`/api/v1/menu/${id}`)
        .set('Authorization', `Bearer ${gestoreToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/deleted/i);

      const check = await MenuItem.findById(id);
      expect(check).toBeNull();
    });

    it('should return 404 when deleting non-existent dish', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/v1/menu/${fakeId}`)
        .set('Authorization', `Bearer ${gestoreToken}`);

      expect(response.status).toBe(404);
    });
  });
});
