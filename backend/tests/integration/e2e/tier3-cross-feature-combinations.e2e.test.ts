import request from 'supertest';
import { createApp } from '../../../src/app';
import { User } from '../../../src/models/User';
import { MenuItem } from '../../../src/models/MenuItem';
import { Pescato } from '../../../src/models/Pescato';
import { Avviso } from '../../../src/models/Avviso';
import { AuditLog } from '../../../src/models/AuditLog';
import { jwtService } from '../../../src/services/jwt.service';

describe('Tier 3: Cross-Feature Combinations & Pairwise Integration E2E Suite', () => {
  const app = createApp();

  let adminUser: any;
  let adminToken: string;

  beforeEach(async () => {
    adminUser = await User.create({
      name: 'Federico Bortolato (Master Admin)',
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
  });

  it('Flow 3.1: Create Gestore -> Login -> Create Dish -> AuditLog check -> Logout -> Revocation check', async () => {
    // 1. Admin creates new Gestore
    const createUserRes = await request(app)
      .post('/api/v1/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Giuseppe Capocuoco',
        email: 'giuseppe.cuoco@ilveliero.it',
        password: 'CuocoPassword123!',
        role: 'gestore',
      });

    expect(createUserRes.status).toBe(201);

    // 2. Gestore logs in
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'giuseppe.cuoco@ilveliero.it',
        password: 'CuocoPassword123!',
      });

    expect(loginRes.status).toBe(200);
    const gestoreToken = loginRes.body.token;

    // 3. Gestore creates new specialty dish
    const createDishRes = await request(app)
      .post('/api/v1/menu')
      .set('Authorization', `Bearer ${gestoreToken}`)
      .send({
        title: 'Calamarata al Sugo di Scorfano',
        description: 'Pasta trafilata al bronzo con polpa di scorfano fresco, pomodorini e timo.',
        price: 22.0,
        category: 'pesce',
        subcategory: 'primi',
        allergens: ['glutine', 'pesce'],
      });

    expect(createDishRes.status).toBe(201);
    const dishId = createDishRes.body.data.id || createDishRes.body.data._id;

    // 4. Verify Audit Log was recorded with operator email
    await new Promise((r) => setTimeout(r, 60));
    const auditRecord = await AuditLog.findOne({
      userEmail: 'giuseppe.cuoco@ilveliero.it',
      action: 'CREATE_MENU_ITEM',
    });
    expect(auditRecord).not.toBeNull();
    expect(auditRecord?.status).toBe('SUCCESS');
    expect(auditRecord?.role).toBe('gestore');
    expect(auditRecord?.role).not.toBe('anonymous');

    // 5. Gestore logs out
    const logoutRes = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${gestoreToken}`);
    expect(logoutRes.status).toBe(200);

    // 6. Attempt to modify dish with old token -> must be rejected (401)
    const updateRes = await request(app)
      .put(`/api/v1/menu/${dishId}`)
      .set('Authorization', `Bearer ${gestoreToken}`)
      .send({ price: 25.0 });

    expect(updateRes.status).toBe(401);
  });

  it('Flow 3.2: Dish Allergen Mutation -> Public Search Filter Dynamic Consistency', async () => {
    // 1. Create gestore
    const gestore = await User.create({
      name: 'Chef Allergen Tester',
      email: 'chef.allergen@ilveliero.it',
      password: 'Password123!',
      role: 'gestore',
      isActive: true,
    });
    const token = jwtService.generateToken({
      id: gestore._id.toString(),
      email: gestore.email,
      role: gestore.role,
      name: gestore.name,
    });

    // 2. Create dish initially without crustaceans (crostacei)
    const dish = await MenuItem.create({
      title: 'Zuppetta di Cozze e Vongole',
      description: 'Molluschi veraci in guazzetto leggero.',
      price: 15.0,
      category: 'pesce',
      subcategory: 'antipasti',
      allergens: ['molluschi'],
      isAvailable: true,
    });

    // 3. Client excluding crustaceans can view the dish
    const res1 = await request(app).get('/api/v1/menu?excludeAllergens=crostacei');
    expect(res1.status).toBe(200);
    expect(res1.body.data.some((d: any) => d.title === 'Zuppetta di Cozze e Vongole')).toBe(true);

    // 4. Chef updates recipe to add scampi (crostacei)
    const updateRes = await request(app)
      .put(`/api/v1/menu/${dish._id.toString()}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        allergens: ['molluschi', 'crostacei'],
      });
    expect(updateRes.status).toBe(200);

    // 5. Client excluding crustaceans now no longer sees the dish
    const res2 = await request(app).get('/api/v1/menu?excludeAllergens=crostacei');
    expect(res2.status).toBe(200);
    expect(res2.body.data.some((d: any) => d.title === 'Zuppetta di Cozze e Vongole')).toBe(false);
  });

  it('Flow 3.3: Emergency Banner Publishing -> Real-Time Visibility -> Deactivation Lifecycle', async () => {
    const gestore = await User.create({
      name: 'Gestore Notifiche',
      email: 'gestore.notifiche@ilveliero.it',
      password: 'Password123!',
      role: 'gestore',
      isActive: true,
    });
    const token = jwtService.generateToken({
      id: gestore._id.toString(),
      email: gestore.email,
      role: gestore.role,
      name: gestore.name,
    });

    // 1. Gestore creates emergency banner
    const createNoticeRes = await request(app)
      .post('/api/v1/avvisi')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Chiusura Improvvisa per Allerta Meteo',
        message: 'A causa di forte vento e nubifragio, il servizio serale è annullato.',
        severity: 'danger',
        startDate: new Date(Date.now() - 1000 * 60),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 6),
        isActive: true,
      });

    expect(createNoticeRes.status).toBe(201);
    const noticeId = createNoticeRes.body.data.id || createNoticeRes.body.data._id;

    // 2. Public client sees danger banner
    const activeRes1 = await request(app).get('/api/v1/avvisi/active');
    expect(activeRes1.status).toBe(200);
    expect(activeRes1.body.data[0].title).toBe('Chiusura Improvvisa per Allerta Meteo');
    expect(activeRes1.body.data[0].severity).toBe('danger');

    // 3. Gestore deactivates notice after emergency ends
    const updateNoticeRes = await request(app)
      .put(`/api/v1/avvisi/${noticeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ isActive: false });

    expect(updateNoticeRes.status).toBe(200);

    // 4. Public client no longer sees banner
    const activeRes2 = await request(app).get('/api/v1/avvisi/active');
    expect(activeRes2.status).toBe(200);
    expect(activeRes2.body.data.length).toBe(0);
  });
});
