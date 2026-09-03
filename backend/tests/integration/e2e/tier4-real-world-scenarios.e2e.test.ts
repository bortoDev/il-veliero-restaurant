import request from 'supertest';
import { createApp } from '../../../src/app';
import { User } from '../../../src/models/User';
import { MenuItem } from '../../../src/models/MenuItem';
import { Pescato } from '../../../src/models/Pescato';
import { Avviso } from '../../../src/models/Avviso';
import { Evento } from '../../../src/models/Evento';
import { InfoLocale } from '../../../src/models/InfoLocale';
import { AuditLog } from '../../../src/models/AuditLog';
import { jwtService } from '../../../src/services/jwt.service';

describe('Tier 4: Real-World Business & Operational Lifecycle E2E Suite', () => {
  const app = createApp();

  let adminUser: any;
  let adminToken: string;
  let gestoreUser: any;
  let gestoreToken: string;

  beforeEach(async () => {
    adminUser = await User.create({
      name: 'Federico Bortolato',
      email: 'federico.bortolato@ilveliero.it',
      password: 'MasterAdminPassword123!',
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
      email: 'sabina.mazzeracca@ilveliero.it',
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

    // Seed Info Locale
    await InfoLocale.create({
      name: 'Il Veliero — Ristorante & Pizzeria dal Campione del Mondo',
      historyStory: 'La grande tradizione del pesce fresco di mare unita alle pizze pluripremiate del Campione del Mondo.',
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
        notes: 'Chiuso il Mercoledì.',
      },
    });
  });

  // =========================================================================
  // SCENARIO 1: FULL RESTAURANT OPERATIONAL DAY SIMULATION
  // =========================================================================
  it('Scenario 4.1: Full Operational Day Lifecycle Simulation (Morning to Night)', async () => {
    // -----------------------------------------------------------------------
    // STEP 1: Morning Routine (07:30) — Gestore Logs In & Posts Fresh Catch
    // -----------------------------------------------------------------------
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'sabina.mazzeracca@ilveliero.it',
        password: 'GestorePassword123!',
      });
    expect(loginRes.status).toBe(200);
    const activeGestoreToken = loginRes.body.token;

    // Gestore adds "Calamaretti spillo fritti con polentina" from morning fish market
    const addCatchRes = await request(app)
      .post('/api/v1/pescato')
      .set('Authorization', `Bearer ${activeGestoreToken}`)
      .send({
        title: 'Calamaretti spillo fritti con polentina',
        description: 'Pescato freschissimo dell\'alba al mercato di Chioggia, calibri minimi e tenerissimi.',
        price: 12.0,
        catchDate: new Date(),
        isAvailable: true,
        marketLocation: 'Mercato Ittico Chioggia',
        kilogramsAvailable: 4.5,
      });
    expect(addCatchRes.status).toBe(201);

    // -----------------------------------------------------------------------
    // STEP 2: Midday Rush (11:45) — Gestore Updates Active Notice Banner
    // -----------------------------------------------------------------------
    const addNoticeRes = await request(app)
      .post('/api/v1/avvisi')
      .set('Authorization', `Bearer ${activeGestoreToken}`)
      .send({
        title: 'Pranzo al Completo in Veranda',
        message: 'Disponibilità residua solo nella sala interna climatizzata.',
        severity: 'warning',
        startDate: new Date(Date.now() - 1000 * 60),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 4),
        isActive: true,
      });
    expect(addNoticeRes.status).toBe(201);

    // -----------------------------------------------------------------------
    // STEP 3: Customer Public Journey (14:00) — Customer Views Info & Menus
    // -----------------------------------------------------------------------
    // Customer checks restaurant info
    let infoRes = await request(app).get('/api/v1/info');
    if (infoRes.status === 404) infoRes = await request(app).get('/api/v1/info-locale');
    expect(infoRes.status).toBe(200);
    expect(infoRes.body.data.address || infoRes.body.data.indirizzo).toMatch(/Bassano del Grappa/i);

    // Customer checks notice banners
    const bannerRes = await request(app).get('/api/v1/avvisi/active');
    expect(bannerRes.status).toBe(200);
    expect(bannerRes.body.data.some((b: any) => b.title === 'Pranzo al Completo in Veranda')).toBe(true);

    // Customer checks daily catch feed
    const pescatoRes = await request(app).get('/api/v1/pescato');
    expect(pescatoRes.status).toBe(200);
    expect(pescatoRes.body.data.some((p: any) => p.title === 'Calamaretti spillo fritti con polentina')).toBe(true);

    // -----------------------------------------------------------------------
    // STEP 4: Night Audit & Governance (23:30) — Admin Audits Daily Activity
    // -----------------------------------------------------------------------
    await new Promise((r) => setTimeout(r, 80));
    const auditRes = await request(app)
      .get('/api/v1/admin/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(auditRes.status).toBe(200);
    const logs = auditRes.body.data;
    expect(logs.length).toBeGreaterThanOrEqual(2);

    // Confirm that Gestore actions were audited
    const gestoreActions = logs.filter((l: any) => l.userEmail === 'sabina.mazzeracca@ilveliero.it');
    expect(gestoreActions.length).toBeGreaterThanOrEqual(1);
  });

  // =========================================================================
  // SCENARIO 2: MOCKUP SEASONAL SEAFOOD ONBOARDING
  // =========================================================================
  it('Scenario 4.2: Gestore onboards complete mockup seasonal menu', async () => {
    const mockupDishes = [
      {
        title: 'Crostini di pane pizza con crema di dentice',
        description: 'Crostini dorati con crema di dentice.',
        price: 9.0,
        category: 'pesce',
        subcategory: 'antipasti',
        allergens: ['glutine', 'pesce'],
      },
      {
        title: 'Filetti di alici marinate',
        description: 'Alici all\'aceto di mele e pepe rosa.',
        price: 9.0,
        category: 'pesce',
        subcategory: 'antipasti',
        allergens: ['pesce'],
      },
      {
        title: 'Schie fritte con polenta',
        description: 'Gamberetti fritti con morbida polenta.',
        price: 10.0,
        category: 'pesce',
        subcategory: 'antipasti',
        allergens: ['glutine', 'crostacei'],
      },
      {
        title: 'Sardine fritte',
        description: 'Sardine fresche dorate.',
        price: 8.0,
        category: 'pesce',
        subcategory: 'antipasti',
        allergens: ['glutine', 'pesce'],
      },
    ];

    for (const dish of mockupDishes) {
      const res = await request(app)
        .post('/api/v1/menu')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .send(dish);
      expect(res.status).toBe(201);
    }

    // Verify public catalog reflects all 4 dishes
    const publicCatalogRes = await request(app).get('/api/v1/menu?category=pesce');
    expect(publicCatalogRes.status).toBe(200);
    expect(publicCatalogRes.body.count).toBeGreaterThanOrEqual(4);
  });

  // =========================================================================
  // SCENARIO 3: CULINARY EVENT SEATS & RESERVATION LIFECYCLE
  // =========================================================================
  it('Scenario 4.3: Culinary Event Capacity & Reservation Progression', async () => {
    // 1. Create event with 50 max seats
    const createEventRes = await request(app)
      .post('/api/v1/eventi')
      .set('Authorization', `Bearer ${gestoreToken}`)
      .send({
        title: 'Serata Gran Pescato & Champagne',
        description: 'Cena degustazione di 6 portate con champagne millesimati.',
        eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        price: 90.0,
        maxSeats: 50,
        reservedSeats: 0,
      });

    expect(createEventRes.status).toBe(201);
    const eventId = createEventRes.body.data.id || createEventRes.body.data._id;

    // 2. Update reservations to 45 seats
    const updateSeatsRes = await request(app)
      .put(`/api/v1/eventi/${eventId}`)
      .set('Authorization', `Bearer ${gestoreToken}`)
      .send({ reservedSeats: 45 });

    expect(updateSeatsRes.status).toBe(200);
    expect(updateSeatsRes.body.data.reservedSeats).toBe(45);

    // 3. Public checks upcoming event details
    const upcomingRes = await request(app).get('/api/v1/eventi/upcoming');
    expect(upcomingRes.status).toBe(200);
    const found = upcomingRes.body.data.find((e: any) => e.title === 'Serata Gran Pescato & Champagne');
    expect(found).toBeDefined();
    expect(found.maxSeats).toBe(50);
    expect(found.reservedSeats).toBe(45);
  });
});
