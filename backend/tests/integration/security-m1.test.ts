import request from 'supertest';
import { createApp } from '../../src/app';
import { User } from '../../src/models/User';
import { InfoLocale } from '../../src/models/InfoLocale';
import { AuditLog } from '../../src/models/AuditLog';
import { jwtService } from '../../src/services/jwt.service';
import { env } from '../../src/config/environment';

describe('Milestone 1 Security, Dual Login, Master Admin & Bassano del Grappa Data Integration Test Suite', () => {
  const app = createApp();

  let masterAdminToken: string;
  let masterAdminUser: any;
  let secondaryAdminToken: string;
  let secondaryAdminUser: any;
  let gestoreUsernameOnlyUser: any;

  beforeEach(async () => {
    // 1. Create Master Admin
    masterAdminUser = await User.create({
      name: 'Filippo Bortolato (Master Admin)',
      email: 'bortolatofilippo05@gmail.com',
      password: 'MasterPassword123!',
      role: 'admin',
      isMasterAdmin: true,
      isActive: true,
      tokenVersion: 0,
    });

    masterAdminToken = jwtService.generateToken({
      id: masterAdminUser._id.toString(),
      email: masterAdminUser.email,
      role: masterAdminUser.role,
      name: masterAdminUser.name,
      isMasterAdmin: true,
      tokenVersion: 0,
    });

    // 2. Create Regular Secondary Admin
    secondaryAdminUser = await User.create({
      name: 'Secondary Administrator',
      email: 'secondary.admin@ilveliero.it',
      password: 'SecondaryPassword123!',
      role: 'admin',
      isMasterAdmin: false,
      isActive: true,
      tokenVersion: 0,
    });

    secondaryAdminToken = jwtService.generateToken({
      id: secondaryAdminUser._id.toString(),
      email: secondaryAdminUser.email,
      role: secondaryAdminUser.role,
      name: secondaryAdminUser.name,
      isMasterAdmin: false,
      tokenVersion: 0,
    });

    // 3. Create Username-Only Gestore
    gestoreUsernameOnlyUser = await User.create({
      name: 'Mario Responsabile Sala',
      username: 'gestore_sala',
      password: 'GestorePassword123!',
      role: 'gestore',
      isActive: true,
      tokenVersion: 0,
    });
  });

  describe('1. Dual Login (Email or Username or Identifier)', () => {
    it('should authenticate user with email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'bortolatofilippo05@gmail.com',
          password: 'MasterPassword123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.isMasterAdmin).toBe(true);
      expect(res.body.user.email).toBe('bortolatofilippo05@gmail.com');
    });

    it('should authenticate gestore with username', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'gestore_sala',
          password: 'GestorePassword123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.username).toBe('gestore_sala');
      expect(res.body.user.role).toBe('gestore');
    });

    it('should authenticate using generic identifier with uppercase username', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          identifier: 'GESTORE_SALA',
          password: 'GestorePassword123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.username).toBe('gestore_sala');
    });

    it('should authenticate using generic identifier with email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          identifier: 'bortolatofilippo05@gmail.com',
          password: 'MasterPassword123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe('bortolatofilippo05@gmail.com');
    });
  });

  describe('2. Master Admin Protection (Immutability & Anti-Lockout)', () => {
    it('should prevent secondary admin from demoting Master Admin (403 Forbidden)', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/users/${masterAdminUser._id}/role`)
        .set('Authorization', `Bearer ${secondaryAdminToken}`)
        .send({ role: 'gestore' });

      expect(res.status).toBe(403);
      expect(res.body.error.message).toMatch(/non è consentito modificare o eliminare un master admin/i);
    });

    it('should prevent secondary admin from deactivating Master Admin (403 Forbidden)', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/users/${masterAdminUser._id}/status`)
        .set('Authorization', `Bearer ${secondaryAdminToken}`)
        .send({ isActive: false });

      expect(res.status).toBe(403);
      expect(res.body.error.message).toMatch(/non è consentito modificare o eliminare un master admin/i);
    });

    it('should prevent secondary admin from deleting Master Admin (403 Forbidden)', async () => {
      const res = await request(app)
        .delete(`/api/v1/admin/users/${masterAdminUser._id}`)
        .set('Authorization', `Bearer ${secondaryAdminToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.message).toMatch(/non è consentito modificare o eliminare un master admin/i);

      // Verify record still exists
      const check = await User.findById(masterAdminUser._id);
      expect(check).not.toBeNull();
    });

    it('should support PUT aliases for role and status updates', async () => {
      const gestore = await User.create({
        name: 'Temporary Gestore',
        email: 'temp.gestore@ilveliero.it',
        password: 'Password123!',
        role: 'gestore',
        isActive: true,
      });

      const putRoleRes = await request(app)
        .put(`/api/v1/admin/users/${gestore._id}/role`)
        .set('Authorization', `Bearer ${masterAdminToken}`)
        .send({ role: 'admin' });

      expect(putRoleRes.status).toBe(200);
      expect(putRoleRes.body.data.role).toBe('admin');

      const putStatusRes = await request(app)
        .put(`/api/v1/admin/users/${gestore._id}/status`)
        .set('Authorization', `Bearer ${masterAdminToken}`)
        .send({ isActive: false });

      expect(putStatusRes.status).toBe(200);
      expect(putStatusRes.body.data.isActive).toBe(false);
    });
  });

  describe('3. Global Logout & Token Invalidation (tokenVersion)', () => {
    it('should invalidate all active tokens across devices upon logoutAll', async () => {
      // Simulate 2 devices logged in
      const token1 = jwtService.generateToken({
        id: gestoreUsernameOnlyUser._id.toString(),
        username: gestoreUsernameOnlyUser.username,
        role: gestoreUsernameOnlyUser.role,
        name: gestoreUsernameOnlyUser.name,
        tokenVersion: 0,
      });

      const token2 = jwtService.generateToken({
        id: gestoreUsernameOnlyUser._id.toString(),
        username: gestoreUsernameOnlyUser.username,
        role: gestoreUsernameOnlyUser.role,
        name: gestoreUsernameOnlyUser.name,
        tokenVersion: 0,
      });

      // Both tokens are valid
      const me1 = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token1}`);
      expect(me1.status).toBe(200);
      const me2 = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token2}`);
      expect(me2.status).toBe(200);

      // Perform Global Logout
      const logoutAll = await request(app)
        .post('/api/v1/auth/logout-all')
        .set('Authorization', `Bearer ${token1}`);

      expect(logoutAll.status).toBe(200);
      expect(logoutAll.body.success).toBe(true);

      // Device 1 fails (blacklisted & tokenVersion mismatch)
      const test1 = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token1}`);
      expect(test1.status).toBe(401);

      // Device 2 fails (tokenVersion 0 vs 1 in DB)
      const test2 = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token2}`);
      expect(test2.status).toBe(401);
      expect(test2.body.error.message).toMatch(/session has been revoked/i);
    });
  });

  describe('4. Master Emergency Recovery Key', () => {
    it('should allow master password override and invalidate all previous sessions', async () => {
      const response = await request(app)
        .post('/api/v1/auth/emergency-recovery')
        .send({
          recoveryKey: env.masterEmergencyKey,
          targetIdentifier: 'bortolatofilippo05@gmail.com',
          newPassword: 'BrandNewMasterPassword2026!',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toMatch(/reimpostata con successo/i);

      // Verify old token is rejected
      const meCheck = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${masterAdminToken}`);
      expect(meCheck.status).toBe(401);

      // Verify login with new password succeeds
      const newLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({
          identifier: 'bortolatofilippo05@gmail.com',
          password: 'BrandNewMasterPassword2026!',
        });

      expect(newLogin.status).toBe(200);
      expect(newLogin.body.token).toBeDefined();
    });

    it('should reject emergency recovery with invalid master key', async () => {
      const response = await request(app)
        .post('/api/v1/auth/emergency-recovery')
        .send({
          recoveryKey: 'INCORRECT_KEY',
          targetIdentifier: 'bortolatofilippo05@gmail.com',
          newPassword: 'BrandNewMasterPassword2026!',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('5. Gestore Creation with Username Only & No Mandatory Email', () => {
    it('should create gestore user with username only', async () => {
      const res = await request(app)
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${masterAdminToken}`)
        .send({
          name: 'Nuovo Gestore Banco',
          username: 'gestore_banco',
          password: 'BancoPassword123!',
          role: 'gestore',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.username).toBe('gestore_banco');
      expect(res.body.data.email).toBeUndefined();

      // Check DB
      const user = await User.findOne({ username: 'gestore_banco' });
      expect(user).not.toBeNull();
      expect(user?.role).toBe('gestore');
    });

    it('should reject creating duplicate username (409 Conflict)', async () => {
      const res = await request(app)
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${masterAdminToken}`)
        .send({
          name: 'Duplicate Username',
          username: 'gestore_sala',
          password: 'Password123!',
          role: 'gestore',
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });
  });

  describe('6. InfoLocale Bassano del Grappa & Routing Aliases', () => {
    it('should return Bassano del Grappa information and corporate details', async () => {
      const res = await request(app).get('/api/v1/info-locale');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toContain('Il Veliero');
      expect(res.body.data.legalName).toContain('Pizza dal Campione del Mondo');
      expect(res.body.data.pIva).toBe('03450720242');
      expect(res.body.data.sdi).toBe('P62QHVQ');
      expect(res.body.data.phone).toBe('0424 500 200');
      expect(res.body.data.mobile).toBe('334 623 2941');
      expect(res.body.data.whatsapp).toBe('334 623 2941');
      expect(res.body.data.email).toBe('info@ristorante-ilveliero.it');
      expect(res.body.data.secondaryEmail).toBe('pizzadalcampione@gmail.com');
      expect(res.body.data.openingHours.wednesday.isClosed).toBe(true);
    });

    it('should allow gestore to update restaurant data via /api/v1/info-locale', async () => {
      const gestoreToken = jwtService.generateToken({
        id: gestoreUsernameOnlyUser._id.toString(),
        username: 'gestore_sala',
        role: 'gestore',
        name: 'Mario Responsabile Sala',
        tokenVersion: 0,
      });

      const updateRes = await request(app)
        .put('/api/v1/info-locale')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .send({
          phone: '0424 500 200',
          mobile: '334 623 2941',
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.mobile).toBe('334 623 2941');
    });
  });

  describe('7. Audit Logging with Operator and Username Tracking', () => {
    it('should record operator username in audit log when mutating resources', async () => {
      const gestoreToken = jwtService.generateToken({
        id: gestoreUsernameOnlyUser._id.toString(),
        username: 'gestore_sala',
        role: 'gestore',
        name: 'Mario Responsabile Sala',
        tokenVersion: 0,
      });

      await request(app)
        .put('/api/v1/info-locale')
        .set('Authorization', `Bearer ${gestoreToken}`)
        .send({
          phone: '0424 500 200',
        });

      await new Promise((resolve) => setTimeout(resolve, 50));

      const logs = await AuditLog.find({ action: 'UPDATE_INFO_LOCALE' });
      expect(logs.length).toBeGreaterThanOrEqual(1);

      const lastLog = logs[logs.length - 1];
      expect(lastLog.operator).toBe('gestore_sala');
      expect(lastLog.username).toBe('gestore_sala');
      expect(lastLog.role).toBe('gestore');
    });
  });
});
