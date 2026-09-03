import request from 'supertest';
import { createApp } from '../../src/app';
import { User } from '../../src/models/User';
import { MenuItem } from '../../src/models/MenuItem';
import { Evento } from '../../src/models/Evento';
import { Avviso } from '../../src/models/Avviso';
import { AuditLog } from '../../src/models/AuditLog';
import { TokenBlacklist } from '../../src/models/TokenBlacklist';
import { jwtService } from '../../src/services/jwt.service';

describe('Cross-Feature & E2E Interaction Test Suite (Tier 3 & Tier 4)', () => {
  const app = createApp();

  let adminUser: any;
  let adminToken: string;
  let gestoreUser: any;
  let gestoreToken: string;
  let clientUser: any;
  let clientToken: string;

  beforeEach(async () => {
    adminUser = await User.create({
      name: 'Amministratore Master',
      email: 'admin.cross@ilveliero.it',
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
      name: 'Gestore Responsabile',
      email: 'gestore.cross@ilveliero.it',
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
      name: 'Cliente Ospite',
      email: 'cliente.cross@ilveliero.it',
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

  it('Cross-Feature 1: Gestore creates dish -> public client sees dish -> audit log records mutation', async () => {
    // 1. Gestore creates dish
    const createDishRes = await request(app)
      .post('/api/v1/menu')
      .set('Authorization', `Bearer ${gestoreToken}`)
      .send({
        title: 'Trancio di Ricciola al Forno',
        description: 'Ricciola con pomodorini di Pachino, olive taggiasche e capperi di Salina.',
        price: 24.0,
        category: 'pesce',
        subcategory: 'secondi',
        allergens: ['pesce'],
        isAvailable: true,
      });

    expect(createDishRes.status).toBe(201);
    const dishId = createDishRes.body.data.id || createDishRes.body.data._id;

    // 2. Public client visits menu
    const publicMenuRes = await request(app).get('/api/v1/menu?category=pesce');
    expect(publicMenuRes.status).toBe(200);
    const found = publicMenuRes.body.data.find((d: any) => d.title === 'Trancio di Ricciola al Forno');
    expect(found).toBeDefined();

    // 3. Verify audit log was recorded
    await new Promise((resolve) => setTimeout(resolve, 50));
    const audit = await AuditLog.findOne({
      userEmail: 'gestore.cross@ilveliero.it',
      action: 'CREATE_MENU_ITEM',
    });
    expect(audit).not.toBeNull();
    expect(audit?.status).toBe('SUCCESS');
    expect(audit?.role).toBe('gestore');
    expect(audit?.role).not.toBe('anonymous');
  });

  it('Cross-Feature 2: Admin promotes client to gestore -> new gestore logs in -> creates event -> event is public', async () => {
    // 1. Client attempts to create event -> blocked 403
    const blockedRes = await request(app)
      .post('/api/v1/eventi')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        title: 'Serata Vini Naturali',
        description: 'Degustazione',
        eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
      });
    expect(blockedRes.status).toBe(403);

    // 2. Admin promotes client to gestore
    const promoteRes = await request(app)
      .patch(`/api/v1/admin/users/${clientUser._id.toString()}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'gestore' });
    expect(promoteRes.status).toBe(200);

    // 3. Promoted user logs in and gets fresh JWT token
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'cliente.cross@ilveliero.it',
        password: 'ClientPassword123!',
      });
    expect(loginRes.status).toBe(200);
    const newGestoreToken = loginRes.body.token;

    // 4. New gestore successfully creates event
    const createEventRes = await request(app)
      .post('/api/v1/eventi')
      .set('Authorization', `Bearer ${newGestoreToken}`)
      .send({
        title: 'Serata Vini Naturali & Cicchetti',
        description: 'Degustazione di 5 cantine biologiche del Triveneto abbinate a cicchetti di mare.',
        eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
        price: 45.0,
      });
    expect(createEventRes.status).toBe(201);

    // 5. Public upcoming events list contains newly created event
    const upcomingRes = await request(app).get('/api/v1/eventi/upcoming');
    expect(upcomingRes.status).toBe(200);
    const eventFound = upcomingRes.body.data.find(
      (e: any) => e.title === 'Serata Vini Naturali & Cicchetti'
    );
    expect(eventFound).toBeDefined();
  });

  it('Cross-Feature 3: Gestore creates active emergency banner -> public client views active banner immediately', async () => {
    // 1. Gestore creates emergency danger notice
    const createNoticeRes = await request(app)
      .post('/api/v1/avvisi')
      .set('Authorization', `Bearer ${gestoreToken}`)
      .send({
        title: 'Acqua Alta Straordinaria a Chioggia',
        message: 'A causa della marea eccezionale il servizio serale è temporaneamente sospeso.',
        severity: 'danger',
        startDate: new Date(Date.now() - 1000 * 60),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 12),
        isActive: true,
      });
    expect(createNoticeRes.status).toBe(201);

    // 2. Public client visits active notices endpoint
    const activeRes = await request(app).get('/api/v1/avvisi/active');
    expect(activeRes.status).toBe(200);
    expect(activeRes.body.data[0].title).toBe('Acqua Alta Straordinaria a Chioggia');
    expect(activeRes.body.data[0].severity).toBe('danger');
  });

  it('Cross-Feature 4: Admin blacklists gestore token -> gestore mutation immediately rejected with 401', async () => {
    // 1. Dish exists in database
    const dish = await MenuItem.create({
      title: 'Rombo al Forno',
      description: 'Con patate',
      price: 22.0,
      category: 'pesce',
    });

    // 2. Admin revokes gestore token via blacklist
    const blacklistRes = await request(app)
      .post('/api/v1/admin/blacklist')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        token: gestoreToken,
        reason: 'Compromised session security audit',
      });
    expect(blacklistRes.status).toBe(201);

    // 3. Gestore attempts to modify dish with revoked token -> rejected 401
    const mutateRes = await request(app)
      .put(`/api/v1/menu/${dish._id.toString()}`)
      .set('Authorization', `Bearer ${gestoreToken}`)
      .send({ price: 99.0 });

    expect(mutateRes.status).toBe(401);
    expect(mutateRes.body.error.message).toMatch(/revoked/i);

    // 4. Verify dish was not modified in DB
    const unchanged = await MenuItem.findById(dish._id);
    expect(unchanged?.price).toBe(22.0);
  });

  it('Cross-Feature 5: Dish allergen updated -> client allergen exclusion filter excludes updated dish', async () => {
    // 1. Create a dish originally without gluten
    const dish = await MenuItem.create({
      title: 'Insalata di Polpo e Patate',
      description: 'Polpo verace adriatico, patate novelle e prezzemolo.',
      price: 16.0,
      category: 'pesce',
      subcategory: 'antipasti',
      allergens: ['molluschi'],
      isAvailable: true,
    });

    // 2. Client excluding gluten can see it
    const clientRes1 = await request(app).get('/api/v1/menu?excludeAllergens=glutine');
    expect(clientRes1.status).toBe(200);
    expect(clientRes1.body.data.some((d: any) => d.title === 'Insalata di Polpo e Patate')).toBe(
      true
    );

    // 3. Gestore updates dish recipe to add croutons (glutine)
    const updateRes = await request(app)
      .put(`/api/v1/menu/${dish._id.toString()}`)
      .set('Authorization', `Bearer ${gestoreToken}`)
      .send({
        allergens: ['molluschi', 'glutine'],
      });
    expect(updateRes.status).toBe(200);

    // 4. Client excluding gluten now no longer sees the dish
    const clientRes2 = await request(app).get('/api/v1/menu?excludeAllergens=glutine');
    expect(clientRes2.status).toBe(200);
    expect(clientRes2.body.data.some((d: any) => d.title === 'Insalata di Polpo e Patate')).toBe(
      false
    );
  });
});
