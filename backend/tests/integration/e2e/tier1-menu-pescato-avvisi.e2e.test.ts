import request from 'supertest';
import { createApp } from '../../../src/app';
import { User } from '../../../src/models/User';
import { MenuItem } from '../../../src/models/MenuItem';
import { Pescato } from '../../../src/models/Pescato';
import { Avviso } from '../../../src/models/Avviso';
import { Evento } from '../../../src/models/Evento';
import { jwtService } from '../../../src/services/jwt.service';

describe('Tier 1: Menu, Weekly Pescato, Avvisi & Eventi E2E Suite', () => {
  const app = createApp();

  let gestoreToken: string;
  let clientToken: string;

  beforeEach(async () => {
    const gestore = await User.create({
      name: 'Gestore Cucina',
      email: 'gestore.menu@ilveliero.it',
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
      name: 'Cliente Ospite',
      email: 'cliente.menu@ilveliero.it',
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

    // Seed dishes from mockup
    await MenuItem.create([
      {
        title: 'Crostini di pane pizza con crema di dentice',
        description: 'Pane pizza artigianale tostato con crema soffice di dentice mantecato all\'olio EVO.',
        price: 9.0,
        category: 'pesce',
        subcategory: 'antipasti',
        allergens: ['glutine', 'pesce'],
        isAvailable: true,
      },
      {
        title: 'Calamaretti spillo fritti con polentina',
        description: 'Calamaretti tenerissimi fritti ad alta temperatura serviti con polenta calda morbida.',
        price: 12.0,
        category: 'pesce',
        subcategory: 'antipasti',
        allergens: ['glutine', 'molluschi'],
        isAvailable: true,
        isChefSpecial: true,
      },
      {
        title: 'Filetti di alici marinate',
        description: 'Alici freschissime marinate all\'aceto di mele, bacche di pepe rosa e prezzemolo.',
        price: 9.0,
        category: 'pesce',
        subcategory: 'antipasti',
        allergens: ['pesce'],
        isAvailable: true,
      },
      {
        title: 'Schie fritte con polenta',
        description: 'Tipici gamberetti di laguna fritti interi croccanti accompagnati da polenta veneta.',
        price: 10.0,
        category: 'pesce',
        subcategory: 'antipasti',
        allergens: ['glutine', 'crostacei'],
        isAvailable: true,
      },
      {
        title: 'Sardine fritte',
        description: 'Sarde dell\'Adriatico aperte a libro, infarinate e dorate in olio caldo.',
        price: 8.0,
        category: 'pesce',
        subcategory: 'antipasti',
        allergens: ['glutine', 'pesce'],
        isAvailable: true,
      },
    ]);
  });

  // =========================================================================
  // 1. MENU CRUD & MOCKUP DISHES
  // =========================================================================
  describe('1. Menu CRUD & Category Filtering', () => {
    it('1.1 should list all mockup dishes in public menu', async () => {
      const response = await request(app).get('/api/v1/menu');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.count).toBe(5);

      const titles = response.body.data.map((d: any) => d.title);
      expect(titles).toContain('Crostini di pane pizza con crema di dentice');
      expect(titles).toContain('Calamaretti spillo fritti con polentina');
      expect(titles).toContain('Filetti di alici marinate');
      expect(titles).toContain('Schie fritte con polenta');
      expect(titles).toContain('Sardine fritte');
    });

    it('1.2 should filter dishes by category (pesce)', async () => {
      const response = await request(app).get('/api/v1/menu?category=pesce');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(5);
      expect(response.body.data.every((d: any) => d.category === 'pesce')).toBe(true);
    });

    it('1.3 should filter out dishes with gluten (excludeAllergens=glutine)', async () => {
      const response = await request(app).get('/api/v1/menu?excludeAllergens=glutine');

      expect(response.status).toBe(200);
      // Only "Filetti di alici marinate" does not have gluten
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].title).toBe('Filetti di alici marinate');
    });

    it('1.4 should allow Gestore to create, update, and delete menu dishes', async () => {
      // 1. Create
      const createRes = await request(app)
        .post('/api/v1/menu')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .send({
          title: 'Pizza Campione del Mondo',
          description: 'Fior di latte, pomodorini del Piennolo, gamberi rossi a crudo e granella di pistacchio.',
          price: 16.0,
          category: 'pizze',
          allergens: ['glutine', 'latte', 'crostacei', 'frutta_a_guscio'],
          isAvailable: true,
        });

      expect(createRes.status).toBe(201);
      const dishId = createRes.body.data.id || createRes.body.data._id;

      // 2. Update
      const updateRes = await request(app)
        .put(`/api/v1/menu/${dishId}`)
        .set('Authorization', `Bearer ${gestoreToken}`)
        .send({ price: 17.5 });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.price).toBe(17.5);

      // 3. Delete
      const deleteRes = await request(app)
        .delete(`/api/v1/menu/${dishId}`)
        .set('Authorization', `Bearer ${gestoreToken}`);

      expect(deleteRes.status).toBe(200);
    });

    it('1.5 should forbid Client from creating menu dishes (403 Forbidden)', async () => {
      const response = await request(app)
        .post('/api/v1/menu')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          title: 'Unauthorized Dish',
          description: 'Test',
          price: 10,
          category: 'pesce',
        });

      expect(response.status).toBe(403);
    });
  });

  // =========================================================================
  // 2. PESCATO DEL GIORNO / DIARIO DI BORDO
  // =========================================================================
  describe('2. Pescato del Giorno / Diario di Bordo CRUD', () => {
    it('2.1 should allow Gestore to post fresh catch', async () => {
      const response = await request(app)
        .post('/api/v1/pescato')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .send({
          title: 'Rombo Chiodato dell\'Adriatico',
          description: 'Magnifico esemplare pescato al mattino, ideale per 2 persone al forno con patate.',
          price: 38.0,
          catchDate: new Date(),
          isAvailable: true,
          marketLocation: 'Mercato Ittico Chioggia',
          kilogramsAvailable: 2.4,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.title).toBe('Rombo Chiodato dell\'Adriatico');
    });

    it('2.2 should retrieve public active pescato feed', async () => {
      await Pescato.create({
        title: 'Triglie di Scoglio Fresche',
        description: 'Triglie di fondale ideali per sauté o griglia.',
        price: 22.0,
        isAvailable: true,
        catchDate: new Date(),
      });

      const response = await request(app).get('/api/v1/pescato');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('2.3 should update pescato availability status', async () => {
      const catchItem = await Pescato.create({
        title: 'Seppie Nere con Uova',
        description: 'Seppie fresche',
        price: 18.0,
        isAvailable: true,
      });

      const response = await request(app)
        .put(`/api/v1/pescato/${catchItem._id.toString()}`)
        .set('Authorization', `Bearer ${gestoreToken}`)
        .send({ isAvailable: false });

      expect(response.status).toBe(200);
      expect(response.body.data.isAvailable).toBe(false);
    });
  });

  // =========================================================================
  // 3. AVVISI & EVENTI BANNERS
  // =========================================================================
  describe('3. Dynamic Notice Banners (Avvisi) & Eventi', () => {
    it('3.1 should fetch active notice banners for homepage', async () => {
      await Avviso.create({
        title: 'Chiusura per Ferie Estive',
        message: 'Il ristorante sarà chiuso dal 10 al 17 Agosto per ferie del personale.',
        severity: 'info',
        startDate: new Date(Date.now() - 1000 * 60 * 60),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        isActive: true,
      });

      const response = await request(app).get('/api/v1/avvisi/active');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].title).toBe('Chiusura per Ferie Estive');
      expect(response.body.data[0].severity).toBe('info');
    });

    it('3.2 should exclude expired notices from active list', async () => {
      await Avviso.create({
        title: 'Avviso Scaduto',
        message: 'Questo avviso appartiene al passato.',
        severity: 'warning',
        startDate: new Date(Date.now() - 1000 * 60 * 60 * 48),
        endDate: new Date(Date.now() - 1000 * 60 * 60 * 24), // expired yesterday
        isActive: true,
      });

      const response = await request(app).get('/api/v1/avvisi/active');

      expect(response.status).toBe(200);
      const titles = response.body.data.map((a: any) => a.title);
      expect(titles).not.toContain('Avviso Scaduto');
    });

    it('3.3 should allow Gestore to create notice with severity', async () => {
      const response = await request(app)
        .post('/api/v1/avvisi')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .send({
          title: 'Serata a Tema Pescato & Jazz',
          message: 'Prenotazione obbligatoria per il concerto jazz di venerdì sera.',
          severity: 'warning',
          startDate: new Date(),
          isActive: true,
        });

      expect(response.status).toBe(201);
      expect(response.body.data.severity).toBe('warning');
    });

    it('3.4 should fetch upcoming events and track reservations', async () => {
      const event = await Evento.create({
        title: 'Gran Galà della Pizza Campione del Mondo',
        description: 'Degustazione di 6 impasti gourmet e abbinamenti con birre artigianali venete.',
        eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
        price: 50.0,
        maxSeats: 40,
        reservedSeats: 15,
        isActive: true,
      });

      const response = await request(app).get('/api/v1/eventi/upcoming');

      expect(response.status).toBe(200);
      const found = response.body.data.find((e: any) => e.title === 'Gran Galà della Pizza Campione del Mondo');
      expect(found).toBeDefined();
      expect(found.maxSeats).toBe(40);
      expect(found.reservedSeats).toBe(15);
    });
  });
});
